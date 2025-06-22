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
        Task<Syllabus> CreateSyllabus(Syllabus syllabus);
        Task<List<Syllabus>> GetAll();
        Task<Syllabus?> GetSyllabusById(int id);
        Task<Syllabus> Update(Syllabus newSyllabus);
    }
}
