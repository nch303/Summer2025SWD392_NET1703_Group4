using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class InvoiceDetailService : IInvoiceDetailService
    {
        private readonly IInvoiceDetailRepository _invoiceDetailRepository;

        public InvoiceDetailService(IInvoiceDetailRepository invoiceDetailRepository)
        {
            _invoiceDetailRepository = invoiceDetailRepository ?? throw new ArgumentNullException(nameof(invoiceDetailRepository));
        }

        public async Task<InvoiceDetail> CreateAsync(InvoiceDetail invoiceDetail)
        {
            if (invoiceDetail == null) throw new ArgumentNullException(nameof(invoiceDetail));
            return await _invoiceDetailRepository.CreateAsync(invoiceDetail);
        }
    }
}
