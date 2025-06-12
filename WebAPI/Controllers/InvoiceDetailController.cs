using Application.DTOs.Response;
using Application.Interfaces;
using AutoMapper;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using System.Globalization;
using System.Text.RegularExpressions;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InvoiceDetailController : ControllerBase
    {
        private readonly IInvoiceDetailService _invoiceDetailService;
        private readonly IMapper _mapper;
        private readonly IAccountService _accountService;
        private readonly IChildrenService _childrenService;
        private readonly IEnrichProgramService _enrichProgramService;
        private readonly ITuitionFeeService _tuitionFeeService;
        private readonly IGradeLevelService _gradeLevelService;
        private readonly IChildrenGradeService _childrenGradeService;
        public InvoiceDetailController(IInvoiceDetailService invoiceDetailService, IMapper mapper,
            IAccountService accountService, IChildrenService childrenService, IEnrichProgramService enrichProgramService
            , ITuitionFeeService tuitionFeeService, IGradeLevelService gradeLevelService
            , IChildrenGradeService childrenGradeService)
        {
            _invoiceDetailService = invoiceDetailService;
            _mapper = mapper;
            _accountService = accountService;
            _childrenService = childrenService;
            _enrichProgramService = enrichProgramService;
            _tuitionFeeService = tuitionFeeService;
            _gradeLevelService = gradeLevelService;
            _childrenGradeService = childrenGradeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetByInvoiceIdAsync(Guid invoiceId)
        {
            try
            {
                var invoiceDetails = await _invoiceDetailService.GetByInvoiceIdAsync(invoiceId);
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
                        var tuition = await _tuitionFeeService.GetTuitionFeeByIdAsync(invoiceDetails[i].TuitionFeeID);
                        detail.tuitionFeeName = tuition!.Name;

                        var chidrenGrade = await _childrenGradeService.GetChildrenGradesByChildrenIdAsync(invoiceDetails[i].ChildrenID);

                        var gradeLevel = await _gradeLevelService.GetGradeLevelByIdAsync(chidrenGrade.GradeLevelID);
                        var gradeLevelFeeFormated = string.Format(new CultureInfo("vi-VN"), "{0:N0}", gradeLevel!.Fee);
                        var gradeFeeName = "Học phí lớp " + gradeLevel!.Name! + " (" + gradeLevelFeeFormated + " đồng)";
                        
                        // Design Description cua hoa don
                        // Tách các phần tử
                        string designedDescription = "";
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

                return Ok(invoiceDetailResponses);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
