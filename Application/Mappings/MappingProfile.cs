using AutoMapper;
using PreSchoolBE.src.Application.DTOs.Request;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;
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
            CreateMap<AccountRequest, Account>();
            CreateMap<UpdateUserProfileRequest, Account>();
            CreateMap<Account, UpdateUserProfileResponse>();

            CreateMap<ChildrenRequest, Children>();
            CreateMap<Children, ChildrenResponse>();
            CreateMap<Children, AllChildrenResponse>();

            CreateMap<EnrollmentApplication, EnrollmentApplicationListResponse>()
                .ForMember(dest => dest.EAID, opt => opt.MapFrom(src => src.ID))
                .ForMember(dest => dest.ChildrenName, opt => opt.MapFrom(src => src.Childrens!.Name))
                .ForMember(dest => dest.GradeLevelName, opt => opt.MapFrom(src => src.GradeLevels!.Name));
            CreateMap<EnrollmentApplication, EADetailResponse>()
                .ForMember(dest => dest.ParentName, opt => opt.MapFrom(src => src.Parent!.FullName))
                .ForMember(dest => dest.ParentPhone, opt => opt.MapFrom(src => src.Parent!.PhoneNumber))
                .ForMember(dest => dest.ChildrenName, opt => opt.MapFrom(src => src.Childrens!.Name))
                .ForMember(dest => dest.Birthday, opt => opt.MapFrom(src => src.Childrens!.Birthday))
                .ForMember(dest => dest.Gender, opt => opt.MapFrom(src => src.Childrens!.Gender))
                .ForMember(dest => dest.Avatar, opt => opt.MapFrom(src => src.Childrens!.Avatar))
                .ForMember(dest => dest.City, opt => opt.MapFrom(src => src.Childrens!.City))
                .ForMember(dest => dest.EnrollDate, opt => opt.MapFrom(src => src.Childrens!.EnrollDate))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Childrens!.Status))
                .ForMember(dest => dest.BirthCertificate, opt => opt.MapFrom(src => src.Childrens!.BirthCertificate))
                .ForMember(dest => dest.GradeLevelName, opt => opt.MapFrom(src => src.GradeLevels!.ID))
                .ForMember(dest => dest.GradeLevelFee, opt => opt.MapFrom(src => src.GradeLevels!.Fee))
                .ForMember(dest => dest.GradeLevelIsDelete, opt => opt.MapFrom(src => src.GradeLevels!.IsDelete));
            CreateMap<EnrollmentApplicationRequest, EnrollmentApplication>();

            CreateMap<Invoice, InvoiceResponse>();
            CreateMap<Invoice, InvoicePDFResponse>();

            CreateMap<InvoiceDetail, InvoiceDetailResponse>();

            CreateMap<GradeLevel, GradeLevelResponse>();
            CreateMap<Notification, NotificationResponse>();

            CreateMap<TuitionFee, TuitionWithChildResponse>();

            CreateMap<EnrichmentProgram, EnrichmentProgramResponse>()
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.TypePrograms!.Name));

            CreateMap<Role, RoleResponse>();
        }
    }
}
