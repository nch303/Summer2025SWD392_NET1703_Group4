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
        Task<Syllabus> CreateSyllabus(Syllabus syllabus);
        Task<List<Syllabus>> GetAll();
        Task<bool> DeleteSyllabusAsync(int id);
        Task<List<Syllabus>> Update(List<Syllabus> newSyllabus);
    }
}
