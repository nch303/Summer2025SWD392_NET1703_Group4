using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Response
{
    public class UpdateClassResponse
    {
        public string? SyllabusName { get; set; }
        public string? Name { get; set; }
        public int MaxChildren { get; set; }
    }
}
