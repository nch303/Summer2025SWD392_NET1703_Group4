using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class TuitionFee
    {
        [Key]
        public int ID { get; set; } 
        public string? Name { get; set; }
        public string? Description { get; set; }
        [Required]
        public int GradeLevelID { get; set; }
        [ForeignKey("GradeLevelID")]
        public GradeLevel? GradeLevels { get; set; }
        public InvoiceDetail? InvoiceDetails { get; set; }
    }
}
