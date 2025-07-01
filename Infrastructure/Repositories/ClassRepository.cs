using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.EntitiesConfigurations;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class ClassRepository : IClassRepository
    {
        private readonly AppDbContext _context;

        public ClassRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Class> CreatClass(Class room)
        {
            room.Quantity = 0;
            await _context.Classes.AddAsync(room);
            await _context.SaveChangesAsync();

            await _context.Entry(room)
            .Reference(r => r.Syllabi)
            .LoadAsync();

            await _context.Entry(room)
            .Reference(r => r.GradeLevels)
            .LoadAsync();

            await _context.Entry(room)
            .Reference(r => r.EnrichmentPrograms)
            .LoadAsync();

            return room;
        }

        public async Task<Class> DeleteClass(int classID)
        {
            var room = await _context.Classes.Where(a => a.Status == "Available").FirstOrDefaultAsync(a => a.ID == classID);
            if (room == null)
            {
                throw new Exception("Class not found!!!");
            }
            room!.Status = "Deleted";
            await _context.SaveChangesAsync();
            return room;
        }

        public async Task<Class> RestoreClass(int classID)
        {
            var room = await _context.Classes.FirstOrDefaultAsync(a => a.ID == classID);
            room!.Status = "Available";
            await _context.SaveChangesAsync();
            return room;
        }

        public async Task<Class> GetClass(int classID)
        {
            var room = await _context.Classes
                .Include(a => a.EnrichmentPrograms)
                .Include(a => a.GradeLevels)
                .Include(a => a.Syllabi)
                .Include(c => c.ClassChildrens!)
                    .ThenInclude(cc => cc.Childrens)
                .Include(c => c.ClassTeachers!)
                    .ThenInclude(ct => ct.Teachers)
                .FirstOrDefaultAsync(c => c.ID == classID);
            return room!;
        }

        public async Task<List<Class>> GetAllClass()
        {
            var rooms = await _context.Classes
                .Include(a => a.GradeLevels)
                .Include(a => a.Syllabi)
                .Include(a => a.EnrichmentPrograms)
                .Include(a => a.ClassTeachers!)
                    .ThenInclude(ct => ct.Teachers)
                .ToListAsync();
            return rooms;
        }

        public async Task<List<Class>> GetClassByName(string name)
        {
            var rooms = await _context.Classes
                .FromSqlRaw("SELECT * FROM Classes WHERE Name COLLATE Latin1_General_CI_AI LIKE N'%'+ @p0 +'%'", name)
                .ToListAsync();

            return rooms;
        }

        //public async Task<List<Class>> GetAllSortedClass(string type, string trend)
        //{
        //    var query = _context.Classes
        //        .Where(c => c.Status == "Available")
        //        .Include(c => c.GradeLevels)  // include related entity
        //        .Include(c => c.ClassTeachers!)
        //            .ThenInclude(a => a.Teachers)
        //        .AsQueryable();

        //    var list = await query.ToListAsync();

        //    bool descending = trend?.ToLower() == "desc";

        //    switch (type?.ToLower())
        //    {
        //        case "name":
        //            query = descending ? query.OrderByDescending(c => c.Name)
        //                               : query.OrderBy(c => c.Name);
        //            break;

        //        case "gradelevel":
        //            query = descending ? query.OrderByDescending(c => c.GradeLevels!.Name)
        //                               : query.OrderBy(c => c.GradeLevels!.Name);
        //            break;

        //        case "quantity":
        //            query = descending ? query.OrderByDescending(c => c.Quantity)
        //                               : query.OrderBy(c => c.Quantity);
        //            break;

        //        case "academicyear":
        //            list = descending ? list.OrderByDescending(c => int.Parse(c.AcademicYear!.Split('-')[0])).ToList()
        //                              : list.OrderBy(c => int.Parse(c.AcademicYear!.Split('-')[0])).ToList();
        //            break;

        //        case "teacher":
        //            query = descending
        //                ? query.OrderByDescending(c => c.ClassTeachers!.Select(ct => ct.Teachers!.FullName).FirstOrDefault())
        //                : query.OrderBy(c => c.ClassTeachers!.Select(ct => ct.Teachers!.FullName).FirstOrDefault());
        //            break;

        //        default:
        //            // Default sort by Name
        //            query = descending ? query.OrderByDescending(c => c.Name)
        //                               : query.OrderBy(c => c.Name);
        //            break;
        //    }

        //    return await query.ToListAsync();
        //}

        public async Task<List<Class>> GetAllSortedClass(string type, string trend)
        {
            var query = _context.Classes
                .Where(c => c.Status == "Available")
                .Include(c => c.GradeLevels)
                .Include(c => c.ClassTeachers!)
                    .ThenInclude(a => a.Teachers)
                .AsQueryable();

            var list = await query.ToListAsync();

            bool descending = trend?.ToLower() == "desc";

            switch (type?.ToLower())
            {
                case "name":
                    list = descending ? list.OrderByDescending(c => c.Name).ToList()
                                      : list.OrderBy(c => c.Name).ToList();
                    break;

                case "gradelevel":
                    list = descending ? list.OrderByDescending(c => c.GradeLevels!.Name).ToList()
                                      : list.OrderBy(c => c.GradeLevels!.Name).ToList();
                    break;

                case "quantity":
                    list = descending ? list.OrderByDescending(c => c.Quantity).ToList()
                                      : list.OrderBy(c => c.Quantity).ToList();
                    break;

                case "academicyear":
                    list = descending
                        ? list.OrderByDescending(c => int.Parse(c.AcademicYear!.Split('-')[0])).ToList()
                        : list.OrderBy(c => int.Parse(c.AcademicYear!.Split('-')[0])).ToList();
                    break;

                case "teacher":
                    list = descending
                        ? list.OrderByDescending(c => c.ClassTeachers!.Select(ct => ct.Teachers!.FullName).FirstOrDefault()).ToList()
                        : list.OrderBy(c => c.ClassTeachers!.Select(ct => ct.Teachers!.FullName).FirstOrDefault()).ToList();
                    break;

                default:
                    list = descending ? list.OrderByDescending(c => c.Name).ToList()
                                      : list.OrderBy(c => c.Name).ToList();
                    break;
            }

            return list;
        }


        public async Task<Class> UpdateClass(int classID, Class newClass)
        {
            var room = await _context.Classes.Include(c => c.Syllabi).FirstOrDefaultAsync(a => a.ID == classID);
            room!.Name = newClass.Name;
            room.MaxChildren = newClass.MaxChildren;
            room.SyllabusID = newClass.SyllabusID;
            await _context.SaveChangesAsync();
            return room;
        }

        public async Task<List<Class>> GetByEnrichmentIdAsync(int enrichmentId)
        {
            var classes = await _context.Classes
                .Where(c => c.EnrichmentProgramId == enrichmentId)
                .Include(c => c.ClassChildrens!)
                    .ThenInclude(cc => cc.Childrens)
                .ToListAsync();
            return classes;
        }

        public async Task<List<Class>> GetClassesByChildIdAsync(Guid childId)
        {
            var classChildren = await _context.ClassChildrens
                .Include(cc => cc.Classes)
                    .ThenInclude(cls => cls!.GradeLevels)
                .Include(cc => cc.Classes)
                    .ThenInclude(cls => cls.Syllabi)
                .Include(cc => cc.Classes)
                    .ThenInclude(cls => cls.EnrichmentPrograms)
                .Where(cc => cc.ChildrenID == childId)
                .Select(cc => cc.Classes)
                .ToListAsync();
            return classChildren!;
        }

        public async Task<Class> OpenClass(int classID)
        {
            var room = await _context.Classes.FirstOrDefaultAsync(a => a.ID == classID);
            room.Status = "Available";
            _context.Classes.Update(room);
            await _context.SaveChangesAsync();
            return room;
        }

        public async Task<List<Class>> GetClassesByTeacherIdAsync(Guid teacherId)
        {
            var classes = await _context.ClassTeachers
                .Include(ct => ct.Classes)
                    .ThenInclude(c => c.GradeLevels)
                .Include(ct => ct.Classes)
                    .ThenInclude(c => c.Syllabi)
                .Include(ct => ct.Classes)
                    .ThenInclude(c => c.EnrichmentPrograms)
                .Where(ct => ct.TeacherID == teacherId)
                .Select(ct => ct.Classes)
                .ToListAsync();
            return classes!;
        }

        public async Task<Class> FinishClass(int classID)
        {
            var room = await _context.Classes.FirstOrDefaultAsync(a => a.ID == classID);
            room.Status = "Finished";
            _context.Classes.Update(room);
            await _context.SaveChangesAsync();
            return room;
        }
    }
}
