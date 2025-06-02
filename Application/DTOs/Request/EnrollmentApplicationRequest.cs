using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Request
{
    public class EnrollmentApplicationRequest
    {
        public string? AcademicYear { get; set; }
        public int GradeLevelID { get; set; }
    }
}
