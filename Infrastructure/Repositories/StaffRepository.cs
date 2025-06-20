using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.EntitiesConfigurations;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class StaffRepository : IStaffRepository
    {
        private readonly AppDbContext _context;

        public StaffRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Children>> GetPaidChildrenAsync()
        {
            // Fetch all children who are not enrolled in any class
            var notEnrolledChildren = await _context.Childrens
                .Include(c => c.Parents)
                .Where(c => c.Status == "Paid")
                .ToListAsync();
            return notEnrolledChildren;
        }

        public async Task<List<ClassChildren>> AssignChildrenListToClassAsync(int classId, List<Guid> childrenIds)
        {
            var classChildren = childrenIds.Select(id => new ClassChildren
            {
                ClassID = classId,
                ChildrenID = id, 
                Status = "Active"
            }).ToList();

            _context.ClassChildrens.AddRange(classChildren);
            await _context.SaveChangesAsync();

            return classChildren;
        }

        public async Task<bool> ReassignChildToNewClassAsync(Guid childId, int newClassId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            // Get current class assignment
            var currentAssignment = await _context.ClassChildrens
                .Include(cc => cc.Classes)
                .FirstOrDefaultAsync(cc => cc.ChildrenID == childId);

            var oldClass = currentAssignment!.Classes;

            // Get new class
            var newClass = await _context.Classes.FindAsync(newClassId);

            // Re-assign class
            currentAssignment.ClassID = newClassId;
            _context.ClassChildrens.Update(currentAssignment);

            // Update class quantities
            oldClass!.Quantity -= 1;
            newClass!.Quantity += 1;

            _context.Classes.UpdateRange(oldClass, newClass);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return true;
        }

        public async Task<ClassTeacher> AssignTeacherToClassAsync(int classId, Guid teacherId)
        {
            var classTeacher =  new ClassTeacher
            {
                ClassID = classId,
                TeacherID = teacherId
            };

            _context.ClassTeachers.Add(classTeacher);
            await _context.SaveChangesAsync();

            // Load related Class and Teacher for later use
            await _context.Entry(classTeacher).Reference(ct => ct.Classes).LoadAsync();
            await _context.Entry(classTeacher).Reference(ct => ct.Teachers).LoadAsync();

            return classTeacher;
        }

        public async Task<bool> IsTeacherAssignedToClassAsync(int classId, Guid teacherId)
        {
            return await _context.ClassTeachers
                .AnyAsync(ct => ct.TeacherID == teacherId && ct.ClassID == classId);
        }
    }
}
