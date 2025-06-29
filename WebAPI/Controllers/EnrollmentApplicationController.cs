using Application.DTOs.Request;
using Application.DTOs.Response;
using Application.Interfaces;
using Application.Services;
using AutoMapper;
using Azure.Core;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EnrollmentApplicationController : Controller
    {
        private readonly IEAService _eAService;
        private readonly IMapper _mapper;
        private readonly IAccountService _accountService;
        private readonly IChildrenGradeService _childrenGradeService;
        private readonly IChildrenService _childrenService;

        public EnrollmentApplicationController(IEAService eAService, IMapper mapper, IAccountService accountService
            , IChildrenGradeService childrenGradeService, IChildrenService childrenService)
        {
            _eAService = eAService;
            _mapper = mapper;
            _accountService = accountService;
            _childrenGradeService = childrenGradeService;
            _childrenService = childrenService;
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

                //Update the status of the child to "Pending"
                var child = await _childrenService.GetChildByIdAsync(childID);
                child.Status = "Pending";
                await _childrenService.UpdateChildAsync(child);

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
                responseList.Reverse();

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

                //Create ChildrenGrade for the newly created child
                var childrenGrade = new ChildrenGrade
                {
                    ChildrenID = updated.ChildrenID,
                    AcademicYear = updated.AcademicYear,
                    GradeLevelID = updated.GradeLevelID, // Default value, can be updated later
                    Status = "Inactive" // Default value, can be updated later
                };
                await _childrenGradeService.CreateChildrenGradeAsync(childrenGrade);

                //Update the status of the child to "Not Enrolled"
                var child = await _childrenService.GetChildByIdAsync(updated.ChildrenID);
                child!.Status = "Not Enrolled";
                await _childrenService.UpdateChildAsync(child);

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

        [HttpGet("get-all-applications")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var applications = await _eAService.GetAllApplications();
                var responses = _mapper.Map<List<AdminViewEAResponse>>(applications);
                return Ok(responses);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("get-application-description/{childId}")]
        public async Task<IActionResult> GetApplicationDescription(Guid childId)
        {
            try
            {
                var description = await _eAService.GetApplicationDescriptionAsync(childId);
                return Ok(new { description = description });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
