using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models
{
    [Table("tbl_MonthlySalaryComponentDetail")]
    public class MonthlySalaryComponentDetail
    {
        [Key]
        public long Id { get; set; }

        public int MonthlySalaryRecordID { get; set; }
        [ForeignKey("MonthlySalaryRecordID")]
        public virtual MonthlySalaryRecord MonthlySalaryRecord { get; set; }

        public string ComponentName { get; set; }
        public string ComponentType { get; set; } // "Earning" or "Deduction"

        [Column(TypeName = "decimal(18, 2)")]
        public decimal Amount { get; set; }
    }
}
