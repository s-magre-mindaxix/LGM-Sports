using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.ERP
{
    [Table("tbl_AgencyBankDetail")]
    public class AgencyBankDetail
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("Agency")]
        public int AgencyId { get; set; }

        public virtual Agency Agency { get; set; }

        public string? BankName { get; set; }

        public string? BankAddress { get; set; }

        public string? AccountHolderName { get; set; }

        public string? AccountNo { get; set; }

        public string? IFSCCode { get; set; }

        public string? SwiftCode { get; set; }

        public string? IBANNo { get; set; }

        public string? EmailAddress { get; set; }

        public bool IsDeleted { get; set; } = false;
    }
}
