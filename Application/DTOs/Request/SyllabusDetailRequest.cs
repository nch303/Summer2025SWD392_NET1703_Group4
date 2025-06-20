using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Request
{
    public class SyllabusDetailRequest
    {
        public int Slot { get; set; }
        public string? Content { get; set; }
        public int Duration { get; set; }
    }
}
