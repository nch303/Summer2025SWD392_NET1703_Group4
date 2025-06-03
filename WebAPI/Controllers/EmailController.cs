using Application.DTOs.Response;
using Application.Interfaces;
using Application.Interfaces.IServices;
using Application.Services;
using AutoMapper;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmailController : ControllerBase
    {
        private readonly IEmailService _emailService;
        private readonly IInvoiceService _invoiceService;
        private readonly IAccountService _accountService;
        private readonly IChildrenService _childrenService;
        private readonly IInvoiceDetailService _invoiceDetailService;
        private readonly IMapper _mapper;
        private readonly IEnrichProgramService _enrichProgramService;

        public EmailController(IEmailService emailService, IInvoiceService invoiceService, IAccountService accountService
            , IChildrenService childrenService, IInvoiceDetailService invoiceDetailService, IMapper mapper
            , IEnrichProgramService enrichProgramService)
        {
            _emailService = emailService;
            _invoiceService = invoiceService;
            _accountService = accountService;
            _childrenService = childrenService;
            _invoiceDetailService = invoiceDetailService;
            _mapper = mapper;
            _enrichProgramService = enrichProgramService;
        }

        [HttpPost("send-email")]
        public async Task<IActionResult> SendInvoiceEmailAsync(Guid invoiceId)
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

                    var program = await _enrichProgramService.GetProgramByIdAsync(invoiceDetails[i].ProgramID);
                    detail.ProgramName = program.Name;
                }
                invoicePDFResponse.InvoiceDetails = invoiceDetailResponses;

                var pdfBytes = _invoiceService.GenerateInvoicePDF(invoicePDFResponse);

                /// Construct email details
                await _emailService.SendInvoiceEmailAsync(
                    "nguyenchihao7n2@gmail.com",
                    "Hóa đơn thanh toán từ Trường Mầm Non",
                    "<p>Kính gửi quý phụ huynh,</p><p>Vui lòng xem hóa đơn thanh toán đính kèm.</p><p>Trân trọng,</p><p>Trường Mầm Non Little Stars</p>",
                    pdfBytes, "invoice.pdf"
                );

                return Ok(new { Message = "Email sent successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
