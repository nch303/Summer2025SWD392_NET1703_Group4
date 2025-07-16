using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    public class ClassChildren
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public Guid ChildrenID { get; set; }
        [Required]
        public int ClassID { get; set; }
        public string? Status { get; set; }

        [ForeignKey("ChildrenID")]
        public Children? Childrens { get; set; }
        [ForeignKey("ClassID")]
        public Class? Classes { get; set; }

        public ICollection<Attendance>? Attendances { get; set; }
    }
}