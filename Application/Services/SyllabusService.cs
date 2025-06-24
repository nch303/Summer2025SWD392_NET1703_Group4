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

        public async Task<List<Syllabus>> Update(List<Syllabus> newSyllabi)
        {
            var updatedSyllabi = new List<Syllabus>();
            for (int i = 0; i < newSyllabi.Count(); i++)
            {
                var existingSyllabus = await _syllabusRepository.GetSyllabusById(newSyllabi[i].ID);
                if (existingSyllabus == null)
                {
                    throw new Exception("Syllabus not found!!!");
                }

                existingSyllabus!.Name = newSyllabi[i].Name;
                existingSyllabus.SlotAmount = newSyllabi[i].SlotAmount;
                updatedSyllabi.Add(existingSyllabus);
                await _syllabusRepository.Update(existingSyllabus);
            }
            return updatedSyllabi;
        }
    }
}
