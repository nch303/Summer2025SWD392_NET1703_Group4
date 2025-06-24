using Application.DTOs.Request;
using Application.DTOs.Response;
using Application.Interfaces;
using Application.Services;
using AutoMapper;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PreSchoolBE.src.Application.Services;
using static Microsoft.Extensions.Logging.EventSource.LoggingEventSource;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NewsController : Controller
    {
        private readonly IMapper _mapper;
        private readonly INewsService _newsService;
        private readonly ICloudinaryService _cloudinaryService;

        public NewsController(INewsService newsService, IMapper mapper, ICloudinaryService cloudinaryService)
        {
            _mapper = mapper;
            _newsService = newsService;
            _cloudinaryService = cloudinaryService;
        }

        [HttpGet("get-list-of-news")]
        public async Task<IActionResult> GetListOfNews(int page = 1, int pageSize = 10)
        {
            try
            {
                var (news, totalCount) = await _newsService.GetListOfNews(page, pageSize);

                var newsResponses = _mapper.Map<List<GetAllNewsResponse>>(news);

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

                var newsResponses = _mapper.Map<NewsResponse>(detail);

                return Ok(newsResponses);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost("create-news")]
        public async Task<IActionResult> CreateNews([FromForm] NewsRequest request)
        {
            try
            {
                string? imageUrl = null;
                string? bannerUrl = null;


                if (request.Image != null && request.Image.Length > 0)
                {
                    using var stream = request.Image.OpenReadStream();
                    imageUrl = await _cloudinaryService.UploadImageAsync(stream, request.Image.FileName);
                }

                
                if (request.Banner != null && request.Banner.Length > 0)
                {
                    using var stream = request.Banner.OpenReadStream();
                    bannerUrl = await _cloudinaryService.UploadImageAsync(stream, request.Banner.FileName);
                }


                var news = _mapper.Map<News>(request);
                news.Image = imageUrl;
                news.Banner = bannerUrl;

                var createdNews = await _newsService.CreateNewsAsync(news);
                var response = _mapper.Map<NewsResponse>(createdNews);

                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("update-news/{id}")]
        public async Task<IActionResult> UpdateNews(int id, [FromForm] NewsRequest request)
        {
            try
            {
                var existingNews = await _newsService.GetByIdAsync(id);
                if (existingNews == null)
                    return NotFound(new { message = "News not found." });

                // Upload lại image nếu có file mới
                if (request.Image != null && request.Image.Length > 0)
                {
                    using var stream = request.Image.OpenReadStream();
                    existingNews.Image = await _cloudinaryService.UploadImageAsync(stream, request.Image.FileName);
                }

                // Upload lại banner nếu có file mới
                if (request.Banner != null && request.Banner.Length > 0)
                {
                    using var stream = request.Banner.OpenReadStream();
                    existingNews.Banner = await _cloudinaryService.UploadImageAsync(stream, request.Banner.FileName);
                }

                // Cập nhật các field còn lại
                existingNews.Title = request.Title;
                existingNews.Content = request.Content;
                existingNews.PublishDate = request.PublishDate;
                existingNews.Status = request.Status;

                await _newsService.UpdateNewsAsync(existingNews);

                var response = _mapper.Map<NewsResponse>(existingNews);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("delete-news/{id}")]
        public async Task<IActionResult> DeleteNews(int id)
        {
            try
            {
                var success = await _newsService.DeleteNewsAsync(id);
                if (!success)
                    return NotFound(new { message = "News not found or already deleted." });

                return Ok(new { message = "News marked as deleted (soft delete)." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


        [HttpGet("search-news")]
        public async Task<IActionResult> SearchNews([FromQuery] string keyword)
        {
            try
            {
                var result = await _newsService.SearchNewsAsync(keyword);
                var response = _mapper.Map<List<NewsResponse>>(result);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("restore-news/{id}")]
        public async Task<IActionResult> RestoreNews(int id)
        {
            try
            {
                var success = await _newsService.RestoreNewsAsync(id);
                if (!success)
                    return NotFound(new { message = "News not found or is not deleted." });

                return Ok(new { message = "News restored successfully (status = Draft)." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
