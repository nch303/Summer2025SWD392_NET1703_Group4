namespace PreSchoolBE.src.Infrastructure.Entities
{
    public class Role
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;

        public ICollection<Account>? Accounts { get; set; }
    }
}
