using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IStaffService
    {
        Task<List<ClassChildren>> AssignChildrenListToClassAsync(int classId, List<Guid> childrenIds);
        Task<bool> ReassignChildToNewClassAsync(Guid childId, int newClassId, int oldClassId);
        Task<ClassTeacher> AssignTeacherToClassAsync(int classId, Guid teacherId);
    }
}
