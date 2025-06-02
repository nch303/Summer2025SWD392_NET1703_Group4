using AutoMapper;
using PreSchoolBE.src.Application.DTOs.Request;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;
using Application.DTOs.Reponse;
using Application.DTOs.Response;
using Application.DTOs.Request;

namespace Application.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<RegisterRequest, Account>();
            CreateMap<Account, AccountResponse>();
            CreateMap<Invoice, InvoiceResponse>();

            CreateMap<ChildrenRequest, Children>();
            CreateMap<Children, ChildrenResponse>();
            CreateMap<Children, AllChildrenResponse>();

            CreateMap<EnrollmentApplication, EnrollmentApplicationResponse>();
            CreateMap<EnrollmentApplicationRequest, EnrollmentApplication>();
        }
    }
}
