using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Response
{
    public class GetAllSyllabusDetailResponse
    {
        public int ID { get; set; }
        public int Slot { get; set; }
        public string? Content { get; set; }
        public int Duration { get; set; }
    }
}
