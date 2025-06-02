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
    public class InvoiceService : IInvoiceService
    {
        private readonly IInvoiceRepository _invoiceRepository;
        public InvoiceService(IInvoiceRepository invoiceRepository)
        {
            _invoiceRepository = invoiceRepository ?? throw new ArgumentNullException(nameof(invoiceRepository));
        }
        public async Task<Invoice> CreateAsync(Invoice invoice)
        {
            if (invoice == null) throw new ArgumentNullException(nameof(invoice));
            return await _invoiceRepository.CreateAsync(invoice);
        }

        public async Task<Invoice?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty) throw new ArgumentException("Invalid invoice ID", nameof(id));
            return await _invoiceRepository.GetByIdAsync(id);
        }

        public async Task<Invoice?> UpdateStatusAsync(Guid id, string status)
        {
            if (id == Guid.Empty) throw new ArgumentException("Invalid invoice ID", nameof(id));
            if (string.IsNullOrEmpty(status)) throw new ArgumentException("Status cannot be null or empty", nameof(status));
            return await _invoiceRepository.UpdateStatusAsync(id, status);
        }

        public async Task<List<Invoice>> GetByAccountIdAsync(Guid accountId)
        {
            if (accountId == Guid.Empty) throw new ArgumentException("Invalid account ID", nameof(accountId));
            var invoices = await _invoiceRepository.GetAllInvoiceAsync();
            return invoices.Where(i => i.AccountID == accountId).ToList();
        }

        public async Task<List<Invoice>> GetAllInvoiceAsync()
        {
            return await _invoiceRepository.GetAllInvoiceAsync();
        }
    }
}
