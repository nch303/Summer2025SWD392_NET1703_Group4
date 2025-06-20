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
        Task<TuitionFee> GetByGradeLevelIdAsync(int gradeLevelId);
        Task<TuitionFee> CreateAsync(TuitionFee tuitionFee);
        Task<List<TuitionFee>> GetAllTuitionFeesAsync();
        Task<TuitionFee> UpdateAsync(TuitionFee tuitionFee);
    }
}
