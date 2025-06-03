using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IAccountService
    {
        Task<Account> GetAccountByEmailAsync(string email);
        Task<Account> GetCurrentAccount();
        Task<Account> GetAccountByIdAsync(Guid id);
        Task<Account> UpdateAccountTokenAsync(string email, string token);
        Task UpdateAccountAsync(Account account);
    }
}
