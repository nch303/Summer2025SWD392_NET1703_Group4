using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Request
{
    public class EnrichmentProgramRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int? Level { get; set; }
        public int MaxChildren { get; set; }
        public decimal Fee { get; set; }
        public int TypeProgramID { get; set; }
    }
}
