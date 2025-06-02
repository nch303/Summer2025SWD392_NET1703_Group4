using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InvoiceController: ControllerBase
    {
        private readonly IInvoiceService _invoiceService;

        public InvoiceController(IInvoiceService invoiceService)
        {
            _invoiceService = invoiceService ?? throw new ArgumentNullException(nameof(invoiceService));
        }

        [HttpGet("byAccountId")]
        [Authorize]
        public async Task<IActionResult> GetByAccountIdAsync(Guid accountId)
        {
            var invoices = await _invoiceService.GetByAccountIdAsync(accountId);
            return Ok(invoices);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAsync()
        {
            var invoices = await _invoiceService.GetAllInvoiceAsync();
            return Ok(invoices);
        }


    }
}
