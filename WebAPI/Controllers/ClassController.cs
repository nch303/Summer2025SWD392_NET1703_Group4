using Application.DTOs.Request;
using Application.DTOs.Response;
using Application.Interfaces;
using Application.Services;
using AutoMapper;
using Domain.Entities;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClassController : Controller
    {
        private readonly IMapper _mapper;
        private readonly IClassService _classService;

        public ClassController(IMapper mapper, IClassService classService)
        {
            _mapper = mapper;
            _classService = classService;
        }

        [HttpGet("get-all-classes")]
        public async Task<ActionResult> GetAll()
        {
            var classes = await _classService.GetAllClass();
            var response = _mapper.Map<List<ClassResponse>>(classes);
            return Ok(response);
        }

        // GET: api/class/{id}
        [HttpGet("get-class-detail/{id}")]
        public async Task<ActionResult> GetById(int id)
        {
            try
            {
                var result = await _classService.GetClass(id);
                var response = _mapper.Map<ClassDetailResponse>(result);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // GET: api/class/search?name=math
        [HttpGet("search-by-name")]
        public async Task<ActionResult> SearchByName([FromQuery] string name)
        {
            var result = await _classService.GetClassByName(name);
            var response = _mapper.Map<List<SortResponse>>(result);
            return Ok(response);
        }

        // GET: api/class/sort?type=name&trend=asc
        [HttpGet("sort")]
        public async Task<ActionResult> GetSorted([FromQuery] string type, [FromQuery] string trend)
        {
            var results = await _classService.GetAllSortedClass(type, trend);
            var responses = _mapper.Map<List<SortResponse>>(results);
            return Ok(responses);
        }

        // POST: api/class
        [HttpPost("create")]
        public async Task<ActionResult> Create([FromBody] CreateClassRequest request)
        {
            try
            {
                var newClass = _mapper.Map<Class>(request);
                var created = await _classService.CreatClass(newClass);
                var response = _mapper.Map<ClassResponse>(created);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/class/{id}
        [HttpDelete("delete-class/{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var deleted = await _classService.DeleteClass(id);
                return Ok("Class is now unavailable");
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPut("restore-class/{id}")]
        public async Task<ActionResult> Restore(int id)
        {
            try
            {
                var deleted = await _classService.RestoreClass(id);
                return Ok("Class is now available");
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPut("update-class/{id}")]
        public async Task<IActionResult> Update(int id, UpdateClassRequest request)
        {
            try
            {
                var room = await _classService.GetClass(id);
                _mapper.Map(request, room);
                var updatedClass = await _classService.UpdateClass(id, room);
                var response = _mapper.Map<UpdateClassResponse>(updatedClass);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPost("assign-children-to-enrichmentClass/{enrichmentId}")]
        public async Task<ActionResult> AssignChildren(int enrichmentId, [FromBody] List<Guid> childrenIds)
        {
            try
            {
                var result = await _classService.AssignChildIntoEnrichmentClass(enrichmentId, childrenIds);
                return Ok(new { message = "Assign successfully." });
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("get-classes-by-childrenId/{childrenId}")]
        public async Task<ActionResult> GetClassesByChildrenId(Guid childrenId)
        {
            try
            {
                var result = await _classService.GetClassesByChildIdAsync(childrenId);
                var response = _mapper.Map<List<ClassResponse>>(result);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("get-classes-by-teacherId/{teacherId}")]
        public async Task<ActionResult> GetClassesByTeacherId(Guid teacherId)
        {
            try
            {
                var result = await _classService.GetClassesByTeacherIdAsync(teacherId);
                var response = _mapper.Map<List<ClassResponse>>(result);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}
