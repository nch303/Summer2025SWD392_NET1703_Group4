using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface ITuitionFeeRepositiry
    {
        Task<List<TuitionFee>> GetTuitionFeeByCurrentAccount();
        Task<TuitionFee?> GetTuitionFeeByIdAsync(int? id);
        Task<TuitionFee> GetTuitionFeeByNameAsync(string name);
    }
}
