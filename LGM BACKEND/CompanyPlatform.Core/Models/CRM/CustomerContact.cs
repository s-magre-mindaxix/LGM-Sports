using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("tbl_CustomerContact")]
    public class CustomerContact
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("Customer")]
        public int CustomerId { get; set; }
        public virtual Customer Customer { get; set; }

        [Required]
        public string ResPersonName { get; set; }

        // Relationship with Department
        //[ForeignKey("Department")]
        //public int DepartmentId { get; set; }
        //public virtual Department Department { get; set; }
        public string DepartmentName { get; set; }

        public string Designation { get; set; }

        public string MobileNo { get; set; }

        public string AltMobileNo { get; set; }

        [EmailAddress]
        public string EmailAddress { get; set; }

        [EmailAddress]
        public string AltEmailAddress { get; set; }

        public bool IsDeleted { get; set; } = false;
    }
}
