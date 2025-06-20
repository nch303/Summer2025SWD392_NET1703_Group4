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
    public class ChildrenService : IChildrenService
    {
        private readonly IChildrenRepository _childrenRepository;
        private readonly IAccountService _accountService;
        private readonly IClassService _classService;   
        public ChildrenService(IChildrenRepository childrenRepository, IAccountService accountService, IClassService classService)
        {
            _accountService = accountService;
            _childrenRepository = childrenRepository;
            _classService = classService;
        }
        public async Task<Children> CreateChildAsync(Children child)
        {
            if (child == null)
            {
                throw new ArgumentNullException(nameof(child), "Child cannot be null");
            }
            var account = await _accountService.GetCurrentAccount();
            child.ParentID = account.Id;
            child.ID = Guid.NewGuid();
            child.Status = "Temporary";
            return await _childrenRepository.CreateChildAsync(child);
        }

        public async Task<Children> UpdateChildAsync(Children child)
        {
            await _childrenRepository.UpdateChildAsync(child);
            return child;
        }

        public async Task<Children> GetChildByIdAsync(Guid id)
        {
            var child = await _childrenRepository.GetChildByIdAsync(id);
            if (child == null)
            {
                throw new Exception("Child not found.");
            }
            return child;
        }

        public async Task<List<Children>> GetAllChildrenAsync()
        {
            return await _childrenRepository.GetAllChildrenAsync();
        }

        public async Task<List<Children>> GetChildrenByParentIdAsync(Guid parentId)
        {
            var children = await _childrenRepository.GetChildrenByParentIdAsync(parentId);
            if (children == null || children.Count == 0)
            {
                throw new Exception("No children found for this parent.");
            }
            return children;
        }

        public async Task<List<Children>> SearchChildrenAsync(string searchTerm, int page, int pageSize)
        {
            return await _childrenRepository.SearchChildrenAsync(searchTerm, page, pageSize);
        }

        public async Task<List<Children>> SearchChildrenInClassAsync(int classId, string searchTerm)
        {
            return await _childrenRepository.SearchChildrenInClassAsync(classId, searchTerm);
        }

        public async Task<List<Children>> GetPaidChildrenAsync()
        {
            return await _childrenRepository.GetPaidChildrenAsync();

        }

        public async Task<List<Children>> GetChildrenByEnrichmentIdAsync(int enrichmentId)
        {
            var classes = await _classService.GetByEnrichmentIdAsync(enrichmentId);
            var children = classes.SelectMany(c => c.ClassChildrens!.Where(c => c.Status == "Active").Select(cc => cc.Childrens)).ToList();
            return children!;
        }
    }
}
