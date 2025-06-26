using Application.DTOs.Request;
using Application.DTOs.Response;
using Application.Interfaces;
using Application.Services;
using AutoMapper;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StaffController : ControllerBase
    {
        private readonly IStaffService _staffService;
        private readonly IChildrenService _childrenService;
        private readonly IMapper _mapper;
        private readonly INotificationService _notificationService;
        private readonly IClassService _classService;
        private readonly IEAService _EAService;
        private readonly IChildrenGradeService _childrenGradeService;


        public StaffController(IStaffService staffService, IChildrenService childrenService, IMapper mapper
            , INotificationService notificationService, IClassService classService, IEAService eAService
            , IChildrenGradeService childrenGradeService)
        {
            _staffService = staffService;
            _childrenService = childrenService;
            _mapper = mapper;
            _notificationService = notificationService;
            _classService = classService;
            _EAService = eAService;
            _childrenGradeService = childrenGradeService;
        }

        [HttpGet("GetNotEnrolledChildren")]
        public async Task<IActionResult> GetNotEnrolledChildrenAsync()
        {
            try
            {
                var children = await _childrenService.GetNotEnrolledChildrenAsync();
                var response = _mapper.Map<List<ChildrenResponse>>(children);

                for (int i = 0; i < response.Count(); i++)
                {
                    //Gan ApplicationID cho ChildResponse
                    var application = await _EAService.GetApplicatioinByChildID(response[i].ID);
                    response[i].ApplicationID = application?.ID ?? Guid.Empty;

                    //Gan GradeLevel cho ChildResponse
                    var grade = await _childrenGradeService.GetChildrenGradesByChildrenIdAsync(response[i].ID);
                    response[i].GradeLevelID = grade?.GradeLevels!.ID ?? 0;
                    response[i].GradeLevelName = grade?.GradeLevels!.Name ?? string.Empty;
                }

                response = response.OrderByDescending(c => c.EnrollDate).ToList();
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("AssignChildrenToClass/{classId}")]
        public async Task<IActionResult> AssignChildrenToClass(int classId, [FromBody] List<Guid> childrenIds)
        {
            try
            {
                var result = await _staffService.AssignChildrenListToClassAsync(classId, childrenIds);

                // Update the status of each child to "Active"
                foreach (var childId in childrenIds)
                {

                    var application = await _EAService.GetApplicatioinByChildID(childId);
                    application.Status = "Enrolled";
                    await _EAService.UpdateEnrollmentApplicationAsync(application);

                    var child = await _childrenService.GetChildByIdAsync(childId);
                    if (child == null)
                    {
                        return NotFound($"Child with ID {childId} not found.");
                    }
                    child.Status = "Enrolled";
                    await _childrenService.UpdateChildAsync(child);
                }

                //Send notification to parents
                var notificationMessage = "Your child has been successfully assigned to a class.";

                foreach (var childId in childrenIds)
                {
                    var child = await _childrenService.GetChildByIdAsync(childId);
                    var classInfo = await _classService.GetClass(classId);

                    //Update quantity of children in class
                    if (classInfo != null)
                    {
                        classInfo.Quantity += 1;
                        await _classService.UpdateClass(classId, classInfo);
                    }

                    if (child?.Parents != null && classInfo != null)
                    {
                        var accountIDs = new List<Guid>();
                        accountIDs.Add(child.Parents.Id);

                        var notification = new NotificationRequest
                        {
                            AccountIDs = accountIDs,
                            Title = notificationMessage,
                            Content = $"Dear {child.Parents.FullName},\n\nWe are pleased to inform you that your child, {child.Name}, has been successfully assigned to the class \"{classInfo.Name}\".\n\nThank you for your trust and support.\n\n- The School Administration"
                        };

                        await _notificationService.CreateNotificationAsync(notification);
                    }
                }


                return Ok("Assign successfully!");
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("reassign-child")]
        public async Task<IActionResult> ReAssignChildToNewClass(int newClassId, Guid childID)
        {
            try
            {
                var reassign = await _staffService.ReassignChildToNewClassAsync(childID, newClassId);
                return Ok("Re-assign children successfully!!!");
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("assign-teacher")]
        public async Task<IActionResult> AssignTeacherToClass(int classId, Guid teacherId)
        {
            try
            {
                var assign = await _staffService.AssignTeacherToClassAsync(classId, teacherId);
                var dto = new AssignTeacherResponse
                {
                    ClassName = assign.Classes!.Name,
                    TeacherName = assign.Teachers!.FullName
                };
                return Ok(dto);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("openClass)/{classId}")]
        public async Task<IActionResult> OpenClass(int classId)
        {
            try
            {
                var openClass = await _classService.OpenClass(classId);
                return Ok(new { message = "Class is now available" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
