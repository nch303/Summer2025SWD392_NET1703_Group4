using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class TuitionFeeService : ITuitionFeeService
    {
        private readonly ITuitionFeeRepositiry _tuitionFeeRepository;
        private readonly IAccountService _accountService;
        private readonly IInvoiceService _invoiceService;
        private readonly IInvoiceDetailService _invoiceDetailService;
        private readonly IChildrenService _childService;
        private readonly IChildrenGradeService _childrenGradeService;

        public TuitionFeeService(ITuitionFeeRepositiry tuitionFeeRepository, IAccountService accountService
            , IInvoiceService invoiceService, IInvoiceDetailService invoiceDetailService
            , IChildrenService childrenService, IChildrenGradeService childrenGradeService)
        {
            _tuitionFeeRepository = tuitionFeeRepository;
            _accountService = accountService;
            _invoiceService = invoiceService;
            _invoiceDetailService = invoiceDetailService;
            _childService = childrenService;
            _childrenGradeService = childrenGradeService;
        }

        public async Task<List<TuitionFee>> GetTuitionFeeByCurrentAccount()
        {
            var tuitions = await _tuitionFeeRepository.GetTuitionFeeByCurrentAccount();
            var tuitionTemp = tuitions.ToList();

            var currentAccount = await _accountService.GetCurrentAccount();

            var childrenGrade = await _childrenGradeService.GetChildrenGradesByAccountIdAsync(currentAccount.Id);

            var invoices = _invoiceService.GetByAccountIdAsync(currentAccount.Id).Result.Where(i => i.Status == "Success");

            foreach (var invoice in invoices)
            {
                var invoiceDetails = await _invoiceDetailService.GetByInvoiceIdAsync(invoice.ID);
                foreach (var invoiceDetail in invoiceDetails)
                {
                    for (int i = 0; i < tuitionTemp.Count; i++)
                    {
                        if (tuitionTemp[i].ID == invoiceDetail.TuitionFeeID)
                        {
                            tuitions.Remove(tuitionTemp[i]);
                        }

                        foreach (var child in childrenGrade)
                        {
                            var years = child.AcademicYear!.Split('-');
                            if (years.Length == 2 &&
                            int.TryParse(years[0], out int startYear) &&
                            int.TryParse(years[1], out int endYear))
                            {
                                var startDate = new DateTime(startYear, 9, 1);     // 01/09/startYear
                                var endDate = new DateTime(endYear, 8, 31);

                                if (tuitionTemp[i].GradeLevelID != child.GradeLevelID ||
                                    tuitionTemp[i].Date < DateOnly.FromDateTime(startDate) ||
                                    tuitionTemp[i].Date > DateOnly.FromDateTime(endDate))
                                {
                                    tuitions.Remove(tuitionTemp[i]);
                                }
                            }
                        }
                    }
                }

            }
            return tuitions;
        }

        public async Task<TuitionFee?> GetTuitionFeeByIdAsync(int? id)
        {
            var tuition = await _tuitionFeeRepository.GetTuitionFeeByIdAsync(id);
            if (tuition == null)
            {
                throw new Exception("Tuition fee not found");
            }
            return tuition;
        }

        public async Task<TuitionFee> GetTuitionFeeByNameAsync(string name)
        {
            var tuition = await _tuitionFeeRepository.GetTuitionFeeByNameAsync(name);
            if (tuition == null)
            {
                throw new Exception("Tuition fee not found");
            }
            return tuition;
        }
    }
}
