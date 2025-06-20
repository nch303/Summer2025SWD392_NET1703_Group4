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

        public async Task<Syllabus> CreateAsync(Syllabus syllabus, SyllabusDetail detail)
        {
            return await _syllabusRepository.CreateAsync(syllabus, detail);
        }

        public async Task<List<Syllabus>> GetAllAsync()
        {
            return await _syllabusRepository.GetAllAsync();
        }

        public async Task<SyllabusDetail?> GetDetailByIdAsync(int id)
        {
            return await _syllabusRepository.GetDetailByIdAsync(id);
        }

        public async Task<Syllabus> UpdateAsync(int id, Syllabus newSyllabus, SyllabusDetail newDetail)
        {
            var existingDetail = await _syllabusRepository.GetDetailByIdAsync(id);
            var existingSyllabus = await _syllabusRepository.GetSyllabusById(id);
            if (existingSyllabus == null || existingDetail == null)
            {
                throw new Exception("Syllabus not found!!!");
            }

            existingSyllabus!.Name = newSyllabus.Name;
            existingDetail!.Content = newDetail.Content;
            existingDetail.Duration = newDetail.Duration;
            existingDetail.Slot = newDetail.Slot;
            return await _syllabusRepository.UpdateAsync(existingSyllabus, existingDetail);
        }
    }
}
