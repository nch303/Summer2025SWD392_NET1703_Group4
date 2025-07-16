using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Domain.Entities
{
    public class Class
    {
        [Key]
        public int ID { get; set; }

        public string? Name { get; set; }

        [Required]
        public int SyllabusID { get; set; }
        public int? GradeLevelID { get; set; }
        public int? EnrichmentProgramId { get; set; }
        public string? AcademicYear { get; set; }
        public int Quantity { get; set; }
        public int MaxChildren {  get; set; }
        public string? Timetable {  get; set; }
        public string? Status { get; set; }

        public ICollection<ClassChildren>? ClassChildrens { get; set; }

        [ForeignKey("SyllabusID")]
        public Syllabus? Syllabi { get; set; }
        [ForeignKey("GradeLevelID")]
        public GradeLevel? GradeLevels { get; set; }
        [ForeignKey("EnrichmentProgramId")]
        public EnrichmentProgram? EnrichmentPrograms { get; set; }
        public ICollection<ClassTeacher>? ClassTeachers { get; set; }    
    }
}