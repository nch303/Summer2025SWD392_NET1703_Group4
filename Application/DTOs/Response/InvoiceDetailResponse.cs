using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Response
{
    public class InvoiceDetailResponse
    {
        public Guid InvoiceID { get; set; }

        public String? ProgramName { get; set; }

        public decimal Price { get; set; }

        public String? ChildrenName { get; set; }
    }
}
