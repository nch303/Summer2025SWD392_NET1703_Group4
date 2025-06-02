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
        public ChildrenService(IChildrenRepository childrenRepository, IAccountService accountService)
        {
            _accountService = accountService;
            _childrenRepository = childrenRepository;
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
            child.Status = "Not Enrolled";
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
    }
}
