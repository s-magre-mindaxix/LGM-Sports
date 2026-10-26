
using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.DTOs.Commonmaster;
using CompanyPlatform.Core.Models.Commonmaster;
using Microsoft.EntityFrameworkCore;

namespace CompanyPlatform.Core.Services.Commonmaster
{
    public class CategoryService : ICategoryService
    {
        private readonly ApplicationDBContext _context;

        public CategoryService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<List<CategoryResponseDto>> GetAllAsync()
        {
            return await _context.Tbl_Categories
                .AsNoTracking()
                .Where(c => !c.IsDeleted)
                .Select(c => new CategoryResponseDto
                {
                    CategoryId = c.CategoryId,
                    Code = c.Code,
                    CategoryName = c.CategoryName,
                    ParentCategoryId = c.ParentCategoryId,
                    ParentCategoryName = c.ParentCategory != null &&
                                         !c.ParentCategory.IsDeleted
                        ? c.ParentCategory.CategoryName
                        : null,
                    Description = c.Description,
                    IsActive = c.IsActive,
                    IsDeleted = c.IsDeleted
                })
                .ToListAsync();
        }

        public async Task<CategoryResponseDto?> GetByIdAsync(int id)
        {
            return await _context.Tbl_Categories
                .AsNoTracking()
                .Where(c => c.CategoryId == id && !c.IsDeleted)
                .Select(c => new CategoryResponseDto
                {
                    CategoryId = c.CategoryId,
                    Code = c.Code,
                    CategoryName = c.CategoryName,
                    ParentCategoryId = c.ParentCategoryId,
                    ParentCategoryName = c.ParentCategory != null &&
                                         !c.ParentCategory.IsDeleted
                        ? c.ParentCategory.CategoryName
                        : null,
                    Description = c.Description,
                    IsActive = c.IsActive,
                    IsDeleted = c.IsDeleted
                })
                .FirstOrDefaultAsync();
        }

        public async Task<CategoryResponseDto> CreateAsync(
            CategoryCreateDto dto)
        {
            if (await _context.Tbl_Categories
                .AnyAsync(c => c.Code == dto.Code && !c.IsDeleted))
            {
                throw new InvalidOperationException(
                    "Category code already exists.");
            }

            if (dto.ParentCategoryId.HasValue &&
                !await _context.Tbl_Categories.AnyAsync(
                    c => c.CategoryId == dto.ParentCategoryId.Value &&
                         !c.IsDeleted))
            {
                throw new InvalidOperationException(
                    "Parent category not found or has been deleted.");
            }

            var category = new Category
            {
                Code = dto.Code,
                CategoryName = dto.CategoryName,
                ParentCategoryId = dto.ParentCategoryId,
                Description = dto.Description,
                IsActive = dto.IsActive,
                IsDeleted = false
            };

            _context.Tbl_Categories.Add(category);
            await _context.SaveChangesAsync();

            return (await GetByIdAsync(category.CategoryId))!;
        }

        public async Task<CategoryResponseDto?> UpdateAsync(
            int id,
            CategoryUpdateDto dto)
        {
            var category = await _context.Tbl_Categories
                .FirstOrDefaultAsync(c =>
                    c.CategoryId == id && !c.IsDeleted);

            if (category == null)
                return null;

            if (await _context.Tbl_Categories.AnyAsync(
                c => c.Code == dto.Code &&
                     c.CategoryId != id &&
                     !c.IsDeleted))
            {
                throw new InvalidOperationException(
                    "Category code already exists.");
            }

            if (dto.ParentCategoryId == id)
            {
                throw new InvalidOperationException(
                    "A category cannot be its own parent.");
            }

            if (dto.ParentCategoryId.HasValue &&
                !await _context.Tbl_Categories.AnyAsync(
                    c => c.CategoryId == dto.ParentCategoryId.Value &&
                         !c.IsDeleted))
            {
                throw new InvalidOperationException(
                    "Parent category not found or has been deleted.");
            }

            category.Code = dto.Code;
            category.CategoryName = dto.CategoryName;
            category.ParentCategoryId = dto.ParentCategoryId;
            category.Description = dto.Description;
            category.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();

            return await GetByIdAsync(id);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var category = await _context.Tbl_Categories
                .FirstOrDefaultAsync(c =>
                    c.CategoryId == id && !c.IsDeleted);

            if (category == null)
                return false;

            if (await _context.Tbl_Categories.AnyAsync(
                c => c.ParentCategoryId == id && !c.IsDeleted))
            {
                throw new InvalidOperationException(
                    "Delete child categories before deleting this category.");
            }

            category.IsDeleted = true;

            await _context.SaveChangesAsync();

            return true;
        }
    }
}
