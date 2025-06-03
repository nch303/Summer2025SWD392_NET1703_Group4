using Application.DTOs.Request;
using Application.DTOs.Response;
using Application.Interfaces;
using Application.Libraries;
using Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Security.Cryptography;
using System.Text;


namespace Application.Services
{
    public class VnPayService : IVnPayService
    {
        private readonly IConfiguration _configuration;
        private readonly IInvoiceService _invoiceService;
        private readonly IInvoiceDetailService  _invoiceDetailService;
        private readonly IAccountService _accountService;
        private readonly IEnrichProgramService _enrichProgramService;


        public VnPayService(IConfiguration configuration, IInvoiceService invoiceService, IInvoiceDetailService invoiceDetailService
            , IAccountService accountService, IEnrichProgramService enrichProgramService)
        {
            _configuration = configuration;
            _invoiceService = invoiceService;
            _invoiceDetailService = invoiceDetailService;
            _accountService = accountService;
            _enrichProgramService = enrichProgramService;
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
                PaymentLink = paymentUrl
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


    }
}
