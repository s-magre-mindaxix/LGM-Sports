using Microsoft.Extensions.Logging;
using CompanyPlatform.Core.DTO.Designation;
using CompanyPlatform.Core.Repository;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DesignationModel = CompanyPlatform.Core.Models.Designation;
using CompanyPlatform.Core.Services.Designation;

namespace PayrollManagementAPI.Services.Designation
{
    public class DesignationService : IDesignationService
    {
        private readonly IRepositories<DesignationModel> _repository;
        private readonly ILogger<DesignationService> _logger;

        public DesignationService(IRepositories<DesignationModel> repository, ILogger<DesignationService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<DesignationDto>> GetAllDesignationsAsync()
        {
            _logger.LogInformation("Fetching all active designations.");
            var items = await _repository.GetAll();

            return items
                .Where(d => d.IsDeleted == false)
                .Select(d => new DesignationDto
                {
                    ID = d.ID,
                    DesignationName = d.DesignationName,
                    IsDeleted = d.IsDeleted        
                });
        }

        public async Task<DesignationDto> GetDesignationByIdAsync(int id)
        {
            _logger.LogInformation("Fetching designation by ID: {DesignationId}", id);
            var item = await _repository.GetByIdAsync(id);

            if (item == null || !item.IsDeleted == false)
            {
                _logger.LogWarning("Designation with ID: {DesignationId} not found or is inactive.", id);
                return null;
            }

            return new DesignationDto
            {
                ID = item.ID,
                DesignationName = item.DesignationName,
                IsDeleted = item.IsDeleted              
            };
        }

        public async Task<DesignationDto> CreateDesignationAsync(DesignationDto dto)
        {
            _logger.LogInformation("Creating a new designation with name: {DesignationName}", dto.DesignationName);
            var newItem = new DesignationModel
            {
                DesignationName = dto.DesignationName,
                IsDeleted = false
            };

            await _repository.Create(newItem);

            dto.ID = newItem.ID;
            dto.IsDeleted = newItem.IsDeleted;

            _logger.LogInformation("Successfully created designation with ID: {DesignationId}", newItem.ID);
            return dto;
        }

        public async Task<bool> UpdateDesignationAsync(int id, DesignationDto dto)
        {
            _logger.LogInformation("Attempting to update designation with ID: {DesignationId}", id);
            var itemToUpdate = await _repository.GetByIdAsync(id);

            if (itemToUpdate == null || !itemToUpdate.IsDeleted == false)
            {
                _logger.LogWarning("Update failed. Designation with ID: {DesignationId} not found or is inactive.", id);
                return false;
            }

            itemToUpdate.DesignationName = dto.DesignationName;
            await _repository.Update(itemToUpdate);

            _logger.LogInformation("Successfully updated designation with ID: {DesignationId}", id);
            return true;
        }

        public async Task<bool> DeleteDesignationAsync(int id)
        {
            _logger.LogInformation("Attempting to deactivate designation with ID: {DesignationId}", id);
            var itemToDelete = await _repository.GetByIdAsync(id);

            if (itemToDelete == null)
            {
                _logger.LogWarning("Deactivation failed. Designation with ID: {DesignationId} not found.", id);
                return false;
            }

            itemToDelete.IsDeleted = true;
            await _repository.Update(itemToDelete);

            _logger.LogInformation("Successfully deactivated designation with ID: {DesignationId}", id);
            return true;
        }
    }
}