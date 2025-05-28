using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PreSchoolBE.src.Infrastructure.Entities
{
	public class EnrollmentApplication
	{
		[Key]
		public Guid ID { get; set; }

        [Required]
        public Guid ParentID { get; set; }

        public string? AcademicYear { get; set; }
        public string? Status { get; set; }

        public int StaffID { get; set; }

        [Required]
        public int ProgramID { get; set; }
        [Required]
        public Guid ChildrenID { get; set; }

        public DateTime ApprovalDate { get; set; }

        [ForeignKey("ChildrenID")]
        public Children? EAChildren { get; set; }

        [ForeignKey("ParentID")]
        public Account? EAAccount { get; set; }

        [ForeignKey("ProgramID")]
        public EnrichmentProgram? Program { get; set; }
    }
}
