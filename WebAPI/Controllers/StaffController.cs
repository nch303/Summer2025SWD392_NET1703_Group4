using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StaffController: ControllerBase
    {
        private readonly IStaffService _staffService;
        private readonly IChildrenService _childrenService;

        public StaffController(IStaffService staffService, IChildrenService childrenService)
        {
            _staffService = staffService;
            _childrenService = childrenService;
        }

        [HttpGet("GetNotEnrolledChildren")]
        public async Task<IActionResult> GetNotEnrolledChildren()
        {
            try
            {
                var children = await _staffService.GetNotEnrolledChildrenAsync();
                return Ok(children);
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
