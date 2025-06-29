using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Domain.Interfaces
{
    public interface IGradeLevelRepository
    {
        Task<List<GradeLevel>> GetAllGradeLevelsAsync();
        Task<GradeLevel?> GetGradeLevelByIdAsync(int id);
        Task<GradeLevel> GetGradeLevelByNameAsync(string name);
    }
}
