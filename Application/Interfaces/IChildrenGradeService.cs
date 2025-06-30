using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IChildrenGradeService
    {
        Task<List<ChildrenGrade>> GetChildrenGradesByAccountIdAsync(Guid accountId);
        Task<List<ChildrenGrade>> GetChildrenGradesByChildrenIdAsync(Guid childrenId);
        Task<ChildrenGrade> CreateChildrenGradeAsync(ChildrenGrade childrenGrade);  
        Task<ChildrenGrade> UpdateChildrenGradeAsync(ChildrenGrade childrenGrade);
        Task<List<ChildrenGrade>> GetInActiveChildrenGradeAsync();
    }
}
