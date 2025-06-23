using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Domain.Interfaces
{
    public interface ISyllabusDetailRepository
    {
        Task<List<SyllabusDetail>> CreateSyllabusDetails(int syllabusId, List<SyllabusDetail> details);
        Task<List<SyllabusDetail>> GetAllSyllabusDetailBySyllabusId(int detailId);
        Task<SyllabusDetail?> GetById(int detailId);
        Task<SyllabusDetail> Update(SyllabusDetail detail);
    }
}
