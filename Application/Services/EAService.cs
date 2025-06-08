using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.DTOs.Request;
using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;

namespace Application.Services
{
    public class EAService : IEAService
    {
        private readonly IEARepository _eARepository;
        private readonly IAccountService _accountService;

        public EAService(IEARepository eARepository, IAccountService accountService)
        {
            _eARepository = eARepository;
            _accountService = accountService;
        }

        public async Task<EnrollmentApplication> CreateEnrollmentApplicationAsync(EnrollmentApplicationRequest request, Guid parentID, Guid childID)
        {
            var existingApplication = await _eARepository.GetApplicatioinByChildID(childID); // get pending and success applications

            if (existingApplication != null)
            {
                throw new InvalidOperationException("An enrollment application with the same ID already exists.");
            }

            var application = new EnrollmentApplication
            {
                ParentID = parentID,
                ChildrenID = childID,
                AcademicYear = request.AcademicYear,
                GradeLevelID = request.GradeLevelID,
                Status = "Pending",
                ApprovalDate = DateTime.Now, //dummy value
                StaffID = null
            };

            return await _eARepository.CreateEnrollmentApplicationAsync(application);
        }

        public async Task<List<EnrollmentApplication>> ViewListApplicationAsync(Guid parentID)
        {
            return await _eARepository.ViewListApplicationAsync(parentID);
        }

        public async Task<EnrollmentApplication> ViewApplicationDetail(Guid eAId)
        {
            return await _eARepository.ViewApplicationDetail(eAId);
        }

        public async Task<EnrollmentApplication> ApproveByStaff(Guid eAId)
        {
            var staff = await _accountService.GetCurrentAccount();
            var updated = await _eARepository.ApproveByStaff(eAId, staff.Id);
            return updated;
        }
        public async Task<EnrollmentApplication> RejectByStaff(Guid eAId)
        {
            var staff = await _accountService.GetCurrentAccount();
            var updated = await _eARepository.RejectByStaff(eAId, staff.Id);
            return updated;
        }

        public async Task<List<EnrollmentApplication>> GetAllApplications()
        {
            var applications = await _eARepository.GetAllApplications();
            return applications;
        }
    }
}
