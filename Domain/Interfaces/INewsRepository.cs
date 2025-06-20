using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Domain.Interfaces
{
    public interface INewsRepository
    {
        Task<(List<News> Items, int TotalCount)> GetListOfNews(int page, int pageSize);
        Task<News> ViewNewsDetail(int id);
        Task<News> CreateNewsAsynce(News news);
        Task<News> UpdateNewsAsynce(News news);
        Task<bool> DeleteNewsAsynce(int id);
        Task<List<News>> SearchNewsAsync(string keyword);
        Task<News> GetByIdAsync(int id);
    }
}
