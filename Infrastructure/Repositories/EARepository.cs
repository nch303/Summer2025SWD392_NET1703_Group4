using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.EntitiesConfigurations;
using Microsoft.EntityFrameworkCore;
using static System.Net.Mime.MediaTypeNames;

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

        public async Task<EnrollmentApplication> GetApplicatioinByChildID(Guid childId)
        {
                var application = await _context.EnrollmentApplications.Where(ea => ea.Status != "Rejected").FirstOrDefaultAsync(ea => ea.ChildrenID == childId);
                return application!;
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

        public async Task<EnrollmentApplication> ApproveByStaff(Guid eAId, Guid staffID)
        {
            var application = await _context.EnrollmentApplications.FirstOrDefaultAsync(ea=>ea.ID == eAId);
            if (application == null)
            {
                throw new Exception("Cannot found application");
            }
            application!.Status = "Approved";
            application.StaffID = staffID;
            application.ApprovalDate = DateTime.Now;
            _context.EnrollmentApplications.Update(application);
            await _context.SaveChangesAsync();
            return application!;
        }

        public async Task<EnrollmentApplication> RejectByStaff(Guid eAId, Guid staffID)
        {
            var application = await _context.EnrollmentApplications.FirstOrDefaultAsync(ea => ea.ID == eAId);
            if (application == null)
            {
                throw new Exception("Cannot found application");
            }
            application!.Status = "Rejected";
            application.StaffID = staffID;
            application.ApprovalDate = DateTime.Now;
            _context.EnrollmentApplications.Update(application);
            await _context.SaveChangesAsync();
            return application!;
        }

        public async Task<List<EnrollmentApplication>> GetAllApplications()
        {
            var applications = await _context.EnrollmentApplications
                .Include(ea => ea.Childrens)
                .Include(ea => ea.Parent)
                .Include(ea => ea.Staff)
                .Include(ea => ea.GradeLevels)
                .ToListAsync();
            return applications;
        }
    }
}
