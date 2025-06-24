    using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.EntitiesConfigurations;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class NewsRepository : INewsRepository
    {
        private readonly AppDbContext _context;

        public NewsRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<(List<News> Items, int TotalCount)> GetListOfNewsForParent(int page, int pageSize)
        {
            var query = _context.News.Where(n => n.Status == "Published")
                .AsQueryable();

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderBy(a => a.ID)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<(List<News> Items, int TotalCount)> GetListOfNews(int page, int pageSize)
        {
            var query = _context.News
                .AsQueryable();

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderBy(a => a.ID)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<News> ViewNewsDetail(int id)
        {
            var result = await _context.News.FirstOrDefaultAsync(a => a.ID == id);
            return result!;
        }

        public async Task<News> CreateNewsAsynce(News news)
        {
            _context.News.Add(news);
            await _context.SaveChangesAsync();
            return news;
        }

        public async Task<News> UpdateNewsAsynce(News news)
        {
            _context.News.Update(news);
            await _context.SaveChangesAsync();
            return news;
        }

        public async Task<bool> DeleteNewsAsynce(int id)
        {
            var news = await _context.News.FindAsync(id);
            if (news == null)
            {
                return false;
            }
            _context.News.Remove(news);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<News>> SearchNewsAsync(string keyword)
        {
            var query = _context.News.AsQueryable();
            if (!string.IsNullOrEmpty(keyword))
            {
                query = query.Where(n => n.Title.Contains(keyword) || n.Content.Contains(keyword));
            }
            return await query.ToListAsync();
        }

        public async Task<News> GetByIdAsync(int id)
        {
            return await _context.News.FirstOrDefaultAsync(n => n.ID == id) ?? throw new KeyNotFoundException("News not found");
        }
    }
}
