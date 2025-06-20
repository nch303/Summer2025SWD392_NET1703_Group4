using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Request
{
    public class CreateSyllabusRequest
    {
        public SyllabusRequest? SyllabusRequest { get; set; }
        public SyllabusDetailRequest? DetailRequest { get; set; }
    }
}
