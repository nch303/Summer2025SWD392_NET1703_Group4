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
    public class EnrichProgramService: IEnrichProgramService
    {
        private readonly IEnrichProgramRepository _enrichProgramRepository;

        public EnrichProgramService(IEnrichProgramRepository enrichProgramRepository)
        {
            _enrichProgramRepository = enrichProgramRepository;
        }
        public async Task<EnrichmentProgram> GetProgramByIdAsync(int? programId)
        {
            var program = await _enrichProgramRepository.GetProgramByIdAsync(programId);
            if (program == null)
            {
                throw new KeyNotFoundException($"Program with ID {programId} not found.");
            }
            return program;
        }

        public async Task<List<EnrichmentProgram>> GetAllEnrichmentProgramsAsync()
        {
            var list = await _enrichProgramRepository.GetAllEnrichmentProgramsAsync();
            return list;
        }
    }
   
}
