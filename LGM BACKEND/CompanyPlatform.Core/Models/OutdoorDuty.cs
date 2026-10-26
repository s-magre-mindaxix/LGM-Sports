using System.ComponentModel.DataAnnotations;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;
using CompanyPlatform.Core.Models.CRM.Employee;

namespace CompanyPlatform.Core.Models
{
    [Table("tbl_OutdoorDuty")]
    public class OutdoorDuty
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int EmployeeID { get; set; }
        [ForeignKey("EmployeeID")]
        public virtual Employees Employee { get; set; }

        [Required]
        [Column(TypeName = "date")]
        public DateTime FromDate { get; set; }

        [Required]
        [Column(TypeName = "date")]
        public DateTime ToDate { get; set; }

        [Required]
        [StringLength(500)]
        public string Description { get; set; }

        [Required]
        public DateTime AppliedDate { get; set; }

        [Required]
        [StringLength(50)]
        public string Status { get; set; } 

        public int? ApproverID { get; set; }
        [ForeignKey("ApproverID")]
        public virtual Employees Approver { get; set; }

        public DateTime? ApprovalDate { get; set; }

        [StringLength(500)]
        public string? ManagerRemarks { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}
