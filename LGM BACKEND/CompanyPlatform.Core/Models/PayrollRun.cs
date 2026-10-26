using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models
{
    [Table("tbl_PayrollRun")]
    public class PayrollRun
    {
        [Key]
        public int Id { get; set; }
        public int Year { get; set; }
        public int Month { get; set; }
        public DateTime ProcessedDate { get; set; }
        public string Status { get; set; } 
        public int ProcessedByUserID { get; set; }
    }
}
