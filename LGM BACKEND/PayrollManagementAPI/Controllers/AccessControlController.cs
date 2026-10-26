using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CompanyPlatform.Core.DTO.AccessControl;
using CompanyPlatform.Core.Services.AccessControl;
using System.ComponentModel.DataAnnotations;
[Authorize(Roles = "Admin")]
[Route("api/[controller]")]
[ApiController]
public class AccessControlController : ControllerBase
{
    private readonly IAccessControlService _accessControlService;
    private readonly RoleManager<IdentityRole> _roleManager;

    public AccessControlController(IAccessControlService accessControlService, RoleManager<IdentityRole> roleManager)
    {
        _accessControlService = accessControlService;
        _roleManager = roleManager;
    }

    [HttpGet("roles")]
    public async Task<IActionResult> GetRoles()
    {
        var roles = await _roleManager.Roles.Select(r => new { r.Id, r.Name }).ToListAsync();
        return Ok(roles);
    }

    [HttpGet("systems")]
    public IActionResult GetSystems()
    {
        // This list can also be moved to appsettings.json or a database table if needed
        var systems = new List<string> { "HRMS", "CRM", "ERP" };
        return Ok(systems);
    }

    // GET: api/accesscontrol/{roleId}?systemName=HRMS
    [HttpGet("{roleId}")]
    public async Task<IActionResult> GetPermissions(string roleId, [FromQuery][Required] string systemName)
    {
        var role = await _roleManager.FindByIdAsync(roleId);
        if (role == null) return NotFound("Role not found.");

        var permissions = await _accessControlService.GetPermissionsByRoleAndSystemAsync(roleId, systemName);
        return Ok(permissions);
    }

    // PUT: api/accesscontrol/{roleId}
    [HttpPut("{roleId}")]
    public async Task<IActionResult> UpdatePermissions(string roleId, [FromBody] UpdatePermissionsRequestDto request)
    {
        var role = await _roleManager.FindByIdAsync(roleId);
        if (role == null) return NotFound("Role not found.");

        if (role.Name.Equals("Admin", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest("Cannot modify permissions for the Admin role.");
        }

        await _accessControlService.UpdatePermissionsAsync(roleId, request.SystemName, request.Permissions);
        return NoContent();
    }

    // DELETE: api/accesscontrol/{roleId}
    [HttpDelete("{roleId}")]
    public async Task<IActionResult> DeletePermission(
        string roleId,
        [FromQuery] string systemName,
        [FromQuery] string formName)
    {
        await _accessControlService.DeletePermissionAsync(roleId, systemName, formName);
        return NoContent();
    }


}