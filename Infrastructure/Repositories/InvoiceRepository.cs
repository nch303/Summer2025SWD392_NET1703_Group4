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

        public async Task<Invoice> GetByIdAsync(Guid id)
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
    }
}
