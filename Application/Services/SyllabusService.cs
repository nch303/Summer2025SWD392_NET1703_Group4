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
    public class SyllabusService : ISyllabusService
    {
        private readonly ISyllabusRepository _syllabusRepository;

        public SyllabusService(ISyllabusRepository syllabusRepository)
        {
            _syllabusRepository = syllabusRepository;
        }

        public async Task<Syllabus> CreateSyllabus(Syllabus syllabus)
        {
            return await _syllabusRepository.CreateSyllabus(syllabus);
        }

        public async Task<List<Syllabus>> GetAll()
        {
            return await _syllabusRepository.GetAll();
        }

        public async Task<Syllabus> Update(int id, Syllabus newSyllabus)
        {
            var existingSyllabus = await _syllabusRepository.GetSyllabusById(id);
            if (existingSyllabus == null)
            {
                throw new Exception("Syllabus not found!!!");
            }

            existingSyllabus!.Name = newSyllabus.Name;
            existingSyllabus.SlotAmount = newSyllabus.SlotAmount;
            return await _syllabusRepository.Update(existingSyllabus);
        }

        public async Task<bool> DeleteSyllabusAsync(int id)
        {
            return await _syllabusRepository.DeleteSyllabus(id);
        }
    }
} 
