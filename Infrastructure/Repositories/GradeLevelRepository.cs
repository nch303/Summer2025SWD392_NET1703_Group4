using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.EntitiesConfigurations;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class GradeLevelRepository : IGradeLevelRepository
    {
        private readonly AppDbContext _context;

        public GradeLevelRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<GradeLevel>> GetAllGradeLevelsAsync()
        {
            var gradeLevels = await _context.GradeLevels.ToListAsync();
            return gradeLevels;
        }

        public async Task<GradeLevel?> GetGradeLevelByIdAsync(int id)
        {
            var gradeLevel = await _context.GradeLevels.FirstOrDefaultAsync(g => g.ID == id);
            return gradeLevel;
        }

        public async Task<GradeLevel> GetGradeLevelByNameAsync(string name)
        {
            var gradeLevel = await _context.GradeLevels.FirstOrDefaultAsync(g => g.Name == name);
            return gradeLevel;
        }

        public async Task<GradeLevel> CreateAsync(GradeLevel gradeLevel)
        {
            _context.GradeLevels.Add(gradeLevel);
            await _context.SaveChangesAsync();
            return gradeLevel;
        }

        public async Task<GradeLevel> UpdateAsync(GradeLevel gradeLevel)
        {
            _context.GradeLevels.Update(gradeLevel);
            await _context.SaveChangesAsync();
            return gradeLevel;
        }
    }
}
