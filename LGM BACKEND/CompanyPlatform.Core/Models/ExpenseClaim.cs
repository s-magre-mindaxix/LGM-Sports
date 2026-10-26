using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel;
using CompanyPlatform.Core.Models.CRM.Employee;

namespace CompanyPlatform.Core.Models
{
    [Table("tbl_ExpenseClaim")]
    public class ExpenseClaim
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int EmployeeID { get; set; }
        [ForeignKey("EmployeeID")]
        public virtual Employees Employee { get; set; }

        [Required]
        public int ExpenseTypeID { get; set; }
        [ForeignKey("ExpenseTypeID")]
        public virtual ExpenseType ExpenseType { get; set; }

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal Amount { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal? ApprovedAmount { get; set; }

        [Required]
        public DateTime ClaimDate { get; set; } 

        public DateTime AppliedDate { get; set; } 

        [StringLength(500)]
        public string? Description { get; set; }

        [Required]
        [StringLength(50)]
        public string Status { get; set; } 

        public int? ApproverID { get; set; }
        [ForeignKey("ApproverID")]
        public virtual Employees Approver { get; set; }

        public DateTime? ApprovalDate { get; set; }

        [StringLength(500)]
        public string? ManagerRemarks { get; set; }

        public string? ReceiptFilePath { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}
