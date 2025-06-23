using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;

namespace Application.Services
{
    public class AttendanceService : IAttendanceService
    {
        private readonly IAttendanceRepository _attendanceRepository;

        public AttendanceService(IAttendanceRepository attendanceRepository)
        {
            _attendanceRepository = attendanceRepository;
        }

        public async Task<List<Attendance>> GetOrCreateTodayAttendanceByTeacherIdAsync(Guid teacherId, int classId)
        {
            return await _attendanceRepository.GetOrCreateTodayAttendanceByTeacherIdAsync(teacherId, classId);
        }

        public async Task<List<Attendance>> GetAllAttendanceByClassIdAsync(int classId)
        {
            return await _attendanceRepository.GetAllAttendanceByClassIdAsync(classId);
        }

        public async Task<bool> UpdateAttendanceAsync(List<Attendance> attendances)
        {
            return await _attendanceRepository.UpdateAttendanceAsync(attendances);
        }

    }
}
