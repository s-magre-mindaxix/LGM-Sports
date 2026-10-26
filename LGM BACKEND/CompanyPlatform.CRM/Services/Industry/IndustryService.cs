using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.Industry;
using CompanyPlatform.Core.Repository;
using IndustryModel = CompanyPlatform.Core.Models.CRM.Company.Industry;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.Industry
{
    public class IndustryService : IIndustryService
    {
        private readonly IRepositories<IndustryModel> _repository;
        private readonly ILogger<IndustryService> _logger;

        public IndustryService(
            IRepositories<IndustryModel> repository,
            ILogger<IndustryService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        // Generate next Industry Code
        private async Task<string> GenerateNextIndustryCodeAsync()
        {
            var industries = await _repository.GetAll();

            int maxNumber = 0;

            foreach (var industry in industries)
            {
                if (string.IsNullOrWhiteSpace(industry.IndustryCode))
                    continue;

                var code = industry.IndustryCode.Trim();

                if (code.StartsWith(
                    "INDUSTRY_",
                    StringComparison.OrdinalIgnoreCase))
                {
                    var numberPart =
                        code.Substring("INDUSTRY_".Length);

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

            return $"INDUSTRY_{nextNumber:D3}";
        }


        // GET ALL
        public async Task<IEnumerable<IndustryDto>>
            GetAllIndustriesAsync()
        {
            _logger.LogInformation(
                "Fetching all active industries.");

            var industries = await _repository.GetAll();

            return industries
                .Where(x => !x.IsDeleted)
                .Select(x => new IndustryDto
                {
                    IndustryId = x.IndustryId,
                    IndustryName = x.IndustryName,
                    IndustryCode = x.IndustryCode,
                    IsActive = x.IsActive,
                    IsDeleted = x.IsDeleted
                })
                .ToList();
        }


        // GET BY ID
        public async Task<IndustryDto>
            GetIndustryByIdAsync(int id)
        {
            _logger.LogInformation(
                "Fetching Industry with ID: {IndustryId}",
                id);

            var industry =
                await _repository.GetByIdAsync(id);

            if (industry == null || industry.IsDeleted)
            {
                _logger.LogWarning(
                    "Industry with ID {IndustryId} not found.",
                    id);

                return null;
            }

            return new IndustryDto
            {
                IndustryId = industry.IndustryId,
                IndustryName = industry.IndustryName,
                IndustryCode = industry.IndustryCode,
                IsActive = industry.IsActive,
                IsDeleted = industry.IsDeleted
            };
        }


        // CREATE
        public async Task<IndustryDto>
            CreateIndustryAsync(IndustryDto dto)
        {
            _logger.LogInformation(
                "Creating Industry: {IndustryName}",
                dto.IndustryName);

            // Generate code automatically
            string generatedCode =
                await GenerateNextIndustryCodeAsync();

            var industry = new IndustryModel
            {
                IndustryName = dto.IndustryName,
                IndustryCode = generatedCode,
                IsActive = true,
                IsDeleted = false
            };

            await _repository.Create(industry);

            dto.IndustryId = industry.IndustryId;
            dto.IndustryCode = industry.IndustryCode;
            dto.IsActive = industry.IsActive;
            dto.IsDeleted = industry.IsDeleted;

            return dto;
        }


        // UPDATE
        public async Task<bool>
            UpdateIndustryAsync(
                int id,
                IndustryDto dto)
        {
            _logger.LogInformation(
                "Updating Industry with ID: {IndustryId}",
                id);

            var industry =
                await _repository.GetByIdAsync(id);

            if (industry == null || industry.IsDeleted)
                return false;

            industry.IndustryName =
                dto.IndustryName;

            // Allow Active / Inactive from UI
            industry.IsActive =
                dto.IsActive;

            // IndustryCode is not changed
            await _repository.Update(industry);

            return true;
        }


        // DELETE
        public async Task<bool>
            DeleteIndustryAsync(int id)
        {
            _logger.LogInformation(
                "Deleting Industry with ID: {IndustryId}",
                id);

            var industry =
                await _repository.GetByIdAsync(id);

            if (industry == null || industry.IsDeleted)
                return false;

            // Soft delete
            industry.IsDeleted = true;

            await _repository.Update(industry);

            return true;
        }
    }
}