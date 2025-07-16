using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Response
{
    public class TuitionResponse
    {
        public int ID { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public DateOnly? Date { get; set; }
        public double Fee { get; set; }
        public int GradeLevelID { get; set; }
    }
}
