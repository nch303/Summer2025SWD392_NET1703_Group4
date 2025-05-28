using PreSchoolBE.src.Infrastructure.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IAuthRepository
    {
        Task RegisterAsync(Account account);
        Task<Account> GetAccountByEmailAsync(string email);
        Task<Account> LoginAsync(string email, string password);
        Task ConfirmEmailAsync(string token);
    }
}
