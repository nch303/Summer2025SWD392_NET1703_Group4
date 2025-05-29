using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Domain.Entities;
using Infrastructure.EntitiesConfigurations;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly AppDbContext _context;

        public AuthRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task RegisterAsync(Account account)
        {
            if (await _context.Accounts.AnyAsync(u => u.Email == account.Email))
                throw new Exception("Email already exists.");

            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();
        }

        public async Task<Account> GetAccountByEmailAsync(string email)
        {
            var account = _context.Accounts.FirstOrDefault(a => a.Email == email);
            return account!;
        }

        public async Task<Account> LoginAsync(string email, string password)
        {
            var user = await _context.Accounts
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == email);

            return user!;
        }

        public async Task ConfirmEmailAsync(string token)
        {
            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.ConfirmationToken == token);
            if (account == null)
            {
                throw new Exception("Invalid confirmation token.");
            }
            account.Status = "Active";
            account.ConfirmationToken = null; // Clear the confirmation token after successful confirmation
            await _context.SaveChangesAsync();
        }
    }
}
