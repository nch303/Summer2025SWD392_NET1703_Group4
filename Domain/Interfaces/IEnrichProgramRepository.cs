using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IEnrichProgramRepository
    {
        Task<EnrichmentProgram> GetProgramByIdAsync(int? programId);
        Task<List<EnrichmentProgram>> GetAllEnrichmentProgramsAsync();
        Task<EnrichmentProgram> CreateEnrichmentProgram(EnrichmentProgram enrichmentProgram);
        Task<EnrichmentProgram> UpdateEnrichmentProgramAsync(EnrichmentProgram enrichmentProgram);
        Task<bool> DeleteEnrichmentProgramAsync(EnrichmentProgram enrichmentProgram);

    }
}
