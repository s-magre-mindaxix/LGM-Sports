using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.Core.Models
{
    public class Country
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string CountryName { get; set; }

        [MaxLength(10)]
        public string CountryCode { get; set; }

        public bool IsDeleted { get; set; } = false;
    }
}
