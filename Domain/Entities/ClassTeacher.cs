using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    public class ClassTeacher
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public Guid TeacherID { get; set; }

        [Required]
        public int ClassID { get; set; }
        public string? Status { get; set; }

        [ForeignKey("TeacherID")]
        public Account? Teachers { get; set; }
        [ForeignKey("ClassID")]
        public Class? Classes { get; set; }
    }
}