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
    public class TuitionController : ControllerBase
    {
        private readonly ITuitionFeeService _tuitionFeeService;
        private readonly IMapper _mapper;

        public TuitionController(ITuitionFeeService tuitionFeeService, IMapper mapper)
        {
            _tuitionFeeService = tuitionFeeService;
            _mapper = mapper;
        }

        [HttpGet("GetTuitionFeeByCurrentAccount")]
        public async Task<IActionResult> Get()
        {
            try
            {
                var tuitionFees = await _tuitionFeeService.GetTuitionFeeByCurrentAccount();
                return Ok(tuitionFees);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }

        [HttpPost("CreateTuitionFee")]
        public async Task<IActionResult> Create([FromBody] TuitionRequest request)
        {
            try
            {
                //Check if tuition fee with the same name already exists
                var existingTuitionFee = await _tuitionFeeService.GetTuitionFeeByNameAsync(request.Name);
                if (existingTuitionFee != null)
                {
                    return BadRequest(new {message = $"Tuition fee with name '{request.Name}' already exists." });
                }

                var tuitionFee = _mapper.Map<TuitionFee>(request);
                var createdTuitionFee = await _tuitionFeeService.CreateAsync(tuitionFee);
                var response = _mapper.Map<TuitionResponse>(createdTuitionFee);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }

        [HttpGet("GetTuitionFeeById/{id}")]
        public async Task<IActionResult> GetById(int? id)
        {
            if (id == null)
            {
                return BadRequest(new { message = "Tuition ID cannot be null." });
            }
            try
            {
                var tuitionFee = await _tuitionFeeService.GetTuitionFeeByIdAsync(id);
                if (tuitionFee == null)
                {
                    return NotFound(new {message = $"Tuition fee with ID {id} not found." });
                }
                var response = _mapper.Map<TuitionResponse>(tuitionFee);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new {message = $"Internal server error: {ex.Message}" });
            }
        }

        [HttpGet("GetAllTuitionFees")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var tuitionFees = await _tuitionFeeService.GetAllTuitionFeesAsync();
                var response = _mapper.Map<List<TuitionResponse>>(tuitionFees);
                response = response.OrderByDescending(t => t.Date).ToList();
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }

        [HttpPut("{tuitionFeeId}")]
        public async Task<IActionResult> Update(int tuitionFeeId, [FromBody]TuitionRequest request)
        {
            try
            {
                var tuitionFee = _mapper.Map<TuitionFee>(request);
                tuitionFee.ID = tuitionFeeId;
                var updatedTuitionFee = await _tuitionFeeService.UpdateAsync(tuitionFee);
                var response = _mapper.Map<TuitionResponse>(updatedTuitionFee);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }
    }
}
