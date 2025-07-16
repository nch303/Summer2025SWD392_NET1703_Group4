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
            var type = await _repository.GetTypeByID(id)!;
            if (type == null)
            {
                throw new ArgumentException($"Type with ID {id} not found.");
            }
            return type.Name!;
        }

        public async Task<List<TypeProgram>>? GetAllTypes()
        {
            var types = await _repository.GetAllTypes()!;
            if (types == null || !types.Any())
            {
                throw new InvalidOperationException("No types found.");
            }
            return types;
        }

        public async Task<TypeProgram> CreateAsync(TypeProgram typeProgram)
        {
            if (typeProgram == null)
            {
                throw new ArgumentNullException(nameof(typeProgram), "TypeProgram cannot be null.");
            }
            var types = await _repository.GetAllTypes()!;
            var existingType = types.FirstOrDefault(t => t.Name == typeProgram.Name);
            if (existingType != null)
            {
                throw new InvalidOperationException($"Type with name {typeProgram.Name} already exists.");
            }

            return await _repository.CreateAsync(typeProgram);
        }
    }
}
