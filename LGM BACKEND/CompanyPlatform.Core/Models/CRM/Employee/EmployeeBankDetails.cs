using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM.Employee
{
    [Table("tbl_EmployeeBankDetails")]
    public class EmployeeBankDetails
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public string BankName { get; set; }

        [Required]
        public string AccountNumber { get; set; }

        [Required]
        public string IFSCCode { get; set; }

        public int EmployeeID { get; set; }

        public string? BankAddress { get; set; }
        public string? SortCode { get; set; }
        public string? SwiftCode { get; set; }
        public string? IBANNo { get; set; }
        public string? AccountHolderName { get; set; }

        [ForeignKey("EmployeeID")]
        public Employees Employee { get; set; }
        [DefaultValue(false)]
        public bool IsDeleted { get; set; }

    }
}
