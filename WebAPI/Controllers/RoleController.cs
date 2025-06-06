using Application.DTOs.Response;
using Application.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoleController : ControllerBase
    {
        private readonly IRoleService _roleService;
        private readonly IMapper _mapper;

        public RoleController(IRoleService roleService, IMapper mapper)
        {
            _roleService = roleService;
            _mapper = mapper;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var role = await _roleService.GetById(id);
                var roleResponse = _mapper.Map<RoleResponse>(role); // Assuming you have a RoleDto for mapping
                return Ok(roleResponse);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpGet]   
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var roles = await _roleService.GetAllAsync();
                var roleResponses = _mapper.Map<List<RoleResponse>>(roles); // Assuming you have a RoleDto for mapping
                return Ok(roleResponses);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}
