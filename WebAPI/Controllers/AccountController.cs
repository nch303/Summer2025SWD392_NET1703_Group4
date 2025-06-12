using Application.DTOs.Response;
using Application.DTOs.Request;
using Application.Interfaces;
using AutoMapper;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IAccountService _accountService;
        private readonly IMapper _mapper;
        private readonly IRoleService _roleService;

        public AccountController(IAccountService accountService, IMapper mapper, IRoleService roleService)
        {
            _accountService = accountService;
            _mapper = mapper;
            _roleService = roleService;
        }

        [HttpGet("getCurrentAccount")]
        [Authorize]
        public async Task<IActionResult> GetCurrentAccount()
        {
            try
            {
                var account = await _accountService.GetCurrentAccount();
                var accountResponse = new AccountResponse();
                _mapper.Map(account, accountResponse);
                accountResponse.RoleName = account.Role!.Name;
                return Ok(accountResponse);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{Id}")]
        public async Task<IActionResult> GetAccountById(Guid Id)
        {
            try
            {
                var account = await _accountService.GetAccountByIdAsync(Id);
                if (account == null)
                {
                    return NotFound("Account not found.");
                }
                var response = _mapper.Map<AccountResponse>(account);
                var role = await _roleService.GetById(account.RoleId);
                response.RoleName = role.Name;
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("byAdmin")]
        public async Task<IActionResult> CreateAccount([FromBody] AccountRequest request)
        {
            try
            {
                var account = _mapper.Map<Account>(request);
                account.Password = BCrypt.Net.BCrypt.HashPassword(request.Password);
                var createdAccount = await _accountService.CreateAccountAsync(account);
                var response = _mapper.Map<AccountResponse>(createdAccount);
                var role = await _roleService.GetById(createdAccount.RoleId);
                response.RoleName = role.Name;
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { ex.Message });
            }
        }

        [HttpGet("AllAccount")]
        public async Task<IActionResult> GetAllAccounts()
        {
            try
            {
                var accounts = await _accountService.GetAllAsync();
                var accountResponses = _mapper.Map<List<AccountResponse>>(accounts);
                for (int i = 0; i < accountResponses.Count; i++)
                {
                    var accountResponse = accountResponses[i];
                    var role = await _roleService.GetById(accounts[i].RoleId);
                    accountResponse.RoleName = role.Name;
                }
                return Ok(accountResponses);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{Id}")]
        public async Task<IActionResult> UpdateAccount(Guid Id, [FromBody] AccountRequest request)
        {
            try
            {
                var account = await _accountService.GetAccountByIdAsync(Id);
                var oldPass = account.Password;
                account = _mapper.Map<Account>(request);
                account.Id = Id;
                if(request.Password != null)
                {
                    account.Password = BCrypt.Net.BCrypt.HashPassword(request.Password);
                }
                else
                {
                    account.Password = oldPass; // Keep the existing password if not provided
                }
                var updatedAccount = await _accountService.UpdateAccountByAdminAsync(account);
                var response = _mapper.Map<AccountResponse>(updatedAccount);
                var role = await _roleService.GetById(updatedAccount.RoleId);
                response.RoleName = role.Name;
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("update-user-profile")]
        public async Task<IActionResult> UpdateUserProfile([FromBody] UpdateUserProfileRequest request)
        {
            try
            {
                var account = await _accountService.GetCurrentAccount();
                var id = account.Id;
                account = _mapper.Map<Account>(request);
                account.Id = id;
                var updatedAccount = await _accountService.UpdateAccountByUserAsync(account);
                var response = _mapper.Map<UpdateUserProfileResponse>(updatedAccount);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{Id}")]
        public async Task<IActionResult> BanAccount(Guid Id)
        {
            try
            {
                var bannedAccount = await _accountService.BanAccountAsync(Id);
                if (bannedAccount == null)
                {
                    return NotFound("Account not found.");
                }
                var response = _mapper.Map<AccountResponse>(bannedAccount);
                var role = await _roleService.GetById(bannedAccount.RoleId);
                response.RoleName = role.Name;
                return Ok("The account ID: " + bannedAccount!.Id + " is banned successfully");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("get-list-of-teachers")]
        public async Task<IActionResult> GetListOfTeachers()
        {
            try
            {
                var teachers = await _accountService.GetListOfTeachers();
                var responses = _mapper.Map<List<TeacherResponse>>(teachers);
                return Ok(responses);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("restore-account/{Id}")]
        public async Task<IActionResult> RestoreAccount(Guid Id)
        {
            try
            {
                var restoredAccount = await _accountService.RestoreAccountAsync(Id);
                if (restoredAccount == null)
                {
                    return NotFound("Account not found.");
                }
                var response = _mapper.Map<AccountResponse>(restoredAccount);
                var role = await _roleService.GetById(restoredAccount.RoleId);
                response.RoleName = role.Name;
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("AllAccounts")]
        public async Task<IActionResult> GetAllAccounts(int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                var (accounts, totalCount) = await _accountService.GetPagedAsync(pageNumber, pageSize);

                var accountResponses = _mapper.Map<List<AccountResponse>>(accounts);

                for (int i = 0; i < accountResponses.Count; i++)
                {
                    var role = await _roleService.GetById(accounts[i].RoleId);
                    accountResponses[i].RoleName = role.Name;
                }

                return Ok(new
                {
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    Data = accountResponses
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("Search")]
        public async Task<IActionResult> SearchAccounts(string? keyword = "", int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                var (accounts, totalCount) = await _accountService.SearchAccountsAsync(keyword, pageNumber, pageSize);

                var accountResponses = _mapper.Map<List<AccountResponse>>(accounts);

                for (int i = 0; i < accountResponses.Count; i++)
                {
                    var role = await _roleService.GetById(accounts[i].RoleId);
                    accountResponses[i].RoleName = role.Name;
                }

                return Ok(new
                {
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    Data = accountResponses
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
