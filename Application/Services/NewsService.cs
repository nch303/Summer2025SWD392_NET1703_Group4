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
    public class NewsService : INewsService
    {
        private readonly INewsRepository _newsRepository;

        public NewsService(INewsRepository newsRepository)
        {
            _newsRepository = newsRepository;
        }

        public async Task<(List<News> Items, int TotalCount)> GetListOfNews(int page, int pageSize)
        {
            return await _newsRepository.GetListOfNews(page, pageSize);
        }

        public async Task<News> ViewNewsDetail(int id)
        {
            return await _newsRepository.ViewNewsDetail(id);
        }

        public async Task<News> CreateNewsAsync(News news)
        {
            return await _newsRepository.CreateNewsAsynce(news);
        }

        public async Task<News> UpdateNewsAsync(News news)
        {
            return await _newsRepository.UpdateNewsAsynce(news);
        }

        public async Task<bool> DeleteNewsAsync(int id)
        {
            return await _newsRepository.DeleteNewsAsynce(id);
        }

        public async Task<List<News>> SearchNewsAsync(string keyword)
        {
            return await _newsRepository.SearchNewsAsync(keyword);
        }

        public async Task<News> GetByIdAsync(int id)
        {
            return await _newsRepository.ViewNewsDetail(id);
        }
    }
}
