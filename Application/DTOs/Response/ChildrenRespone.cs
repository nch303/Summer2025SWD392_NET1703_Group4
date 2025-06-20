using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Response
{
    public class ChildrenResponse
    {
        public Guid ID { get; set; }
        public Guid ParentID { get; set; }
        public string? Name { get; set; }
        public DateTime Birthday { get; set; }
        public string? Gender { get; set; }
        public string? Avatar { get; set; }
        public string? City { get; set; }
        public string? BirthCertificate { get; set; }
        public string ParentName { get; set; }
        public string PhoneNumber { get; set; }
        public DateTime EnrollDate { get; set; }
        public Guid? ApplicationID { get; set; }
        public int GradeLevelID { get; set; }
        public string? GradeLevelName { get; set; }
    }
}
