using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Response
{
    public class GetAllNewsResponse
    {
        public int ID { get; set; }
        public string? Title { get; set; }
        public string? Image { get; set; }
    }
}
