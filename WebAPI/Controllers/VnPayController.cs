using Application.DTOs.Request;
using Application.DTOs.Response;
using Application.Interfaces;
using Application.Interfaces.IServices;
using Application.Services;
using AutoMapper;
using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.EntitiesConfigurations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace WebAPI.Controllers
{
    [Route("api/vnpay")]
    [ApiController]
    public class VNPayController : ControllerBase
    {
        private readonly IVnPayService _vnPayService;
        private readonly IInvoiceService _invoiceService;
        private readonly IMapper _mapper;
        private readonly IAccountService _accountService;
        private readonly IChildrenService _childrenService;
        private readonly IInvoiceDetailService _invoiceDetailService;
        private readonly IEnrichProgramService _enrichProgramService;
        private readonly IEmailService _emailService;
        private readonly ITuitionFeeService _tuitionFeeService;
        private readonly IEARepository _eARepository;
        private readonly IEAService _eaService;
        private readonly IConfiguration _configuration;

        public VNPayController(IVnPayService vnPayService, IInvoiceService invoiceService, IMapper mapper
            , IAccountService accountService, IChildrenService childrenService, IInvoiceDetailService invoiceDetailService
            , IEnrichProgramService enrichProgramService, IEmailService emailService, ITuitionFeeService tuitionFeeService
            , IEARepository eARepository, IEAService eAService, IConfiguration configuration)
        {
            _vnPayService = vnPayService;
            _invoiceService = invoiceService;
            _mapper = mapper;
            _accountService = accountService;
            _childrenService = childrenService;
            _invoiceDetailService = invoiceDetailService;
            _enrichProgramService = enrichProgramService;
            _emailService = emailService;
            _tuitionFeeService = tuitionFeeService;
            _eARepository = eARepository;
            _eaService = eAService;
            _configuration = configuration;
        }

        [HttpPost("create-payment-url")]
        public async Task<IActionResult> CreatePaymentUrlVnpay(VnPayRequest request)
        {
            var url = await _vnPayService.CreatePaymentUrl(request, HttpContext);

            return Ok(new { Url = url });
        }

        [HttpGet("PaymentCallbackVnpay")]
        public async Task<IActionResult> PaymentCallbackVnpay()
        {
            var redirectUrl = "";
            var response = _vnPayService.PaymentExecute(Request.Query).Result;

            // Lấy chuỗi OrderInfo từ request
            string vnpOrderInfo = Request.Query["vnp_OrderInfo"];

            // Tách chuỗi theo dấu '|'
            var parts = vnpOrderInfo.Split('|');

            // Lấy phần chứa invoice ID (giả sử luôn ở phần thứ 4)
            var invoicePart = parts.FirstOrDefault(p => p.StartsWith("invoiceID:"));
            var invoiceId = Guid.Parse(invoicePart?.Substring("invoiceID:".Length) ?? "0");
            if (response.VnPayResponseCode == "00")
            {
                await _invoiceService.UpdateStatusAsync(invoiceId, "Success");

                /// Gửi email hóa đơn   
                var invoice = await _invoiceService.GetByIdAsync(invoiceId);
                var invoicePDFResponse = _mapper.Map<InvoicePDFResponse>(invoice);

                ///Update status enrollment application
                var enrollmentApp = await _eARepository.GetApplicatioinByChildID(invoice!.ChildrenID);
                enrollmentApp!.Status = "Paid";
                await _eaService.UpdateEnrollmentApplicationAsync(enrollmentApp);

                var parentAccount = await _accountService.GetAccountByIdAsync(invoice!.AccountID);
                invoicePDFResponse.ParentName = parentAccount.FullName;


                var invoiceDetails = await _invoiceDetailService.GetByInvoiceIdAsync(invoiceId);
                var invoiceDetailResponses = _mapper.Map<List<InvoiceDetailResponse>>(invoiceDetails);
                for (int i = 0; i < invoiceDetails.Count; i++)
                {
                    var detail = invoiceDetailResponses[i];

                    var child = await _childrenService.GetChildByIdAsync(invoiceDetails[i].ChildrenID);
                    detail.ChildrenName = child!.Name;


                    if (invoiceDetails[i].ProgramID != null)
                    {
                        var program = await _enrichProgramService.GetProgramByIdAsync(invoiceDetails[i].ProgramID);
                        detail.ProgramName = program.Name;
                        detail.Description = program.Description;
                    }
                    else
                    {
                        var tuitionFee = await _tuitionFeeService.GetTuitionFeeByIdAsync(invoiceDetails[i].TuitionFeeID);
                        detail.tuitionFeeName = tuitionFee?.Name;
                        detail.Description = tuitionFee?.Description;
                    }

                }
                invoicePDFResponse.InvoiceDetails = invoiceDetailResponses;

                var pdfBytes = _invoiceService.GenerateInvoicePDF(invoicePDFResponse);

                /// Construct email details
                await _emailService.SendInvoiceEmailAsync(
                    parentAccount.Email,
                    "Hóa đơn thanh toán từ Trường Mầm Non",
                    "<p>Kính gửi quý phụ huynh,</p><p>Vui lòng xem hóa đơn thanh toán đính kèm.</p><p>Trân trọng,</p><p>Trường Mầm Non Little Stars</p>",
                    pdfBytes, "invoice.pdf"
                );

                //Update status children
                var children = await _childrenService.GetChildByIdAsync(invoice.ChildrenID);
                children!.Status = "Paid";
                await _childrenService.UpdateChildAsync(children);

                // set success payment link
                redirectUrl = _configuration["Vnpay:successUrl"] + $"/{invoiceId}"
                ;
            }
            else
            {
                await _invoiceService.UpdateStatusAsync(invoiceId, "Failed");
                var invoice = await _invoiceService.GetByIdAsync(invoiceId);
                invoice!.PaymentLink = null;
                await _invoiceService.UpdateInvoiceAsync(invoice);

                // set failed payment link
                redirectUrl = _configuration["Vnpay:failureUrl"] + $"/{invoiceId}";
            }

            return Redirect(redirectUrl);
        }

        [HttpPost("create-payment-url-for-tuitionFee")]
        public async Task<IActionResult> CreatePaymentUrlVnpayForTuitionFee(VnPayTuitionFeeRequest request)
        {
            var url = await _vnPayService.CreatePaymentUrlForTuitionFee(request, HttpContext);

            return Ok(new { Url = url });
        }

        [HttpPost("create-payment-url-for-enrollment")]
        public async Task<IActionResult> CreatePaymentUrlVnpayForEnrollment(VnPayEnrollmentRequest request)
        {
            var url = await _vnPayService.CreatePaymentUrlForEnrollment(request, HttpContext);
            return Ok(new { Url = url });
        }

    }
}