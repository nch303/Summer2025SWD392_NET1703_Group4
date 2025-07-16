using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Request
{
    public class InvoiceRequest
    {
        public Guid AccountID { get; set; }
        public Guid ChildrenID { get; set; }

        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
    }
}
