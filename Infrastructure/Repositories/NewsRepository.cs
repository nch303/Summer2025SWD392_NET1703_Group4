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
    }
}
