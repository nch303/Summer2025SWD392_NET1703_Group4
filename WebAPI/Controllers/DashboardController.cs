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

            // Tách các dữ liệu await phức tạp thành từng bước để tránh lỗi Hot Reload
            var allChildren = await _childrenService.GetAllChildrenAsync();
            var allAccounts = await _accountService.GetAllAsync();
            var allClasses = await _classService.GetAllClass();
            var allApplications = await _eaService.GetAllApplications();
            var allInvoices = await _invoiceService.GetAllInvoiceAsync();

            // Lọc dữ liệu theo điều kiện
            var totalActiveStudents = allChildren.Count(c => c.Status == "Active");
            var totalActiveAccounts = allAccounts.Count(a => a.Status == "Active");
            var totalActiveClasses = allClasses.Count(cl => cl.Status == "Available");
            var totalActiveTeachers = allAccounts.Count(a => a.RoleId == 3 && a.Status == "Active");
            var totalApprovedEA = allApplications.Count(e => e.Status == "Enrolled" || e.Status == "Paid" || e.Status == "Approved");
            var totalRejectedEA = allApplications.Count(e => e.Status == "Rejected");

            var invoicesOfYear = allInvoices
                .Where(i => i.Date.Year == selectedYear)
                .ToList();

            var months = Enumerable.Range(1, 12);
            var monthlyRevenueRefunds = months.Select(m => new
            {
                Month = m,
                Revenue = invoicesOfYear
                    .Where(i => i.Date.Month == m && i.Status == "Success")
                    .Sum(i => i.Amount),
                Refund = invoicesOfYear
                    .Where(i => i.Date.Month == m && i.Status == "Refunded")
                    .Sum(i => i.Amount)
            }).ToList();

            var quarterlyRevenueRefunds = Enumerable.Range(1, 4).Select(q => new
            {
                Quarter = q,
                Revenue = invoicesOfYear
                    .Where(i => (i.Date.Month - 1) / 3 + 1 == q && i.Status == "Success")
                    .Sum(i => i.Amount),
                Refund = invoicesOfYear
                    .Where(i => (i.Date.Month - 1) / 3 + 1 == q && i.Status == "Refunded")
                    .Sum(i => i.Amount)
            }).ToList();

            var yearlyRevenue = new[]
            {
        new {
            Year = selectedYear,
            Revenue = invoicesOfYear.Where(i => i.Status == "Success").Sum(i => i.Amount)
        }
    };

            var totalRefunds = invoicesOfYear
                .Where(i => i.Status == "Refunded")
                .Sum(i => i.Amount);

            return Ok(new
            {
                year = selectedYear,
                totalActiveStudents,
                totalActiveAccounts,
                totalActiveClasses,
                totalActiveTeachers,
                totalApprovedEA,
                totalRejectedEA,
                monthlyRevenueRefunds,
                quarterlyRevenueRefunds,
                yearlyRevenue,
                totalRefunds
            });
        }

        [HttpGet("ExportToExcel")]
        public async Task<IActionResult> ExportToExcel([FromQuery] int? year)
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            var now = DateTime.Now;
            var selectedYear = year ?? now.Year;

            // Lấy dữ liệu cần thiết
            var allChildren = await _childrenService.GetAllChildrenAsync();
            var allAccounts = await _accountService.GetAllAsync();
            var allClasses = await _classService.GetAllClass();
            var allApplications = await _eaService.GetAllApplications();
            var allInvoices = await _invoiceService.GetAllInvoiceAsync();

            var totalActiveStudents = allChildren.Count(c => c.Status == "Active");
            var totalActiveAccounts = allAccounts.Count(a => a.Status == "Active");
            var totalActiveClasses = allClasses.Count(cl => cl.Status == "Available");
            var totalActiveTeachers = allAccounts.Count(a => a.RoleId == 3 && a.Status == "Active");
            var totalApprovedEA = allApplications.Count(e => e.Status == "Approve");
            var totalRejectedEA = allApplications.Count(e => e.Status == "Rejected");

            var invoices = allInvoices.Where(i => i.Date.Year == selectedYear).ToList();
            var months = Enumerable.Range(1, 12);

            var monthlyRevenue = months.Select(m => new
            {
                Month = m,
                Revenue = invoices.Where(i => i.Date.Month == m).Sum(i => i.Amount)
            }).ToList();

            var monthlyRefunds = months.Select(m => new
            {
                Month = m,
                Refund = invoices.Where(i => i.Date.Month == m && i.Status == "Refunded").Sum(i => i.Amount)
            }).ToList();

            var quarterlyRevenue = Enumerable.Range(1, 4).Select(q => new
            {
                Quarter = q,
                Revenue = invoices.Where(i => (i.Date.Month - 1) / 3 + 1 == q).Sum(i => i.Amount)
            }).ToList();

            var quarterlyRefunds = Enumerable.Range(1, 4).Select(q => new
            {
                Quarter = q,
                Refund = invoices.Where(i => (i.Date.Month - 1) / 3 + 1 == q && i.Status == "Refunded").Sum(i => i.Amount)
            }).ToList();

            var yearlyRevenue = new[] {
        new { Year = selectedYear, Revenue = invoices.Sum(i => i.Amount) }
    };

            var totalRefunds = invoices.Where(i => i.Status == "Refunded").Sum(i => i.Amount);

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
            sheet.Cells[row++, 1].Value = $"Total Refunds: {totalRefunds:N0}";

            row += 2;

            // --- Doanh thu + Hoàn tiền theo tháng
            sheet.Cells[row++, 1].Value = "Monthly Revenue & Refund";
            sheet.Cells[row - 1, 1].Style.Font.Bold = true;

            sheet.Cells[row, 1].Value = "Month";
            sheet.Cells[row, 2].Value = "Revenue";
            sheet.Cells[row, 3].Value = "Refund";
            sheet.Cells[row, 1, row, 3].Style.Fill.PatternType = ExcelFillStyle.Solid;
            sheet.Cells[row, 1, row, 3].Style.Fill.BackgroundColor.SetColor(Color.LightGray);
            row++;

            foreach (var m in months)
            {
                var revenue = monthlyRevenue.FirstOrDefault(x => x.Month == m)?.Revenue ?? 0;
                var refund = monthlyRefunds.FirstOrDefault(x => x.Month == m)?.Refund ?? 0;

                sheet.Cells[row, 1].Value = m;
                sheet.Cells[row, 2].Value = revenue;
                sheet.Cells[row, 3].Value = refund;
                row++;
            }

            row += 2;

            // --- Doanh thu + Hoàn tiền theo quý
            sheet.Cells[row++, 1].Value = "Quarterly Revenue & Refund";
            sheet.Cells[row - 1, 1].Style.Font.Bold = true;

            sheet.Cells[row, 1].Value = "Quarter";
            sheet.Cells[row, 2].Value = "Revenue";
            sheet.Cells[row, 3].Value = "Refund";
            sheet.Cells[row, 1, row, 3].Style.Fill.PatternType = ExcelFillStyle.Solid;
            sheet.Cells[row, 1, row, 3].Style.Fill.BackgroundColor.SetColor(Color.LightGray);
            row++;

            for (int q = 1; q <= 4; q++)
            {
                var revenue = quarterlyRevenue.FirstOrDefault(x => x.Quarter == q)?.Revenue ?? 0;
                var refund = quarterlyRefunds.FirstOrDefault(x => x.Quarter == q)?.Refund ?? 0;

                sheet.Cells[row, 1].Value = $"Q{q}";
                sheet.Cells[row, 2].Value = revenue;
                sheet.Cells[row, 3].Value = refund;
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
