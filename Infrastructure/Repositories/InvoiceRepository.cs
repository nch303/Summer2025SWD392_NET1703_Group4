using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.EntitiesConfigurations;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class InvoiceRepository : IInvoiceRepository
    {
        private readonly AppDbContext _context;

        public InvoiceRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Invoice> CreateAsync(Invoice invoice)
        {
            if (invoice == null) throw new ArgumentNullException(nameof(invoice));
            _context.Invoices.Add(invoice);
            await _context.SaveChangesAsync();
            return invoice;
        }

        public async Task<Invoice> GetByIdAsync(Guid? id)
        {
            if (id == Guid.Empty) ;
            return await _context.Invoices.FindAsync(id);
        }

        public async Task<Invoice?> UpdateStatusAsync(Guid id, string status)
        {
            var invoice = _context.Invoices.Find(id);
            invoice!.Status = status;
            _context.Invoices.Update(invoice);
            await _context.SaveChangesAsync();
            return invoice;
        }

        public async Task<List<Invoice>> GetByAccountIdAsync(Guid accountId)
        {
            return await _context.Invoices.Where(i => i.AccountID == accountId).ToListAsync();
        }

        public async Task<List<Invoice>> GetAllInvoiceAsync()
        {
            return await _context.Invoices.ToListAsync();
        }

        public async Task<Invoice> UpdateInvoiceAsync(Invoice invoice)
        {
            var existingInvoice = await _context.Invoices.FindAsync(invoice.ID);
            var updateInvoice = new Invoice
            {
                ID = invoice.ID,
                AccountID = invoice.AccountID,
                ChildrenID = invoice.ChildrenID,
                Amount = invoice.Amount,
                Date = invoice.Date,
                Status = invoice.Status,
                PaymentLink = invoice.PaymentLink,
                Name = invoice.Name
            };

            _context.Invoices.Update(invoice);
            await _context.SaveChangesAsync();
            return invoice;
        }

        public async Task<List<InvoiceDetail>> GetInvoiceDetailsByChildrenIdAndEnrichProgramIdAsync(Guid childrenId, int enrichmentProgramId)
        {
            var invoiceDetails = await _context.InvoiceDetails
                .Where(id => id.ChildrenID == childrenId && id.ProgramID == enrichmentProgramId)
                .ToListAsync();
            return invoiceDetails;
        }

        public async Task<List<Invoice>> GetAwaitingRefundInvoicesAsync()
        {
            return await _context.Invoices
                .Include(i => i.Childrens)
                .Include(i => i.Accounts)
                .Where(i => i.Status == "Awaiting" || i.Status == "Refunded")
                .ToListAsync();
        }

        public async Task<Invoice> GetRefundByInvoiceID(Guid invoiceId)
        {
            var invoice = await _context.Invoices
                .Include(i => i.Childrens)
                .Include(i => i.Accounts)
                .FirstOrDefaultAsync(i => i.Name!.Contains(invoiceId.ToString()));
            return invoice;
        }
    }
}
