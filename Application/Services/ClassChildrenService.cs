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
            var currentAssignment = await _repository.GetCurrentAssignment(childID);
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
            if (classChildren.Count != 0 && classChildren.Where(cc => cc.ChildrenID == childId).Count() !=0)
            {
                return await _repository.KickClassChildren(childId, classId);
            }
            else return false;
        }
    }
}
