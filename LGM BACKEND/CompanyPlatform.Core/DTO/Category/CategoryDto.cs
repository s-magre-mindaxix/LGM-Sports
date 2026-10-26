
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.Core.DTOs.Commonmaster
{
    public class CategoryCreateDto
    {
        [Required]
        [StringLength(50)]
        public string Code { get; set; } = string.Empty;

        [Required]
        [StringLength(150)]
        public string CategoryName { get; set; } = string.Empty;

        public int? ParentCategoryId { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;
    }

    public class CategoryUpdateDto
    {
        [Required]
        [StringLength(50)]
        public string Code { get; set; } = string.Empty;

        [Required]
        [StringLength(150)]
        public string CategoryName { get; set; } = string.Empty;

        public int? ParentCategoryId { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        public bool IsActive { get; set; }

        public bool IsDeleted { get; set; } = false;
    }

    public class CategoryResponseDto
    {
        public int CategoryId { get; set; }

        public string Code { get; set; } = string.Empty;

        public string CategoryName { get; set; } = string.Empty;

        public int? ParentCategoryId { get; set; }

        public string? ParentCategoryName { get; set; }

        public string? Description { get; set; }

        public bool IsActive { get; set; }

        public bool IsDeleted { get; set; } = false;
    }
}
