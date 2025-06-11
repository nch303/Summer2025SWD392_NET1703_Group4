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
    public class ClassChildrenRepository : IClassChildrenRepository
    {
        private readonly AppDbContext _context;
        public ClassChildrenRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ClassChildren> GetCurrentAssignment(Guid childID)
        {
            var assignment = await _context.ClassChildrens.FirstOrDefaultAsync(cc => cc.ChildrenID == childID);
            return assignment!;
        }
    }
}
