using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IInvoiceRepository
    {
        Task<Invoice> CreateAsync(Invoice invoice);
        Task<Invoice?> UpdateStatusAsync(Guid id, string status);
        Task<Invoice?> GetByIdAsync(Guid id);
        Task<List<Invoice>> GetByAccountIdAsync(Guid accountId);
        Task<List<Invoice>> GetAllInvoiceAsync();
    }
}
