using Application.DTOs.Response;
using Application.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClassChildrenController: ControllerBase
    {
        private readonly IClassChildrenService _classChildrenService;
        private IMapper _mapper;
        public ClassChildrenController(IClassChildrenService classChildrenService, IMapper mapper)
        {
            _classChildrenService = classChildrenService;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAsync()
        {
            var allChildren = await _classChildrenService.GetAllAsync();
            var response = _mapper.Map<List<GetAllClassChildrenResponse>>(allChildren);
            return Ok(response);
        }

    }
}
