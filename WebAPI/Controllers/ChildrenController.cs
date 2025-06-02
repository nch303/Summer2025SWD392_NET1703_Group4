using Application.DTOs.Request;
using Application.DTOs.Response;
using Application.Interfaces;
using AutoMapper;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChildrenController : ControllerBase
    {
        private readonly IChildrenService _childrenService;
        private readonly IMapper _mapper;
        private readonly IAccountService _accountService;

        public ChildrenController(IChildrenService childrenService, IMapper mapper, IAccountService accountService)
        {
            _childrenService = childrenService;
            _mapper = mapper;
            _accountService = accountService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateChildAsync([FromBody] ChildrenRequest childRequest)
        {            
            try
            {
                var child = _mapper.Map<Children>(childRequest);
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
        public async Task<IActionResult> UpdateChildAsync(Guid Id, [FromBody] ChildrenRequest childRequest)
        {
            try
            {
                var existingChild = await _childrenService.GetChildByIdAsync(Id);
                if (existingChild == null)
                {
                    return NotFound($"Child with ID {Id} not found.");
                }
                existingChild = _mapper.Map<Children>(childRequest);
                existingChild.ID = Id;
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
                var childrenResponse = _mapper.Map<List<AllChildrenResponse>>(children);
                for (int i=0; i<children.Count(); i++)
                {
                    var parent = _accountService.GetAccountByIdAsync(children[i].ParentID);
                    childrenResponse[i].ParentName = parent.Result.FullName;
                    childrenResponse[i].PhoneNumber = parent.Result.PhoneNumber;
                }
                return Ok(childrenResponse);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
