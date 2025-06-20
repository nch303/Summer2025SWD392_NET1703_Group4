using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Response
{
    public class NewsResponse
    {
        public string? Title { get; set; }
        public string? Content { get; set; }
        public DateTime PublishDate { get; set; }
        public string? Image { get; set; }
        public string? Banner { get; set; }
        public string? Status { get; set; }
    }
}
