using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace Application.DTOs.Request
{
    public class NewsRequest
    {
        public string? Title { get; set; }
        public string? Content { get; set; }
        public DateTime PublishDate { get; set; }
        public IFormFile? Image { get; set; }
        public IFormFile? Banner { get; set; }
        public string? Status { get; set; }
    }
}
