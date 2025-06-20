using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.EntitiesConfigurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Infrastructure.Repositories
{
    public class AttendanceRepository : IAttendanceRepository
    {
        private readonly AppDbContext _context;

        public AttendanceRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Attendance>> GetOrCreateTodayAttendanceByTeacherIdAsync(Guid teacherId, int classId)
        {
            var today = DateTime.Today;

            // 1. Verify teacher is assigned to the class
            var isAssigned = await _context.ClassTeachers
                .AnyAsync(ct => ct.TeacherID == teacherId && ct.ClassID == classId);

            if (!isAssigned)
                return new List<Attendance>(); // or throw exception

            // 2. Get ClassChildren IDs for the class
            var classChildren = await _context.ClassChildrens
                .Include(cc => cc.Childrens)
                .Where(cc => cc.ClassID == classId)
                .ToListAsync();

            var classChildrenIds = classChildren.Select(cc => cc.ID).ToList();

            // 3. Get existing attendance for today
            var existingAttendance = await _context.Attendances
                .Include(a => a.ClassChildrens)
                    .ThenInclude(cc => cc!.Childrens)
                .Where(a => classChildrenIds.Contains(a.ClassChildrenID) &&
                            EF.Functions.DateDiffDay(a.Date, today) == 0)
                .ToListAsync();

            var existingIds = existingAttendance.Select(a => a.ClassChildrenID).ToHashSet();

            // 4. Identify missing records and create them
            var newAttendances = classChildren
                .Where(cc => !existingIds.Contains(cc.ID))
                .Select(cc => new Attendance
                {
                    ClassChildrenID = cc.ID,
                    Date = today,
                    Status = "Absent",
                    Notes = ""
                }).ToList();

            
            _context.Attendances.AddRange(newAttendances);
            await _context.SaveChangesAsync();
            existingAttendance.AddRange(newAttendances);

            return existingAttendance;
        }

        public async Task<bool> UpdateAttendanceAsync(List<Attendance> attendances)
        {
            var ids = attendances.Select(a => a.ID).ToList();

            var existingRecords = await _context.Attendances
                .Where(a => ids.Contains(a.ID))
                .ToListAsync();

            if (existingRecords.Count != attendances.Count)
                return false; // some records not found

            foreach (var record in existingRecords)
            {
                var updated = attendances.First(a => a.ID == record.ID);
                record.Status = updated.Status;
                record.Notes = updated.Notes;
            }

            await _context.SaveChangesAsync();
            return true;
        }

    }
}
