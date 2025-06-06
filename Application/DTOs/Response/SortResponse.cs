using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.DTOs.Response
{
    public class SortResponse
    {
        public string? Name { get; set; }
        public string? GradeLevelName { get; set; }
        public int MaxChildren { get; set; }
        public int Quantity { get; set; }
        public string? Status { get; set; }
        public ICollection<ClassChildren>? ClassChildrens { get; set; }
        public ICollection<ClassTeacher>? ClassTeachers { get; set; }
    }
}
