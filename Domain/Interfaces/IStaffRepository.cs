using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IStaffRepository
    {
        Task<List<Children>> GetNotEnrolledChildrenAsync();
        Task<List<ClassChildren>> AssignChildrenListToClassAsync(int classId, List<Guid> childrenIds);
        Task<bool> ReassignChildToNewClassAsync(Guid childId, int newClassId);
        Task<ClassTeacher> AssignTeacherToClassAsync(int classId, Guid teacherId);
        Task<bool> IsTeacherAssignedToClassAsync(int classId, Guid teacherId);
    }
}
