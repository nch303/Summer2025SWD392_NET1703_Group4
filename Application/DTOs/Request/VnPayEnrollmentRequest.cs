using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Request
{
    public class VnPayEnrollmentRequest
    {
        public string OrderType { get; set; }
        public string OrderDescription { get; set; }
        public string Name { get; set; }
        public Guid ChildrenID { get; set; }
    }
}
