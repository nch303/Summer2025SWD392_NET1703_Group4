using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Request
{
    public class ResetPasswordRequest
    {
        public string? Token { get; set; }
        public string? NewPassword { get; set; }
    }
}
