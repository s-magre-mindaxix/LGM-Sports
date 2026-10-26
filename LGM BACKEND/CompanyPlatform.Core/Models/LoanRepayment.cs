using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models
{
    public class LoanRepayment
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public int LoanApplicationID { get; set; }
        [ForeignKey("LoanApplicationID")]
        public virtual LoanApplication LoanApplication { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal AmountPaid { get; set; }

        [Required]
        public DateTime PaymentDate { get; set; }

        [Required]
        [StringLength(7)] // Format: "YYYY-MM"
        public string PayrollPeriod { get; set; }
    }
}
