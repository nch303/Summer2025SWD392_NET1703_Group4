using Domain.Entities;

namespace Domain.Interfaces
{
    public interface IClassRepository
    {
        Task<Class> CreatClass(Class room);
        Task<Class> DeleteClass(int classID);
        Task<Class> RestoreClass(int classID);
        Task<Class> GetClass(int classID);
        Task<Class> UpdateClass(int classID, Class newClass);
        Task<List<Class>> GetAllClass();
        Task<List<Class>> GetClassByName(string name);
        Task<List<Class>> GetAllSortedClass(string type, string trend);
    }
}
