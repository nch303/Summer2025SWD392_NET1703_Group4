using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Domain.Interfaces
{
    public interface IEARepository
    {
        Task<EnrollmentApplication> CreateEnrollmentApplicationAsync(EnrollmentApplication enrollmentApplication);
        Task<List<EnrollmentApplication>> ViewListApplicationAsync(Guid parentID);
        Task<EnrollmentApplication> ViewApplicationDetail(Guid eAId);
        Task<EnrollmentApplication> ApproveByStaff(Guid eAId, Guid staffID);
        Task<EnrollmentApplication> RejectByStaff(Guid eAId, Guid staffID);
        Task<List<EnrollmentApplication>> GetAllApplications();
    }
}
