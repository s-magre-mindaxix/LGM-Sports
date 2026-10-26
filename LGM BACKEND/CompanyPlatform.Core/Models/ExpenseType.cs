using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models
{
    [Table("tbl_ExpenseType")]
    public class ExpenseType
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string ExpenseTypeName { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}
