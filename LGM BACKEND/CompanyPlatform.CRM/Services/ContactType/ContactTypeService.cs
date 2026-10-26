using CompanyPlatform.Core.Repository;
using CompanyPlatform.CRM.DTO.ContactTypes;
using Microsoft.Extensions.Logging;

namespace CompanyPlatform.CRM.Services.ContactType
{
    public class ContactTypeService : IContactTypeService
    {
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.ContactType> _repository;
        private readonly ILogger<ContactTypeService> _logger;

        public ContactTypeService(
            IRepositories<CompanyPlatform.Core.Models.CRM.ContactType> repository,
            ILogger<ContactTypeService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<ContactTypeDto>> GetAllContactTypesAsync()
        {
            _logger.LogInformation("Fetching all active contact types.");

            var items = await _repository.GetAll();

            return items
                .Where(x => x.IsDeleted == false)
                .Select(x => new ContactTypeDto
                {
                    ContactTypeId = x.ContactTypeId,
                    Value = x.Value,
                    Code = x.Code,
                    IsActive = x.IsActive,
                    IsDeleted = x.IsDeleted
                });
        }

        public async Task<ContactTypeDto> GetContactTypeByIdAsync(int id)
        {
            _logger.LogInformation(
                "Fetching Contact Type by ID: {ContactTypeId}", id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted == true)
            {
                _logger.LogWarning(
                    "Contact Type with ID: {ContactTypeId} not found or is deleted.",
                    id);

                return null;
            }

            return new ContactTypeDto
            {
                ContactTypeId = item.ContactTypeId,
                Value = item.Value,
                Code = item.Code,
                IsActive = item.IsActive,
                IsDeleted = item.IsDeleted
            };
        }

        public async Task<ContactTypeDto> CreateContactTypeAsync(
            ContactTypeDto dto)
        {
            _logger.LogInformation("Creating a new Contact Type.");

            var newItem =
                new CompanyPlatform.Core.Models.CRM.ContactType
                {
                    Value = dto.Value,
                    Code = dto.Code,
                    IsActive = dto.IsActive,
                    IsDeleted = false
                };

            await _repository.Create(newItem);

            dto.ContactTypeId = newItem.ContactTypeId;
            dto.IsDeleted = newItem.IsDeleted;

            _logger.LogInformation(
                "Successfully created Contact Type with ID: {ContactTypeId}",
                newItem.ContactTypeId);

            return dto;
        }

        public async Task<bool> UpdateContactTypeAsync(
            int id,
            ContactTypeDto dto)
        {
            _logger.LogInformation(
                "Attempting to update Contact Type with ID: {ContactTypeId}",
                id);

            var itemToUpdate = await _repository.GetByIdAsync(id);

            if (itemToUpdate == null || itemToUpdate.IsDeleted == true)
            {
                _logger.LogWarning(
                    "Update failed. Contact Type with ID: {ContactTypeId} not found or is deleted.",
                    id);

                return false;
            }

            itemToUpdate.Value = dto.Value;
            itemToUpdate.Code = dto.Code;
            itemToUpdate.IsActive = dto.IsActive;

            await _repository.Update(itemToUpdate);

            _logger.LogInformation(
                "Successfully updated Contact Type with ID: {ContactTypeId}",
                id);

            return true;
        }

        public async Task<bool> DeleteContactTypeAsync(int id)
        {
            _logger.LogInformation(
                "Attempting to delete Contact Type with ID: {ContactTypeId}",
                id);

            var itemToDelete = await _repository.GetByIdAsync(id);

            if (itemToDelete == null)
            {
                _logger.LogWarning(
                    "Delete failed. Contact Type with ID: {ContactTypeId} not found.",
                    id);

                return false;
            }

            itemToDelete.IsDeleted = true;

            await _repository.Update(itemToDelete);

            _logger.LogInformation(
                "Successfully deleted Contact Type with ID: {ContactTypeId}",
                id);

            return true;
        }
    }
}