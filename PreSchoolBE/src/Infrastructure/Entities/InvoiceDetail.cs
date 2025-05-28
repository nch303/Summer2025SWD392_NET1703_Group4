using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PreSchoolBE.src.Infrastructure.Entities
{
    public class InvoiceDetail
    {
        [Key]
        public Guid ID { get; set; }

        [Required]
        public Guid InvoiceID { get; set; }

        [Required]
        public int ProgramID { get; set; }

        public decimal Price { get; set; }

        [Required]
        public Guid ChildrenID { get; set; }

        [ForeignKey("InvoiceID")]
        public Invoice? Invoice { get; set; }
        [ForeignKey("ProgramID")]
        public EnrichmentProgram? Program { get; set; }
        [ForeignKey("ChildrenID")]
        public Children? Children { get; set; }
    }
}