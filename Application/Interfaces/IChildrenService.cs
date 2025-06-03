using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Interfaces
{
    public interface IChildrenService
    {
        Task<Children> CreateChildAsync(Children child);
        Task<Children?> UpdateChildAsync(Children child);
        Task<Children?> GetChildByIdAsync(Guid id);
        Task<List<Children>> GetAllChildrenAsync();
        Task<List<Children>> GetChildrenByParentIdAsync(Guid id);

    }
}
