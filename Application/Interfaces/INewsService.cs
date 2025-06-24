using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Interfaces
{
    public interface INewsService
    {
        Task<(List<News> Items, int TotalCount)> GetListOfNews(int page, int pageSize);
        Task<News> ViewNewsDetail(int id);
        Task<News> CreateNewsAsync(News news);
        Task<News> UpdateNewsAsync(News news);
        Task<bool> DeleteNewsAsync(int id);
        Task<List<News>> SearchNewsAsync(string keyword);
        Task<News> GetByIdAsync(int id);
        Task<bool> RestoreNewsAsync(int id);

    }
}
