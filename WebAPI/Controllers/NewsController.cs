using Application.DTOs.Response;
using Application.Interfaces;
using Application.Services;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static Microsoft.Extensions.Logging.EventSource.LoggingEventSource;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NewsController : Controller
    {
        private readonly IMapper _mapper;
        private readonly INewsService _newsService;

        public NewsController(INewsService newsService, IMapper mapper)
        {
            _mapper = mapper;
            _newsService = newsService;
        }

        [HttpGet("get-list-of-news")]
        public async Task<IActionResult> GetListOfNews(int page = 1, int pageSize = 10)
        {
            try
            {
                var (news, totalCount) = await _newsService.GetListOfNews(page, pageSize);

                var newsResponses = _mapper.Map<List<NewsResponse>>(news);

                return Ok(new
                {
                    TotalCount = totalCount,
                    PageNumber = page,
                    PageSize = pageSize,
                    Data = newsResponses
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}/view-news-detail")]
        public async Task<IActionResult> ViewDetail(int id)
        {
            try
            {
                var detail = await _newsService.ViewNewsDetail(id);

                var newsResponses = _mapper.Map<List<NewsResponse>>(detail);

                return Ok(newsResponses);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
