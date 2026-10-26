using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models
{
    [Table("tbl_Shift")]
    public class Shift
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string ShiftName { get; set; }

        [Required]
        public TimeSpan StartTime { get; set; }

        [Required]
        public TimeSpan EndTime { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }

    }
}
