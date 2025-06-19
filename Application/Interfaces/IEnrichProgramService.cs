using Application.DTOs.Request;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IEnrichProgramService
    {
        Task<EnrichmentProgram> GetProgramByIdAsync(int? programId);
        Task<List<EnrichmentProgram>> GetAllEnrichmentProgramsAsync();
        Task<EnrichmentProgram> CreateEnrichmentProgramAsync(EnrichmentProgram enrichmentProgram);
        Task<EnrichmentProgram> UpdateEnrichmentProgramAsync(EnrichmentProgram enrichmentProgram);
        Task<bool> DeleteEnrichmentProgramAsync(EnrichmentProgram enrichmentProgram);
        Task<List<EnrichmentProgram>> SearchEnrichmentProgramAsync(string keyword);
    }
}
