using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.EntitiesConfigurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;

namespace Infrastructure.Repositories
{
    public class NotificationRepository : INotificationsRepository
    {
        private readonly AppDbContext _context;
        public NotificationRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Notification> CreateNotificationAsync(Notification notification)
        {
            notification.IsRead = false;

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            return notification;
        }

        public async Task<List<Notification>> GetNotificationsByAccountIdAsync(Guid accountId)
        {
            return await _context.Notifications
                .Where(n => n.AccountID == accountId)
                .OrderByDescending(n => n.ID) // ID mới nhất đầu tiên
                .ToListAsync();
        }

        public async Task MarkAsReadAsync(int notificationId)
        {
            var notification = await _context.Notifications.FindAsync(notificationId);
            if (notification != null)
            {
                notification.IsRead = true;
                await _context.SaveChangesAsync();
            }
        }

        public async Task<Notification?> GetByIdAsync(int id)
        {
            return await _context.Notifications.FindAsync(id);
        }

        public async Task<Notification> UpdateNotificationAsync(Notification notification)
        {
            _context.Notifications.Update(notification);
            await _context.SaveChangesAsync();
            return notification;
        }
    }
}
