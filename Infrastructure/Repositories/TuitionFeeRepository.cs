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
    public class TuitionFeeRepository : ITuitionFeeRepositiry
    {
        private readonly AppDbContext _context;

        public TuitionFeeRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<TuitionFee>> GetTuitionFeeByCurrentAccount()
        {
            return await _context.TuitionFees.ToListAsync();
        }

        public async Task<TuitionFee?> GetTuitionFeeByIdAsync(int? id)
        {
            return await _context.TuitionFees.FirstOrDefaultAsync(t => t.ID == id);
        }

        public async Task<TuitionFee> GetTuitionFeeByNameAsync(string name)
        {
            var tuition = await _context.TuitionFees.FirstOrDefaultAsync(t => t.Name!.Contains(name));
            return tuition!;
        }

        public async Task<TuitionFee> GetByGradeLevelIdAsync(int gradeLevelId)
        {
            var tuition = await _context.TuitionFees.FirstOrDefaultAsync(t => t.GradeLevelID == gradeLevelId);
            return tuition!;
        }
    }
}
