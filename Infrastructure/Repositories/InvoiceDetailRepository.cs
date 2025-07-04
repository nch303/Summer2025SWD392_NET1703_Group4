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
    public class InvoiceDetailRepository : IInvoiceDetailRepository
    {
        private readonly AppDbContext _context;

        public InvoiceDetailRepository(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<InvoiceDetail> CreateAsync(InvoiceDetail invoiceDetail)
        {
            if (invoiceDetail == null) throw new ArgumentNullException(nameof(invoiceDetail));
            _context.InvoiceDetails.Add(invoiceDetail);
            await _context.SaveChangesAsync();
            return invoiceDetail;
        }

        public async Task<List<InvoiceDetail>> GetByInvoiceIdAsync(Guid invoiceId)
        {
            return await _context.InvoiceDetails
                .Where(id => id.InvoiceID == invoiceId)
                .ToListAsync();
        }

        public async Task<List<InvoiceDetail>> GetByTuitionIdAsync(int tuitionId)
        {
            return await _context.InvoiceDetails
                .Where(id => id.TuitionFeeID == tuitionId)
                .ToListAsync();
        }

        public async Task<List<InvoiceDetail>> GetByProgramIdAsync(int? programId)
        {
            return await _context.InvoiceDetails
                .Where(id => id.ProgramID == programId)
                .Include(id => id.Invoices)
                .ToListAsync();
        }
    }
}
