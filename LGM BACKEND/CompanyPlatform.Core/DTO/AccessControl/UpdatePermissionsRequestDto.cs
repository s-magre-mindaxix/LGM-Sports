using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.DTO.AccessControl
{
    public class UpdatePermissionsRequestDto
    {
        [Required]
        public string SystemName { get; set; }

        [Required]
        public List<AccessControlDto> Permissions { get; set; }
    }
}
