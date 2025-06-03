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
        Task<EnrollmentApplication> ViewApplicationAsync(Guid parentID);
    }
}
