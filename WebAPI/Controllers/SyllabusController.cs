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
        public async Task<IActionResult> CreateSyllabus([FromBody] SyllabusRequest request)
        {
            try
            {
                var syllabus = _mapper.Map<Syllabus>(request);
                var result = await _syllabusService.CreateSyllabus(syllabus);
                var response = _mapper.Map<SyllabusResponse>(result);
                return Ok(response);
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
                var response = _mapper.Map<List<SyllabusResponse>>(await _syllabusService.GetAll());
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("/update-syllabus")]
        public async Task<IActionResult> UpdateSyllabus([FromBody] List<UpdateSyllabusRequest> request)
        {
            try
            {
                var newSyllabus = _mapper.Map<List<Syllabus>>(request);
                var updated = await _syllabusService.Update(newSyllabus);
                var response = _mapper.Map<List<SyllabusResponse>>(updated);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
