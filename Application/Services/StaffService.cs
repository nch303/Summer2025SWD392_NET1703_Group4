using Application.Interfaces;
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

        public StaffService(IStaffRepository staffRepository, IClassService classService, IEARepository eARepository
            , IChildrenService childrenService, IClassChildrenService classChildrenService)
        {
            _staffRepository = staffRepository;
            _classService = classService;
            _eARepository = eARepository;
            _childrenService = childrenService;
            _classChildrenService = classChildrenService;
        }

        public async Task<List<Children>> GetNotEnrolledChildrenAsync()
        {
            // Fetch all children who are not enrolled in any class
            var notEnrolledChildren = await _staffRepository.GetNotEnrolledChildrenAsync();
            if (notEnrolledChildren == null || notEnrolledChildren.Count == 0)
            {
                throw new Exception("No children found who are not enrolled in any class.");
            }

            return notEnrolledChildren;
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

            foreach (var childId in childrenIds)
            {
                var child = await _childrenService.GetChildByIdAsync(childId);
                var application = await _eARepository.GetApplicatioinByChildID(childId);
                if ( application.GradeLevelID != classInfo?.GradeLevelID)
                {
                    throw new Exception($"Child {child!.Name} with ID {childId} does not match the grade level of the class {classInfo?.Name}.");
                }
            }


            //Check the amount of children to be assigned
            if ((OldClass.MaxChildren - OldClass.Quantity) < childrenIds.Count)
            {
                throw new Exception("This class just has " + (OldClass.MaxChildren - OldClass.Quantity) + " slots for children.");
            }

            var children = await _staffRepository.AssignChildrenListToClassAsync(classId, childrenIds);
            return children;

        }

        public async Task<bool> ReassignChildToNewClassAsync(Guid childId, int newClassId)
        {
            var assignment = await _classChildrenService.GetCurrentAssignment(childId);

            var oldClass = await _classService.GetClass(assignment.ClassID);
            var newClass = await _classService.GetClass(newClassId);

            if (oldClass == null || newClass == null)
                throw new Exception("One of the classes does not exist.");

            if (oldClass.GradeLevelID != newClass.GradeLevelID)
                throw new Exception("Classes must have the same GradeLevel.");

            var result = await _staffRepository.ReassignChildToNewClassAsync(childId, newClassId);
            return result;
        }

        public async Task<ClassTeacher> AssignTeacherToClassAsync(int classId, Guid teacherId)
        {
            //Check if the class exists
            var classToAssign = await _classService.GetClass(classId);
            if (classToAssign == null)
            {
                throw new Exception("Class not found");
            }

            // ✅ Check if the teacher is already assigned to any class
            var isAlreadyAssigned = await _staffRepository.IsTeacherAssignedToClassAsync(classId, teacherId);
            if (isAlreadyAssigned)
            {
                throw new InvalidOperationException("This teacher is already assigned to a class.");
            }

            var result = await _staffRepository.AssignTeacherToClassAsync(classId, teacherId);
            return result;
        }
    }
}
