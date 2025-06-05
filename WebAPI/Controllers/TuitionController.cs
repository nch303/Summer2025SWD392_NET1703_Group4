    using Application.Interfaces;
    using Microsoft.AspNetCore.Mvc;

    namespace WebAPI.Controllers
    {
        [ApiController]
        [Route("api/[controller]")]
        public class TuitionController : ControllerBase
        {
            private readonly ITuitionFeeService _tuitionFeeService;

            public TuitionController(ITuitionFeeService tuitionFeeService)
            {
                _tuitionFeeService = tuitionFeeService;
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
                    return StatusCode(500, $"Internal server error: {ex.Message}");
                }
            }
        }
    }
