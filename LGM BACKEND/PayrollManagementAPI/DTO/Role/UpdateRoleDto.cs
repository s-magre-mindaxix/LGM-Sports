using System.ComponentModel.DataAnnotations;

namespace PayrollManagementAPI.DTO.Role
{
    public class UpdateRoleDto
    {
        [Required]
        public string Name { get; set; }
    }
}


