using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PreSchoolBE.src.Infrastructure.Entities
{
    public class SyllabusDetail
    {
        [Key]
        public int ID { get; set; }

        public int Slot { get; set; }
        public string? Content { get; set; }
        public int Duration { get; set; }

        [Required]
        public int SyllabusID { get; set; }

        [ForeignKey("SyllabusID")]
        public Syllabus? Syllabus { get; set; }
    }
}