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
    public class StaffService: IStaffService
    {
        private readonly IStaffRepository _staffRepository;
        private readonly IClassService _classService;

        public StaffService(IStaffRepository staffRepository, IClassService classService)
        {
            _staffRepository = staffRepository;
            _classService = classService;
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

            //Check the amount of children to be assigned
            if((OldClass.MaxChildren - OldClass.Quantity) < childrenIds.Count)
            {
                throw new Exception("This class just has " + ( OldClass.MaxChildren  - OldClass.Quantity ) + " slots for children.");
            }

            var children = await _staffRepository.AssignChildrenListToClassAsync(classId, childrenIds);
            return children;

        }   
    }
}
