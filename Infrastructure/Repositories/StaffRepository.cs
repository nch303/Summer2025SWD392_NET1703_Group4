using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.EntitiesConfigurations;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class StaffRepository: IStaffRepository
    {
        private readonly AppDbContext _context;

        public StaffRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Children>> GetNotEnrolledChildrenAsync()
        {
            // Fetch all children who are not enrolled in any class
            var notEnrolledChildren = await _context.Childrens
                .Include(c => c.Parents)
                .Where(c => c.Status == "Not Enrolled")
                .ToListAsync();
            return notEnrolledChildren;
        }

        public async Task<List<ClassChildren>> AssignChildrenListToClassAsync(int classId, List<Guid> childrenIds)
        {
            var classChildren = childrenIds.Select(id => new ClassChildren
            {
                ClassID = classId,
                ChildrenID = id
            }).ToList();

            _context.ClassChildrens.AddRange(classChildren);
            await _context.SaveChangesAsync();

            return classChildren;
        }

    }
}
