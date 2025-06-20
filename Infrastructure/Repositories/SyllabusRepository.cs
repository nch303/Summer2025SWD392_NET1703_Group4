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

        public async Task<Syllabus> CreateAsync(Syllabus syllabus, SyllabusDetail detail)
        {
            try
            {
                _context.Syllabi.Add(syllabus);
                await _context.SaveChangesAsync();

                detail.SyllabusID = syllabus.ID;
                _context.SyllabusDetails.Add(detail);
                await _context.SaveChangesAsync();
                return syllabus;
            }
            catch (DbUpdateException ex)
            {
                throw new Exception("Database save failed: " + ex.InnerException?.Message, ex);
            }
        }

        public async Task<List<Syllabus>> GetAllAsync()
        {
            return await _context.Syllabi
                .ToListAsync();
        }

        public async Task<SyllabusDetail?> GetDetailByIdAsync(int id)
        {
            return await _context.SyllabusDetails
                .Include(s => s.Syllabi)
                .FirstOrDefaultAsync(s => s.SyllabusID == id);
        }

        public async Task<Syllabus?> GetSyllabusById(int id)
        {
            return await _context.Syllabi
                .FirstOrDefaultAsync(s => s.ID == id);
        }

        public async Task<Syllabus> UpdateAsync(Syllabus syllabus, SyllabusDetail detail)
        {
            _context.Syllabi.Update(syllabus);
            _context.SyllabusDetails.Update(detail);
            await _context.SaveChangesAsync();
            return syllabus;
        }
    }
}
