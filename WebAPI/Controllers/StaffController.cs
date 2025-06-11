using Application.DTOs.Request;
using Application.DTOs.Response;
using Application.Interfaces;
using AutoMapper;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StaffController: ControllerBase
    {
        private readonly IStaffService _staffService;
        private readonly IChildrenService _childrenService;
        private readonly IMapper _mapper;
        private readonly INotificationService _notificationService;
        private readonly IClassService _classService; 

        public StaffController(IStaffService staffService, IChildrenService childrenService, IMapper mapper
            , INotificationService notificationService, IClassService classService)
        {
            _staffService = staffService;
            _childrenService = childrenService;
            _mapper = mapper;
            _notificationService = notificationService;
            _classService = classService;
        }

        [HttpGet("GetNotEnrolledChildren")]
        public async Task<IActionResult> GetNotEnrolledChildren()
        {
            try
            {
                var children = await _staffService.GetNotEnrolledChildrenAsync();
                var childrenResponse = _mapper.Map<List<ChildrenResponse>>(children);
                return Ok(childrenResponse);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
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
                    var child = await _childrenService.GetChildByIdAsync(childId);
                    if (child == null)
                    {
                        return NotFound($"Child with ID {childId} not found.");
                    }
                    child.Status = "Active";
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
                        var notification = new NotificationRequest
                        {
                            AccountID = child.ParentID,
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
                return BadRequest(ex.Message);
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
                return BadRequest(ex.Message);
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
                return BadRequest(ex.Message);
            }
        }
    }
}
