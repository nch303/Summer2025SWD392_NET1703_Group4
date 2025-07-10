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
    public class EnrichProgramRepository : IEnrichProgramRepository
    {
        private readonly AppDbContext _context;
        public EnrichProgramRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<EnrichmentProgram> GetProgramByIdAsync(int? programId)
        {
            var program = await _context.EnrichmentPrograms.FindAsync(programId);
            return program!;
        }

        public async Task<List<EnrichmentProgram>> GetAllEnrichmentProgramsAsync()
        {
            var list = await _context.EnrichmentPrograms
                .Include(ep => ep.TypePrograms)
                .ToListAsync();
            return list;
        }

        public async Task<EnrichmentProgram> CreateEnrichmentProgram(EnrichmentProgram enrichmentProgram)
        {
            await _context.EnrichmentPrograms.AddAsync(enrichmentProgram);
            await _context.SaveChangesAsync();
            return enrichmentProgram;
        }

        public async Task<EnrichmentProgram> UpdateEnrichmentProgramAsync(EnrichmentProgram enrichmentProgram)
        {
            _context.EnrichmentPrograms.Update(enrichmentProgram);
            await _context.SaveChangesAsync();
            return enrichmentProgram;
        }

        public async Task<bool> DeleteEnrichmentProgramAsync(EnrichmentProgram enrichmentProgram)
        {
            enrichmentProgram.IsDelete = true;
            _context.EnrichmentPrograms.Update(enrichmentProgram);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<EnrichmentProgram>> SearchEnrichmentProgramAsync(string keyword)
        {
            return await _context.EnrichmentPrograms
                .Where(p => p.Name != null && p.Name.ToLower().Contains(keyword.ToLower()))
                .ToListAsync();
        }

        public async Task<List<EnrichmentProgram>> GetAllEnrichmentProgramsForParentAsync()
        {
            return await _context.EnrichmentPrograms
                .Where(ep => ep.EndDate >= DateTime.Now && !ep.IsDelete && ep.EndDate >= DateTime.UtcNow)
                .Include(ep => ep.TypePrograms)
                .ToListAsync();
        }
    }
}
