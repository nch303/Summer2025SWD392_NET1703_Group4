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
            CreateMap<SyllabusRequest, Syllabus>();
            CreateMap<SyllabusDetailRequest, SyllabusDetail>();
            CreateMap<Syllabus, GetAllSyllabiResponse>();
            CreateMap<SyllabusDetail, SyllabusDetailResponse>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Syllabi!.Name));
            CreateMap<Syllabus, SyllabusDetailResponse>()
                .ForMember(dest => dest.Slot, opt => opt.MapFrom(src => src.SyllabusDetails!.Slot))
                .ForMember(dest => dest.Content, opt => opt.MapFrom(src => src.SyllabusDetails!.Content))
                .ForMember(dest => dest.Duration, opt => opt.MapFrom(src => src.SyllabusDetails!.Duration));

            CreateMap<RegisterRequest, Account>();
            CreateMap<Account, AccountResponse>();
            CreateMap<AccountRequest, Account>();
            CreateMap<UpdateUserProfileRequest, Account>();
            CreateMap<Account, UpdateUserProfileResponse>();
            CreateMap<Account, TeacherResponse>()
                .ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.Role!.Name));

            CreateMap<ChildrenRequest, Children>();
            CreateMap<Children, ChildrenResponse>()
                .ForMember(dest => dest.ParentName, opt => opt.MapFrom(src => src.Parents!.FullName))
                .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.Parents!.PhoneNumber));

            CreateMap<ClassChildren, ChildrenResponse>()
                .ForMember(dest => dest.ID, opt => opt.MapFrom(src => src.Childrens.ID))
                .ForMember(dest => dest.ParentID, opt => opt.MapFrom(src => src.Childrens.ParentID))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Childrens.Name))
                .ForMember(dest => dest.Birthday, opt => opt.MapFrom(src => src.Childrens.Birthday))
                .ForMember(dest => dest.Gender, opt => opt.MapFrom(src => src.Childrens.Gender))
                .ForMember(dest => dest.Avatar, opt => opt.MapFrom(src => src.Childrens.Avatar))
                .ForMember(dest => dest.City, opt => opt.MapFrom(src => src.Childrens.City))
                .ForMember(dest => dest.BirthCertificate, opt => opt.MapFrom(src => src.Childrens.BirthCertificate))
                .ForMember(dest => dest.ParentName, opt => opt.MapFrom(src => src.Childrens.Parents != null ? src.Childrens.Parents.FullName : null))
                .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.Childrens.Parents != null ? src.Childrens.Parents.PhoneNumber : null))

                // 🚫 Không ánh xạ ApplicationID → giữ mặc định (null)
                .ForMember(dest => dest.ApplicationID, opt => opt.Ignore());


            CreateMap<EnrichmentProgramRequest, EnrichmentProgram>();
            CreateMap<EnrichmentProgram, EnrichmentProgramResponse>()
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.TypePrograms!.Name));


            CreateMap<EnrollmentApplication, EnrollmentApplicationListResponse>()
                .ForMember(dest => dest.EAID, opt => opt.MapFrom(src => src.ID))
                .ForMember(dest => dest.ChildrenName, opt => opt.MapFrom(src => src.Childrens!.Name))
                .ForMember(dest => dest.GradeLevelName, opt => opt.MapFrom(src => src.GradeLevels!.Name));

            CreateMap<EnrollmentApplication, EADetailResponse>()
                .ForMember(dest => dest.ParentName, opt => opt.MapFrom(src => src.Parent!.FullName))
                .ForMember(dest => dest.ParentPhone, opt => opt.MapFrom(src => src.Parent!.PhoneNumber))
                .ForMember(dest => dest.Address, opt => opt.MapFrom(src => src.Parent!.Address))
                .ForMember(dest => dest.ChildrenName, opt => opt.MapFrom(src => src.Childrens!.Name))
                .ForMember(dest => dest.Birthday, opt => opt.MapFrom(src => src.Childrens!.Birthday))
                .ForMember(dest => dest.Gender, opt => opt.MapFrom(src => src.Childrens!.Gender))
                .ForMember(dest => dest.Avatar, opt => opt.MapFrom(src => src.Childrens!.Avatar))
                .ForMember(dest => dest.City, opt => opt.MapFrom(src => src.Childrens!.City))
                .ForMember(dest => dest.EnrollDate, opt => opt.MapFrom(src => src.Childrens!.EnrollDate))
                .ForMember(dest => dest.BirthCertificate, opt => opt.MapFrom(src => src.Childrens!.BirthCertificate))
                .ForMember(dest => dest.GradeLevelName, opt => opt.MapFrom(src => src.GradeLevels!.Name))
                .ForMember(dest => dest.GradeLevelFee, opt => opt.MapFrom(src => src.GradeLevels!.Fee))
                .ForMember(dest => dest.GradeLevelIsDelete, opt => opt.MapFrom(src => src.GradeLevels!.IsDelete));

            CreateMap<EnrollmentApplication, AdminViewEAResponse>()
                .ForMember(dest => dest.ParentName, opt => opt.MapFrom(src => src.Parent!.FullName))
                .ForMember(dest => dest.ParentPhone, opt => opt.MapFrom(src => src.Parent!.PhoneNumber))
                .ForMember(dest => dest.ChildrenName, opt => opt.MapFrom(src => src.Childrens!.Name))
                .ForMember(dest => dest.Birthday, opt => opt.MapFrom(src => src.Childrens!.Birthday))
                .ForMember(dest => dest.Gender, opt => opt.MapFrom(src => src.Childrens!.Gender))
                .ForMember(dest => dest.Avatar, opt => opt.MapFrom(src => src.Childrens!.Avatar))
                .ForMember(dest => dest.City, opt => opt.MapFrom(src => src.Childrens!.City))
                .ForMember(dest => dest.EnrollDate, opt => opt.MapFrom(src => src.Childrens!.EnrollDate))
                .ForMember(dest => dest.BirthCertificate, opt => opt.MapFrom(src => src.Childrens!.BirthCertificate))
                .ForMember(dest => dest.GradeLevelName, opt => opt.MapFrom(src => src.GradeLevels!.Name))
                .ForMember(dest => dest.GradeLevelFee, opt => opt.MapFrom(src => src.GradeLevels!.Fee))
                .ForMember(dest => dest.GradeLevelIsDelete, opt => opt.MapFrom(src => src.GradeLevels!.IsDelete))
                .ForMember(dest => dest.StaffName, opt => opt.MapFrom(src => src.Staff!.FullName));
            CreateMap<EnrollmentApplicationRequest, EnrollmentApplication>();

            CreateMap<Invoice, InvoiceResponse>();
            CreateMap<Invoice, InvoicePDFResponse>();

            CreateMap<InvoiceDetail, InvoiceDetailResponse>();

            CreateMap<GradeLevel, GradeLevelResponse>();
            CreateMap<Notification, NotificationResponse>();

            CreateMap<TuitionRequest, TuitionFee>();
            CreateMap<TuitionFee, TuitionWithChildResponse>();
            CreateMap<TuitionFee, TuitionResponse>();

            CreateMap<EnrichmentProgram, EnrichmentProgramResponse>()
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.TypePrograms!.Name));

            CreateMap<CreateClassRequest, Class>();
            CreateMap<UpdateClassRequest, Class>();
            CreateMap<Class, ClassResponse>()
                .ForMember(dest => dest.EPName, opt => opt.MapFrom(src => src.EnrichmentPrograms!.Name))
                .ForMember(dest => dest.GradeLevelName, opt => opt.MapFrom(src => src.GradeLevels!.Name))
                .ForMember(dest => dest.SyllabusName, opt => opt.MapFrom(src => src.Syllabi!.Name));
            CreateMap<Class, ClassDetailResponse>()
                .ForMember(dest => dest.EPName, opt => opt.MapFrom(src => src.EnrichmentPrograms!.Name))
                .ForMember(dest => dest.GradeLevelName, opt => opt.MapFrom(src => src.GradeLevels!.Name))
                .ForMember(dest => dest.SyllabusName, opt => opt.MapFrom(src => src.Syllabi!.Name))
                .ForMember(dest => dest.ClassChildrens, opt => opt.MapFrom(src => src.ClassChildrens))
                .ForMember(dest => dest.ClassTeachers, opt => opt.MapFrom(src => src.ClassTeachers));
            CreateMap<Class, SortResponse>()
                .ForMember(dest => dest.GradeLevelName, opt => opt.MapFrom(src => src.GradeLevels!.Name));
            CreateMap<Class, UpdateClassResponse>()
                .ForMember(dest => dest.SyllabusName, opt => opt.MapFrom(src => src.Syllabi!.Name));

            CreateMap<ClassChildren, ClassChildrenResponse>()
                .ForMember(dest => dest.ChildrenID, opt => opt.MapFrom(src => src.ChildrenID))
                .ForMember(dest => dest.ChildrenName, opt => opt.MapFrom(src => src.Childrens!.Name));

            CreateMap<ClassTeacher, ClassTeacherResponse>()
                .ForMember(dest => dest.TeacherID, opt => opt.MapFrom(src => src.TeacherID))
                .ForMember(dest => dest.TeacherName, opt => opt.MapFrom(src => src.Teachers!.FullName));

            CreateMap<Role, RoleResponse>();

            CreateMap<Attendance, AttendanceResponse>()
                 .ForMember(dest => dest.ChildrenName, opt => opt.MapFrom(src => src.ClassChildrens!.Childrens!.Name));
            CreateMap<UpdateAttendanceRequest, Attendance>();
        }
    }
}
