
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.Commonmaster
{
    [Table("Category")]
    public class Category
    {
        [Key]
        public int CategoryId { get; set; }

        [Required]
        [StringLength(50)]
        public string Code { get; set; } = string.Empty;

        [Required]
        [StringLength(150)]
        public string CategoryName { get; set; } = string.Empty;

        // Compatibility property for existing code using Name
        [NotMapped]
        public string Name
        {
            get => CategoryName;
            set => CategoryName = value;
        }

        public int? ParentCategoryId { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;

        [ForeignKey(nameof(ParentCategoryId))]
        public Category? ParentCategory { get; set; }

        public ICollection<Category> ChildCategories { get; set; }
            = new List<Category>();
    }
}
