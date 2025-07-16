using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Response
{
    public class InvoicePDFResponse
    {
        public Guid InvoiceID { get; set; }
        public String? Name { get; set; }
        public String? ParentName { get; set; }
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public List<InvoiceDetailResponse> InvoiceDetails { get; set; } = new List<InvoiceDetailResponse>();
    }
}
