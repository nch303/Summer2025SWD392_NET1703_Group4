using Application.DTOs.Response;
using Application.Interfaces;
using Application.Services;
using AutoMapper;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Client;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InvoiceController : ControllerBase
    {
        private readonly IInvoiceService _invoiceService;
        private readonly IMapper _mapper;
        private readonly IAccountService _accountService;
        private readonly IChildrenService _childrenService;
        private readonly IInvoiceDetailService _invoiceDetailService;
        private readonly IEnrichProgramService _enrichProgramService;
        private readonly ITuitionFeeService _tuitionFeeService;

        public InvoiceController(IInvoiceService invoiceService, IMapper mapper, IAccountService accountService
            , IChildrenService childrenService, IInvoiceDetailService invoiceDetailService, IEnrichProgramService enrichProgramService
            , ITuitionFeeService tuitionFeeService)
        {
            _invoiceService = invoiceService;
            _mapper = mapper;
            _accountService = accountService;
            _childrenService = childrenService;
            _invoiceDetailService = invoiceDetailService;
            _enrichProgramService = enrichProgramService;
            _tuitionFeeService = tuitionFeeService;
        }

        [HttpGet("byAccountId")]
        [Authorize]
        public async Task<IActionResult> GetByAccountIdAsync(Guid accountId)
        {
            var invoices = await _invoiceService.GetByAccountIdAsync(accountId);
            var invoiceResponses = _mapper.Map<List<InvoiceResponse>>(invoices);
            for (int i = 0; i < invoiceResponses.Count; i++)
            {
                var invoiceResponse = invoiceResponses[i];

                var parentAccount = await _accountService.GetAccountByIdAsync(accountId);
                invoiceResponse.ParentName = parentAccount.FullName;

                var children = await _childrenService.GetChildByIdAsync(invoices[i].ChildrenID);
                invoiceResponse.ChildrenName = children!.Name!;
            }

            return Ok(invoiceResponses);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAsync()
        {
            var invoices = await _invoiceService.GetAllInvoiceAsync();
            var invoiceResponses = _mapper.Map<List<InvoiceResponse>>(invoices);
            for (int i = 0; i < invoiceResponses.Count; i++)
            {
                var invoiceResponse = invoiceResponses[i];

                var parentAccount = await _accountService.GetAccountByIdAsync(invoices[i].AccountID);
                invoiceResponse.ParentName = parentAccount.FullName;

                var children = await _childrenService.GetChildByIdAsync(invoices[i].ChildrenID);
                invoiceResponse.ChildrenName = children!.Name!;
            }
            return Ok(invoiceResponses);
        }

        [HttpGet("pdf/{invoiceId}")]
        public async Task<IActionResult> GetInvoicePdf(Guid invoiceId)
        {
            try
            {
                var invoice = await _invoiceService.GetByIdAsync(invoiceId);
                var invoicePDFResponse = _mapper.Map<InvoicePDFResponse>(invoice);

                var parentAccount = await _accountService.GetAccountByIdAsync(invoice!.AccountID);
                invoicePDFResponse.ParentName = parentAccount.FullName;


                var invoiceDetails = await _invoiceDetailService.GetByInvoiceIdAsync(invoiceId);
                var invoiceDetailResponses = _mapper.Map<List<InvoiceDetailResponse>>(invoiceDetails);
                for (int i = 0; i < invoiceDetails.Count; i++)
                {
                    var detail = invoiceDetailResponses[i];

                    var child = await _childrenService.GetChildByIdAsync(invoiceDetails[i].ChildrenID);
                    detail.ChildrenName = child!.Name;

                    if(invoiceDetails[i].ProgramID != null)
                    {
                        var program = await _enrichProgramService.GetProgramByIdAsync(invoiceDetails[i].ProgramID);
                        detail.ProgramName = program.Name;
                        detail.Description = program.Description;
                    }
                    else
                    {
                        var tuition = await _tuitionFeeService.GetTuitionFeeByIdAsync(invoiceDetails[i].TuitionFeeID);
                        detail.tuitionFeeName = tuition!.Name;
                        detail.Description = tuition.Description;
                    }
                    
                }
                invoicePDFResponse.InvoiceDetails = invoiceDetailResponses;
                invoicePDFResponse.InvoiceID = invoiceId;

                var pdfBytes = _invoiceService.GenerateInvoicePDF(invoicePDFResponse).Result;

                return File(pdfBytes, "application/pdf", $"Invoice_{invoiceId}.pdf");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống", detail = ex.Message });
            }
        }

        [HttpGet("ByCurrentAccount")]
        [Authorize]
        public async Task<IActionResult> GetByCurrentAccountAsync()
        {
            var currentAccount = await _accountService.GetCurrentAccount();
            if (currentAccount == null)
            {
                return Unauthorized(new { message = "Unauthorized" });
            }
            var invoices = await _invoiceService.GetByAccountIdAsync(currentAccount.Id);
            var invoiceResponses = _mapper.Map<List<InvoiceResponse>>(invoices);
            for (int i = 0; i < invoiceResponses.Count; i++)
            {
                var invoiceResponse = invoiceResponses[i];
                var parentAccount = await _accountService.GetAccountByIdAsync(currentAccount.Id);
                invoiceResponse.ParentName = parentAccount.FullName;
                var children = await _childrenService.GetChildByIdAsync(invoices[i].ChildrenID);
                invoiceResponse.ChildrenName = children!.Name!;
            }
            return Ok(invoiceResponses);

        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetByIdAsync(Guid id)
        {
            var invoice = await _invoiceService.GetByIdAsync(id);
            if (invoice == null)
            {
                return NotFound(new { message = "Invoice not found" });
            }
            var invoiceResponse = _mapper.Map<InvoiceResponse>(invoice);
            var parentAccount = await _accountService.GetAccountByIdAsync(invoice.AccountID);
            invoiceResponse.ParentName = parentAccount.FullName;
            var children = await _childrenService.GetChildByIdAsync(invoice.ChildrenID);
            invoiceResponse.ChildrenName = children!.Name!;
            return Ok(invoiceResponse);

        }
    }
}
