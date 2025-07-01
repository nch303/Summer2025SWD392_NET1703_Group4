using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Interfaces
{
    public interface ITypeProgramService
    {
        Task<string>? GetTypeNameByID(int id);
        Task<List<TypeProgram>>? GetAllTypes();
        Task<TypeProgram> CreateAsync(TypeProgram typeProgram);
    }
}
