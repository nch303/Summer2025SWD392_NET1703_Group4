using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.DTOs.Request;
using Application.Interfaces;
using AutoMapper;
using Domain.Entities;
using Domain.Interfaces;

namespace Application.Services
{
    public class ClassService : IClassService
    {
        private readonly IClassRepository _classRepository;
        private readonly IStaffRepository _staffRepository;

        public ClassService(IClassRepository classRepository, IStaffRepository staffRepository)
        {
            _classRepository = classRepository;
            _staffRepository = staffRepository;
        }

        public async Task<Class> CreatClass(Class room)
        {
            if (string.IsNullOrWhiteSpace(room.Name))
                throw new ArgumentException("Class name is required.");

            return await _classRepository.CreatClass(room);
        }

        public async Task<Class> DeleteClass(int classId)
        {
            return await _classRepository.DeleteClass(classId);
        }

        public async Task<Class> RestoreClass(int classId)
        {
            return await _classRepository.RestoreClass(classId);
        }

        public async Task<Class> UpdateClass(int classId, Class room)
        {
            return await _classRepository.UpdateClass(classId, room);
        }

        public async Task<Class> GetClass(int classId)
        {
            var room = await _classRepository.GetClass(classId);
            if (room == null)
                throw new Exception("Class not found.");
            return room;
        }

        public async Task<List<Class>> GetAllClass()
        {
            return await _classRepository.GetAllClass();
        }

        public async Task<List<Class>> GetClassByName(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                return new List<Class>(); // Return empty result

            return await _classRepository.GetClassByName(name);
        }

        public async Task<List<Class>> GetAllSortedClass(string type, string trend)
        {
            if (string.IsNullOrWhiteSpace(type)) type = "name";
            if (string.IsNullOrWhiteSpace(trend)) trend = "asc";

            return await _classRepository.GetAllSortedClass(type, trend);
        }

        public async Task<List<ClassChildren>> AssignChildIntoEnrichmentClass(int enrichmentId, List<Guid> childrenIds)
        {
            var classes = GetByEnrichmentIdAsync(enrichmentId).Result;
            var classchildren = new List<ClassChildren>();
            foreach (var classItem in classes)
            {
                if (classItem.MaxChildren >= classItem.Quantity + childrenIds.Count)
                {
                    classchildren = await _staffRepository.AssignChildrenListToClassAsync(classItem.ID, childrenIds);

                    classItem.Quantity += childrenIds.Count;
                    await _classRepository.UpdateClass(classItem.ID, classItem);
                }
            }

            //Check if class if full
            if (classes[classes.Count - 1].MaxChildren < classes[classes.Count - 1].Quantity + childrenIds.Count)
            {
                throw new Exception("Class is full, cannot assign more children.");
            }

            return classchildren;
        }

        public async Task<List<Class>> GetByEnrichmentIdAsync(int enrichmentId)
        {
            return await _classRepository.GetByEnrichmentIdAsync(enrichmentId);
        }

        public async Task<List<Class>> GetClassesByChildIdAsync(Guid childId)
        {
            return await _classRepository.GetClassesByChildIdAsync(childId);
        }

        public async Task<Class> OpenClass(int classId)
        {
            var room = await _classRepository.GetClass(classId);
            if (room == null)
                throw new Exception("Class not found.");
            if (room.Status == "Available")
                throw new Exception("Class is already open.");
            return await _classRepository.OpenClass(classId);
        }

        public async Task<List<Class>> GetClassesByTeacherIdAsync(Guid teacherId)
        {
            return await _classRepository.GetClassesByTeacherIdAsync(teacherId);
        }
    }
}
