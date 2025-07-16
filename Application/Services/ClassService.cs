using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.DTOs.Request;
using Application.Interfaces;
using AutoMapper;
using Domain.Entities;
using Domain.Interfaces;

namespace Application.Services
{
    public class ClassService : IClassService
    {
        private readonly IClassRepository _classRepository;
        private readonly IStaffRepository _staffRepository;
        private readonly IClassChildrenRepository _classChildrenRepository;
        private readonly IEnrichProgramService _enrichProgramService;
        private readonly IChildrenRepository _childrenRepository;

        public ClassService(IClassRepository classRepository, IStaffRepository staffRepository
            , IClassChildrenRepository classChildrenRepository, IEnrichProgramService enrichProgramService
            , IChildrenRepository childrenRepository)
        {
            _classRepository = classRepository;
            _staffRepository = staffRepository;
            _classChildrenRepository = classChildrenRepository;
            _enrichProgramService = enrichProgramService;
            _childrenRepository = childrenRepository;
        }

        public async Task<Class> CreatClass(Class room)
        {
            if (string.IsNullOrWhiteSpace(room.Name))
                throw new ArgumentException("Class name is required.");

            return await _classRepository.CreatClass(room);
        }

        public async Task<Class> DeleteClass(int classId)
        {
            return await _classRepository.DeleteClass(classId);
        }

        public async Task<Class> RestoreClass(int classId)
        {
            return await _classRepository.RestoreClass(classId);
        }

        public async Task<Class> UpdateClass(int classId, Class room)
        {
            return await _classRepository.UpdateClass(classId, room);
        }

        public async Task<Class> GetClass(int classId)
        {
            var room = await _classRepository.GetClass(classId);
            if (room == null)
                throw new Exception("Class not found.");
            return room;
        }

        public async Task<List<Class>> GetAllClass()
        {
            return await _classRepository.GetAllClass();
        }

        public async Task<List<Class>> GetClassByName(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                return new List<Class>(); // Return empty result

            return await _classRepository.GetClassByName(name);
        }

        public async Task<List<Class>> GetAllSortedClass(string type, string trend)
        {
            if (string.IsNullOrWhiteSpace(type)) type = "name";
            if (string.IsNullOrWhiteSpace(trend)) trend = "asc";

            return await _classRepository.GetAllSortedClass(type, trend);
        }

        public async Task<List<ClassChildren>> AssignChildIntoEnrichmentClass(int enrichmentId, List<Guid> childrenIds)
        {
            var classes = GetByEnrichmentIdAsync(enrichmentId).Result;
            if (classes.Count == 0)
            {
                throw new Exception("No classes found for the specified enrichment program.");
            }
            var classchildren = new List<ClassChildren>();
            foreach (var classItem in classes)
            {
                if (classItem.MaxChildren >= classItem.Quantity + childrenIds.Count)
                {
                    foreach (var childId in childrenIds)
                    {

                        //Get child information
                        var child = await _childrenRepository.GetChildByIdAsync(childId);

                        //Get academic year
                        string academicYear = "";
                        var today = DateTime.Now.Date;
                        var year = today.Year;

                        // So sánh với ngày 1/6 của năm hiện tại
                        var schoolStartDate = new DateTime(year, 6, 1);

                        if (today < schoolStartDate)
                        {
                            academicYear = (year - 1).ToString() + "-" + year.ToString();
                        }
                        else
                        {
                            academicYear = year.ToString() + "-" + (year + 1).ToString();
                        }

                        // Check a child must be enrolled in at only one enrichment program in a academic year
                        var classChildren = await _classChildrenRepository.GetByChildIdAsync(childId);
                        if (classChildren.Count != 0)
                        {
                            var enrichmentClassChildren = classChildren.FindAll(x => x.Classes!.AcademicYear == academicYear && x.Classes.EnrichmentProgramId != null);
                            if (enrichmentClassChildren.Count > 1)
                            {
                                throw new Exception("Your child " + child.Name + " must be enrolled in at only one enrichment program in a academic year");
                            }

                            var existingProgram = classChildren.Find(x => x.Classes!.EnrichmentProgramId == enrichmentId);
                            if (existingProgram != null)
                            {
                                throw new Exception("Your child " + child.Name + " is already enrolled in this enrichment program. If your child finished this program, please choose the higher level or a new pprogram.");
                            }
                        }

                        // Check a child must be completed the previous level before enrolling in a new enrichment program
                        var newEnrichment = await _enrichProgramService.GetProgramByIdAsync(enrichmentId);
                        if (newEnrichment.Level > 1)
                        {
                            var enrichmentClassChildrenUsed = classChildren.FindAll(x => x.Classes!.EnrichmentProgramId != null);

                            var passedEnrichment = enrichmentClassChildrenUsed.FindAll(x => x.Classes!.EnrichmentPrograms!.TypeProgramID == newEnrichment.TypeProgramID
                                                                  && x.Classes.EnrichmentPrograms!.Level == newEnrichment.Level - 1 && x.Status == "Completed");
                            if (passedEnrichment.Count == 0)
                            {
                                throw new Exception("A child must be completed the previous level before enrolling in a new enrichment program.");
                            }
                        }
                    }


                    classchildren = await _staffRepository.AssignChildrenListToClassAsync(classItem.ID, childrenIds);
                    classItem.Quantity += childrenIds.Count;
                    await _classRepository.UpdateClass(classItem.ID, classItem);
                }
            }

            //Check if class if full
            if (classes[classes.Count - 1].MaxChildren < classes[classes.Count - 1].Quantity + childrenIds.Count)
            {
                throw new Exception("Class is full, cannot assign more children.");
            }

            return classchildren;
        }

        public async Task<List<Class>> GetByEnrichmentIdAsync(int enrichmentId)
        {
            return await _classRepository.GetByEnrichmentIdAsync(enrichmentId);
        }

        public async Task<List<Class>> GetClassesByChildIdAsync(Guid childId)
        {
            return await _classRepository.GetClassesByChildIdAsync(childId);
        }

        public async Task<Class> OpenClass(int classId)
        {
            var room = await _classRepository.GetClass(classId);
            if (room == null)
                throw new Exception("Class not found.");
            if (room.Status == "Available")
                throw new Exception("Class is already open.");
            return await _classRepository.OpenClass(classId);
        }

        public async Task<List<Class>> GetClassesByTeacherIdAsync(Guid teacherId)
        {
            return await _classRepository.GetClassesByTeacherIdAsync(teacherId);
        }

        public async Task<List<Class>> GetClassesToAssignAsync()
        {
            var classes = await _classRepository.GetAllClass();

            //Get academic year
            string academicYear = "";

            var today = DateTime.Now.Date;
            var year = today.Year;

            // So sánh với ngày 1/6 của năm hiện tại
            var schoolStartDate = new DateTime(year, 6, 1);

            if (today < schoolStartDate)
            {
                academicYear = (year - 1).ToString() + "-" + year.ToString();
            }
            else
            {
                academicYear = year.ToString() + "-" + (year + 1).ToString();
            }

            var classesResult = classes.Where(c => c.Status == "Unavailable" && c.AcademicYear.Equals(academicYear)).ToList();
            return classesResult;
        }

        public async Task<Class> FinishClass(int classId)
        {
            var room = await _classRepository.GetClass(classId);
            if (room == null)
                throw new Exception("Class not found.");
            if (room.Status == "Finished")
                throw new Exception("Class is already finished.");
            return await _classRepository.FinishClass(classId);
        }
    }
}