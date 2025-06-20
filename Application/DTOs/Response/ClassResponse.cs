using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Response
{
    public class ClassResponse
    {
        public string? Name { get; set; }
        public string? SyllabusName { get; set; }
        public string? GradeLevelName { get; set; }
        public int MaxChildren { get; set; }
        public int Quantity { get; set; }
        public string? Status { get; set; }
        public string? EPName { get; set; }
    }
}
