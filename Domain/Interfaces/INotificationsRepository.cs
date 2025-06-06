using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Domain.Interfaces
{
    public interface INotificationsRepository
    {
        Task<Notification> CreateNotificationAsync(Notification notification);
        Task<List<Notification>> GetNotificationsByAccountIdAsync(Guid accountId);
        Task MarkAsReadAsync(int notificationId);
        Task<Notification> UpdateNotificationAsync(Notification notification);
        Task<Notification?> GetByIdAsync(int id);


    }
}
