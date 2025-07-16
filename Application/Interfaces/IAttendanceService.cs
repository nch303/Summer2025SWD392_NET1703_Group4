using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Interfaces
{
    public interface IAttendanceService
    {
        Task<List<Attendance>> GetOrCreateTodayAttendanceByTeacherIdAsync(Guid teacherId, int classId);
        Task<List<Attendance>> GetAllAttendanceByClassIdAsync(int classId);
        Task<bool> UpdateAttendanceAsync(List<Attendance> attendances);
    }
}
