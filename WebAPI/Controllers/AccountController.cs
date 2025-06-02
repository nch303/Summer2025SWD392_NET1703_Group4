using Application.DTOs.Reponse;
using Application.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController: ControllerBase
    {
        private readonly IAccountService _accountService;
        private readonly IMapper _mapper;

        public AccountController(IAccountService accountService, IMapper mapper)
        {
            _accountService = accountService;
            _mapper = mapper;
        }

        [HttpGet("getCurrentAccount")]
        [Authorize]
        public async Task<IActionResult> GetCurrentAccount()
        {
            try
            {
                var account = await _accountService.GetCurrentAccount();
                var accountResponse = new AccountResponse();
                _mapper.Map(account,accountResponse);
                accountResponse.RoleName = account.Role!.Name;
                return Ok(accountResponse);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
