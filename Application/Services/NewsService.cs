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
    }
}
