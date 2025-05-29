using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    public class EnrichmentProgram
    {
        [Key]
        public int ID { get; set; }

        public string? Name { get; set; }
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsDelete { get; set; }
        public int MaxChildren { get; set; }
        public decimal Fee { get; set; }

        [Required]
        public int TypeProgramID { get; set; }
        [ForeignKey("TypeProgramID")]
        public TypeProgram? TypePrograms { get; set; }
        public ICollection<InvoiceDetail>? InvoiceDetails { get; set; }
    }
}