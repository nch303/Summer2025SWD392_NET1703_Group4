using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Interfaces
{
    public interface ISyllabusDetailService
    {
        Task<List<SyllabusDetail>> CreateSyllabusDetails(int syllabusId, List<SyllabusDetail> details);
        Task<List<SyllabusDetail>> GetAllSyllabusDetailBySyllabusId(int detailId);
        Task<SyllabusDetail?> GetById(int detailId);
        Task<SyllabusDetail> Update(int id, SyllabusDetail newDetail);
    }
}
