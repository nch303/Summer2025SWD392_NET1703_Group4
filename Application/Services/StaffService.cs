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

        public StaffService(IStaffRepository staffRepository, IClassService classService, IEARepository eARepository
            , IChildrenService childrenService)
        {
            _staffRepository = staffRepository;
            _classService = classService;
            _eARepository = eARepository;
            _childrenService = childrenService;
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
    }
}
