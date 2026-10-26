using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.DTO.ProductType;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Services.ProductType
{
    public class ProductTypeService : IProductTypeService
    {
        private readonly ApplicationDBContext _context;
        public ProductTypeService(ApplicationDBContext context) => _context = context;

        public async Task<List<ProductTypeDto>> GetAllAsync()
        {
            return await _context.Tbl_ProductTypes
                .Where(x => !x.IsDeleted)
                .Select(x => new ProductTypeDto { Id = x.Id, ProductTypeName = x.ProductTypeName })
                .ToListAsync();
        }

        public async Task<ProductTypeDto> CreateAsync(ProductTypeDto dto)
        {
            var pt = new Models.Commonmaster.ProductType { ProductTypeName = dto.ProductTypeName };
            _context.Tbl_ProductTypes.Add(pt);
            await _context.SaveChangesAsync();
            dto.Id = pt.Id;
            return dto;
        }

        public async Task<bool> UpdateAsync(ProductTypeDto dto)
        {
            var pt = await _context.Tbl_ProductTypes.FindAsync(dto.Id);
            if (pt == null) return false;
            pt.ProductTypeName = dto.ProductTypeName;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var pt = await _context.Tbl_ProductTypes.FindAsync(id);
            if (pt == null) return false;
            pt.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
