using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.EntitiesConfigurations;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class AccountRepository : IAccountRepository
    {
        private readonly AppDbContext _context;

        public AccountRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Account> GetAccountByPhoneNumberAsync(string phoneNumber)
        {
            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.PhoneNumber == phoneNumber);
            return account!;
        }

        public async Task<Account> GetAccountByEmailAsync(string email)
        {
            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.Email == email);
            return account!;
        }

        public async Task<Account> GetAccountByIdAsync(Guid id)
        {
            var account = await _context.Accounts.Include(a => a.Role)
                .FirstOrDefaultAsync(a => a.Id == id);
            return account!;
        }

        public async Task<Account> UpdateAccountTokenAsync(string email, string token)
        {
            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.Email.ToLower().Trim() == email.ToLower().Trim());
            if (account == null) return null!;
            account.ConfirmationToken = token;
            _context.Accounts.Update(account);
            await _context.SaveChangesAsync();
            return account;
        }

        public async Task UpdateAccountAsync(Account account)
        {
            _context.Accounts.Update(account);
            await _context.SaveChangesAsync();
        }

        public async Task ChangePasswordAsync(string newPassword, Account account)
        {
            account.Password = newPassword;
            _context.Accounts.Update(account);
            await _context.SaveChangesAsync();
        }

        public async Task<Account> CreateAccountAsync(Account account)
        {
            await _context.Accounts.AddAsync(account);
            await _context.SaveChangesAsync();
            return account;
        }

        public async Task<List<Account>> GetAllAsync()
        {
            var accounts = await _context.Accounts.ToListAsync();
            return accounts;
        }

        public async Task<Account> UpdateAccountByAdminAsync(Account account)
        {
            var existingAccount = await _context.Accounts.FindAsync(account.Id);
            existingAccount!.FullName = account.FullName;
            existingAccount.PhoneNumber = account.PhoneNumber;
            existingAccount.Email = account.Email;
            existingAccount.Password = BCrypt.Net.BCrypt.HashPassword(account.Password);

            _context.Accounts.Update(existingAccount);
            await _context.SaveChangesAsync();
            return existingAccount;
        }

        public async Task<Account> BanAccountAsync(Guid id)
        {
            var account = await _context.Accounts.FindAsync(id);
            _context.Accounts.Update(account!);
            await _context.SaveChangesAsync();
            return account!;
        }

        public async Task<Account> GetByIdAsync(Guid id)
        {
            var account = await _context.Accounts.FindAsync(id);
            return account!;
        }
    }
}
