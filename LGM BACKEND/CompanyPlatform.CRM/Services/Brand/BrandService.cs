
using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.DTOs.Inventory;
using CompanyPlatform.Core.Interfaces.Inventory;
using CompanyPlatform.Core.Models.Inventory;
using Microsoft.EntityFrameworkCore;

namespace CompanyPlatform.Core.Services.Inventory
{
    public class BrandService : IBrandService
    {
        private readonly ApplicationDBContext _context;

        public BrandService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<BrandDto>> GetAllAsync()
        {
            return await _context.Brands
                .AsNoTracking()
                .Where(b => !b.IsDeleted)
                .Select(b => new BrandDto
                {
                    BrandId = b.BrandId,
                    BrandCode = b.BrandCode,
                    BrandName = b.BrandName,
                    Description = b.Description,
                    IsActive = b.IsActive,
                    IsDeleted = b.IsDeleted
                })
                .ToListAsync();
        }

        public async Task<BrandDto?> GetByIdAsync(int id)
        {
            return await _context.Brands
                .AsNoTracking()
                .Where(b => b.BrandId == id && !b.IsDeleted)
                .Select(b => new BrandDto
                {
                    BrandId = b.BrandId,
                    BrandCode = b.BrandCode,
                    BrandName = b.BrandName,
                    Description = b.Description,
                    IsActive = b.IsActive,
                    IsDeleted = b.IsDeleted
                })
                .FirstOrDefaultAsync();
        }

        public async Task<BrandDto> CreateAsync(BrandDto brandDto)
        {
            var brand = new Brand
            {
                BrandCode = brandDto.BrandCode,
                BrandName = brandDto.BrandName,
                Description = brandDto.Description,
                IsActive = brandDto.IsActive,
                IsDeleted = false
            };

            _context.Brands.Add(brand);

            await _context.SaveChangesAsync();

            brandDto.BrandId = brand.BrandId;
            brandDto.IsDeleted = brand.IsDeleted;

            return brandDto;
        }

        public async Task<BrandDto?> UpdateAsync(
            int id,
            BrandDto brandDto)
        {
            var brand = await _context.Brands
                .FirstOrDefaultAsync(b =>
                    b.BrandId == id && !b.IsDeleted);

            if (brand == null)
                return null;

            brand.BrandCode = brandDto.BrandCode;
            brand.BrandName = brandDto.BrandName;
            brand.Description = brandDto.Description;
            brand.IsActive = brandDto.IsActive;

            await _context.SaveChangesAsync();

            brandDto.BrandId = brand.BrandId;
            brandDto.IsDeleted = brand.IsDeleted;

            return brandDto;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var brand = await _context.Brands
                .FirstOrDefaultAsync(b =>
                    b.BrandId == id && !b.IsDeleted);

            if (brand == null)
                return false;

            brand.IsDeleted = true;

            await _context.SaveChangesAsync();

            return true;
        }
    }
}
