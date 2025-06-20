using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Domain.Interfaces
{
    public interface IAttendanceRepository
    {
        Task<List<Attendance>> GetOrCreateTodayAttendanceByTeacherIdAsync(Guid teacherId, int classId);
        Task<bool> UpdateAttendanceAsync(List<Attendance> attendances);
    }
}
