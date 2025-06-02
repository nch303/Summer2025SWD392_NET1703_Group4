using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Response
{
    public class InvoiceResponse
    {
        public String ParentName { get; set; }
        public String ChildrenName { get; set; }
        public decimal Amount { get; set; }
        public string? Status { get; set; }
        public DateTime Date { get; set; }
        public string? PaymentLink { get; set; }
    }
}
