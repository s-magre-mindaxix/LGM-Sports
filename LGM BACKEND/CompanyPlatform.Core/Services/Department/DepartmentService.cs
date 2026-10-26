using Microsoft.Extensions.Logging;
using CompanyPlatform.Core.DTO.Department;
using CompanyPlatform.Core.Repository;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CompanyPlatform.Core.Services.Department;

namespace PayrollManagementAPI.Services.Department
{
    public class DepartmentService : IDepartmentService
    {
        private readonly IRepositories<CompanyPlatform.Core.Models.Department> _repository;
        private readonly ILogger<DepartmentService> _logger;

        public DepartmentService(IRepositories<CompanyPlatform.Core.Models.Department> repository, ILogger<DepartmentService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<DepartmentDto>> GetAllDepartmentsAsync()
        {
            _logger.LogInformation("Fetching all active departments.");
            var items = await _repository.GetAll();

            // Assuming the Department model has an IsActive property
            return items
                .Where(d => d.IsDeleted==false)
                .Select(d => new DepartmentDto { ID = d.ID, DepartmentName = d.DepartmentName, IsDeleted = d.IsDeleted });
        }

        public async Task<DepartmentDto> GetDepartmentByIdAsync(int id)
        {
            _logger.LogInformation("Fetching department by ID: {DepartmentId}", id);
            var item = await _repository.GetByIdAsync(id);

            // Return item only if it exists and is active
            if (item == null || !item.IsDeleted == false)
            {
                _logger.LogWarning("Department with ID: {DepartmentId} not found or is inactive.", id);
                return null;
            }

            return new DepartmentDto { ID = item.ID, DepartmentName = item.DepartmentName, IsDeleted = item.IsDeleted };
        }

        public async Task<DepartmentDto> CreateDepartmentAsync(DepartmentDto dto)
        {
            _logger.LogInformation("Creating a new department with name: {DepartmentName}", dto.DepartmentName);
            var newItem = new CompanyPlatform.Core.Models.Department
            {
                DepartmentName = dto.DepartmentName,
                IsDeleted = false 
            };

            await _repository.Create(newItem);

            dto.ID = newItem.ID;
            dto.IsDeleted = newItem.IsDeleted;

            _logger.LogInformation("Successfully created department with ID: {DepartmentId}", newItem.ID);
            return dto;
        }

        public async Task<bool> UpdateDepartmentAsync(int id, DepartmentDto dto)
        {
            _logger.LogInformation("Attempting to update department with ID: {DepartmentId}", id);
            var itemToUpdate = await _repository.GetByIdAsync(id);

            if (itemToUpdate == null || !itemToUpdate.IsDeleted == false)
            {
                _logger.LogWarning("Update failed. Department with ID: {DepartmentId} not found or is inactive.", id);
                return false;
            }

            itemToUpdate.DepartmentName = dto.DepartmentName;
            await _repository.Update(itemToUpdate);

            _logger.LogInformation("Successfully updated department with ID: {DepartmentId}", id);
            return true;
        }

        public async Task<bool> DeleteDepartmentAsync(int id)
        {
            _logger.LogInformation("Attempting to deactivate department with ID: {DepartmentId}", id);
            var itemToDelete = await _repository.GetByIdAsync(id);

            if (itemToDelete == null)
            {
                _logger.LogWarning("Deactivation failed. Department with ID: {DepartmentId} not found.", id);
                return false;
            }

            // Soft delete: Mark as inactive instead of deleting
            itemToDelete.IsDeleted = true;
            await _repository.Update(itemToDelete);

            _logger.LogInformation("Successfully deactivated department with ID: {DepartmentId}", id);
            return true;
        }
    }
}