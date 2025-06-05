using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Response
{
    public class EnrollmentApplicationListResponse
    {
        public Guid EAID { get; set; }
        public Guid ParentID { get; set; }
        public Guid ChildrenID { get; set; }
        public Guid? InvoiceID { get; set; }
        public Guid? StaffID { get; set; }
        public string? AcademicYear { get; set; }
        public int GradeLevelID { get; set; }
        public string? Status { get; set; }
        public string? ChildrenName { get; set; }
        public string? GradeLevelName { get; set; }
        public DateTime ApprovalDate { get; set; }
    }
}

