using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    public class Account
    {
        [Key]
        public Guid Id { get; set; }

        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string? Status { get; set; }
        public string? ConfirmationToken { get; set; }

        [Required]
        public int RoleId { get; set; }

        [ForeignKey("RoleId")]
        public Role? Role { get; set; }
        public ICollection<Invoice>? Invoices { get; set; }
        public ICollection<Notification>? Notifications { get; set; }
        public ICollection<EnrollmentApplication>? ApplicationsSubmitted { get; set; } // as Parent
        public ICollection<EnrollmentApplication>? ApplicationsApproved { get; set; }  // as Staff
        public ICollection<Children>? Childrens { get; set; }
        public ICollection<ClassTeacher>? ClassTeachers { get; set; }
    }

}
