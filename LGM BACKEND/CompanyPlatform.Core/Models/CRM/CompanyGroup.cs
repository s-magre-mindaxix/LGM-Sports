using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM
{
    public class CompanyGroup
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(150)]
        public string CompanyGroupName { get; set; }

        public bool IsDeleted { get; set; } = false;
    }
}
