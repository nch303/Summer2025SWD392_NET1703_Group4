using Application.DTOs.Request;
using Application.DTOs.Response;
using Application.Interfaces;
using AutoMapper;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using PreSchoolBE.src.Application.Services;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChildrenController : ControllerBase
    {
        private readonly IChildrenService _childrenService;
        private readonly IMapper _mapper;
        private readonly IAccountService _accountService;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly IChildrenGradeService _childrenGradeService;
        private readonly IEAService _eaService;

        public ChildrenController(IChildrenService childrenService, IMapper mapper, IAccountService accountService
            , ICloudinaryService cloudinaryService, IChildrenGradeService childrenGradeService
            , IEAService eAService)
        {
            _childrenService = childrenService;
            _mapper = mapper;
            _accountService = accountService;
            _cloudinaryService = cloudinaryService;
            _childrenGradeService = childrenGradeService;
            _eaService = eAService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateChildAsync([FromForm] ChildrenRequest childRequest)
        {
            try
            {
                string? avatarUrl = null;
                string? birthCertificateUrl = null;

                try
                {
                    if (childRequest.Avatar != null && childRequest.Avatar.Length > 0)
                    {
                        using var stream = childRequest.Avatar.OpenReadStream();
                        avatarUrl = await _cloudinaryService.UploadImageAsync(stream, childRequest.Avatar.FileName);
                    }

                    if (childRequest.BirthCertificate != null && childRequest.BirthCertificate.Length > 0)
                    {
                        using var stream = childRequest.BirthCertificate.OpenReadStream();
                        birthCertificateUrl = await _cloudinaryService.UploadImageAsync(stream, childRequest.BirthCertificate.FileName);
                    }
                }
                catch (Exception ex)
                {
                    return BadRequest($"File upload failed: {ex.Message}");
                }

                var child = _mapper.Map<Children>(childRequest);
                child.Avatar = avatarUrl;
                child.BirthCertificate = birthCertificateUrl;
                child.EnrollDate = DateTime.Now;
                var createdChild = await _childrenService.CreateChildAsync(child);
                var createdChildResponse = _mapper.Map<ChildrenResponse>(createdChild);

                return Ok(createdChildResponse);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{Id}")]
        public async Task<IActionResult> UpdateChildAsync(Guid Id, [FromForm] ChildrenRequest childRequest)
        {
            try
            {
                string? avatarUrl = null;
                string? birthCertificateUrl = null;

                try
                {
                    if (childRequest.Avatar != null && childRequest.Avatar.Length > 0)
                    {
                        using var stream = childRequest.Avatar.OpenReadStream();
                        avatarUrl = await _cloudinaryService.UploadImageAsync(stream, childRequest.Avatar.FileName);
                    }

                    if (childRequest.BirthCertificate != null && childRequest.BirthCertificate.Length > 0)
                    {
                        using var stream = childRequest.BirthCertificate.OpenReadStream();
                        birthCertificateUrl = await _cloudinaryService.UploadImageAsync(stream, childRequest.BirthCertificate.FileName);
                    }
                }
                catch (Exception ex)
                {
                    return BadRequest($"File upload failed: {ex.Message}");
                }

                var existingChild = await _childrenService.GetChildByIdAsync(Id);
                var oldAvatar = existingChild?.Avatar;
                var oldBirthCertificate = existingChild?.BirthCertificate;

                if (existingChild == null)
                {
                    return NotFound($"Child with ID {Id} not found.");
                }
                existingChild = _mapper.Map<Children>(childRequest);

                existingChild.ID = Id;
                existingChild.Avatar = avatarUrl ?? oldAvatar; 
                existingChild.BirthCertificate = birthCertificateUrl ?? oldBirthCertificate;
                var updatedChild = await _childrenService.UpdateChildAsync(existingChild);
                var updatedChildResponse = _mapper.Map<ChildrenResponse>(updatedChild);
                return Ok(updatedChildResponse);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{Id}")]
        public async Task<IActionResult> GetChildByIdAsync(Guid Id)
        {
            try
            {
                var child = await _childrenService.GetChildByIdAsync(Id);
                if (child == null)
                {
                    return NotFound($"Child with ID {Id} not found.");
                }

                var childResponse = _mapper.Map<ChildrenResponse>(child);

                //Gan ApplicationID cho ChildResponse
                var application = await _eaService.GetApplicatioinByChildID(Id);
                childResponse.ApplicationID = application?.ID ?? Guid.Empty;

                return Ok(childResponse);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAllChildrenAsync()
        {
            try
            {
                var children = await _childrenService.GetAllChildrenAsync();
                var childrenResponse = _mapper.Map<List<ChildrenResponse>>(children);
                //for (int i = 0; i < children.Count(); i++)
                //{
                //    var parent = _accountService.GetAccountByIdAsync(children[i].ParentID);
                //    childrenResponse[i].ParentName = parent.Result.FullName;
                //    childrenResponse[i].PhoneNumber = parent.Result.PhoneNumber;
                //}

                return Ok(childrenResponse);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("byParentId/{parentId}")]
        public async Task<IActionResult> GetChildrenByParentIdAsync(Guid parentId)
        {
            try
            {
                var children = await _childrenService.GetChildrenByParentIdAsync(parentId);
                var childrenResponse = _mapper.Map<List<ChildrenResponse>>(children);
                for (int i = 0; i < children.Count(); i++)
                {
                    var parent = await _accountService.GetAccountByIdAsync(children[i].ParentID);
                    childrenResponse[i].ParentName = parent.FullName;
                    childrenResponse[i].PhoneNumber = parent.PhoneNumber;

                    //Gan ApplicationID cho ChildResponse
                    var application = await _eaService.GetApplicatioinByChildID(childrenResponse[i].ID);
                    childrenResponse[i].ApplicationID = application?.ID ?? Guid.Empty;
                }
                return Ok(childrenResponse);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("searchAllChildren")]
        public async Task<IActionResult> SearchChildren(
    [FromQuery] string keyword,
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 15)
        {
            try
            {
                var children = await _childrenService.SearchChildrenAsync(keyword, page, pageSize);
                var response = _mapper.Map<List<ChildrenResponse>>(children);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("searchInClass")]
        public async Task<IActionResult> SearchChildrenInClass(
    [FromQuery] int classId,
    [FromQuery] string keyword)
        {
            try
            {
                var children = await _childrenService.SearchChildrenInClassAsync(classId, keyword);
                var response = _mapper.Map<List<ChildrenResponse>>(children);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
