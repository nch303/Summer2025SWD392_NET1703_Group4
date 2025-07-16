using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.EntitiesConfigurations;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class SyllabusRepository : ISyllabusRepository
    {
        private readonly AppDbContext _context;

        public SyllabusRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Syllabus> CreateSyllabus(Syllabus syllabus)
        {
            try
            {
                _context.Syllabi.Add(syllabus);
                await _context.SaveChangesAsync();
                return syllabus;
            }
            catch (DbUpdateException ex)
            {
                throw new Exception("Database save failed: " + ex.InnerException?.Message, ex);
            }
        }

        public async Task<List<Syllabus>> GetAll()
        {
            return await _context.Syllabi
                .ToListAsync();
        }

        public async Task<Syllabus?> GetSyllabusById(int id)
        {
            return await _context.Syllabi
                .FirstOrDefaultAsync(s => s.ID == id);
        }

        public async Task<Syllabus> Update(Syllabus syllabus)
        {
            _context.Syllabi.Update(syllabus);
            await _context.SaveChangesAsync();
            return syllabus;
        }

        public async Task<bool> DeleteSyllabus(int id)
        {
            var syllabus = await GetSyllabusById(id);
            if (syllabus == null)
            {
                return false;
            }

            syllabus.IsDeleted = true;
            _context.Syllabi.Update(syllabus);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
