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
    public class ChildrenRepository : IChildrenRepository
    {
        private readonly AppDbContext _context;

        public ChildrenRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Children> CreateChildAsync(Children child)
        {
            _context.Childrens.Add(child);
            await _context.SaveChangesAsync();
            return child;
        }

        public async Task<Children> UpdateChildAsync(Children child)
        {
            var existingChild = _context.Childrens.FirstOrDefault(c => c.ID == child.ID);
            existingChild.Name = child.Name;
            existingChild.Birthday = child.Birthday;
            existingChild.Gender = child.Gender;
            existingChild.City = child.City;
            existingChild.Avatar = child.Avatar;
            existingChild.BirthCertificate = child.BirthCertificate;
            _context.Childrens.Update(existingChild);
            await _context.SaveChangesAsync();
            return existingChild;
        }

        public async Task<Children> GetChildByIdAsync(Guid id)
        {
            return await _context.Childrens.FindAsync(id);
        }

        public async Task<List<Children>> GetAllChildrenAsync()
        {
            return await _context.Childrens
        .Where(c => c.Status == "Active")
        .ToListAsync();
        }

        public async Task<List<Children>> GetChildrenByParentIdAsync(Guid id)
        {
            return await _context.Childrens
                .Where(c => c.ParentID == id)
                .ToListAsync();
        }
    }
}
