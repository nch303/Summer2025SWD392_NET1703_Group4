using Application.DTOs.Request;
using Application.DTOs.Response;
using Application.Interfaces;
using Application.Libraries;
using Domain.Entities;
using Domain.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.Security.Cryptography;
using System.Text;


namespace Application.Services
{
    public class VnPayService : IVnPayService
    {
        private readonly IConfiguration _configuration;
        private readonly IInvoiceService _invoiceService;
        private readonly IInvoiceDetailService _invoiceDetailService;
        private readonly IAccountService _accountService;
        private readonly IEnrichProgramService _enrichProgramService;
        private readonly ITuitionFeeService _tuitionFeeService;
        private readonly IGradeLevelService _gradeLevelService;
        private readonly IChildrenGradeService _childrenGradeService;
        private readonly IEARepository _eaRepository;
        private readonly IEAService _eaService;


        public VnPayService(IConfiguration configuration, IInvoiceService invoiceService, IInvoiceDetailService invoiceDetailService
            , IAccountService accountService, IEnrichProgramService enrichProgramService, ITuitionFeeService tuitionFeeService
            , IGradeLevelService gradeLevelService, IChildrenGradeService childrenGradeService
            , IEARepository eARepository, IEAService eaService)
        {
            _configuration = configuration;
            _invoiceService = invoiceService;
            _invoiceDetailService = invoiceDetailService;
            _accountService = accountService;
            _enrichProgramService = enrichProgramService;
            _tuitionFeeService = tuitionFeeService;
            _gradeLevelService = gradeLevelService;
            _childrenGradeService = childrenGradeService;
            _eaRepository = eARepository;
            _eaService = eaService;
        }


        public async Task<string> CreatePaymentUrl(VnPayRequest request, HttpContext context)
        {
            var invoiceId = Guid.NewGuid(); // Generate a new invoice ID for the payment 

            var timeZoneById = TimeZoneInfo.FindSystemTimeZoneById(_configuration["TimeZoneId"]);
            var timeNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZoneById);
            var tick = DateTime.Now.Ticks.ToString();
            var pay = new VnPayLibrary();
            var urlCallBack = _configuration["Vnpay:PaymentBackReturnUrl"];

            pay.AddRequestData("vnp_Version", _configuration["Vnpay:Version"]);
            pay.AddRequestData("vnp_Command", _configuration["Vnpay:Command"]);
            pay.AddRequestData("vnp_TmnCode", _configuration["Vnpay:TmnCode"]);
            pay.AddRequestData("vnp_Amount", ((int)request.Amount * 100).ToString());
            pay.AddRequestData("vnp_CreateDate", timeNow.ToString("yyyyMMddHHmmss"));
            pay.AddRequestData("vnp_CurrCode", _configuration["Vnpay:CurrCode"]);
            pay.AddRequestData("vnp_IpAddr", pay.GetIpAddress(context));
            pay.AddRequestData("vnp_Locale", _configuration["Vnpay:Locale"]);
            pay.AddRequestData("vnp_OrderInfo", $"{request.Name}|{request.OrderDescription}|{request.Amount}|invoiceID:{invoiceId}");
            pay.AddRequestData("vnp_OrderType", request.OrderType);
            pay.AddRequestData("vnp_ReturnUrl", urlCallBack);
            pay.AddRequestData("vnp_TxnRef", tick);

            var paymentUrl =
                pay.CreateRequestUrl(_configuration["Vnpay:BaseUrl"], _configuration["Vnpay:HashSecret"]);

            // Get current account
            var currentAccount = _accountService.GetCurrentAccount();

            // Save invoice and invoice details
            var invoice = new Invoice
            {
                ID = invoiceId,
                Amount = request.Amount,
                ChildrenID = request.ChildrenID,
                Date = DateTime.Now,
                AccountID = currentAccount.Result.Id,
                Status = "Pending",
                PaymentLink = paymentUrl,
                Name = request.Name
            };
            await _invoiceService.CreateAsync(invoice);

            foreach (var enrichmentProgramId in request.enrichmentPrograms)
            {
                var program = await _enrichProgramService.GetProgramByIdAsync(enrichmentProgramId);
                var invoiceDetail = new InvoiceDetail
                {
                    ID = Guid.NewGuid(),
                    InvoiceID = invoice.ID,
                    ProgramID = enrichmentProgramId,
                    Price = program.Fee,
                    ChildrenID = request.ChildrenID
                };
                await _invoiceDetailService.CreateAsync(invoiceDetail);
            }


            return paymentUrl;
        }

        public async Task<VnPayResponse> PaymentExecute(IQueryCollection collections)
        {
            var pay = new VnPayLibrary();
            var response = pay.GetFullResponseData(collections, _configuration["Vnpay:HashSecret"]);

            return response;
        }

        public async Task<string> CreatePaymentUrlForTuitionFee(VnPayTuitionFeeRequest request, HttpContext context)
        {
            var invoiceId = Guid.NewGuid(); // Generate a new invoice ID for the payment 

            var timeZoneById = TimeZoneInfo.FindSystemTimeZoneById(_configuration["TimeZoneId"]);
            var timeNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZoneById);
            var tick = DateTime.Now.Ticks.ToString();
            var pay = new VnPayLibrary();
            var urlCallBack = _configuration["Vnpay:PaymentBackReturnUrl"];

            pay.AddRequestData("vnp_Version", _configuration["Vnpay:Version"]);
            pay.AddRequestData("vnp_Command", _configuration["Vnpay:Command"]);
            pay.AddRequestData("vnp_TmnCode", _configuration["Vnpay:TmnCode"]);
            pay.AddRequestData("vnp_Amount", ((int)request.Amount * 100).ToString());
            pay.AddRequestData("vnp_CreateDate", timeNow.ToString("yyyyMMddHHmmss"));
            pay.AddRequestData("vnp_CurrCode", _configuration["Vnpay:CurrCode"]);
            pay.AddRequestData("vnp_IpAddr", pay.GetIpAddress(context));
            pay.AddRequestData("vnp_Locale", _configuration["Vnpay:Locale"]);
            pay.AddRequestData("vnp_OrderInfo", $"{request.Name}|{request.OrderDescription}|{request.Amount}|invoiceID:{invoiceId}");
            pay.AddRequestData("vnp_OrderType", request.OrderType);
            pay.AddRequestData("vnp_ReturnUrl", urlCallBack);
            pay.AddRequestData("vnp_TxnRef", tick);

            var paymentUrl =
                pay.CreateRequestUrl(_configuration["Vnpay:BaseUrl"], _configuration["Vnpay:HashSecret"]);

            // Get current account
            var currentAccount = _accountService.GetCurrentAccount();

            // Save invoice and invoice details
            var invoice = new Invoice
            {
                ID = invoiceId,
                Amount = request.Amount,
                ChildrenID = request.ChildrenID,
                Date = DateTime.Now,
                AccountID = currentAccount.Result.Id,
                Status = "Pending",
                PaymentLink = paymentUrl,
                Name = request.Name
            };
            await _invoiceService.CreateAsync(invoice);

            foreach (var tuitionFeeId in request.TuitionFeeIds)
            {
                var tuition = await _tuitionFeeService.GetTuitionFeeByIdAsync(tuitionFeeId);
                var gradeLevel = await _gradeLevelService.GetGradeLevelByIdAsync(tuition!.GradeLevelID);
                decimal price;
                var invoiceDetail = new InvoiceDetail
                {
                    ID = Guid.NewGuid(),
                    InvoiceID = invoice.ID,
                    TuitionFeeID = tuitionFeeId,
                    Price = (decimal)gradeLevel!.Fee,
                    ChildrenID = request.ChildrenID
                };
                await _invoiceDetailService.CreateAsync(invoiceDetail);
            }


            return paymentUrl;
        }

        public async Task<string> CreatePaymentUrlForEnrollment(VnPayEnrollmentRequest request, HttpContext context)
        {
            var invoiceId = Guid.NewGuid(); // Generate a new invoice ID for the payment 

            // Get the tuition fee based on the children's grade
            var childrenGrade = await _childrenGradeService.GetChildrenGradesByChildrenIdAsync(request.ChildrenID);
            var tuitionName = "09/" + childrenGrade.AcademicYear!.Split('-')[0];
            var tuition = await _tuitionFeeService.GetTuitionFeeByNameAsync(tuitionName);

            //Get amount from grade level
            var gradeLevel = await _gradeLevelService.GetGradeLevelByIdAsync(tuition!.GradeLevelID);
            var amount = (decimal)gradeLevel!.Fee + (decimal)tuition.Fee;

            var timeZoneById = TimeZoneInfo.FindSystemTimeZoneById(_configuration["TimeZoneId"]);
            var timeNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZoneById);
            var tick = DateTime.Now.Ticks.ToString();
            var pay = new VnPayLibrary();
            var urlCallBack = _configuration["Vnpay:PaymentBackReturnUrl"];

            pay.AddRequestData("vnp_Version", _configuration["Vnpay:Version"]);
            pay.AddRequestData("vnp_Command", _configuration["Vnpay:Command"]);
            pay.AddRequestData("vnp_TmnCode", _configuration["Vnpay:TmnCode"]);
            pay.AddRequestData("vnp_Amount", ((int)amount * 100).ToString());
            pay.AddRequestData("vnp_CreateDate", timeNow.ToString("yyyyMMddHHmmss"));
            pay.AddRequestData("vnp_CurrCode", _configuration["Vnpay:CurrCode"]);
            pay.AddRequestData("vnp_IpAddr", pay.GetIpAddress(context));
            pay.AddRequestData("vnp_Locale", _configuration["Vnpay:Locale"]);
            pay.AddRequestData("vnp_OrderInfo", $"{request.Name}|{request.OrderDescription}|{amount}|invoiceID:{invoiceId}");
            pay.AddRequestData("vnp_OrderType", request.OrderType);
            pay.AddRequestData("vnp_ReturnUrl", urlCallBack);
            pay.AddRequestData("vnp_TxnRef", tick);

            var paymentUrl =
                pay.CreateRequestUrl(_configuration["Vnpay:BaseUrl"], _configuration["Vnpay:HashSecret"]);

            // Get current account
            var currentAccount = _accountService.GetCurrentAccount();

            // Save invoice and invoice details
            var invoice = new Invoice
            {
                ID = invoiceId,
                Amount = amount,
                ChildrenID = request.ChildrenID,
                Date = DateTime.Now,
                AccountID = currentAccount.Result.Id,
                Status = "Pending",
                PaymentLink = paymentUrl,
                Name = request.Name
            };
            await _invoiceService.CreateAsync(invoice);

            
            decimal price;
                var invoiceDetail = new InvoiceDetail
            {
                ID = Guid.NewGuid(),
                InvoiceID = invoice.ID,
                TuitionFeeID = tuition.ID,
                Price = (decimal)gradeLevel!.Fee,
                ChildrenID = request.ChildrenID
            };
            await _invoiceDetailService.CreateAsync(invoiceDetail);

            // Add invoiceID to enrollment application
            var enrollmentApplication = await _eaRepository.GetApplicatioinByChildID(request.ChildrenID);
            enrollmentApplication.InvoiceID = invoiceId;
            await _eaService.UpdateEnrollmentApplicationAsync(enrollmentApplication);

            return paymentUrl;
        }

    }
}
