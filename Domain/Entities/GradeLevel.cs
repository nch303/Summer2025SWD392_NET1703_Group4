using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    public class GradeLevel
    {
        [Key]
        public int ID { get; set; }
        public string? Name { get; set; }
        public double Fee { get; set; }
        public bool IsDelete { get; set; }

        public ICollection<EnrollmentApplication>? EnrollmentApplications { get; set; }
    }
}
