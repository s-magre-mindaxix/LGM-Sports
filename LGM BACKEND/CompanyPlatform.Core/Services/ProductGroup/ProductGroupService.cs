using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.DTO.ProductGroup;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Services.ProductGroup
{
    public class ProductGroupService : IProductGroupService
    {
        private readonly ApplicationDBContext _context;
        public ProductGroupService(ApplicationDBContext context) => _context = context;

        public async Task<List<ProductGroupDto>> GetAllAsync()
        {
            return await _context.Tbl_ProductGroups
                .Where(x => !x.IsDeleted)
                .Select(x => new ProductGroupDto { Id = x.Id, GroupName = x.GroupName })
                .ToListAsync();
        }

        public async Task<ProductGroupDto> CreateAsync(ProductGroupDto dto)
        {
            var pg = new Models.Commonmaster.ProductGroup { GroupName = dto.GroupName };
            _context.Tbl_ProductGroups.Add(pg);
            await _context.SaveChangesAsync();
            dto.Id = pg.Id;
            return dto;
        }

        public async Task<bool> UpdateAsync(ProductGroupDto dto)
        {
            var pg = await _context.Tbl_ProductGroups.FindAsync(dto.Id);
            if (pg == null) return false;
            pg.GroupName = dto.GroupName;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var pg = await _context.Tbl_ProductGroups.FindAsync(id);
            if (pg == null) return false;
            pg.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
