using Application.DTOs.Response;
using Application.Interfaces;
using AutoMapper;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;

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
        public InvoiceDetailController(IInvoiceDetailService invoiceDetailService, IMapper mapper,
            IAccountService accountService, IChildrenService childrenService, IEnrichProgramService enrichProgramService)
        {
            _invoiceDetailService = invoiceDetailService;
            _mapper = mapper;
            _accountService = accountService;
            _childrenService = childrenService;
            _enrichProgramService = enrichProgramService;
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

                    var program = await _enrichProgramService.GetProgramByIdAsync(invoiceDetails[i].ProgramID);
                    detail.ProgramName = program.Name;
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
