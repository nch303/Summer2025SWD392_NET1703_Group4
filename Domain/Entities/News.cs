using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    public class News
    {
        [Key]
        public int ID { get; set; }

        public string? Title { get; set; }
        public string? Content { get; set; }
        public DateTime PublishDate { get; set; }
        public string? Image { get; set; }
        public string? Banner { get; set; }
        public string? Status { get; set; }
    }
}