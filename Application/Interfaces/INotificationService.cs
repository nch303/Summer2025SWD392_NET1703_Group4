using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.DTOs.Request;
using Domain.Entities;

namespace Application.Interfaces
{
    public interface INotificationService
    {
        Task<List<Notification>> CreateNotificationAsync(NotificationRequest request);
        Task<List<Notification>> GetNotificationsByCurrentAsync();
        Task MarkAsReadAsync(int notificationId);
        Task<Notification> UpdateNotificationAsync(UpdateNotificationRequest updateNotificationRequest);
    }
}
