using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PreSchoolBE.src.Infrastructure.Entities
{
    public class Class
    {
        [Key]
        public int ID { get; set; }

        public string? Name { get; set; }

        [Required]
        public int SyllabusID { get; set; }

        public int Quantity { get; set; }
        public string? Status { get; set; }

        public ICollection<ClassChildren> ClassChildrens { get; set; }

        [ForeignKey("SyllabusID")]
        public Syllabus? ClassSyllabus { get; set; }
    }
}