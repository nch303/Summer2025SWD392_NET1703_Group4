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

        public async Task<bool> ReassignChildToNewClassAsync(Guid childId, int newClassId, int oldClassId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            // Get current class assignment
            var currentAssignment = await _context.ClassChildrens
                .FirstOrDefaultAsync(cc => cc.ChildrenID == childId && cc.ClassID == oldClassId);

            //Get old class
            var oldClass = await _context.Classes.FindAsync(oldClassId);

            // Get new class
            var newClass = await _context.Classes.FindAsync(newClassId);

            // Re-assign class
            currentAssignment!.ClassID = newClassId;
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
            var classTeacher = new ClassTeacher
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

        public async Task<bool> IsTeacherAssignedInAcademicYearAsync(Guid teacherId, string academicYear)
        {
            return await _context.ClassTeachers
                .Include(ct => ct.Classes)
                .AnyAsync(ct => ct.TeacherID == teacherId &&
                                ct.Classes!.AcademicYear == academicYear &&
                                ct.Classes!.EnrichmentProgramId == null);
        }

        public async Task<List<ChildrenGrade>> UpgradeChildren(List<Guid> childrenIds)
        {
            var childrenGrades = await _context.ChildrenGrades
                .Where(cg => childrenIds.Contains(cg.ChildrenID) && cg.Status == "Active")
                .ToListAsync();
            return childrenGrades;
        }
    }
}
