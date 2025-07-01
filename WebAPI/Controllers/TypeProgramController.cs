using Application.DTOs.Response;
using Application.Interfaces;
using AutoMapper;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TypeProgramController : ControllerBase
    {
        private readonly ITypeProgramService _typeProgramService;
        private readonly IMapper _mapper;

        public TypeProgramController(ITypeProgramService typeProgramService, IMapper mapper)
        {
            _typeProgramService = typeProgramService;
            _mapper = mapper;
        }

        [HttpGet("GetTypeNameByID/{id}")]
        public async Task<IActionResult> GetTypeNameByID(int id)
        {
            try
            {
                var typeName = await _typeProgramService.GetTypeNameByID(id)!;
                return Ok(new { type = typeName });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }

        }

        [HttpGet("GetAllTypes")]
        public async Task<IActionResult> GetAllTypes()
        {
            try
            {
                var types = await _typeProgramService.GetAllTypes()!;
                var typesResponses = _mapper.Map<List<TypeProgramResponse>>(types);
                return Ok(typesResponses);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("CreateTypeProgram")]
        public async Task<IActionResult> CreateTypeProgram(string typeName)
        {
            try
            {
                var typeProgram = new TypeProgram
                {
                    Name = typeName
                };

                var createdTypeProgram = await _typeProgramService.CreateAsync(typeProgram);
                var createdTypeProgramResponse = _mapper.Map<TypeProgramResponse>(createdTypeProgram);
                return Ok(createdTypeProgramResponse);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
