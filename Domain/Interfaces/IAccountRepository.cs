using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IAccountRepository
    {
        Task<Account> GetAccountByPhoneNumberAsync(string phoneNumber);
        Task<Account> GetAccountByEmailAsync(string email);
        Task<Account> GetAccountByIdAsync(Guid id);
        Task<Account> UpdateAccountTokenAsync(string email, string token);
        Task UpdateAccountAsync(Account account);
        Task<Account> UpdateAccountByUserAsync(Account account);
        Task ChangePasswordAsync(string newPassword, Account account);

        Task<Account> CreateAccountAsync(Account account);
        Task<List<Account>> GetAllAsync();
        Task<Account> UpdateAccountByAdminAsync(Account account);
        Task<Account> BanAccountAsync(Guid id);
        Task<Account> GetByIdAsync(Guid id);
    }
}
