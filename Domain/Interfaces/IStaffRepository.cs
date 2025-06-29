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
        Task<List<ClassChildren>> AssignChildrenListToClassAsync(int classId, List<Guid> childrenIds);
        Task<bool> ReassignChildToNewClassAsync(Guid childId, int newClassId, int oldClassId);
        Task<ClassTeacher> AssignTeacherToClassAsync(int classId, Guid teacherId);
        Task<bool> IsTeacherAssignedInAcademicYearAsync(Guid teacherId, string academicYear);
        Task<List<ChildrenGrade>> UpgradeChildren(List<Guid> childrenIds);
    }
}
