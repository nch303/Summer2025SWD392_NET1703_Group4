using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class ChildrenGradeService : IChildrenGradeService
    {
        private readonly IChildrenGradeRepository _childrenGradeRepository;
        public ChildrenGradeService(IChildrenGradeRepository childrenGradeRepository)
        {
            _childrenGradeRepository = childrenGradeRepository;
        }
        public async Task<List<ChildrenGrade>> GetChildrenGradesByAccountIdAsync(Guid accountId)
        {
            return await _childrenGradeRepository.GetChildrenGradesByAccountIdAsync(accountId);
        }

        public async Task<List<ChildrenGrade>> GetChildrenGradesByChildrenIdAsync(Guid childrenId)
        {
            return await _childrenGradeRepository.GetChildrenGradesByChildrenIdAsync(childrenId);
        }

        public async Task<ChildrenGrade> CreateChildrenGradeAsync(ChildrenGrade childrenGrade)
        {
            return await _childrenGradeRepository.CreateChildrenGradeAsync(childrenGrade);
        }

        public async Task<ChildrenGrade> UpdateChildrenGradeAsync(ChildrenGrade childrenGrade)
        {
            return await _childrenGradeRepository.UpdateChildrenGradeAsync(childrenGrade);
        }
    }
}
