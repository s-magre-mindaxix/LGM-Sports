using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.Core.Models
{
    [Table("tbl_EmployeeDeclarationDocument")]
    public class EmployeeDeclarationDocument
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public int EmployeeDeclarationDetailID { get; set; }

        [ForeignKey("EmployeeDeclarationDetailID")]
        public virtual EmployeeDeclarationDetail EmployeeDeclarationDetail { get; set; }

        [Required]
        public string FileName { get; set; } 

        [Required]
        public string StoredFileName { get; set; } 

        [Required]
        public string FilePath { get; set; } 

        [Required]
        public string ContentType { get; set; } 

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    }
}
