using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CompanyPlatform.Core.Models.Inventory;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("DocumentSeries")]
    public class DocumentSeries
    {
        [Key]
        public int DocumentSeriesId { get; set; }

        [Required]
        [MaxLength(50)]
        public string DocumentType { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Prefix { get; set; } = string.Empty;

        [Required]
        public int NextNumber { get; set; } = 1;

        [Required]
        [MaxLength(20)]
        public string FinancialYear { get; set; } = string.Empty;

        [Required]
        public int BranchId { get; set; }

        [ForeignKey(nameof(BranchId))]
        public virtual Branch? Branch { get; set; }
        public bool IsDeleted { get; set; } = false;
    }
}



//using System.ComponentModel.DataAnnotations;
//using System.ComponentModel.DataAnnotations.Schema;

//namespace CompanyPlatform.Core.Models.CRM
//{
//    [Table("DocumentSeries")]
//    public class DocumentSeries
//    {
//        [Key]
//        public int DocumentSeriesId { get; set; }

//        [Required]
//        [MaxLength(50)]
//        public string DocumentType { get; set; } = string.Empty;

//        [Required]
//        [MaxLength(20)]
//        public string Prefix { get; set; } = string.Empty;

//        [Required]
//        public int NextNumber { get; set; } = 1;

//        [Required]
//        [MaxLength(20)]
//        public string FinancialYear { get; set; } = string.Empty;

//        [Required]
//        public int BranchId { get; set; }
//    }
//}