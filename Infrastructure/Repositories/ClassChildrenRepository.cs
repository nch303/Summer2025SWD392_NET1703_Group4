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

        public async Task<List<ClassChildren>> GetCurrentAssignment(Guid childID)
        {
            var assignment = await _context.ClassChildrens
                .Include(a => a.Classes)
                .Where(cc => cc.ChildrenID == childID)
                .ToListAsync();
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

        public async Task<bool> KickClassChildren(Guid childId, int classId)
        {
            var classChildren = await _context.ClassChildrens.FirstOrDefaultAsync(cc => cc.ChildrenID == childId && cc.ClassID == classId);
            var attendance = await _context.Attendances.Where(a => a.ClassChildrenID == classChildren.ID).ToListAsync();
            if (attendance.Count != 0)
            {
                _context.Attendances.RemoveRange(attendance);
            }
            _context.ClassChildrens.Remove(classChildren);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> KickEnrichmentClassChildren(Guid childId, int classId)
        {
            var classChildren = await _context.ClassChildrens.FirstOrDefaultAsync(cc => cc.ChildrenID == childId && cc.ClassID == classId);
            if (classChildren != null)
            {
                var attendance = await _context.Attendances.Where(a => a.ClassChildrenID == classChildren.ID).ToListAsync();
                if (attendance.Count != 0)
                {
                    _context.Attendances.RemoveRange(attendance);
                }
                _context.ClassChildrens.Remove(classChildren);
                await _context.SaveChangesAsync();
                return true;
            }
            return false;
        }

        public async Task<List<ClassChildren>> GetEnrichmentClassChildrenWithParentIdChildrenIdAsync(Guid parentId, Guid childrenId)
        {
            var enrichmentChildren = await _context.ClassChildrens
                .Include(cc => cc.Childrens)
                    .ThenInclude(c => c.Parents)
                .Include(cc => cc.Classes)
                    .ThenInclude(cls => cls.EnrichmentPrograms)
                    .ThenInclude(ep => ep!.InvoiceDetails)
                .Where(cc => cc.Childrens!.Parents!.Id == parentId && cc.Classes!.EnrichmentPrograms != null && cc.ChildrenID == childrenId)
                .ToListAsync();
            return enrichmentChildren;
        }

        public async Task<List<ClassChildren>> GetEnrichmentClassChildrenWithParentIdAsync(Guid parentId)
        {
            var enrichmentChildren = await _context.ClassChildrens
                .Include(cc => cc.Childrens)
                    .ThenInclude(c => c.Parents)
                .Include(cc => cc.Classes)
                    .ThenInclude(cls => cls.EnrichmentPrograms)
                    .ThenInclude(ep => ep!.InvoiceDetails)
                .Where(cc => cc.Childrens!.Parents!.Id == parentId && cc.Classes!.EnrichmentPrograms != null)
                .ToListAsync();
            return enrichmentChildren;
        }

        public async Task<List<ClassChildren>> UpdateClassChildrenAsync(ClassChildren classChildren)
        {
            _context.ClassChildrens.Update(classChildren);
            await _context.SaveChangesAsync();
            return await _context.ClassChildrens
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
        }
    }
}
