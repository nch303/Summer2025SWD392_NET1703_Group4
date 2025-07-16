using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.EntitiesConfigurations;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class TypeProgramRepository : ITypeProgramRepository
    {
        private readonly AppDbContext _context;

        public TypeProgramRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<TypeProgram>? GetTypeByID(int id)
        {
            var type = await _context.TypePrograms.Where(a => a.ID == id).FirstOrDefaultAsync();
            return type!;
        }

        public async Task<List<TypeProgram>>? GetAllTypes()
        {
            var types = await _context.TypePrograms.ToListAsync();
            return types!;
        }

        public async Task<TypeProgram> CreateAsync(TypeProgram typeProgram)
        {
            _context.TypePrograms.Add(typeProgram);
            await _context.SaveChangesAsync();
            return typeProgram;
        }
    }
}
