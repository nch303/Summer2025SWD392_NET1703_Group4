using Application.DTOs.Request;
using Application.DTOs.Response;
using Application.Interfaces;
using Application.Services;
using AutoMapper;
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
        private readonly IMapper _mapper;

       public EnrichmentProgamController(IEnrichProgramService enrichProgramService, IMapper mapper)
        {
            _enrichProgramService = enrichProgramService;
            _mapper = mapper;
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
    }
}
