using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Response
{
    public class NotificationResponse
    {
        public int ID { get; set; }
        public Guid AccountID { get; set; }
        public string? Title { get; set; }
        public string? Content { get; set; }
        public bool IsRead { get; set; }

    }
}
