using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel;

namespace CompanyPlatform.Core.Models
{
    [Table("tbl_Holiday")]
    public class Holiday
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [Required]
        [StringLength(100)]
        public string Description { get; set; }

        [Required]
        public int Year { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; } 
    }
}
