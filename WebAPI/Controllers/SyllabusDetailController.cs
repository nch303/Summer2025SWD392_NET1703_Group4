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
    public class SyllabusDetailController : Controller
    {
        private readonly ISyllabusDetailService _syllabusDetailService;
        private readonly IMapper _mapper;

        public SyllabusDetailController(IMapper mapper, ISyllabusDetailService service)
        {
            _mapper = mapper;
            _syllabusDetailService = service;
        }

        [HttpPost("{syllabusId}/create-syllabus-detail")]
        public async Task<IActionResult> CreateSyllabus(int syllabusId, [FromBody] List<SyllabusDetailRequest> request)
        {
            try
            {
                var details = _mapper.Map<List<SyllabusDetail>>(request);
                var result = await _syllabusDetailService.CreateSyllabusDetails(syllabusId, details);
                var responses = _mapper.Map<List<SyllabusDetailResponse>>(result);
                return Ok(responses);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{syllabusId}/get-all-syllabus-detail")]
        public async Task<IActionResult> GetAll(int syllabusId)
        {
            try
            {
                var response = _mapper.Map<List<GetAllSyllabusDetailResponse>>(await _syllabusDetailService.GetAllSyllabusDetailBySyllabusId(syllabusId));
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}/update-syllabus")]
        public async Task<IActionResult> UpdateSyllabus(int id, [FromBody] SyllabusDetailRequest request)
        {
            try
            {
                var newDetail = _mapper.Map<SyllabusDetail>(request);
                var updated = await _syllabusDetailService.Update(id, newDetail);
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
