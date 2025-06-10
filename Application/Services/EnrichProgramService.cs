using Application.DTOs.Request;
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
    public class EnrichProgramService : IEnrichProgramService
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
            return list.Where(p => !p.IsDelete).ToList();
        }

        public async Task<EnrichmentProgram> CreateEnrichmentProgramAsync(EnrichmentProgram enrichmentProgram)
        {
            return await _enrichProgramRepository.CreateEnrichmentProgram(enrichmentProgram);
        }

        public async Task<EnrichmentProgram> UpdateEnrichmentProgramAsync(EnrichmentProgram enrichmentProgram)
        {
            return await _enrichProgramRepository.UpdateEnrichmentProgramAsync(enrichmentProgram);
        }

        public async Task<bool> DeleteEnrichmentProgramAsync(EnrichmentProgram enrichmentProgram)
        {
            return await _enrichProgramRepository.DeleteEnrichmentProgramAsync(enrichmentProgram);
        }
    }
}
   

