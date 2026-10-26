using CompanyPlatform.Core.Repository;
using CompanyPlatform.CRM.DTO.ClientType;
using Microsoft.Extensions.Logging;

using ClientTypeModel =
    CompanyPlatform.Core.Models.CRM.Company.ClientType;

namespace CompanyPlatform.CRM.Services.ClientType
{
    public class ClientTypeService : IClientTypeService
    {
        private readonly IRepositories<ClientTypeModel> _repository;
        private readonly ILogger<ClientTypeService> _logger;

        public ClientTypeService(
            IRepositories<ClientTypeModel> repository,
            ILogger<ClientTypeService> logger)
        {
            _repository = repository;
            _logger = logger;
        }


        // =========================================================
        // Generate Next Client Type Code
        // =========================================================
        private async Task<string> GenerateNextClientTypeCodeAsync()
        {
            var clientTypes = await _repository.GetAll();

            int maxNumber = 0;

            foreach (var clientType in clientTypes)
            {
                if (string.IsNullOrWhiteSpace(
                    clientType.ClientTypeCode))
                {
                    continue;
                }

                var code =
                    clientType.ClientTypeCode.Trim();

                if (code.StartsWith(
                    "CLIENT_",
                    StringComparison.OrdinalIgnoreCase))
                {
                    var numberPart =
                        code.Substring("CLIENT_".Length);

                    if (int.TryParse(
                        numberPart,
                        out int number))
                    {
                        if (number > maxNumber)
                        {
                            maxNumber = number;
                        }
                    }
                }
            }

            int nextNumber = maxNumber + 1;

            return $"CLIENT_{nextNumber:D3}";
        }


        // =========================================================
        // GET ALL
        // =========================================================
        public async Task<IEnumerable<ClientTypeDto>>
            GetAllClientTypesAsync()
        {
            _logger.LogInformation(
                "Fetching all active client types.");

            var clientTypes =
                await _repository.GetAll();

            return clientTypes
                .Where(x => !x.IsDeleted)
                .Select(x => new ClientTypeDto
                {
                    ClientTypeId =
                        x.ClientTypeId,

                    ClientTypeName =
                        x.ClientTypeName,

                    ClientTypeCode =
                        x.ClientTypeCode,

                    IsActive =
                        x.IsActive,

                    IsDeleted =
                        x.IsDeleted
                })
                .ToList();
        }


        // =========================================================
        // GET BY ID
        // =========================================================
        public async Task<ClientTypeDto?>
            GetClientTypeByIdAsync(int id)
        {
            _logger.LogInformation(
                "Fetching Client Type with ID: {Id}",
                id);

            var clientType =
                await _repository.GetByIdAsync(id);

            if (clientType == null ||
                clientType.IsDeleted)
            {
                _logger.LogWarning(
                    "Client Type with ID {Id} not found.",
                    id);

                return null;
            }

            return new ClientTypeDto
            {
                ClientTypeId =
                    clientType.ClientTypeId,

                ClientTypeName =
                    clientType.ClientTypeName,

                ClientTypeCode =
                    clientType.ClientTypeCode,

                IsActive =
                    clientType.IsActive,

                IsDeleted =
                    clientType.IsDeleted
            };
        }


        // =========================================================
        // CREATE
        // =========================================================
        public async Task<ClientTypeDto>
            CreateClientTypeAsync(
                ClientTypeDto dto)
        {
            _logger.LogInformation(
                "Creating Client Type: {ClientTypeName}",
                dto.ClientTypeName);

            // Generate code automatically
            var generatedCode =
                await GenerateNextClientTypeCodeAsync();

            var clientType =
                new ClientTypeModel
                {
                    ClientTypeName =
                        dto.ClientTypeName,

                    ClientTypeCode =
                        generatedCode,

                    IsActive = true,

                    IsDeleted = false
                };

            await _repository.Create(clientType);

            // Return generated values
            dto.ClientTypeId =
                clientType.ClientTypeId;

            dto.ClientTypeCode =
                clientType.ClientTypeCode;

            dto.IsActive =
                clientType.IsActive;

            dto.IsDeleted =
                clientType.IsDeleted;

            return dto;
        }


        // =========================================================
        // UPDATE
        // =========================================================
        public async Task<bool>
            UpdateClientTypeAsync(
                int id,
                ClientTypeDto dto)
        {
            _logger.LogInformation(
                "Updating Client Type with ID: {Id}",
                id);

            var clientType =
                await _repository.GetByIdAsync(id);

            if (clientType == null ||
                clientType.IsDeleted)
            {
                return false;
            }

            // Update name
            clientType.ClientTypeName =
                dto.ClientTypeName;

            // Update Active / Inactive status
            clientType.IsActive =
                dto.IsActive;

            // ClientTypeCode is NOT changed
            await _repository.Update(clientType);

            return true;
        }


        // =========================================================
        // DELETE
        // =========================================================
        public async Task<bool>
            DeleteClientTypeAsync(int id)
        {
            _logger.LogInformation(
                "Deleting Client Type with ID: {Id}",
                id);

            var clientType =
                await _repository.GetByIdAsync(id);

            if (clientType == null ||
                clientType.IsDeleted)
            {
                return false;
            }

            // Soft Delete
            clientType.IsDeleted = true;

            await _repository.Update(clientType);

            return true;
        }
    }
}


//using Microsoft.Extensions.Logging;
//using CompanyPlatform.CRM.DTO.ClientType;
//using CompanyPlatform.Core.Repository;


//namespace CompanyPlatform.CRM.Services.ClientType
//{
//    public class ClientTypeService : IClientTypeService
//    {
//        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.Company.ClientType> _repository;
//        private readonly ILogger<ClientTypeService> _logger;

//        public ClientTypeService(IRepositories<CompanyPlatform.Core.Models.CRM.Company.ClientType> repository, ILogger<ClientTypeService> logger)
//        {
//            _repository = repository;
//            _logger = logger;
//        }

//        public async Task<IEnumerable<ClientTypeDto>> GetAllClientTypesAsync()
//        {
//            _logger.LogInformation("Fetching all client types.");

//            var items = await _repository.FindByCondition(x => !x.IsDeleted);

//            return items.Select(c => new ClientTypeDto
//            {
//                ClientTypeId = c.ClientTypeId,
//                ClientTypeName = c.ClientTypeName,
//                IsActive = c.IsActive
//            });
//        }

//        public async Task<ClientTypeDto> GetClientTypeByIdAsync(int id)
//        {
//            _logger.LogInformation("Fetching client type by ID: {ClientTypeId}", id);

//            var item = await _repository.GetByIdAsync(id);

//            if (item == null || item.IsDeleted)
//            {
//                _logger.LogWarning("Client type with ID: {ClientTypeId} not found.", id);

//                return null;
//            }

//            return new ClientTypeDto
//            {
//                ClientTypeId = item.ClientTypeId,
//                ClientTypeName = item.ClientTypeName,
//                IsActive = item.IsActive
//            };
//        }

//        public async Task<ClientTypeDto> CreateClientTypeAsync(ClientTypeDto dto)
//        {
//            _logger.LogInformation("Creating a new client type with name: {ClientTypeName}", dto.ClientTypeName);

//            var newItem = new CompanyPlatform.Core.Models.CRM.Company.ClientType {
//                ClientTypeName = dto.ClientTypeName,
//                IsActive = dto.IsActive,
//                IsDeleted = false
//            };

//            await _repository.Create(newItem);

//            dto.ClientTypeId = newItem.ClientTypeId;

//            _logger.LogInformation("Successfully created client type with ID: {ClientTypeId}", newItem.ClientTypeId);

//            return dto;
//        }

//        public async Task<bool> UpdateClientTypeAsync(int id, ClientTypeDto dto)
//        {
//            _logger.LogInformation("Attempting to update client type with ID: {ClientTypeId}", id);

//            var itemToUpdate = await _repository.GetByIdAsync(id);

//            if (itemToUpdate == null || itemToUpdate.IsDeleted)
//            {
//                _logger.LogWarning("Update failed. Client type with ID: {ClientTypeId} not found.", id);

//                return false;
//            }

//            itemToUpdate.ClientTypeName = dto.ClientTypeName;
//            itemToUpdate.IsActive = dto.IsActive;

//            await _repository.Update(itemToUpdate);

//            _logger.LogInformation("Successfully updated client type with ID: {ClientTypeId}", id);

//            return true;
//        }

//        public async Task<bool> DeleteClientTypeAsync(int id)
//        {
//            _logger.LogInformation("Attempting to delete client type with ID: {ClientTypeId}", id);

//            var itemToDelete = await _repository.GetByIdAsync(id);

//            if (itemToDelete == null || itemToDelete.IsDeleted)
//            {
//                _logger.LogWarning("Delete failed. Client type with ID: {ClientTypeId} not found.", id);

//                return false;
//            }

//            itemToDelete.IsDeleted = true;

//            await _repository.SoftDelete(itemToDelete);

//            _logger.LogInformation("Successfully deleted client type with ID: {ClientTypeId}", id);

//            return true;
//        }
//    }
//}