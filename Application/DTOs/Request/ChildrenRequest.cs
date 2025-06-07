using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Request
{
    public class ChildrenRequest
    {
        public string? Name { get; set; }
        public DateTime Birthday { get; set; }
        public string? Gender { get; set; }
        public IFormFile? Avatar { get; set; }
        public string? City { get; set; }
        public IFormFile? BirthCertificate { get; set; }
        //public string? AcedemicYear { get; set; }
        //public int GradeLevelID { get; set; }
    }
}
