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
        public async Task<IActionResult> SubmitApplication([FromBody] EnrollmentApplicationRequest request, Guid childID)
        {
            try
            {
                var parent = await _accountService.GetCurrentAccount();
                var app = await _eAService.CreateEnrollmentApplicationAsync(request, parent.Id, childID);
                var response = new EnrollmentApplicationListResponse();
                _mapper.Map(app, response);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("view-applications-progress")]
        public async Task<IActionResult> ViewListApplicationProgress()
        {
            try
            {
                var parent = await _accountService.GetCurrentAccount();
                var applications = await _eAService.ViewListApplicationAsync(parent.Id);
                var responseList = _mapper.Map<List<EnrollmentApplicationListResponse>>(applications);

                return Ok(responseList);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("view-application-detail/{eAId}")]
        public async Task<IActionResult> ViewApplicationDetail(Guid eAId)
        {
            try
            {
                var application = await _eAService.ViewApplicationDetail(eAId);
                var response = _mapper.Map<EADetailResponse>(application);

                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("approve-application")]
        public async Task<IActionResult> ApproveApplication(Guid eAId)
        {
            try
            {
                var updated = await _eAService.ApproveByStaff(eAId);
                return Ok("Approved!");
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("reject-application")]
        public async Task<IActionResult> RejectApplication(Guid eAId)
        {
            try
            {
                var updated = await _eAService.RejectByStaff(eAId);
                return Ok("Rejected!");
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
