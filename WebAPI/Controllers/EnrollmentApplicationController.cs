using Application.DTOs.Request;
using Application.DTOs.Response;
using Application.Interfaces;
using Application.Services;
using AutoMapper;
using Azure.Core;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EnrollmentApplicationController : Controller
    {
        private readonly IEAService _eAService;
        private readonly IMapper _mapper;
        private readonly IAccountService _accountService;

        public EnrollmentApplicationController(IEAService eAService, IMapper mapper, IAccountService accountService)
        {
            _eAService = eAService;
            _mapper = mapper;
            _accountService = accountService;
        }

        [HttpPost("submit-application")]
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

        [HttpGet("view-application-progress")]
        public async Task<IActionResult> ViewApplicationProgress()
        {
            try
            {
                var parent = await _accountService.GetCurrentAccount();
                var app = await _eAService.ViewApplicationAsync(parent.Id);
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
