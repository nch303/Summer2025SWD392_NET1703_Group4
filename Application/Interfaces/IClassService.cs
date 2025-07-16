using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Interfaces
{
    public interface IClassService
    {
        Task<Class> CreatClass(Class room);
        Task<Class> DeleteClass(int classID);
        Task<Class> RestoreClass(int classID);
        Task<Class> UpdateClass(int classID, Class room);
        Task<Class> GetClass(int classID);
        Task<List<Class>> GetAllClass();
        Task<List<Class>> GetClassByName(string name);
        Task<List<Class>> GetAllSortedClass(string type, string trend);
        Task<List<ClassChildren>> AssignChildIntoEnrichmentClass(int classId, List<Guid> childrenId);
        Task<List<Class>> GetByEnrichmentIdAsync(int enrichmentId);
        Task<List<Class>> GetClassesByChildIdAsync(Guid childId);
        Task<Class> OpenClass(int classID);
        Task<List<Class>> GetClassesByTeacherIdAsync(Guid teacherId);
        Task<List<Class>> GetClassesToAssignAsync();
        Task<Class> FinishClass(int classID);
    }
}
