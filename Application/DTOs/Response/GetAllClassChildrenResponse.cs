using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Response
{
    public class GetAllClassChildrenResponse
    {
        public int ID { get; set; }
        public string? Status { get; set; }
        public ChildrenResponse ChildrenResponse { get; set; }
        public ClassResponse ClassResponse { get; set; }
        public List<AttendanceResponse> AttendanceResponses { get; set; }
        public List<AccountResponse> Teachers {  get; set; }
    }
}
