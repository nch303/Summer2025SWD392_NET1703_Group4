using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class RoleService : IRoleService
    {
        private readonly IRoleRepository _roleRepository;

        public RoleService(IRoleRepository roleRepository)
        {
            _roleRepository = roleRepository;
        }
        public async Task<Role> GetById(int id)
        {
            var role = await _roleRepository.GetById(id);
            if (role == null)
            {
                throw new KeyNotFoundException($"Role with ID {id} not found.");
            }
            return role;
        }

        public async Task<List<Role>> GetAllAsync()
        {
            var roles = await _roleRepository.GetAllAsync();
            if (roles == null)
            {
                throw new KeyNotFoundException("No roles found.");
            }
            return roles;
        }

        public async Task<Role> CreateAsync(Role role)
        {
            if (role == null)
            {
                throw new ArgumentNullException(nameof(role), "Role cannot be null.");
            }
            
            var roles = await _roleRepository.GetAllAsync();

            if (roles.Any(r => r.Name.Equals(role.Name, StringComparison.OrdinalIgnoreCase)))
            {
                throw new InvalidOperationException($"Role with name {role.Name} already exists.");
            }

            return await _roleRepository.CreateAsync(role);
        }
    }
}
