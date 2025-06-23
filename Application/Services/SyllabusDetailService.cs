using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;

namespace Application.Services
{
    public class SyllabusDetailService : ISyllabusDetailService
    {
        private readonly ISyllabusDetailRepository _syllabusDetailRepository;
        
        public SyllabusDetailService(ISyllabusDetailRepository syllabusDetailRepository)
        {
            _syllabusDetailRepository = syllabusDetailRepository;
        }

        public async Task<List<SyllabusDetail>> CreateSyllabusDetails(int syllabusId, List<SyllabusDetail> details)
        {
            return await _syllabusDetailRepository.CreateSyllabusDetails(syllabusId, details);
        }

        public async Task<List<SyllabusDetail>> GetAllSyllabusDetailBySyllabusId(int detailId)
        {
            return await _syllabusDetailRepository.GetAllSyllabusDetailBySyllabusId(detailId);
        }

        public async Task<SyllabusDetail?> GetById(int detailId)
        {
            return await _syllabusDetailRepository.GetById(detailId);
        }

        public async Task<SyllabusDetail> Update(int id, SyllabusDetail newDetail)
        {
            var existingDetail = await _syllabusDetailRepository.GetById(id);
            if (existingDetail == null)
            {
                throw new Exception($"Slot {existingDetail!.Slot} not found!!!");
            }

            existingDetail.Duration = newDetail.Duration;
            existingDetail.Content = newDetail.Content;
            return await _syllabusDetailRepository.Update(existingDetail);
        }
    }
}
