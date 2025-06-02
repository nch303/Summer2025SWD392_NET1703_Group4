using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Response
{
    public class ChildrenResponse
    {
        public string? Name { get; set; }
        public DateTime Birthday { get; set; }
        public string? Gender { get; set; }
        public string? Avatar { get; set; }
        public string? City { get; set; }
        public string? BirthCertificate { get; set; }
    }
}
