using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Domain.Interfaces
{
    public interface IClassChildrenRepository
    {
        Task<List<ClassChildren>> GetCurrentAssignment(Guid childID);
        Task<List<ClassChildren>> GetChilldrenByClassIdAsync(int classId);
        Task<List<ClassChildren>> GetAllAsync();
        Task<List<ClassChildren>> GetByParentIdAsync(Guid parentId);
        Task<List<ClassChildren>> GetByChildIdAsync(Guid childId);
        Task<bool> KickClassChildren(Guid childId, int classId);
        Task<bool> KickEnrichmentClassChildren(Guid childId, int classId);
        Task<List<ClassChildren>> GetEnrichmentClassChildrenWithParentIdChildrenIdAsync(Guid parentId, Guid childrenId);
        Task<List<ClassChildren>> GetEnrichmentClassChildrenWithParentIdAsync(Guid parentId);
    }
}
