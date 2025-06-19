using Application.DTOs.Request;
using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Application.Services
{
    public class EAService : IEAService
    {
        private readonly IEARepository _eARepository;
        private readonly IAccountService _accountService;
        private readonly IChildrenGradeService _childrenGradeService;
        private readonly IGradeLevelService _gradeLevelService;
        private readonly ITuitionFeeService _tuitionService;

        public EAService(IEARepository eARepository, IAccountService accountService, IChildrenGradeService childrenGradeService
            , IGradeLevelService gradeLevelService, ITuitionFeeService tuitionService)
        {
            _eARepository = eARepository;
            _accountService = accountService;
            _childrenGradeService = childrenGradeService;
            _gradeLevelService = gradeLevelService;
            _tuitionService = tuitionService;
        }

        public async Task<EnrollmentApplication> CreateEnrollmentApplicationAsync(EnrollmentApplicationRequest request, Guid parentID, Guid childID)
        {
            var existingApplication = await _eARepository.GetApplicatioinByChildID(childID); // get pending and success applications

            if (existingApplication != null)
            {
                throw new InvalidOperationException("An enrollment application with the same ID already exists.");
            }

            var application = new EnrollmentApplication
            {
                ParentID = parentID,
                ChildrenID = childID,
                AcademicYear = request.AcademicYear,
                GradeLevelID = request.GradeLevelID,
                Status = "Pending",
                ApprovalDate = DateTime.Now, //dummy value
                StaffID = null
            };

            return await _eARepository.CreateEnrollmentApplicationAsync(application);
        }

        public async Task<List<EnrollmentApplication>> ViewListApplicationAsync(Guid parentID)
        {
            return await _eARepository.ViewListApplicationAsync(parentID);
        }

        public async Task<EnrollmentApplication> ViewApplicationDetail(Guid eAId)
        {
            return await _eARepository.ViewApplicationDetail(eAId);
        }

        public async Task<EnrollmentApplication> ApproveByStaff(Guid eAId)
        {
            var staff = await _accountService.GetCurrentAccount();
            var updated = await _eARepository.ApproveByStaff(eAId, staff.Id);
            return updated;
        }
        public async Task<EnrollmentApplication> RejectByStaff(Guid eAId)
        {
            var staff = await _accountService.GetCurrentAccount();
            var updated = await _eARepository.RejectByStaff(eAId, staff.Id);
            return updated;
        }

        public async Task<List<EnrollmentApplication>> GetAllApplications()
        {
            var applications = await _eARepository.GetAllApplications();
            return applications;
        }

        public async Task<EnrollmentApplication> GetApplicatioinByChildID(Guid childId)
        {
            return await _eARepository.GetApplicatioinByChildID(childId);
        }

        public async Task<EnrollmentApplication> UpdateEnrollmentApplicationAsync(EnrollmentApplication enrollmentApplication)
        {
            return await _eARepository.UpdateEnrollmentApplicationAsync(enrollmentApplication);
        }


        public async Task<string> GetApplicationDescriptionAsync(Guid childId)
        {
            var culture = CultureInfo.GetCultureInfo("vi-VN");

            var childrenGrade = await _childrenGradeService.GetChildrenGradesByChildrenIdAsync(childId);
            var tuitionName = "09/" + childrenGrade.AcademicYear!.Split('-')[0];
            var tuition = await _tuitionService.GetTuitionFeeByNameAsync(tuitionName);
            var gradeLevel = await _gradeLevelService.GetGradeLevelByIdAsync(childrenGrade.GradeLevelID);

            var lines = new List<string>();
            decimal totalAmount = 0;

            // Hàm phụ để format tiền
            string FormatMoney(decimal amount) => amount.ToString("#,##0", culture) + " đồng";

            // Dòng học phí tháng
            totalAmount += (decimal)gradeLevel.Fee;
            lines.Add($"- Học phí tháng {tuition.Name} ({FormatMoney((decimal)gradeLevel.Fee)})");

            // Các mô tả khác (nếu có)
            if (!string.IsNullOrWhiteSpace(tuition.Description))
            {
                var extras = tuition.Description.Split(" + ", StringSplitOptions.RemoveEmptyEntries);
                foreach (var extra in extras)
                {
                    var formattedExtra = Regex.Replace(
                        extra.Trim(),
                        @"\((\d+)\)",
                        match =>
                        {
                            decimal value = decimal.Parse(match.Groups[1].Value);
                            totalAmount += value;
                            return "(" + FormatMoney(value) + ")";
                        });

                    lines.Add($"- {formattedExtra}");
                }
            }

            // Dòng tổng cộng
            lines.Add($"\nTổng cộng: {FormatMoney(totalAmount)}");

            return string.Join("\n", lines);
        }

    }
}
