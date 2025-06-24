using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using OfficeOpenXml.Style;
using OfficeOpenXml;
using System.Drawing;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : Controller
    {
        private readonly IInvoiceService _invoiceService;
        private readonly IClassService _classService;
        private readonly IChildrenService _childrenService;
        private readonly IAccountService _accountService;
        private readonly IEAService _eaService;

        public DashboardController(IInvoiceService invoiceService, IClassService classService, IChildrenService childrenService,
            IAccountService accountService, IEAService eAService)
        {
            _invoiceService = invoiceService;
            _classService = classService;
            _childrenService = childrenService;
            _accountService = accountService;
            _eaService = eAService;
        }

        [HttpGet("GetDashboardData")]
        public async Task<IActionResult> GetDashboardData([FromQuery] int? year)
        {
            var now = DateTime.Now;
            var selectedYear = year ?? now.Year;

            // Tổng số học sinh đang theo học (Status == "Active")
            var totalActiveStudents = (await _childrenService.GetAllChildrenAsync())
                .Count(c => c.Status == "Active");

            // Tổng số account đang hoạt động (Status == "Active")
            var totalActiveAccounts = (await _accountService.GetAllAsync())
                .Count(a => a.Status == "Active");

            // Tổng số lớp học đang hoạt động (Status == "Available")
            var totalActiveClasses = (await _classService.GetAllClass())
                .Count(cl => cl.Status == "Available");

            // Tổng số giáo viên còn hoạt động (Status == "Active" và RoleId == 3)
            var totalActiveTeachers = (await _accountService.GetAllAsync())
                .Count(a => a.RoleId == 3 && a.Status == "Active");

            // Tổng số đơn đã duyệt (Status == "Approve")
            var totalApprovedEA = (await _eaService.GetAllApplications())
                .Count(e => e.Status == "Enrolled");

            // Tổng số đơn bị từ chối (Status == "Rejected")
            var totalRejectedEA = (await _eaService.GetAllApplications())
                .Count(e => e.Status == "Rejected");

            var invoices = (await _invoiceService.GetAllInvoiceAsync())
                .Where(i => i.Date.Year == selectedYear)
                .ToList();

            // Doanh thu theo tháng (luôn đủ 12 tháng)
            var months = Enumerable.Range(1, 12);
            var monthlyRevenue = months.Select(m => new
            {
                Month = m,
                Revenue = invoices
                    .Where(i => i.Date.Month == m)
                    .Sum(i => i.Amount)
            }).ToList();

            // Doanh thu theo quý (Q1–Q4)
            var quarterlyRevenue = Enumerable.Range(1, 4).Select(q => new
            {
                Quarter = q,
                Revenue = invoices
                    .Where(i => (i.Date.Month - 1) / 3 + 1 == q)
                    .Sum(i => i.Amount)
            }).ToList();

            // Doanh thu theo năm (chỉ năm đang xem)
            var yearlyRevenue = new[]
            {
        new {
            Year = selectedYear,
            Revenue = invoices.Sum(i => i.Amount)
        }
    };

            return Ok(new
            {
                year = selectedYear,
                totalActiveStudents,
                totalActiveAccounts,
                totalActiveClasses,
                totalActiveTeachers,
                totalApprovedEA,
                totalRejectedEA,
                monthlyRevenue,
                quarterlyRevenue,
                yearlyRevenue
            });
        }




        [HttpGet("ExportToExcel")]
        public async Task<IActionResult> ExportToExcel([FromQuery] int? year)
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            var now = DateTime.Now;
            var selectedYear = year ?? now.Year;

            // Lấy dữ liệu tương tự GetDashboardData
            var totalActiveStudents = (await _childrenService.GetAllChildrenAsync()).Count(c => c.Status == "Active");
            var totalActiveAccounts = (await _accountService.GetAllAsync()).Count(a => a.Status == "Active");
            var totalActiveClasses = (await _classService.GetAllClass()).Count(cl => cl.Status == "Available");
            var totalActiveTeachers = (await _accountService.GetAllAsync()).Count(a => a.RoleId == 3 && a.Status == "Active");
            var totalApprovedEA = (await _eaService.GetAllApplications()).Count(e => e.Status == "Approve");
            var totalRejectedEA = (await _eaService.GetAllApplications()).Count(e => e.Status == "Rejected");

            var invoices = (await _invoiceService.GetAllInvoiceAsync())
                .Where(i => i.Date.Year == selectedYear)
                .ToList();

            var monthlyRevenue = Enumerable.Range(1, 12).Select(m => new
            {
                Month = m,
                Revenue = invoices.Where(i => i.Date.Month == m).Sum(i => i.Amount)
            }).ToList();

            var quarterlyRevenue = Enumerable.Range(1, 4).Select(q => new
            {
                Quarter = q,
                Revenue = invoices.Where(i => (i.Date.Month - 1) / 3 + 1 == q).Sum(i => i.Amount)
            }).ToList();

            var yearlyRevenue = new[] {
        new { Year = selectedYear, Revenue = invoices.Sum(i => i.Amount) }
    };

            using var package = new ExcelPackage();
            var sheet = package.Workbook.Worksheets.Add("Dashboard");

            int row = 1;

            // --- Tiêu đề
            sheet.Cells[row++, 1].Value = $"Dashboard Report for Year {selectedYear}";
            sheet.Cells[row - 1, 1, row - 1, 4].Merge = true;
            sheet.Cells[row - 1, 1].Style.Font.Bold = true;
            sheet.Cells[row - 1, 1].Style.Font.Size = 14;

            row++;
            sheet.Cells[row++, 1].Value = $"Total Active Students: {totalActiveStudents}";
            sheet.Cells[row++, 1].Value = $"Total Active Accounts: {totalActiveAccounts}";
            sheet.Cells[row++, 1].Value = $"Total Active Classes: {totalActiveClasses}";
            sheet.Cells[row++, 1].Value = $"Total Active Teachers: {totalActiveTeachers}";
            sheet.Cells[row++, 1].Value = $"Total Approved Applications: {totalApprovedEA}";
            sheet.Cells[row++, 1].Value = $"Total Rejected Applications: {totalRejectedEA}";

            row += 2;

            // --- Doanh thu theo tháng
            sheet.Cells[row++, 1].Value = "Monthly Revenue";
            sheet.Cells[row - 1, 1].Style.Font.Bold = true;

            sheet.Cells[row, 1].Value = "Month";
            sheet.Cells[row, 2].Value = "Revenue";
            sheet.Cells[row, 1, row, 2].Style.Fill.PatternType = ExcelFillStyle.Solid;
            sheet.Cells[row, 1, row, 2].Style.Fill.BackgroundColor.SetColor(Color.LightGray);
            row++;

            foreach (var m in monthlyRevenue)
            {
                sheet.Cells[row, 1].Value = m.Month;
                sheet.Cells[row, 2].Value = m.Revenue;
                row++;
            }

            row += 2;

            // --- Doanh thu theo quý
            sheet.Cells[row++, 1].Value = "Quarterly Revenue";
            sheet.Cells[row - 1, 1].Style.Font.Bold = true;

            sheet.Cells[row, 1].Value = "Quarter";
            sheet.Cells[row, 2].Value = "Revenue";
            sheet.Cells[row, 1, row, 2].Style.Fill.PatternType = ExcelFillStyle.Solid;
            sheet.Cells[row, 1, row, 2].Style.Fill.BackgroundColor.SetColor(Color.LightGray);
            row++;

            foreach (var q in quarterlyRevenue)
            {
                sheet.Cells[row, 1].Value = $"Q{q.Quarter}";
                sheet.Cells[row, 2].Value = q.Revenue;
                row++;
            }

            row += 2;

            // --- Doanh thu theo năm
            sheet.Cells[row++, 1].Value = "Yearly Revenue";
            sheet.Cells[row - 1, 1].Style.Font.Bold = true;

            sheet.Cells[row, 1].Value = "Year";
            sheet.Cells[row, 2].Value = "Revenue";
            sheet.Cells[row, 1, row, 2].Style.Fill.PatternType = ExcelFillStyle.Solid;
            sheet.Cells[row, 1, row, 2].Style.Fill.BackgroundColor.SetColor(Color.LightGray);
            row++;

            foreach (var y in yearlyRevenue)
            {
                sheet.Cells[row, 1].Value = y.Year;
                sheet.Cells[row, 2].Value = y.Revenue;
                row++;
            }

            sheet.Cells.AutoFitColumns();

            var stream = new MemoryStream(package.GetAsByteArray());
            return File(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"Dashboard_{selectedYear}.xlsx");
        }
    }
}
