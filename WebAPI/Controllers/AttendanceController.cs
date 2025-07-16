using System.Security.Claims;
using Application.DTOs.Request;
using Application.DTOs.Response;
using Application.Interfaces;
using Application.Services.AuthService;
using AutoMapper;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AttendanceController : Controller
    {
        private readonly IAttendanceService _attendanceService;
        private readonly IMapper _mapper;
        private readonly IAccountService _accountService;

        public AttendanceController(IMapper mapper, IAttendanceService attendanceService, IAccountService accountService)
        {
            _attendanceService = attendanceService;
            _mapper = mapper;
            _accountService = accountService;
        }

        [HttpGet("{classId}/teacher-today")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> GetOrCreateTodayAttendance(int classId)
        {
            try
            {
                var account = await _accountService.GetCurrentAccount();
                var teacherId = account.Id;
                var attendanceList = await _attendanceService.GetOrCreateTodayAttendanceByTeacherIdAsync(teacherId, classId);
                var response = _mapper.Map<List<AttendanceResponse>>(attendanceList);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{classId}/get-all-class-attendance")]
        [Authorize]
        public async Task<IActionResult> GetAllClassAttendance(int classId)
        {
            try
            {
                var attendanceList = await _attendanceService.GetAllAttendanceByClassIdAsync(classId);
                var response = _mapper.Map<List<AttendanceResponse>>(attendanceList);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("update")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> UpdateAttendance([FromBody] List<UpdateAttendanceRequest> requests)
        {
            try
            {
                var attendancesToUpdate = requests.Select(r => new Attendance
                {
                    ID = r.AttendanceID,
                    Status = r.Status,
                    Notes = r.Notes
                }).ToList();

                var success = await _attendanceService.UpdateAttendanceAsync(attendancesToUpdate);
                if (!success)
                    return NotFound("One or more attendance records were not found.");

                return Ok("Attendance updated successfully.");
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
