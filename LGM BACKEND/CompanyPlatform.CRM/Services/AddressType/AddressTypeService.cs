using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.AddressType;
using CompanyPlatform.Core.Repository;

namespace CompanyPlatform.CRM.Services.AddressType
{
    public class AddressTypeService : IAddressTypeService
    {
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.AddressType.AddressType> _repository;
        private readonly ILogger<AddressTypeService> _logger;

        private static readonly SemaphoreSlim _codeLock = new SemaphoreSlim(1, 1);

        public AddressTypeService(
            IRepositories<CompanyPlatform.Core.Models.CRM.AddressType.AddressType> repository,
            ILogger<AddressTypeService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        private async Task<string> GenerateNextAddressTypeCodeAsync()
        {
            await _codeLock.WaitAsync();

            try
            {
                var addressTypes = await _repository.GetAll();

                int maxNumber = 0;

                foreach (var addressType in addressTypes)
                {
                    if (string.IsNullOrWhiteSpace(addressType.AddressTypeCode))
                        continue;

                    var code = addressType.AddressTypeCode.Trim();

                    if (code.StartsWith("ADDRESS_", StringComparison.OrdinalIgnoreCase))
                    {
                        var numberPart = code.Substring(8);

                        if (int.TryParse(numberPart, out int number))
                        {
                            if (number > maxNumber)
                            {
                                maxNumber = number;
                            }
                        }
                    }
                }

                int nextNumber = maxNumber + 1;

                return $"ADDRESS_{nextNumber:D3}";
            }
            finally
            {
                _codeLock.Release();
            }
        }

        public async Task<IEnumerable<AddressTypeDto>> GetAllAddressTypesAsync()
        {
            _logger.LogInformation("Fetching all Address Type records.");

            var items = await _repository.GetAll();

            return items
                .Where(x => x.IsDeleted == false)
                .Select(x => new AddressTypeDto
                {
                    AddressTypeId = x.AddressTypeId,
                    AddressTypeName = x.AddressTypeName,
                    AddressTypeCode = x.AddressTypeCode,
                    IsActive = x.IsActive,
                    IsDeleted = x.IsDeleted
                });
        }

        public async Task<AddressTypeDto> GetAddressTypeByIdAsync(int id)
        {
            _logger.LogInformation(
                "Fetching Address Type with ID: {AddressTypeId}",
                id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
                return null;

            return new AddressTypeDto
            {
                AddressTypeId = item.AddressTypeId,
                AddressTypeName = item.AddressTypeName,
                AddressTypeCode = item.AddressTypeCode,
                IsActive = item.IsActive,
                IsDeleted = item.IsDeleted
            };
        }

        public async Task<AddressTypeDto> CreateAddressTypeAsync(
            AddressTypeDto dto)
        {
            _logger.LogInformation(
                "Creating Address Type: {AddressTypeName}",
                dto.AddressTypeName);

            string generatedCode =
                await GenerateNextAddressTypeCodeAsync();

            var addressType =
                new CompanyPlatform.Core.Models.CRM.AddressType.AddressType
                {
                    AddressTypeName = dto.AddressTypeName,
                    AddressTypeCode = generatedCode,
                    IsActive = true,
                    IsDeleted = false
                };

            await _repository.Create(addressType);

            dto.AddressTypeId = addressType.AddressTypeId;
            dto.AddressTypeCode = addressType.AddressTypeCode;
            dto.IsActive = addressType.IsActive;
            dto.IsDeleted = addressType.IsDeleted;

            return dto;
        }

        public async Task<bool> UpdateAddressTypeAsync(
            int id,
            AddressTypeDto dto)
        {
            _logger.LogInformation(
                "Updating Address Type with ID: {AddressTypeId}",
                id);

            var addressType = await _repository.GetByIdAsync(id);

            if (addressType == null || addressType.IsDeleted)
                return false;

            addressType.AddressTypeName = dto.AddressTypeName;

            if (!string.IsNullOrWhiteSpace(dto.AddressTypeCode))
            {
                addressType.AddressTypeCode = dto.AddressTypeCode;
            }

            addressType.IsActive = dto.IsActive;

            await _repository.Update(addressType);

            return true;
        }

        public async Task<bool> DeleteAddressTypeAsync(int id)
        {
            _logger.LogInformation(
                "Deleting Address Type with ID: {AddressTypeId}",
                id);

            var addressType = await _repository.GetByIdAsync(id);

            if (addressType == null || addressType.IsDeleted)
                return false;

            addressType.IsDeleted = true;

            await _repository.Update(addressType);

            return true;
        }
    }
}