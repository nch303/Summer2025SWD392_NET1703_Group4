using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Request
{
    public class VnPayTuitionFeeRequest
    {
        public string OrderType { get; set; }
        public decimal Amount { get; set; }
        public string OrderDescription { get; set; }
        public string Name { get; set; }

        public Guid ChildrenID { get; set; }
        public List<int> TuitionFeeIds { get; set; } = new List<int>();
    }
}
