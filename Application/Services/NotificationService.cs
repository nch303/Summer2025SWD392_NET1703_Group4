using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.DTOs.Request;
using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;

namespace Application.Services
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationsRepository _notificationsRepository;
        private readonly IAuthService _authService; 
        public NotificationService(INotificationsRepository notificationsRepository, IAuthService authService)
        {
            _authService = authService;
            _notificationsRepository = notificationsRepository;
        }
        public async Task<Notification> CreateNotificationAsync(NotificationRequest request)
        {
            var notification = new Notification
            {
                AccountID = request.AccountID,
                Title = request.Title,
                Content = request.Content,
                IsRead = false // mặc định là chưa đọc
            };

            return await _notificationsRepository.CreateNotificationAsync(notification);
        }

        public async Task<List<Notification>> GetNotificationsByCurrentAsync()
        {
            var currentAccount = await _authService.GetCurrentAccountAsync();
            var currentAccountId = currentAccount.Id;

            return await _notificationsRepository.GetNotificationsByAccountIdAsync(currentAccountId);
        }

        public async Task MarkAsReadAsync(int notificationId)
        {
            await _notificationsRepository.MarkAsReadAsync(notificationId);
        }

        public async Task<Notification> UpdateNotificationAsync(UpdateNotificationRequest request)
        {
            var notification = await _notificationsRepository.GetByIdAsync(request.ID);
            if (notification == null)
                throw new Exception("Thông báo không tồn tại.");

            notification.Title = request.Title;
            notification.Content = request.Content;
            notification.IsRead = false;

            return await _notificationsRepository.UpdateNotificationAsync(notification);
        }

    }
}
