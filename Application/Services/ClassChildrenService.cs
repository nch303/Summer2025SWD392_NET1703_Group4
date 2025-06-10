using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;

namespace Application.Services
{
    public class ClassChildrenService : IClassChildrenService
    {
        private readonly IClassChildrenRepository _repository;

        public ClassChildrenService(IClassChildrenRepository repository)
        {
            _repository = repository;
        }

        public async Task<ClassChildren> GetCurrentAssignment(Guid childID)
        {
            var currentAssignment = await _repository.GetCurrentAssignment(childID);
            return currentAssignment;
        }
    }
}
