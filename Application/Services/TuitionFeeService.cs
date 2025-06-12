using Application.DTOs.Response;
using Application.Interfaces;
using AutoMapper;
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
        private readonly IMapper _mapper;
        private readonly IGradeLevelService _gradeLevelService;

        public TuitionFeeService(ITuitionFeeRepositiry tuitionFeeRepository, IAccountService accountService
            , IInvoiceService invoiceService, IInvoiceDetailService invoiceDetailService
            , IChildrenService childrenService, IChildrenGradeService childrenGradeService
            , IMapper mapper, IGradeLevelService gradeLevelService)
        {
            _tuitionFeeRepository = tuitionFeeRepository;
            _accountService = accountService;
            _invoiceService = invoiceService;
            _invoiceDetailService = invoiceDetailService;
            _childService = childrenService;
            _childrenGradeService = childrenGradeService;
            _mapper = mapper;
            _gradeLevelService = gradeLevelService;
        }

        public async Task<List<TuitionWithChildResponse>> GetTuitionFeeByCurrentAccount()
        {
            var tuitions = await _tuitionFeeRepository.GetTuitionFeeByCurrentAccount();

            var currentAccount = await _accountService.GetCurrentAccount();

            var childrenGrade = await _childrenGradeService.GetChildrenGradesByAccountIdAsync(currentAccount.Id);

            //TuitionWithChildResponse
            var tuitionWithChildResponses = new List<TuitionWithChildResponse>();

            //Add tuitions in to list based on amount of children
            var totalTuitions = new List<TuitionFee>();
            foreach (var child in childrenGrade)
            {
                foreach (var tuition in tuitions)
                {
                    totalTuitions.Add(tuition);
                    var tuitionWithChild = _mapper.Map<TuitionWithChildResponse>(tuition);
                    tuitionWithChild.ID = tuition.ID;
                    tuitionWithChild.ChildID = child.ChildrenID;
                    tuitionWithChild.ChildName = _childService.GetChildByIdAsync(child.ChildrenID).Result!.Name;
                    tuitionWithChild.GradeLevelID = child.GradeLevelID;
                    
                    var gradeLevel = await _gradeLevelService.GetGradeLevelByIdAsync(child.GradeLevelID);
                    tuitionWithChild.Fee = (decimal)tuition.Fee + (decimal)gradeLevel!.Fee;
                    tuitionWithChild.GradeLevelName = gradeLevel!.Name;
                    tuitionWithChild.Description = "Học phí tháng " + tuition.Name + " (" + gradeLevel.Fee + ")" +
                        (string.IsNullOrWhiteSpace(tuition.Description) ? "" : " + " + tuition.Description);
                    tuitionWithChildResponses.Add(tuitionWithChild);
                }
            }

            var tuitionTemp = tuitionWithChildResponses.ToList();


            var invoices = _invoiceService.GetByAccountIdAsync(currentAccount.Id).Result.Where(i => i.Status == "Success");

            foreach (var invoice in invoices)
            {
                var invoiceDetails = await _invoiceDetailService.GetByInvoiceIdAsync(invoice.ID);
                foreach (var invoiceDetail in invoiceDetails)
                {
                    for (int i = 0; i < tuitionTemp.Count; i++)
                    {
                        //Remove tuition fees that are already paid
                        if (tuitionTemp[i].ID == invoiceDetail.TuitionFeeID && tuitionTemp[i].ChildID == invoiceDetail.ChildrenID)
                        {
                            tuitionWithChildResponses.Remove(tuitionTemp[i]);
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
                                var nextMonth = DateTime.Now.AddMonths(1);
                                var dateOnly = new DateOnly(nextMonth.Year, nextMonth.Month, 20);

                                var tuitionDate20th = new DateTime(tuitionTemp[i].Date!.Value.Year, tuitionTemp[i].Date!.Value.Month, 20);
                                var tuitionDate20thLastMonth = tuitionDate20th.AddMonths(-1);


                                // Remove tuition fees that do not match the child's grade level or date range
                                if (tuitionTemp[i].GradeLevelID != child.GradeLevelID ||
                                    tuitionTemp[i].Date < DateOnly.FromDateTime(startDate) ||
                                    tuitionTemp[i].Date > DateOnly.FromDateTime(endDate) ||
                                    tuitionTemp[i].Date >= dateOnly ||
                                    DateTime.Now < tuitionDate20thLastMonth)
                                {
                                    tuitionWithChildResponses.Remove(tuitionTemp[i]);
                                }
                            }
                        }
                    }
                }

            }
            return tuitionWithChildResponses;
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
