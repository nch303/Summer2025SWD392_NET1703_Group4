using Application.DTOs.Response;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface ITuitionFeeService
    {
        Task<List<TuitionWithChildResponse>> GetTuitionFeeByCurrentAccount();
        Task<TuitionFee?> GetTuitionFeeByIdAsync(int? id);
        Task<TuitionFee> GetTuitionFeeByNameAsync(string name);
    }
}
