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

        public StaffController(IStaffService staffService, IChildrenService childrenService, IMapper mapper)
        {
            _staffService = staffService;
            _childrenService = childrenService;
            _mapper = mapper;
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

                foreach(var childId in childrenIds)
                {
                    var child = await _childrenService.GetChildByIdAsync(childId);
                    if (child == null)
                    {
                        return NotFound($"Child with ID {childId} not found.");
                    }
                    child.Status = "Active";
                    await _childrenService.UpdateChildAsync(child);
                }
                return Ok("Assign successfully!");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
