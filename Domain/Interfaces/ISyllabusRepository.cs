using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Domain.Interfaces
{
    public interface ISyllabusRepository
    {
        Task<Syllabus> CreateAsync(Syllabus syllabus, SyllabusDetail detail);
        Task<List<Syllabus>> GetAllAsync();
        Task<SyllabusDetail?> GetDetailByIdAsync(int id);
        Task<Syllabus?> GetSyllabusById(int id);
        Task<Syllabus> UpdateAsync(Syllabus newSyllabus, SyllabusDetail newSyllabusDetail);
    }
}
