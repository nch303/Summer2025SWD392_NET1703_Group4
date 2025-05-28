using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PreSchoolBE.src.Infrastructure.Entities
{
    public class ClassTeacher
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public Guid TeacherID { get; set; }

        [Required]
        public int ClassID { get; set; }

        [ForeignKey("TeacherID")]
        public Account? Teacher { get; set; }
        [ForeignKey("ClassID")]
        public Class? Class { get; set; }
    }
}