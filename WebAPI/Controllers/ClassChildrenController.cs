using Application.DTOs.Response;
using Application.Interfaces;
using Application.Services;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClassChildrenController: ControllerBase
    {
        private readonly IClassChildrenService _classChildrenService;
        private IMapper _mapper;
        private readonly IEAService _eaService;
        private readonly IChildrenGradeService _childrenGradeService;
        private readonly IAccountService _accountService;
        public ClassChildrenController(IClassChildrenService classChildrenService, IMapper mapper, IEAService eaService
            , IChildrenGradeService childrenGradeService, IAccountService accountService)
        {
            _classChildrenService = classChildrenService;
            _mapper = mapper;
            _eaService = eaService;
            _childrenGradeService = childrenGradeService;
            _accountService = accountService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAsync()
        {
            var allChildren = await _classChildrenService.GetAllAsync();
            var responses = _mapper.Map<List<GetAllClassChildrenResponse>>(allChildren);
            foreach (var response in responses)
            {
                //Gan ApplicationID cho ChildResponse
                var application = await _eaService.GetApplicatioinByChildID(response.ChildrenResponse.ID);
                response.ChildrenResponse.ApplicationID = application?.ID ?? Guid.Empty;

                //Gan GradeLevel cho ChildResponse
                var grade = await _childrenGradeService.GetChildrenGradesByChildrenIdAsync(response.ChildrenResponse.ID);
                if (grade.Count == 0)
                {
                    response.ChildrenResponse.GradeLevelID = 0;
                    response.ChildrenResponse.GradeLevelName = string.Empty;
                    continue;
                }
                response.ChildrenResponse.GradeLevelID = grade[grade.Count - 1]?.GradeLevels!.ID ?? 0;
                response.ChildrenResponse.GradeLevelName = grade[grade.Count - 1]?.GradeLevels!.Name ?? string.Empty;

                //Gan Teachers cho Class
                var teachers = await _accountService.GetTeacherByClassIdAsync(response.ClassResponse.ID);
                var teacherResponses = _mapper.Map<List<AccountResponse>>(teachers);
                response.Teachers = teacherResponses;

            }
            
            return Ok(responses);
        }

        [HttpGet("GetByParentID/{parentId}")]
        public async Task<IActionResult> GetByParentID(Guid parentId)
        {
            var allChildren = await _classChildrenService.GetByParentIdAsync(parentId);
            var responses = _mapper.Map<List<GetAllClassChildrenResponse>>(allChildren);
            foreach (var response in responses)
            {
                //Gan ApplicationID cho ChildResponse
                var application = await _eaService.GetApplicatioinByChildID(response.ChildrenResponse.ID);
                response.ChildrenResponse.ApplicationID = application?.ID ?? Guid.Empty;

                //Gan GradeLevel cho ChildResponse
                var grade = await _childrenGradeService.GetChildrenGradesByChildrenIdAsync(response.ChildrenResponse.ID);
                if (grade.Count == 0)
                {
                    response.ChildrenResponse.GradeLevelID = 0;
                    response.ChildrenResponse.GradeLevelName = string.Empty;
                    continue;
                }
                response.ChildrenResponse.GradeLevelID = grade[grade.Count - 1]?.GradeLevels!.ID ?? 0;
                response.ChildrenResponse.GradeLevelName = grade[grade.Count - 1]?.GradeLevels!.Name ?? string.Empty;

                //Gan Teachers cho Class
                var teachers = await _accountService.GetTeacherByClassIdAsync(response.ClassResponse.ID);
                var teacherResponses = _mapper.Map<List<AccountResponse>>(teachers);
                response.Teachers = teacherResponses;
            }

            return Ok(responses);
        }

        [HttpGet("GetByChildID/{childId}")]
        public async Task<IActionResult> GetByChildID(Guid childId)
        {
            var allChildren = await _classChildrenService.GetByChildIdAsync(childId);
            var responses = _mapper.Map<List<GetAllClassChildrenResponse>>(allChildren);
            foreach (var response in responses)
            {
                //Gan ApplicationID cho ChildResponse
                var application = await _eaService.GetApplicatioinByChildID(response.ChildrenResponse.ID);
                response.ChildrenResponse.ApplicationID = application?.ID ?? Guid.Empty;

                //Gan GradeLevel cho ChildResponse
                var grade = await _childrenGradeService.GetChildrenGradesByChildrenIdAsync(response.ChildrenResponse.ID);
                if (grade.Count == 0)
                {
                    response.ChildrenResponse.GradeLevelID = 0;
                    response.ChildrenResponse.GradeLevelName = string.Empty;
                    continue;
                }
                response.ChildrenResponse.GradeLevelID = grade[grade.Count - 1]?.GradeLevels!.ID ?? 0;
                response.ChildrenResponse.GradeLevelName = grade[grade.Count - 1]?.GradeLevels!.Name ?? string.Empty;

                //Gan Teachers cho Class
                var teachers = await _accountService.GetTeacherByClassIdAsync(response.ClassResponse.ID);
                var teacherResponses = _mapper.Map<List<AccountResponse>>(teachers);
                response.Teachers = teacherResponses;
            }

            return Ok(responses);
        }

    }
}
