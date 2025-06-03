using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Response
{
    public class EnrollmentApplicationResponse
    {
        public string? AcademicYear { get; set; }
        public int GradeLevelID { get; set; }
        public string? Status { get; set; }
    }
}

