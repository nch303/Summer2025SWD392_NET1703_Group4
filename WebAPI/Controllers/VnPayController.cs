using Application.DTOs.Request;
using Application.Interfaces;
using Application.Services;
using Domain.Entities;
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
        public VNPayController(IVnPayService vnPayService, IInvoiceService invoiceService)
        {
            _vnPayService = vnPayService;
            _invoiceService = invoiceService;
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
            }
            else
            {
                await _invoiceService.UpdateStatusAsync(invoiceId, "Failed");
            }

            return Ok(response);
        }

    }
}