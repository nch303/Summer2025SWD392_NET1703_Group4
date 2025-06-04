using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Response
{
    public class EADetailResponse
    {
        public string? ParentName { get; set; }
        public string? ParentPhone { get; set; }

        public string? ChildrenName { get; set; }
        public DateTime Birthday { get; set; }
        public string? Gender { get; set; }
        public string? Avatar { get; set; }
        public string? City { get; set; }
        public string? BirthCertificate { get; set; }
        public string? Status { get; set; }
        public DateTime EnrollDate  { get; set; }
    }
}
