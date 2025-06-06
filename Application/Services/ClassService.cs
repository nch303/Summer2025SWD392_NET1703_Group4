using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Interfaces;
using AutoMapper;
using Domain.Entities;
using Domain.Interfaces;

namespace Application.Services
{
    public class ClassService : IClassService
    {
        private readonly IClassRepository _classRepository;

        public ClassService(IClassRepository classRepository)
        {
            _classRepository = classRepository;
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

        public async Task<Class> GetClass(int classId)
        {
            return await _classRepository.GetClass(classId);
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
    }
}
