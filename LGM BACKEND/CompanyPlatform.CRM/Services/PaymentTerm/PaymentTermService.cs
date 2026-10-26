using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.PaymentTerm;
using CompanyPlatform.Core.Repository;
using CompanyPlatform.Core.Models.CRM.PaymentTerm;

namespace CompanyPlatform.CRM.Services.PaymentTerm
{
    public class PaymentTermService : IPaymentTermService
    {
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.PaymentTerm.PaymentTerm> _repository;
        private readonly ILogger<PaymentTermService> _logger;

        private static readonly SemaphoreSlim _codeLock = new SemaphoreSlim(1, 1);

        public PaymentTermService(
            IRepositories<CompanyPlatform.Core.Models.CRM.PaymentTerm.PaymentTerm> repository,
            ILogger<PaymentTermService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        private async Task<string> GenerateNextPaymentTermCodeAsync()
        {
            await _codeLock.WaitAsync();

            try
            {
                var paymentTerms = await _repository.GetAll();

                int maxNumber = 0;

                foreach (var paymentTerm in paymentTerms)
                {
                    if (string.IsNullOrWhiteSpace(paymentTerm.PaymentTermCode))
                        continue;

                    var code = paymentTerm.PaymentTermCode.Trim();

                    if (code.StartsWith("PAYMENT_", StringComparison.OrdinalIgnoreCase))
                    {
                        var numPart = code.Substring(8);

                        if (int.TryParse(numPart, out int numVal))
                        {
                            if (numVal > maxNumber)
                            {
                                maxNumber = numVal;
                            }
                        }
                    }
                }

                int nextNumber = maxNumber + 1;

                return $"PAYMENT_{nextNumber:D3}";
            }
            finally
            {
                _codeLock.Release();
            }
        }

        public async Task<IEnumerable<PaymentTermDto>> GetAllPaymentTermsAsync()
        {
            _logger.LogInformation(
                "Fetching all active Payment Term records.");

            var items = await _repository.GetAll();

            return items
                .Where(x => x.IsDeleted == false)
                .Select(x => new PaymentTermDto
                {
                    PaymentTermId = x.PaymentTermId,
                    PaymentTermName = x.PaymentTermName,
                    PaymentTermCode = x.PaymentTermCode,
                    IsActive = x.IsActive,
                    IsDeleted = x.IsDeleted
                });
        }

        public async Task<PaymentTermDto> GetPaymentTermByIdAsync(int id)
        {
            _logger.LogInformation(
                "Fetching Payment Term by ID: {PaymentTermId}",
                id);

            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
            {
                _logger.LogWarning(
                    "Payment Term with ID {PaymentTermId} not found.",
                    id);

                return null;
            }

            return new PaymentTermDto
            {
                PaymentTermId = item.PaymentTermId,
                PaymentTermName = item.PaymentTermName,
                PaymentTermCode = item.PaymentTermCode,
                IsActive = item.IsActive,
                IsDeleted = item.IsDeleted
            };
        }

        public async Task<PaymentTermDto> CreatePaymentTermAsync(
            PaymentTermDto dto)
        {
            _logger.LogInformation(
                "Creating Payment Term: {PaymentTermName}",
                dto.PaymentTermName);

            string generatedCode =
                await GenerateNextPaymentTermCodeAsync();

            var paymentTerm =
                new CompanyPlatform.Core.Models.CRM.PaymentTerm.PaymentTerm
                {
                    PaymentTermName = dto.PaymentTermName,
                    PaymentTermCode = generatedCode,
                    IsActive = true,
                    IsDeleted = false
                };

            await _repository.Create(paymentTerm);

            dto.PaymentTermId = paymentTerm.PaymentTermId;
            dto.PaymentTermCode = paymentTerm.PaymentTermCode;
            dto.IsActive = paymentTerm.IsActive;
            dto.IsDeleted = paymentTerm.IsDeleted;

            return dto;
        }

        public async Task<bool> UpdatePaymentTermAsync(
            int id,
            PaymentTermDto dto)
        {
            _logger.LogInformation(
                "Updating Payment Term with ID: {PaymentTermId}",
                id);

            var paymentTerm =
                await _repository.GetByIdAsync(id);

            if (paymentTerm == null || paymentTerm.IsDeleted)
                return false;

            paymentTerm.PaymentTermName = dto.PaymentTermName;

            if (!string.IsNullOrWhiteSpace(dto.PaymentTermCode))
            {
                paymentTerm.PaymentTermCode = dto.PaymentTermCode;
            }

            paymentTerm.IsActive = dto.IsActive;

            await _repository.Update(paymentTerm);

            return true;
        }

        public async Task<bool> DeletePaymentTermAsync(int id)
        {
            _logger.LogInformation(
                "Deleting Payment Term with ID: {PaymentTermId}",
                id);

            var paymentTerm =
                await _repository.GetByIdAsync(id);

            if (paymentTerm == null)
                return false;

            paymentTerm.IsDeleted = true;

            await _repository.Update(paymentTerm);

            return true;
        }
    }
}