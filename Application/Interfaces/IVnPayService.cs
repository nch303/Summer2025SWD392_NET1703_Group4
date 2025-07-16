using Application.DTOs.Request;
using Application.DTOs.Response;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IVnPayService
    {
        Task<string> CreatePaymentUrl(VnPayRequest request, HttpContext context);
        Task<VnPayResponse> PaymentExecute(IQueryCollection collections);
        Task<string> CreatePaymentUrlForTuitionFee(VnPayTuitionFeeRequest request, HttpContext context);
        Task<string> CreatePaymentUrlForEnrollment(VnPayEnrollmentRequest request, HttpContext context);

    }
}
