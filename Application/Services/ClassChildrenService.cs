using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;

namespace Application.Services
{
    public class ClassChildrenService : IClassChildrenService
    {
        private readonly IClassChildrenRepository _repository;

        public ClassChildrenService(IClassChildrenRepository repository)
        {
            _repository = repository;
        }

        public async Task<ClassChildren> GetCurrentAssignment(Guid childID)
        {
            var assignments = await _repository.GetCurrentAssignment(childID);
            var currentAssignment = assignments[assignments.Count - 1];
            return currentAssignment;
        }

        public async Task<List<ClassChildren>> GetChildrenByClassIdAsync(int classId)
        {
            var children = await _repository.GetChilldrenByClassIdAsync(classId);
            return children;
        }

        public async Task<List<ClassChildren>> GetAllAsync()
        {
            var allChildren = await _repository.GetAllAsync();
            return allChildren;
        }

        public async Task<List<ClassChildren>> GetByParentIdAsync(Guid parentId)
        {
            var children = await _repository.GetByParentIdAsync(parentId);
            return children;
        }

        public async Task<List<ClassChildren>> GetByChildIdAsync(Guid childId)
        {
            var children = await _repository.GetByChildIdAsync(childId);
            return children;
        }

        public async Task<bool> KickClassChildren(Guid childId, int classId)
        {
            var classChildren = await _repository.GetChilldrenByClassIdAsync(classId);
            if (classChildren.Count != 0 && classChildren.Where(cc => cc.ChildrenID == childId).Count() != 0)
            {
                return await _repository.KickClassChildren(childId, classId);
            }
            else return false;
        }

        public async Task<bool> KickEnrichmentClassChildren(Guid childId, int classId)
        {
            var classChildren = await _repository.GetChilldrenByClassIdAsync(classId);
            if (classChildren.Count != 0 && classChildren.Where(cc => cc.ChildrenID == childId).Count() != 0)
            {
                return await _repository.KickEnrichmentClassChildren(childId, classId);
            }
            else return false;
        }

        public async Task<List<ClassChildren>> GetEnrichmentClassChildrenWithParentIdChildrenIdAsync(Guid parentId, Guid childrenId)
        {
            var enrichmentChildren = await _repository.GetEnrichmentClassChildrenWithParentIdChildrenIdAsync(parentId, childrenId);
            return enrichmentChildren;
        }

        public async Task<List<ClassChildren>> GetEnrichmentClassChildrenWithParentIdAsync(Guid parentId)
        {
            var enrichmentChildren = await _repository.GetEnrichmentClassChildrenWithParentIdAsync(parentId);
            return enrichmentChildren;
        }

        public async Task<List<ClassChildren>> UpdateClassChildrenAsync(ClassChildren classChildren)
        {
            var updatedChildren = await _repository.UpdateClassChildrenAsync(classChildren);
            return updatedChildren;
        }
    }
}
