using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PreSchoolBE.src.Infrastructure.Entities
{
    public class Invoice
    {
        [Key]
        public Guid ID { get; set; }

        [Required]
        public Guid AccountID { get; set; }

        [Required]
        public Guid ChildrenID { get; set; }

        public decimal Amount { get; set; }
        public string? Status { get; set; }
        public DateTime Date { get; set; }

        [ForeignKey("AccountID")]
        public Account? Accounts { get; set; }
        [ForeignKey("ChildrenID")]
        public Children? Childrens { get; set; }
        public ICollection<InvoiceDetail>? InvoiceDetails { get; set; }
    }
}