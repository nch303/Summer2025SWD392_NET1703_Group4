using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
	public class EnrollmentApplication
	{
		[Key]
		public Guid ID { get; set; }

        [Required]
        public Guid ParentID { get; set; }

        public string? AcademicYear { get; set; }
        public string? Status { get; set; }

        [Required]
        public int GradeLevelID { get; set; }
        [Required]
        public Guid ChildrenID { get; set; }
        [Required]
        public Guid InvoiceID { get; set; }

        public DateTime ApprovalDate { get; set; }

        [ForeignKey("ChildrenID")]
        public Children? Childrens { get; set; }

        [ForeignKey("ParentID")]
        public Account? Accounts { get; set; }

        [ForeignKey("GradeLevelID")]
        public GradeLevel? GradeLevels { get; set; }
        [ForeignKey("InvoiceID")]
        public Invoice? Invoices { get; set; }
    }
}
