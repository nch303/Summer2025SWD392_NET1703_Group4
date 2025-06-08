using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.DTOs.Request;
using Domain.Entities;

namespace Application.Interfaces
{
    public interface IEAService
    {
        Task<EnrollmentApplication> CreateEnrollmentApplicationAsync(EnrollmentApplicationRequest request, Guid parentID, Guid childID);
        Task<List<EnrollmentApplication>> ViewListApplicationAsync(Guid parentID);
        Task<EnrollmentApplication> ViewApplicationDetail(Guid eAId);
        Task<EnrollmentApplication> ApproveByStaff(Guid eAId);
        Task<EnrollmentApplication> RejectByStaff(Guid eAId);
        Task<List<EnrollmentApplication>> GetAllApplications();
    }
}
