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

        public EAService(IEARepository eARepository)
        {
            _eARepository = eARepository;
        }

        public async Task<EnrollmentApplication> CreateEnrollmentApplicationAsync(EnrollmentApplicationRequest request, Guid parentID, Guid childID)
        {
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

        public async Task<EnrollmentApplication> ViewApplicationAsync(Guid parentID)
        {
            return await _eARepository.ViewApplicationAsync(parentID);
        }
    }
}
