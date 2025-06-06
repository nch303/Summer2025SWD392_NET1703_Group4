using Application.DTOs.Request;
using Application.DTOs.Response;
using Application.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;
        private readonly IMapper _mapper;
        public NotificationController(INotificationService notificationService, IMapper mapper)
        {
            _mapper = mapper;
            _notificationService = notificationService;
        }

        [Authorize]
        [HttpPost("CreateNotification")]
        public async Task<IActionResult> CreateNotification([FromBody] NotificationRequest request)
        {
            var result = await _notificationService.CreateNotificationAsync(request);
            var notificationResponse = _mapper.Map<NotificationResponse>(result);
            return Ok(notificationResponse);
        }

        [Authorize]
        [HttpGet("GetNotificationsByCurrent")]
        public async Task<IActionResult> GetMyNotifications()
        {
            var result = await _notificationService.GetNotificationsByCurrentAsync();
            var notificationResponse = _mapper.Map<List<NotificationResponse>>(result);
            return Ok(notificationResponse);
        }

        [Authorize]
        [HttpPost("MarkAsRead/{notificationId}")]
        public async Task<IActionResult> MarkAsRead(int notificationId)
        {
            await _notificationService.MarkAsReadAsync(notificationId);
            return Ok("Read");
        }

        [Authorize]
        [HttpPut("UpdateNotification")]
        public async Task<IActionResult> UpdateNotification([FromBody] UpdateNotificationRequest request)
        {
            var result = await _notificationService.UpdateNotificationAsync(request);
            var notificationResponse = _mapper.Map<NotificationResponse>(result);
            return Ok(notificationResponse);

        }
    }
}
