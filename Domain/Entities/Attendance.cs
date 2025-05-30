using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    public class Attendance
    {
        [Key]
        public int ID { get; set; }
        public DateTime Date { get; set; }

        [Required]
        public int ClassChildrenID { get; set; }

        public string? Status { get; set; }
        public string? Notes { get; set; }

        [ForeignKey("ClassChildrenID")]
        public ClassChildren? ClassChildrens { get; set; }
    }
}