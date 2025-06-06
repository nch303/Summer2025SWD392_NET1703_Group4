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
    public class TypeProgramService : ITypeProgramService
    {
        private readonly ITypeProgramRepository _repository;

        public TypeProgramService(ITypeProgramRepository repository)
        {
            _repository = repository;
        }

        public async Task<string>? GetTypeNameByID(int id)
        {
            var type =  await _repository.GetTypeByID(id)!;
            return type.Name!;
        }
    }
}
