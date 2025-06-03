using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class ChildrenGrade
    {
        [Key]
        public int ID { get; set; }
        [Required]
        public Guid ChildrenID { get; set; }
        [Required]
        public int GradeLevelID { get; set; }
        public string? AcademicYear { get; set; }
        public string? Status { get; set; }

        [ForeignKey("ChildrenID")]
        public Children? Childrens { get; set; }
        [ForeignKey("GradeLevelID")]
        public GradeLevel? GradeLevels { get; set; }
    }
}
