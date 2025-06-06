using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Request
{
    public class CreateClassRequest
    {
        public string? Name { get; set; }
        public int SyllabusID { get; set; }
        public int GradeLevelID { get; set; }
        public int MaxChildren { get; set; }
    }
}
