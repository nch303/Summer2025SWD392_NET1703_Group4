using Application.DTOs.Response;
using Application.Interfaces;
using AutoMapper;
using Domain.Entities;
using Domain.Interfaces;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Reflection.Metadata;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Document = QuestPDF.Fluent.Document;


namespace Application.Services
{
    public class InvoiceService : IInvoiceService
    {
        private readonly IInvoiceRepository _invoiceRepository;
        private readonly IInvoiceDetailService _invoiceDetailService;
        private readonly IChildrenService _childrenService;
        private readonly IEnrichProgramService _enrichProgramService;
        private readonly ITuitionFeeRepositiry _tuitionFeeRepositiry;
        private readonly IGradeLevelService _gradeLevelService;
        private readonly IMapper _mapper;
        private readonly IChildrenGradeService _childrenGradeService;
        public InvoiceService(IInvoiceRepository invoiceRepository, IInvoiceDetailService invoiceDetailService
            , IChildrenService childrenService, IEnrichProgramService enrichProgramService
            , ITuitionFeeRepositiry tuitionFeeRepositiry, IGradeLevelService gradeLevelService, IMapper mapper
            , IChildrenGradeService childrenGradeService)
        {
            _invoiceRepository = invoiceRepository ?? throw new ArgumentNullException(nameof(invoiceRepository));
            _invoiceDetailService = invoiceDetailService;
            _childrenService = childrenService;
            _enrichProgramService = enrichProgramService;
            _tuitionFeeRepositiry = tuitionFeeRepositiry;
            _gradeLevelService = gradeLevelService;
            _mapper = mapper;
            _childrenGradeService = childrenGradeService;
        }
        public async Task<Invoice> CreateAsync(Invoice invoice)
        {
            if (invoice == null) throw new ArgumentNullException(nameof(invoice));
            return await _invoiceRepository.CreateAsync(invoice);
        }

        public async Task<Invoice?> GetByIdAsync(Guid? id)
        {
            if (id == Guid.Empty) throw new ArgumentException("Invalid invoice ID", nameof(id));
            return await _invoiceRepository.GetByIdAsync(id);
        }

        public async Task<Invoice?> UpdateStatusAsync(Guid id, string status)
        {
            if (id == Guid.Empty) throw new ArgumentException("Invalid invoice ID", nameof(id));
            if (string.IsNullOrEmpty(status)) throw new ArgumentException("Status cannot be null or empty", nameof(status));
            return await _invoiceRepository.UpdateStatusAsync(id, status);
        }

        public async Task<List<Invoice>> GetByAccountIdAsync(Guid accountId)
        {
            if (accountId == Guid.Empty) throw new ArgumentException("Invalid account ID", nameof(accountId));
            var invoices = await _invoiceRepository.GetAllInvoiceAsync();
            return invoices.Where(i => i.AccountID == accountId).ToList();
        }

        public async Task<List<Invoice>> GetAllInvoiceAsync()
        {
            return await _invoiceRepository.GetAllInvoiceAsync();
        }

        public async Task<byte[]> GenerateInvoicePDF(InvoicePDFResponse invoice)
        {
            var vietnamCulture = new CultureInfo("vi-VN");
            // Bảng màu mới - màu chủ đạo cho trường mẫu giáo
            var primaryColor = Colors.Pink.Medium; // Màu hồng phù hợp với mẫu giáo
            var accentColor = Colors.Blue.Lighten3;  // Màu xanh nhạt trẻ em
            var lightBgColor = Colors.Pink.Lighten5; // Màu hồng rất nhạt làm nền
            var borderColor = Colors.Pink.Lighten3; // Màu hồng nhạt cho viền
            var textColor = Colors.Grey.Darken3;

            string designedDescription = "";

            var invoiceDetails = await _invoiceDetailService.GetByInvoiceIdAsync(invoice.InvoiceID);
            var invoiceDetailResponses = _mapper.Map<List<InvoiceDetailResponse>>(invoiceDetails);

            for (int i = 0; i < invoiceDetails.Count; i++)
            {
                var detail = invoiceDetailResponses[i];

                var child = await _childrenService.GetChildByIdAsync(invoiceDetails[i].ChildrenID);
                detail.ChildrenName = child!.Name;

                if (invoiceDetails[i].ProgramID != null)
                {
                    var program = await _enrichProgramService.GetProgramByIdAsync(invoiceDetails[i].ProgramID);
                    detail.ProgramName = program.Name;
                }
                else
                {
                    var tuition = await _tuitionFeeRepositiry.GetTuitionFeeByIdAsync(invoiceDetails[i].TuitionFeeID);
                    detail.tuitionFeeName = tuition!.Name;

                    //Get academic year
                    string academicYear = "";

                    var year = invoice.Date.Year;

                    // So sánh với ngày 1/6 của năm hiện tại
                    var schoolStartDate = new DateTime(year, 6, 1);

                    if (invoice.Date < schoolStartDate)
                    {
                        academicYear = (year - 1).ToString() + "-" + (year).ToString();
                    }
                    else
                    {
                        academicYear = (year).ToString() + "-" + (year + 1).ToString();
                    }

                    var chidrenGrade = await _childrenGradeService.GetChildrenGradesByChildrenIdAsync(invoiceDetails[i].ChildrenID);
                    var currentChildrenGrade = chidrenGrade.FirstOrDefault(cg => cg.AcademicYear == academicYear);

                    var gradeLevel = await _gradeLevelService.GetGradeLevelByIdAsync(currentChildrenGrade!.GradeLevelID);
                    var gradeLevelFeeFormated = string.Format(new CultureInfo("vi-VN"), "{0:N0}", gradeLevel!.Fee);
                    var gradeFeeName = "Học phí lớp " + gradeLevel!.Name! + " (" + gradeLevelFeeFormated + " đồng)";

                    // Design Description cua hoa don
                    // Tách các phần tử

                    if (tuition.Description!.Contains("+"))
                    {
                        string[] parts = tuition.Description!.Split(" + ");


                        foreach (var part in parts)
                        {
                            // Tìm tên và số tiền bằng Regex
                            var match = Regex.Match(part, @"^(.*)\((\d+)\)$");
                            if (match.Success)
                            {
                                string title = match.Groups[1].Value.Trim();
                                long amount = long.Parse(match.Groups[2].Value);
                                string formatted = string.Format(new CultureInfo("vi-VN"), "{0} ({1:N0} đồng)", title, amount);
                                designedDescription += "- " + formatted + "\n";
                            }
                        }
                        designedDescription = "- " + gradeFeeName + "\n" + designedDescription.TrimEnd('\n');
                    }
                    else
                    {
                        if (tuition.Description == null)
                        {
                            designedDescription = "- " + gradeFeeName;
                        }
                        else
                        {
                            designedDescription = "- " + gradeFeeName + "\n" + tuition.Description!;
                        }

                    }

                    detail.Description = designedDescription;
                }
            }

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Margin(25);
                    page.Size(PageSizes.A4);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(10).FontFamily("Arial").FontColor(textColor));

                    // Header sạch và gọn gàng hơn
                    page.Header().PaddingBottom(15).Row(row =>
                    {
                        // Thông tin trường
                        row.RelativeItem(2).Column(col =>
                        {
                            col.Item().Text("TRƯỜNG MẦM NON LITTLE STARS ").Bold().FontSize(16).FontColor(primaryColor);
                            col.Item().PaddingTop(3).Text("Đường D1, Quận Thủ Đức, TP.HCM").FontSize(9);
                            col.Item().Text("Email: little-stars-preschool@gmail.com | SĐT: 028.1234.5678").FontSize(9);
                        });

                        // Tiêu đề hóa đơn
                        row.RelativeItem(2).Border(1).BorderColor(borderColor)
                           .Background(lightBgColor).Padding(12)
                           .Column(titleCol =>
                           {
                               titleCol.Item().Text("HÓA ĐƠN THANH TOÁN").Bold().FontSize(14).FontColor(primaryColor).AlignCenter();
                               titleCol.Item().PaddingTop(5).Text($"Mã hóa đơn: {invoice.InvoiceDetails[0].InvoiceID}").FontSize(9).AlignCenter();
                               titleCol.Item().Text($"Ngày: {invoice.Date:dd/MM/yyyy}").FontSize(9).AlignCenter();
                           });
                    });

                    // Nội dung chính
                    page.Content().PaddingVertical(10).Column(col =>
                    {
                        // Thông tin khách hàng
                        col.Item().Border(1).BorderColor(borderColor)
                           .Background(lightBgColor).Padding(15)
                           .Column(info =>
                           {
                               info.Item().Text("THÔNG TIN THANH TOÁN").Bold().FontSize(11).FontColor(primaryColor);
                               info.Item().PaddingTop(5).Grid(grid =>
                               {
                                   grid.Columns(2);
                                   grid.Item().Text($"Tên giao dịch:").SemiBold();
                                   grid.Item().Text($"{invoice.Name}");
                                   grid.Item().Text($"Phụ huynh:").SemiBold();
                                   grid.Item().Text($"{invoice.ParentName}");
                               });
                           });

                        col.Item().PaddingTop(15);

                        // Bảng chi tiết gọn gàng hơn
                        col.Item().Column(column =>
                        {
                            // Tiêu đề bảng
                            column.Item().Border(1).BorderColor(borderColor).BorderBottom(0)
                                  .Background(primaryColor).Padding(8)
                                  .Text("CHI TIẾT HÓA ĐƠN").Bold().FontSize(11).FontColor(Colors.White).AlignCenter();

                            // Bảng chi tiết
                            column.Item().Border(1).BorderColor(borderColor).BorderTop(0)
                                  .Table(table =>
                                  {
                                      table.ColumnsDefinition(columns =>
                                      {
                                          columns.RelativeColumn(1); // Tên chương trình
                                          columns.RelativeColumn(3); // Description
                                          columns.RelativeColumn(2); // Tên trẻ
                                      });

                                      // Header
                                      table.Header(header =>
                                      {
                                          header.Cell().Element(CellStyleHeader).Text("CHƯƠNG TRÌNH");
                                          header.Cell().Element(CellStyleHeader).Text("MÔ TẢ");
                                          header.Cell().Element(CellStyleHeader).Text("TRẺ");

                                          IContainer CellStyleHeader(IContainer container) =>
                                      container.DefaultTextStyle(x => x.SemiBold().FontColor(Colors.White).FontSize(9))
                                              .Padding(8)
                                              .Background(accentColor);
                                      });

                                      // Rows đơn giản và rõ ràng - xen kẽ màu nhẹ
                                      bool isEvenRow = false;
                                      foreach (var detail in invoice.InvoiceDetails)
                                      {
                                          if (detail.ProgramName == null || detail.ProgramName == "")
                                          {
                                              table.Cell().Element(container => CellStyleBody(container, isEvenRow)).Text(detail.tuitionFeeName ?? "");
                                              table.Cell().Element(container => CellStyleBody(container, isEvenRow)).Text(designedDescription ?? "");
                                              table.Cell().Element(container => CellStyleBody(container, isEvenRow)).Text(detail.ChildrenName ?? "");
                                          }
                                          else
                                          {
                                              table.Cell().Element(container => CellStyleBody(container, isEvenRow)).Text(detail.ProgramName ?? "");
                                              table.Cell().Element(container => CellStyleBody(container, isEvenRow)).Text(detail.Description ?? "");
                                              table.Cell().Element(container => CellStyleBody(container, isEvenRow)).Text(detail.ChildrenName ?? "");
                                          }


                                          isEvenRow = !isEvenRow;
                                      }

                                      IContainer CellStyleBody(IContainer container, bool isEven) =>
                                  container.Padding(8)
                                          .BorderBottom(0.5f).BorderColor(borderColor)
                                          .Background(isEven ? Colors.White : Colors.Pink.Lighten5);
                                  });
                        });

                        // Tổng cộng nổi bật
                        col.Item().AlignRight().PaddingTop(15)
                           .Border(1).BorderColor(borderColor)
                           .Background(lightBgColor).Padding(10)
                           .Text(txt =>
                           {
                               txt.Span("TỔNG CỘNG: ").Bold().FontSize(11);
                               txt.Span(invoice.Amount.ToString("C0", vietnamCulture)).Bold().FontSize(13).FontColor(primaryColor);
                           });

                        // Ghi chú thanh toán gọn gàng
                        col.Item().PaddingTop(15).Border(1).BorderColor(borderColor)
                           .Padding(15)
                           .Column(notes =>
                           {
                               notes.Item().Text("THÔNG TIN THANH TOÁN").Bold().FontSize(11).FontColor(primaryColor);
                               notes.Item().PaddingTop(5).Grid(grid =>
                               {
                                   grid.Columns(2);
                                   grid.Item().Text("Ngân hàng:").SemiBold().FontSize(9);
                                   grid.Item().Text("VCB - Chi nhánh TP.HCM").FontSize(9);
                                   grid.Item().Text("Số tài khoản:").SemiBold().FontSize(9);
                                   grid.Item().Text("0281000675888").FontSize(9);
                                   grid.Item().Text("Chủ tài khoản:").SemiBold().FontSize(9);
                                   grid.Item().Text("TRƯỜNG MẦM NON LITTLE STARS").FontSize(9);
                               });
                           });
                    });

                    // Footer đơn giản
                    page.Footer().Column(footer =>
                    {
                        footer.Item().BorderTop(0.5f).BorderColor(borderColor).PaddingTop(10)
                              .AlignCenter()
                              .Text(txt =>
                              {
                                  txt.Span("© 2023 Trường Mầm Non XYZ - Mọi quyền được bảo lưu").FontSize(8).FontColor(Colors.Grey.Medium);
                              });

                        footer.Item().PaddingTop(3).AlignCenter()
                              .Text(text =>
                              {
                                  text.Span("Trang ").FontSize(8).FontColor(Colors.Grey.Medium);
                                  text.CurrentPageNumber().FontSize(8).FontColor(Colors.Grey.Medium);
                                  text.Span(" / ").FontSize(8).FontColor(Colors.Grey.Medium);
                                  text.TotalPages().FontSize(8).FontColor(Colors.Grey.Medium);
                              });
                    });
                });
            });

            return document.GeneratePdf();
        }

        public async Task<Invoice> UpdateInvoiceAsync(Invoice invoice)
        {
            return await _invoiceRepository.UpdateInvoiceAsync(invoice);
        }

        public async Task<List<Invoice>> GetInvoiceByChildrenIdAndEnrichProgramIdAsync(Guid childrenId, int enrichmentProgramId)
        {
            var invoiceDetails = await _invoiceRepository.GetInvoiceDetailsByChildrenIdAndEnrichProgramIdAsync(childrenId, enrichmentProgramId);
            var invoices = new List<Invoice>();

            foreach (var detail in invoiceDetails)
            {
                invoices.Add(await _invoiceRepository.GetByIdAsync(detail.InvoiceID));
            }

            var invoicesTemps = invoices.ToList();
            foreach (var invoice in invoices)
            {
                if (invoice.Status != "Success")
                    invoicesTemps.Remove(invoice);
            }
            return invoicesTemps;
        }

        public async Task<List<Invoice>> GetAwaitingRefundInvoicesAsync()
        {
            var invoices = await _invoiceRepository.GetAwaitingRefundInvoicesAsync();
            if (invoices == null || invoices.Count == 0)
            {
                throw new InvalidOperationException("No awaiting refund invoices found for the specified account ID.");
            }
            return invoices;
        }
    }
}
