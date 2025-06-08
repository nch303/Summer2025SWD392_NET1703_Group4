using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Response
{
    public class AdminViewEAResponse
    {
        public Guid ID { get; set; }

        public Guid ParentID { get; set; }
        public string? ParentName { get; set; }
        public string? ParentPhone { get; set; }

        public Guid ChildrenID { get; set; }
        public string? ChildrenName { get; set; }
        public DateTime Birthday { get; set; }
        public string? Gender { get; set; }
        public string? Avatar { get; set; }
        public string? City { get; set; }
        public string? BirthCertificate { get; set; }
        public string? Status { get; set; }
        public DateTime EnrollDate { get; set; }

        public string? GradeLevelName { get; set; }
        public double GradeLevelFee { get; set; }
        public bool GradeLevelIsDelete { get; set; }

        public Guid? StaffID { get; set; }
        public string? StaffName { get; set; }
    }
}
