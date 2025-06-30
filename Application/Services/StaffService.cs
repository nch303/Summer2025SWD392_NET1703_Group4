using Application.Interfaces;
using AutoMapper.Configuration.Annotations;
using Domain.Entities;
using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class StaffService : IStaffService
    {
        private readonly IStaffRepository _staffRepository;
        private readonly IClassService _classService;
        private readonly IEARepository _eARepository;
        private readonly IChildrenService _childrenService;
        private readonly IClassChildrenService _classChildrenService;
        private readonly IAccountRepository _accountRepository;
        private readonly IChildrenGradeService _childrengradeService;
        private readonly IGradeLevelService _gradeLevelService;

        public StaffService(IStaffRepository staffRepository, IClassService classService, IEARepository eARepository
            , IChildrenService childrenService, IClassChildrenService classChildrenService, IAccountRepository accountRepository
            , IChildrenGradeService childrenGradeService, IGradeLevelService gradeLevelService)
        {
            _staffRepository = staffRepository;
            _classService = classService;
            _eARepository = eARepository;
            _childrenService = childrenService;
            _classChildrenService = classChildrenService;
            _accountRepository = accountRepository;
            _childrengradeService = childrenGradeService;
            _gradeLevelService = gradeLevelService;
        }

        public async Task<List<ClassChildren>> AssignChildrenListToClassAsync(int classId, List<Guid> childrenIds)
        {
            //Check if the class exists
            var OldClass = await _classService.GetClass(classId);
            if (OldClass == null)
            {
                throw new Exception("Class not found");
            }

            // Check if grade level is not matched
            var classInfo = await _classService.GetClass(classId);

            if (classInfo.EnrichmentProgramId == null)
            {
                foreach (var childId in childrenIds)
                {
                    var child = await _childrenService.GetChildByIdAsync(childId);
                    var application = await _eARepository.GetApplicatioinByChildID(childId);
                    if (application.GradeLevelID != classInfo?.GradeLevelID)
                    {
                        throw new Exception($"Child {child!.Name} with ID {childId} does not match the grade level of the class {classInfo?.Name}.");
                    }
                }
            }

            //Check the amount of children to be assigned
            if ((OldClass.MaxChildren - OldClass.Quantity) < childrenIds.Count)
            {
                throw new Exception("This class just has " + OldClass.MaxChildren + " slots for children.");
            }

            var children = await _staffRepository.AssignChildrenListToClassAsync(classId, childrenIds);

            // Update status of childrenGrade
            foreach (var childId in childrenIds)
            {
                var childrenGrades = await _childrengradeService.GetChildrenGradesByChildrenIdAsync(childId);
                childrenGrades[childrenGrades.Count - 1].Status = "Active";
            }

            return children;

        }

        public async Task<bool> ReassignChildToNewClassAsync(Guid childId, int newClassId, int oldClassId)
        {
            var assignment = await _classChildrenService.GetCurrentAssignment(childId);

            var oldClass = await _classService.GetClass(assignment.ClassID);
            var newClass = await _classService.GetClass(newClassId);

            if (oldClass == null || newClass == null)
                throw new Exception("One of the classes does not exist.");

            //Check the amount of children to be assigned
            if (oldClass.MaxChildren - oldClass.Quantity <= 0)
            {
                throw new Exception("This class just has " + oldClass.MaxChildren + " slots for children.");
            }

            if (oldClass.GradeLevelID != newClass.GradeLevelID)
                throw new Exception("Classes must have the same GradeLevel.");

            var result = await _staffRepository.ReassignChildToNewClassAsync(childId, newClassId, oldClassId);

            return result;
        }

        public async Task<ClassTeacher> AssignTeacherToClassAsync(int classId, Guid teacherId)
        {
            var classToAssign = await _classService.GetClass(classId);
            if (classToAssign == null)
                throw new Exception("Class not found");

            string academicYear = classToAssign.AcademicYear!;

            // Validate if teacher is already assigned in the same AcademicYear
            var isAlreadyAssignedInYear = await _staffRepository.IsTeacherAssignedInAcademicYearAsync(teacherId, academicYear);
            if (isAlreadyAssignedInYear)
                throw new InvalidOperationException($"This teacher is already assigned to a class in academic year {academicYear}.");

            // Check xem giáo viên có bị chia trùng lớp không
            var classesByTeacher = await _classService.GetClassesByTeacherIdAsync(teacherId);
            foreach (var existingClass in classesByTeacher)
            {
                if (existingClass.ID == classId)
                {
                    throw new InvalidOperationException("Giáo viên đã được phân công cho lớp này.");
                }
            }

            var enrichmentClasses = classesByTeacher.Where(c => c.EnrichmentProgramId != null && c.AcademicYear!.Equals(academicYear)).ToList();
            foreach (var existingClass in enrichmentClasses)
            {
                if (existingClass.ID == classId)
                {
                    throw new InvalidOperationException("Giáo viên đã được phân công cho lớp này.");
                }
            }

            // Check xem giáo viên có dạy lớp phụ mà bị trùng thời gian không
            if (classesByTeacher != null)
            {
                if (enrichmentClasses.Count > 0)
                {
                    foreach (var enrichmentClass in enrichmentClasses)
                    {
                        var timetable1 = enrichmentClass.Timetable?.Split(',').Select(s => s.Trim()).ToList() ?? new List<string>();
                        var timetable2 = classToAssign.Timetable?.Split(',').Select(s => s.Trim()).ToList() ?? new List<string>();

                        bool hasConflict = timetable1.Intersect(timetable2).Any();

                        if (hasConflict)
                        {
                            throw new InvalidOperationException($"Giáo viên có lớp bị trùng thời gian biểu.");
                        }
                    }
                }
            }

            var result = await _staffRepository.AssignTeacherToClassAsync(classId, teacherId);
            return result;
        }

        public async Task UpgradeChildren(List<Guid> childrenIds)
        {
            var newChildrenGrade = new ChildrenGrade();
            var gradeLevels = await _gradeLevelService.GetAllGradeLevelsAsync();
            if (gradeLevels.Count == 0)
            {
                throw new Exception("No grade levels found.");
            }

            var currentGrade = new GradeLevel();
            var newGradeLevel = new GradeLevel();
            
            var childrenGrades = await _staffRepository.UpgradeChildren(childrenIds);
            if (childrenGrades.Count == 0)
            {
                throw new Exception("Children are not eligible to move up to grade level.");
            }

            var childrenGradeResult = new List<ChildrenGrade>();
            for (int i = 1; i <= childrenGrades.Count; i++)
            {
                childrenGradeResult.Add(childrenGrades[childrenGrades.Count - i]);
            }
            
            var currentAcademicYear = childrenGrades[0].AcademicYear;
            
            var years = currentAcademicYear!.Split('-');

            int startYear = int.Parse(years[0]);
            int endYear = int.Parse(years[1]);

            string nextAcademicYear = $"{startYear + 1}-{endYear + 1}";
            foreach (var childGrade in childrenGradeResult)
            {
                currentGrade = await _gradeLevelService.GetGradeLevelByIdAsync(childGrade.GradeLevelID);
                switch (currentGrade!.Name)
                {
                    case "Mầm":
                        newGradeLevel = await _gradeLevelService.GetGradeLevelByNameAsync("Chồi");
                        break;
                    case "Chồi":
                        newGradeLevel = await _gradeLevelService.GetGradeLevelByNameAsync("Lá");
                        break;
                    case "Lá":
                        childGrade.Status = "Graduated";
                        await _childrengradeService.UpdateChildrenGradeAsync(childGrade);

                        //Update status of children to "Graduated"
                        var child = await _childrenService.GetChildByIdAsync(childGrade.ChildrenID);
                        if (child != null)
                        {
                            child.Status = "Graduated";
                            await _childrenService.UpdateChildAsync(child);
                        }
                        break;
                }

                if(childGrade.Status != "Graduated")
                {
                    newChildrenGrade = new ChildrenGrade
                    {
                        ChildrenID = childGrade.ChildrenID,
                        GradeLevelID = newGradeLevel.ID,
                        AcademicYear = nextAcademicYear,
                        Status = "Inactive"
                    };

                    //Update the current children grade status to "Completed"
                    childGrade.Status = "Completed";
                    await _childrengradeService.UpdateChildrenGradeAsync(childGrade);

                    await _childrengradeService.CreateChildrenGradeAsync(newChildrenGrade);
                }
            }
        }
    }
}
