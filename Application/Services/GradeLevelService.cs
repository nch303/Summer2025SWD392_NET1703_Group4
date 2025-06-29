using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;

namespace Application.Services
{
    public class GradeLevelService : IGradeLevelService
    {
        private readonly IGradeLevelRepository _repository;

        public GradeLevelService(IGradeLevelRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<GradeLevel>> GetAllGradeLevelsAsync()
        {
            return await _repository.GetAllGradeLevelsAsync();
        }

        public async Task<GradeLevel?> GetGradeLevelByIdAsync(int id)
        {
            var gradelevel = await _repository.GetGradeLevelByIdAsync(id);
            if (gradelevel == null)
            {
                throw new KeyNotFoundException($"Grade level with ID {id} not found.");
            }
            return gradelevel;
        }

        public async Task<GradeLevel> GetGradeLevelByNameAsync(string name)
        {
            var gradelevel = await _repository.GetGradeLevelByNameAsync(name);
            if (gradelevel == null)
            {
                throw new KeyNotFoundException($"Grade level with name {name} not found.");
            }
            return gradelevel;
        }
    }
}
