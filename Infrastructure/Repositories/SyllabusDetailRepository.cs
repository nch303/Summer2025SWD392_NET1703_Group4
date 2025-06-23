using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.EntitiesConfigurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure.Repositories
{
    public class SyllabusDetailRepository : ISyllabusDetailRepository
    {
        private readonly AppDbContext _context;

        public SyllabusDetailRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<SyllabusDetail>> CreateSyllabusDetails(int syllabusId, List<SyllabusDetail> details)
        {
            try
            {
                var syllabus = await _context.Syllabi
                 .Include(s => s.SyllabusDetails)
                 .FirstOrDefaultAsync(s => s.ID == syllabusId);

                int existingCount = syllabus!.SyllabusDetails!.Count;
                int slotAmount = syllabus.SlotAmount;

                if (existingCount + details.Count > slotAmount)
                    throw new Exception($"Cannot add more than {slotAmount} slots. Currently has {existingCount}, trying to add {details.Count}.");

                int slotStart = existingCount == 0 ? 1 : syllabus.SyllabusDetails.Max(d => d.Slot) + 1;

                foreach (var detail in details)
                {
                    detail.SyllabusID = syllabusId;
                    detail.Slot = slotStart++;
                    _context.SyllabusDetails.Add(detail);
                }

                await _context.SaveChangesAsync();
                return details;
            }
            catch (DbUpdateException ex)
            {
                // Log inner exception details
                var inner = ex.InnerException?.Message ?? ex.Message;
                throw new Exception($"Save failed: {inner}");
            }
        }


        public async Task<List<SyllabusDetail>> GetAllSyllabusDetailBySyllabusId(int syllabusId)
        {
            return await _context.SyllabusDetails.Where(sd => sd.SyllabusID == syllabusId).ToListAsync();
        }

        public async Task<SyllabusDetail?> GetById(int detailId)
        {
            return await _context.SyllabusDetails.FirstOrDefaultAsync(sd => sd.ID == detailId);
        }

        public async Task<SyllabusDetail> Update(SyllabusDetail detail)
        {
            _context.SyllabusDetails.Update(detail);
            await _context.SaveChangesAsync();
            return detail;
        }
    }
}
