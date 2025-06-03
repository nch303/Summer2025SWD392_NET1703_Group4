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
    public class EnrichProgramRepository: IEnrichProgramRepository
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
    }
}
