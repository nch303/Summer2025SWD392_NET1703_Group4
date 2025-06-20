using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Interfaces
{
    public interface ISyllabusService
    {
        Task<Syllabus> CreateAsync(Syllabus syllabus, SyllabusDetail detail);
        Task<List<Syllabus>> GetAllAsync();
        Task<SyllabusDetail?> GetDetailByIdAsync(int id);
        Task<Syllabus> UpdateAsync(int id, Syllabus newSyllabus, SyllabusDetail newDetail);
    }
}
