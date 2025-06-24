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
    public class ClassChildrenRepository : IClassChildrenRepository
    {
        private readonly AppDbContext _context;
        public ClassChildrenRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ClassChildren> GetCurrentAssignment(Guid childID)
        {
            var assignment = await _context.ClassChildrens.FirstOrDefaultAsync(cc => cc.ChildrenID == childID);
            return assignment!;
        }

        public async Task<List<ClassChildren>> GetChilldrenByClassIdAsync(int classId)
        {
            var children = await _context.ClassChildrens
                .Include(cc => cc.Childrens)
                .Where(cc => cc.ClassID == classId)
                .ToListAsync();

            return children;
        }

        public async Task<List<ClassChildren>> GetAllAsync()
        {
            var allChildren = await _context.ClassChildrens
                .Include(cc => cc.Childrens)
                    .ThenInclude(c => c.Parents)
                .Include(cc => cc.Classes)
                    .ThenInclude(cls => cls.Syllabi)
                .Include(cc => cc.Classes)
                    .ThenInclude(cls => cls.GradeLevels)
                .Include(cc => cc.Classes)
                    .ThenInclude(cls => cls.EnrichmentPrograms)
                .Include(cc => cc.Attendances)
                .ToListAsync();
            return allChildren;

        }

        public async Task<List<ClassChildren>> GetByParentIdAsync(Guid parentId)
        {
            var children = await _context.ClassChildrens
                .Include(cc => cc.Childrens)
                    .ThenInclude(c => c.Parents)
                .Include(cc => cc.Classes)
                    .ThenInclude(cls => cls.Syllabi)
                .Include(cc => cc.Classes)
                    .ThenInclude(cls => cls.GradeLevels)
                .Include(cc => cc.Classes)
                    .ThenInclude(cls => cls.EnrichmentPrograms)
                .Include(cc => cc.Attendances)
                .Where(cc => cc.Childrens.Parents.Id == parentId)
                .ToListAsync();
            return children;
        }

        public async Task<List<ClassChildren>> GetByChildIdAsync(Guid childId)
        {
            var children = await _context.ClassChildrens
                .Include(cc => cc.Childrens)
                    .ThenInclude(c => c.Parents)
                .Include(cc => cc.Classes)
                    .ThenInclude(cls => cls.Syllabi)
                .Include(cc => cc.Classes)
                    .ThenInclude(cls => cls.GradeLevels)
                .Include(cc => cc.Classes)
                    .ThenInclude(cls => cls.EnrichmentPrograms)
                .Include(cc => cc.Attendances)
                .Where(cc => cc.Childrens.ID == childId)
                .ToListAsync();
            return children;
        }
    }
}
