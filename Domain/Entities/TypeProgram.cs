using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PreSchoolBE.src.Infrastructure.Entities
{
    public class TypeProgram
    {
        [Key]
        public int ID { get; set; }
        public string? Name { get; set; }

        public ICollection<EnrichmentProgram>? Programs { get; set; }
    }
}