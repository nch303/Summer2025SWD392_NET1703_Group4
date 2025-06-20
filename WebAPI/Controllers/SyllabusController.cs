using Application.DTOs.Request;
using Application.DTOs.Response;
using Application.Interfaces;
using Application.Services;
using AutoMapper;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SyllabusController : Controller
    {
        private readonly IMapper _mapper;
        private readonly ISyllabusService _syllabusService;

        public SyllabusController(IMapper mapper, ISyllabusService syllabusService)
        {
            _mapper = mapper;
            _syllabusService = syllabusService;
        }

        [HttpPost("create-syllabus")]
        public async Task<IActionResult> CreateSyllabus([FromBody] CreateSyllabusRequest request)
        {
            try
            {
                var syllabus = _mapper.Map<Syllabus>(request.SyllabusRequest);
                var detail = _mapper.Map<SyllabusDetail>(request.DetailRequest);
                var result = await _syllabusService.CreateAsync(syllabus, detail);
                return Ok($"Syllabus {result.Name} has been created successfully!!!");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("get-all-syllabi")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var response = _mapper.Map<List<GetAllSyllabiResponse>>(await _syllabusService.GetAllAsync());
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}/get-syllabus-detail")]
        public async Task<IActionResult> GetSyllabusDetailById(int id)
        {
            try
            {
                var response = _mapper.Map<SyllabusDetailResponse>(await _syllabusService.GetDetailByIdAsync(id));
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}/update-syllabus")]
        public async Task<IActionResult> UpdateSyllabus(int id, [FromBody] UpdateSyllabusRequest request)
        {
            try
            {
                var newSyllabus = _mapper.Map<Syllabus>(request.SyllabusRequest);
                var newDetail = _mapper.Map<SyllabusDetail>(request.DetailRequest);
                var updated = await _syllabusService.UpdateAsync(id, newSyllabus, newDetail);
                var response = _mapper.Map<SyllabusDetailResponse>(updated);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
