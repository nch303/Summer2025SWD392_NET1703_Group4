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
        Task<List<Children>> SearchChildrenAsync(string searchTerm, int page, int pageSize);
        Task<List<Children>> SearchChildrenInClassAsync(int classId, string searchTerm);
        Task<List<Children>> GetPaidChildrenAsync();
        Task<List<Children>> GetChildrenByEnrichmentIdAsync(int enrichmentId);
    }
}
