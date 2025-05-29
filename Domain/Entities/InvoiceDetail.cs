using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
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
        public Invoice? Invoices { get; set; }
        [ForeignKey("ProgramID")]
        public EnrichmentProgram? Programs { get; set; }
        [ForeignKey("ChildrenID")]
        public Children? Childrens { get; set; }
    }
}