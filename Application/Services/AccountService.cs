using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class AccountService : IAccountService
    {
        private readonly IAccountRepository _accountRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IConfiguration _configuration;

        public AccountService(IAccountRepository accountRepository, IHttpContextAccessor httpContextAccessor, IConfiguration configuration)
        {
            _accountRepository = accountRepository;
            _httpContextAccessor = httpContextAccessor;
            _configuration = configuration;
        }

        public async Task<Account> GetAccountByPhoneNumberAsync(string phoneNumber)
        {
            var account = await _accountRepository.GetAccountByPhoneNumberAsync(phoneNumber);
            if (account == null)
            {
                throw new Exception("Account not found with the provided phone number.");
            }
            return account;
        }

        public async Task<Account> GetAccountByEmailAsync(string email)
        {
            var account = await _accountRepository.GetAccountByEmailAsync(email);
            return account;
        }

        public async Task<Account> GetAccountByIdAsync(Guid id)
        {
            var account = await _accountRepository.GetAccountByIdAsync(id);
            if (account == null)
            {
                throw new Exception("Account not found.");
            }
            return account;
        }

        public async Task<Account> GetCurrentAccount()
        {
            // Take token from header Authorization
            var authorizationHeader = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();
            if (string.IsNullOrEmpty(authorizationHeader))
            {
                throw new Exception("Authorization header is missing.");
            }

            // Take Token and remove "Bearer " prefix if it exists
            var token = authorizationHeader.StartsWith("Bearer ")
                ? authorizationHeader.Substring("Bearer ".Length).Trim()
                : authorizationHeader.Trim();

            // Encode the token 
            var tokenHandler = new JwtSecurityTokenHandler();
            var secretKey = _configuration["JwtSettings:SecretKey"];
            if (string.IsNullOrEmpty(secretKey))
            {
                throw new Exception("JWT Secret Key is not configured.");
            }

            var key = Encoding.ASCII.GetBytes(secretKey);

            try
            {
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _configuration["JwtSettings:Issuer"],
                    ValidateAudience = true,
                    ValidAudience = _configuration["JwtSettings:Audience"],
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;
                var userIdClaim = jwtToken.Claims.FirstOrDefault(x => x.Type == "nameid");
                if (userIdClaim == null)
                {
                    throw new Exception("Invalid token: User ID not found.");
                }

                if (!Guid.TryParse(userIdClaim.Value, out var userId))
                {
                    throw new Exception("Invalid token: User ID is not a valid GUID.");
                }

                var account = await _accountRepository.GetAccountByIdAsync(userId);
                return account ?? throw new Exception("Account not found for the provided user ID.");
            }
            catch (SecurityTokenExpiredException)
            {
                throw new Exception("Token has expired.");
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to validate token: {ex.Message}", ex);
            }
        }

        public async Task<Account> UpdateAccountTokenAsync(string email, string token)
        {
            var account = await _accountRepository.UpdateAccountTokenAsync(email, token);
            if (account == null)
            {
                throw new Exception("Failed to update account token.");
            }
            return account;
        }

        public async Task<Account> CreateAccountAsync(Account account)
        {
            if (account == null)
            {
                throw new ArgumentNullException(nameof(account), "Account cannot be null.");
            }

            //Check existing account by email
            var existingAccount = await _accountRepository.GetAccountByEmailAsync(account.Email);
            if (existingAccount != null)
            {
                throw new Exception("This email already exists.");
            }

            //Check existing account by phone number
            var existingPhoneAccount = await _accountRepository.GetAccountByPhoneNumberAsync(account.PhoneNumber);
            if (existingPhoneAccount != null)
            {
                throw new Exception("This phone number already exists.");
            }

            account.Status = "Active";
            var createdAccount = await _accountRepository.CreateAccountAsync(account);
            if (createdAccount == null)
            {
                throw new Exception("Failed to create account.");
            }
            return createdAccount;
        }

        public async Task<List<Account>> GetAllAsync()
        {
            var accounts = await _accountRepository.GetAllAsync();
            if (accounts.Count == 0)
            {
                throw new Exception("No accounts found.");
            }
            return accounts;
        }

        public async Task<Account> UpdateAccountAsync(Account account)
        {
            if (account == null)
            {
                throw new ArgumentNullException(nameof(account), "Account cannot be null.");
            }

            //Check existing account by email
            var existingEmailAccount = await _accountRepository.GetAccountByEmailAsync(account.Email);
            if (existingEmailAccount != null)
            {
                throw new Exception("This email already exists.");
            }

            //Check existing account by phone number
            var existingPhoneAccount = await _accountRepository.GetAccountByPhoneNumberAsync(account.PhoneNumber);
            if (existingPhoneAccount != null)
            {
                throw new Exception("This phone number already exists.");
            }

            var existingAccount = await _accountRepository.GetAccountByIdAsync(account.Id);
            if (existingAccount == null)
            {
                throw new Exception("Account not found.");
            }

            var updatedAccount = await _accountRepository.UpdateAccountAsync(account);
            if (updatedAccount == null)
            {
                throw new Exception("Failed to update account.");
            }
            return updatedAccount;
        }

        public async Task<Account> BanAccountAsync(Guid id)
        {
            var account = await _accountRepository.GetAccountByIdAsync(id);
            if (account == null)
            {
                throw new Exception("Account not found.");
            }
            account.Status = "Banned"; // Update the status to "Banned"
            var updatedAccount = await _accountRepository.UpdateAccountAsync(account);
            if (updatedAccount == null)
            {
                throw new Exception("Failed to ban account.");
            }
            return updatedAccount;
        }
    }
}
