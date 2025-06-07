using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Request
{
    public class UpdateClassRequest
    {
        public int SyllabusID { get; set; }
        public string? Name { get; set; }
        public int MaxChildren { get; set; }
    }
}
