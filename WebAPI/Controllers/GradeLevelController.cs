using Application.DTOs.Request;
using Application.DTOs.Response;
using Application.Interfaces;
using AutoMapper;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GradeLevelController : Controller
    {
        private readonly IGradeLevelService _gradeLevelService;
        private readonly IMapper _mapper;

        public GradeLevelController(IGradeLevelService gradeLevelService, IMapper mapper)
        {
            _gradeLevelService = gradeLevelService;
            _mapper = mapper;
        }

        [HttpGet("get-list-grade-level")]
        //[Authorize]
        public async Task<IActionResult> GetAllGradeLevels()
        {
            try
            {
                var gradeLevels = await _gradeLevelService.GetAllGradeLevelsAsync();
                var responseList = _mapper.Map<List<GradeLevelResponse>>(gradeLevels);
                return Ok(responseList);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
