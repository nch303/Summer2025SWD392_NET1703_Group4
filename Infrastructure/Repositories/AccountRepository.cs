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

        public async Task<Account> UpdateAccountByUserAsync(Account account)
        {
            var updateAccount = _context.Accounts.FirstOrDefault(a => a.Id == account.Id);
            updateAccount!.FullName = account.FullName;
            updateAccount.PhoneNumber = account.PhoneNumber;
            updateAccount.Address = account.Address;
            _context.Accounts.Update(updateAccount);
            await _context.SaveChangesAsync();
            return account;
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
            existingAccount.RoleId = account.RoleId;
            existingAccount.Address = account.Address;

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

        public async Task<List<Account>> GetListOfTeachers()
        {
            var teachers = await _context.Accounts
                .Include(a => a.Role)
                .Where(a => a.Role!.Name == "Teacher")
                .ToListAsync();
            return teachers;
        }

        public async Task<Account> RestoreAccountAsync(Guid id)
        {
            var account = await _context.Accounts.FindAsync(id);
            _context.Accounts.Update(account!);
            await _context.SaveChangesAsync();
            return account!;
        }

        public async Task<IQueryable<Account>> GetAllQueryableAsync()
        {
            return _context.Accounts.AsQueryable();
        }

        public async Task<(List<Account> Items, int TotalCount)> SearchAccountsAsync(string keyword, int pageNumber, int pageSize)
        {
            var query = _context.Accounts
                .Include(a => a.Role)
                .AsQueryable();

            if (!string.IsNullOrEmpty(keyword))
            {
                query = query.Where(a =>
                    a.FullName.Contains(keyword) ||
                    a.Email.Contains(keyword) ||
                    a.Address!.Contains(keyword) ||
                    a.Role!.Name.Contains(keyword) ||
                    a.PhoneNumber.Contains(keyword) ||
                    a.Status!.Contains(keyword));
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderBy(a => a.Id)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<List<Account>> GetTeacherByClassIdAsync(int classId)
        {
            var teachers = new List<Account>();

            var classTeachers = await _context.ClassTeachers
                .Include(ct => ct.Teachers)
                .Where(ct => ct.ClassID == classId).ToListAsync();

            foreach (var classTeacher in classTeachers)
            {
                var teacher = classTeacher.Teachers;
                teachers.Add(teacher!);
            }

            return teachers!;
        }

        public async Task<List<Account>> GetTeachersNoClass()
        {
            var teachers = await _context.Accounts
                .Include(a => a.Role)!
                .Include(a => a.ClassTeachers)!
                    .ThenInclude(ct => ct.Classes)
                .Where(a => a.Role!.Name == "Teacher")
                .ToListAsync();
            return teachers;

        }
    }
}
