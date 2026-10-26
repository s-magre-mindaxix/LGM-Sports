using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PayrollManagementAPI.DTO.Role;
using PayrollManagementAPI.Services.Role;
using System.Linq;
using System.Threading.Tasks;

namespace PayrollManagementAPI.Controllers
{
    [Route("api/roles")]
    [ApiController]
    [Authorize]
    public class RoleController : ControllerBase
    {
        private readonly IRoleService _roleService;
        private readonly ILogger<RoleController> _logger;

        public RoleController(IRoleService roleService, ILogger<RoleController> logger)
        {
            _roleService = roleService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllRoles()
        {
            _logger.LogInformation("API endpoint called: GetAllRoles");
            var roles = await _roleService.GetAllRolesAsync();
            return Ok(roles);
        }

        [HttpPost]
        public async Task<IActionResult> CreateRole([FromBody] CreateRoleDto createRoleDto)
        {
            _logger.LogInformation("API endpoint called: CreateRole with name: {RoleName}", createRoleDto.Name);
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var (result, roleDto) = await _roleService.CreateRoleAsync(createRoleDto);

            if (result.Succeeded)
            {
                return Ok(new { message = $"Role '{roleDto.Name}' created successfully.", role = roleDto });
            }

            _logger.LogWarning("CreateRole failed for role '{RoleName}'.", createRoleDto.Name);
            return BadRequest(new { message = "Role creation failed.", errors = result.Errors.Select(e => e.Description) });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRole(string id, [FromBody] UpdateRoleDto updateRoleDto)
        {
            _logger.LogInformation("API endpoint called: UpdateRole for ID: {RoleId}", id);
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _roleService.UpdateRoleAsync(id, updateRoleDto);

            if (result.Succeeded)
            {
                return Ok(new { message = $"Role updated successfully." });
            }

            // Check if the error was "not found" to return a more specific status code
            if (result.Errors.Any(e => e.Description.Contains("not found")))
            {
                return NotFound(new { message = "Role not found.", errors = result.Errors.Select(e => e.Description) });
            }

            _logger.LogWarning("UpdateRole failed for ID: {RoleId}.", id);
            return BadRequest(new { message = "Role update failed.", errors = result.Errors.Select(e => e.Description) });
        }


        [HttpDelete("{roleName}")]
        public async Task<IActionResult> DeleteRole(string roleName)
        {
            _logger.LogInformation("API endpoint called: DeleteRole for role: {RoleName}", roleName);
            var result = await _roleService.DeleteRoleAsync(roleName);

            if (result.Succeeded)
            {
                return Ok(new { message = $"Role '{roleName}' deleted successfully." });
            }

            _logger.LogWarning("DeleteRole failed for role '{RoleName}'.", roleName);
            return BadRequest(new { message = "Role deletion failed.", errors = result.Errors.Select(e => e.Description) });
        }
    }
}