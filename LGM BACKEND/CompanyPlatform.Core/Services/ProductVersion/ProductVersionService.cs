using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.DTO.ProductVersion;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Services.ProductVersion
{
    public class ProductVersionService : IProductVersionService
    {
        private readonly ApplicationDBContext _context;
        public ProductVersionService(ApplicationDBContext context) => _context = context;

        public async Task<List<ProductVersionDto>> GetAllAsync()
        {
            return await _context.Tbl_ProductVersions
                .Where(x => !x.IsDeleted)
                .Select(x => new ProductVersionDto { Id = x.Id, VersionName = x.VersionName })
                .ToListAsync();
        }

        public async Task<ProductVersionDto> CreateAsync(ProductVersionDto dto)
        {
            var version = new Models.Commonmaster.ProductVersion { VersionName = dto.VersionName };
            _context.Tbl_ProductVersions.Add(version);
            await _context.SaveChangesAsync();
            dto.Id = version.Id;
            return dto;
        }

        public async Task<bool> UpdateAsync(ProductVersionDto dto)
        {
            var version = await _context.Tbl_ProductVersions.FindAsync(dto.Id);
            if (version == null) return false;
            version.VersionName = dto.VersionName;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var version = await _context.Tbl_ProductVersions.FindAsync(id);
            if (version == null) return false;
            version.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
