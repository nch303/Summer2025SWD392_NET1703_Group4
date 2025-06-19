using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Interfaces
{
    public interface IClassChildrenService
    {
        Task<ClassChildren> GetCurrentAssignment(Guid childID);
        Task<List<ClassChildren>> GetChildrenByClassIdAsync(int classId);
    }
}
