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
    }
}
