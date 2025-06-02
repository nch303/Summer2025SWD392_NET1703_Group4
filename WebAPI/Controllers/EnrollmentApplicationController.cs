using Application.DTOs.Request;
using Application.DTOs.Response;
using Application.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EnrollmentApplicationController : Controller
    {
        private readonly IEAService _eAService;
        private readonly IMapper _mapper;

        public EnrollmentApplicationController(IEAService eAService, IMapper mapper)
        {
            _eAService = eAService;
            _mapper = mapper;
        }

        [HttpPost]
        public async Task<IActionResult> SubmitApplication([FromBody] EnrollmentApplicationRequest request, Guid parentID, Guid childID)
        {
            try
            {
                var app = await _eAService.CreateEnrollmentApplicationAsync(request, parentID, childID);
                var response = new EnrollmentApplicationResponse();
                _mapper.Map(app, response);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


    }
}
