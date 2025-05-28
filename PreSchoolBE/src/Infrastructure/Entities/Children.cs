using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PreSchoolBE.src.Infrastructure.Entities
{
    public class Children
    {
        [Key]
        public Guid ID { get; set; }

        public string? Name { get; set; }
        public DateTime Birthday { get; set; }
        public string? Gender { get; set; }
        public string? Avatar { get; set; }
        public string? City { get; set; }
        public string? BirthCertificate { get; set; }

        [Required]
        public Guid ParentID { get; set; }

        public DateTime EnrollDate { get; set; }
        public string? Status { get; set; }

        [ForeignKey("ParentID")]
        public Account? Parent { get; set; }

        public ICollection<ClassChildren> ClassChildrens { get; set; }
        public ICollection<EnrollmentApplication> EnrollmentApplications { get; set; }
    }
}