using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IInvoiceDetailService
    {
        Task<InvoiceDetail> CreateAsync(InvoiceDetail invoiceDetail);
        Task<List<InvoiceDetail>> GetByInvoiceIdAsync(Guid invoiceId);
        Task<List<InvoiceDetail>> GetByTuitionIdAsync(int tuitionId);
        Task<List<InvoiceDetail>> GetByProgramIdAsync(int? programId);
    }
}
