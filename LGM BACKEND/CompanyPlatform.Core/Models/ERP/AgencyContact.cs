using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.ERP
{
    [Table("tbl_AgencyContact")]
    public class AgencyContact
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("Agency")]
        public int AgencyId { get; set; }

        public virtual Agency Agency { get; set; }

        public string? PersonName { get; set; }

        public string? Designation { get; set; }

        public string? Department { get; set; }

        public string? MobileNo { get; set; }

        public string? AlternateMobileNo { get; set; }

        public string? EmailAddress { get; set; }

        public string? DocsAttachment { get; set; }

        public bool IsDeleted { get; set; } = false;
    }
}
