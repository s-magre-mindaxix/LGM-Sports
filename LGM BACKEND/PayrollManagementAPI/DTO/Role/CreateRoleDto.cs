using System.ComponentModel.DataAnnotations;

namespace PayrollManagementAPI.DTO.Role
{
 
        public class CreateRoleDto
        {
            [Required(ErrorMessage = "Role Name is required")]
            public string Name { get; set; }

    }

}
