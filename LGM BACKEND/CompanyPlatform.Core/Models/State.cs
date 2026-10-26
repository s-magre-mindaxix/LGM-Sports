using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models
{
    public class State
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string StateName { get; set; }

        [ForeignKey("Country")]
        public int CountryId { get; set; }

        public Country Country { get; set; }

        public bool IsDeleted { get; set; } = false;
    }
}
