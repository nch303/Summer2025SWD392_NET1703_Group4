using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    public class Role
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;

        public ICollection<Account>? Accounts { get; set; }
    }
}
