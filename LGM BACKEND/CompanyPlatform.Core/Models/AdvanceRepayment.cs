using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CompanyPlatform.Core.Models.CRM.Employee;
using Microsoft.EntityFrameworkCore;

namespace CompanyPlatform.Core.Models
{
    [Table("tbl_AdvanceRepayment")]
    public class AdvanceRepayment
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public int AdvanceID { get; set; }
        [ForeignKey("AdvanceID")]
        public Advance Advance { get; set; }

        [Required]
        [Precision(18, 2)]
        public decimal RepaymentAmount { get; set; }

        [Required]
        public DateTime RepaymentDate { get; set; }

        [MaxLength(500)]
        public string Notes { get; set; }

        [Required]
        public int CreatedByEmployeeId { get; set; }
        [ForeignKey("CreatedByEmployeeId")]
        public Employees CreatedByEmployee { get; set; }
    }
}