using CompanyPlatform.Core.Repository;
using CompanyPlatform.CRM.DTO.BDEUser;
using Microsoft.Extensions.Logging;

namespace CompanyPlatform.CRM.Services.BDEUser
{
    public class BDEUserService : IBDEUserService
    {
        private readonly IRepositories<CompanyPlatform.Core.Models.CRM.BDEUser> _repository;
        private readonly ILogger<BDEUserService> _logger;

        public BDEUserService(
            IRepositories<CompanyPlatform.Core.Models.CRM.BDEUser> repository,
            ILogger<BDEUserService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<BDEUserDto>> GetAllBDEUsersAsync()
        {
            var items = await _repository.GetAll();

            return items
                .Where(x => x.IsDeleted == false)
                .Select(x => new BDEUserDto
                {
                    ID = x.ID,
                    Value = x.Value,
                    Code = x.Code,
                    IsActive = x.IsActive,
                    IsDeleted = x.IsDeleted
                });
        }

        public async Task<BDEUserDto> GetBDEUserByIdAsync(int id)
        {
            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
                return null;

            return new BDEUserDto
            {
                ID = item.ID,
                Value = item.Value,
                Code = item.Code,
                IsActive = item.IsActive,
                IsDeleted = item.IsDeleted
            };
        }

        public async Task<BDEUserDto> CreateBDEUserAsync(BDEUserDto dto)
        {
            var newItem =
                new CompanyPlatform.Core.Models.CRM.BDEUser
                {
                    Value = dto.Value,
                    Code = dto.Code,
                    IsActive = dto.IsActive,
                    IsDeleted = false
                };

            await _repository.Create(newItem);

            dto.ID = newItem.ID;
            dto.IsDeleted = false;

            return dto;
        }

        public async Task<bool> UpdateBDEUserAsync(
            int id,
            BDEUserDto dto)
        {
            var item = await _repository.GetByIdAsync(id);

            if (item == null || item.IsDeleted)
                return false;

            item.Value = dto.Value;
            item.Code = dto.Code;
            item.IsActive = dto.IsActive;

            await _repository.Update(item);

            return true;
        }

        public async Task<bool> DeleteBDEUserAsync(int id)
        {
            var item = await _repository.GetByIdAsync(id);

            if (item == null)
                return false;

            item.IsDeleted = true;

            await _repository.Update(item);

            return true;
        }
    }
}