using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IInvoiceDetailRepository
    {
        Task<InvoiceDetail> CreateAsync(InvoiceDetail invoiceDetail);   
        Task<List<InvoiceDetail>> GetByInvoiceIdAsync(Guid invoiceId);
    }
}
