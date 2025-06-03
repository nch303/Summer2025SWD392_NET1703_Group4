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
    public class EARepository : IEARepository
    {
        private readonly AppDbContext _context;

        public EARepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<EnrollmentApplication> CreateEnrollmentApplicationAsync(EnrollmentApplication application)
        {
            try
            {
                _context.EnrollmentApplications.Add(application);
                await _context.SaveChangesAsync();
                return application;
            }
            catch (DbUpdateException ex)
            {
                throw new Exception("Database update failed: " + ex.InnerException?.Message, ex);
            }
        }

        public async Task<EnrollmentApplication> ViewApplicationAsync(Guid parentID)
        {
            var application = await _context.EnrollmentApplications.FirstOrDefaultAsync(a => a.ParentID == parentID);
            return application!;
        }
    }
}
