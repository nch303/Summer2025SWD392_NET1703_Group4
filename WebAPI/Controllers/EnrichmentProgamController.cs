using Application.DTOs.Request;
using Application.DTOs.Response;
using Application.Interfaces;
using Application.Services;
using AutoMapper;
using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using PreSchoolBE.src.Application.DTOs.Request;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EnrichmentProgamController : Controller
    {
        private readonly IEnrichProgramService _enrichProgramService;
        private readonly IEnrichProgramRepository _enrichProgramRepository;
        private readonly IMapper _mapper;

        public EnrichmentProgamController(IEnrichProgramService enrichProgramService, IMapper mapper, IEnrichProgramRepository enrichProgramRepository)
        {
            _enrichProgramService = enrichProgramService;
            _mapper = mapper;
            _enrichProgramRepository = enrichProgramRepository;
        }

        [HttpGet("get-all-enrichment-program")]
        public async Task<IActionResult> GetAllEnrichmentProgram()
        {
            try
            {
                var programs = await _enrichProgramService.GetAllEnrichmentProgramsAsync();
                var programResponses = new List<EnrichmentProgramResponse>();
                _mapper.Map(programs, programResponses);
                return Ok(programResponses);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("create-enrichment-program")]
        public async Task<IActionResult> CreateEnrichmentProgramAsync([FromBody] EnrichmentProgramRequest enrichmentProgramRequest)
        {
            try
            {
                var enrichmentProgram = _mapper.Map<EnrichmentProgram>(enrichmentProgramRequest);
                enrichmentProgram = await _enrichProgramService.CreateEnrichmentProgramAsync(enrichmentProgram);
                var response = _mapper.Map<EnrichmentProgramResponse>(enrichmentProgram);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] EnrichmentProgramRequest enrichmentRequest)
        {
            try
            {
                var enrichmentProgram = _mapper.Map<EnrichmentProgram>(enrichmentRequest);
                enrichmentProgram.ID = id;
                enrichmentProgram = await _enrichProgramService.UpdateEnrichmentProgramAsync(enrichmentProgram);

                var response = _mapper.Map<EnrichmentProgramResponse>(enrichmentProgram);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEnrichmentProgram(int id)
        {
            try
            {
                var program = await _enrichProgramService.GetProgramByIdAsync(id);
                if (program == null || program.IsDelete)
                    return NotFound("Enrichment program not found or already deleted.");

                var success = await _enrichProgramService.DeleteEnrichmentProgramAsync(program);
                if (!success)
                    return BadRequest("Deletion failed.");

                return Ok("Deleted");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
