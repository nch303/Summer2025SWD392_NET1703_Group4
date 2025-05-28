using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PreSchoolBE.src.Infrastructure.Entities
{
    public class ClassChildren
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public Guid ChildrenID { get; set; }
        [Required]
        public int ClassID { get; set; }

        [ForeignKey("ChildrenID")]
        public Children? Children { get; set; }
        [ForeignKey("ClassID")]
        public Class? Class { get; set; }

        public ICollection<Attendance> Attendances { get; set; }
    }
}