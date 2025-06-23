using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Response
{
    public class AttendanceResponse
    {
        public int ID { get; set; }
        public DateTime Date { get; set; }
        public string? ChildrenName { get; set; }
        public int ClassChildrenID { get; set; }
        public string? Status { get; set; }
        public string? Notes { get; set; }
    }
}
