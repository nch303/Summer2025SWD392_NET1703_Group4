using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PreSchoolBE.src.Infrastructure.Entities
{
    public class Syllabus
    {
        [Key]
        public int ID { get; set; }

        public string? Name { get; set; }
        public int SlotAmount { get; set; }

        public ICollection<Class>? Classes { get; set; }
        public ICollection<SyllabusDetail>? SyllabusDetails { get; set; }    
    }
}