using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PreSchoolBE.src.Infrastructure.Entities
{
    public class Notification
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public Guid AccountID { get; set; }

        public string? Content { get; set; }
        public string? Title { get; set; }
        public bool IsRead { get; set; }
        public string? Type { get; set; }

        [ForeignKey("AccountID")]
        public Account? Accounts { get; set; }
    }
}