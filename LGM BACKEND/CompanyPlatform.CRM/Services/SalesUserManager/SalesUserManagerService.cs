using CompanyPlatform.Core.Repository;
using CompanyPlatform.CRM.DTO.SalesUserManager;
using Microsoft.Extensions.Logging;

namespace CompanyPlatform.CRM.Services.SalesUserManager
{
    public class SalesUserManagerService : ISalesUserManagerService
    {
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.SalesUserManager> _repository;
        private readonly ILogger<SalesUserManagerService> _logger;

        public SalesUserManagerService(
            IRepositories<CompanyPlatform.Core.Models.CRM.SalesUserManager> repository,
            ILogger<SalesUserManagerService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<SalesUserManagerDto>> GetAllSalesUserManagersAsync()
        {
            _logger.LogInformation("Fetching all active sales user managers.");

            var items = await _repository.GetAll();

            return items
                .Where(x => x.IsDeleted == false)
                .Select(x => new SalesUserManagerDto
                {
                    ID = x.ID,
                    UserName = x.UserName,
                    Code = x.Code,
                    IsActive = x.IsActive,
                    IsDeleted = x.IsDeleted
                });
        }

        public async Task<SalesUserManagerDto> GetSalesUserManagerByIdAsync(int id)
        {
            _logger.LogInformation(
                "Fetching Sales User Manager by ID: {Id}", id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
            {
                _logger.LogWarning(
                    "Sales User Manager with ID: {Id} not found or is deleted.",
                    id);

                return null;
            }

            return new SalesUserManagerDto
            {
                ID = item.ID,
                UserName = item.UserName,
                Code = item.Code,
                IsActive = item.IsActive,
                IsDeleted = item.IsDeleted
            };
        }

        public async Task<SalesUserManagerDto> CreateSalesUserManagerAsync(
            SalesUserManagerDto dto)
        {
            _logger.LogInformation("Creating a new Sales User Manager.");

            var newItem =
                new CompanyPlatform.Core.Models.CRM.SalesUserManager
                {
                    UserName = dto.UserName,
                    Code = dto.Code,
                    IsActive = dto.IsActive,
                    IsDeleted = false
                };

            await _repository.Create(newItem);

            dto.ID = newItem.ID;
            dto.IsDeleted = newItem.IsDeleted;

            _logger.LogInformation(
                "Successfully created Sales User Manager with ID: {Id}",
                newItem.ID);

            return dto;
        }

        public async Task<bool> UpdateSalesUserManagerAsync(
            int id,
            SalesUserManagerDto dto)
        {
            _logger.LogInformation(
                "Attempting to update Sales User Manager with ID: {Id}",
                id);

            var itemToUpdate = await _repository.GetByIdAsync(id);

            if (itemToUpdate == null || itemToUpdate.IsDeleted)
            {
                _logger.LogWarning(
                    "Update failed. Sales User Manager with ID: {Id} not found or is deleted.",
                    id);

                return false;
            }

            itemToUpdate.UserName = dto.UserName;
            itemToUpdate.Code = dto.Code;
            itemToUpdate.IsActive = dto.IsActive;

            await _repository.Update(itemToUpdate);

            _logger.LogInformation(
                "Successfully updated Sales User Manager with ID: {Id}",
                id);

            return true;
        }

        public async Task<bool> DeleteSalesUserManagerAsync(int id)
        {
            _logger.LogInformation(
                "Attempting to delete Sales User Manager with ID: {Id}",
                id);

            var itemToDelete = await _repository.GetByIdAsync(id);

            if (itemToDelete == null)
            {
                _logger.LogWarning(
                    "Delete failed. Sales User Manager with ID: {Id} not found.",
                    id);

                return false;
            }

            itemToDelete.IsDeleted = true;

            await _repository.Update(itemToDelete);

            _logger.LogInformation(
                "Successfully deleted Sales User Manager with ID: {Id}",
                id);

            return true;
        }
    }
}