using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.EntitiesConfigurations;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class RoleRepository : IRoleRepository
    {
        private readonly AppDbContext _context;

        public RoleRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Role> GetById(int id)
        {
            var role = await _context.Roles.FindAsync(id);
            return role!;
        }
    }
}
