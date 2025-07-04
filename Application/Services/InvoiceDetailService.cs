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

        public async Task<List<InvoiceDetail>> GetByInvoiceIdAsync(Guid invoiceId)
        {
            var invoiceDetails = await _invoiceDetailRepository.GetByInvoiceIdAsync(invoiceId);
            if (invoiceDetails.Count == 0)
            {
                throw new KeyNotFoundException($"No invoice details found for Invoice ID: {invoiceId}");
            }
            return invoiceDetails;
        }

        public async Task<List<InvoiceDetail>> GetByTuitionIdAsync(int tuitionId)
        {
            var invoiceDetails = await _invoiceDetailRepository.GetByTuitionIdAsync(tuitionId);
            if (invoiceDetails.Count == 0)
            {
                throw new KeyNotFoundException($"No invoice details found for Tuition ID: {tuitionId}");
            }
            return invoiceDetails;
        }

        public async Task<List<InvoiceDetail>> GetByProgramIdAsync(int? programId)
        {
            var invoiceDetails = await _invoiceDetailRepository.GetByProgramIdAsync(programId);
            if (invoiceDetails.Count == 0)
            {
                throw new KeyNotFoundException($"No invoice details found for Program ID: {programId}");
            }
            return invoiceDetails;
        }
    }
}
