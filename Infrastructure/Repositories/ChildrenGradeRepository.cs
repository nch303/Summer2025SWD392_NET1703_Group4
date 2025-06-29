using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.EntitiesConfigurations;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class ChildrenGradeRepository : IChildrenGradeRepository
    {
        private readonly AppDbContext _context;

        public ChildrenGradeRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ChildrenGrade>> GetChildrenGradesByAccountIdAsync(Guid accountId)
        {
            var children = await _context.Childrens
                .Where(c => c.ParentID == accountId)
                .ToListAsync();

            var childrenGrades = new List<ChildrenGrade>();

            foreach (var child in children)
            {
                var grades = await _context.ChildrenGrades
                    .Where(cg => cg.ChildrenID == child.ID)
                    .ToListAsync();

                var now = DateTime.Now;
                var filteredGrades = grades
                    .Where(cg =>
                    {
                        var years = cg.AcademicYear!.Split('-');
                        if (years.Length == 2 &&
                            int.TryParse(years[0], out int startYear) &&
                            int.TryParse(years[1], out int endYear))
                        {
                            var startDate = new DateTime(startYear, 9, 1);     // 01/09/startYear
                            var endDate = new DateTime(endYear, 8, 31);        // 31/08/endYear
                            return now >= startDate && now <= endDate;
                        }
                        return false;
                    })
                    .ToList();

                foreach (var filteredGrade in filteredGrades)
                {
                    childrenGrades.Add(filteredGrade);
                }
            }

            return childrenGrades;
        }

        public async Task<List<ChildrenGrade>> GetChildrenGradesByChildrenIdAsync(Guid childrenId)
        {
            var childrengrade = await _context.ChildrenGrades
                .Include(cg => cg.GradeLevels)
                .Where(cg => cg.ChildrenID == childrenId)
                .ToListAsync();
            return childrengrade!;
        }

        public async Task<ChildrenGrade> CreateChildrenGradeAsync(ChildrenGrade childrenGrade)
        {
            _context.ChildrenGrades.Add(childrenGrade);
            await _context.SaveChangesAsync();
            return childrenGrade;
        }

        public async Task<ChildrenGrade> UpdateChildrenGradeAsync(ChildrenGrade childrenGrade)
        {
            var existingGrade = await _context.ChildrenGrades
                .FirstOrDefaultAsync(cg => cg.ID == childrenGrade.ID);

            existingGrade.ChildrenID = childrenGrade.ChildrenID;
            existingGrade.GradeLevelID = childrenGrade.GradeLevelID;
            existingGrade.AcademicYear = childrenGrade.AcademicYear;
            existingGrade.Status = childrenGrade.Status;
            _context.ChildrenGrades.Update(existingGrade);
            await _context.SaveChangesAsync();
            return existingGrade;
        }

        public async Task<List<ChildrenGrade>> GetActiveChildrenGradeAsync()
        {
            var childrenGrades = await _context.ChildrenGrades
                .Include(cg => cg.GradeLevels)
                .Include(cg => cg.Childrens)
                .Where(cg => cg.Status == "Active")
                .ToListAsync();
            return childrenGrades;
        }
    }
}
