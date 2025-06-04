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

        public async Task<List<EnrollmentApplication>> ViewListApplicationAsync(Guid parentID)
        {
            var applications = await _context.EnrollmentApplications
                .Include(ea => ea.Childrens)
                .Include(ea => ea.GradeLevels)
                .Where(a => a.ParentID == parentID).ToListAsync();
            return applications!;
        }

        public async Task<EnrollmentApplication> ViewApplicationDetail(Guid eAId)
        {
            var application = await _context.EnrollmentApplications
               .Include(ea => ea.Childrens)
               .Include(ea => ea.Parent)
               .FirstOrDefaultAsync(ea => ea.ID == eAId);

            return application!;
        }
    }
}
