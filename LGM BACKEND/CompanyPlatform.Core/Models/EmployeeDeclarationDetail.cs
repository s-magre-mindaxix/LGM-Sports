using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.Core.Models
{
    [Table("tbl_EmployeeDeclarationDetail")]
    public class EmployeeDeclarationDetail
    {
        [Key] 
        public int ID { get; set; }

        [Required] 
        public int EmployeeTaxDeclarationID { get; set; }

        [ForeignKey("EmployeeTaxDeclarationID")] 
        public virtual EmployeeTaxDeclaration EmployeeTaxDeclaration { get; set; }

        [Required] 
        public string Section { get; set; } // e.g., "80C", "80D", "HRA", "24(b)" for Home Loan Interest
                                                       
        [Required] 

        [Column(TypeName = "decimal(18, 2)")] 
        public decimal DeclaredAmount { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal? ApprovedAmount { get; set; } // Nullable, as it's filled in later

        public string ApprovalStatus { get; set; } // e.g., "Pending", "Approved", "Rejected"

        public string Remarks { get; set; } // Optional remarks from the approver

        public virtual ICollection<EmployeeDeclarationDocument> Documents { get; set; } = new List<EmployeeDeclarationDocument>();
    }
}
