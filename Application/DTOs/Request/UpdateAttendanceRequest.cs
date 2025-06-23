using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Request
{
    public class UpdateAttendanceRequest
    {
        public int AttendanceID { get; set; }
        public bool IsPresent { get; set; }
        public string? Notes { get; set; }
    }

}
