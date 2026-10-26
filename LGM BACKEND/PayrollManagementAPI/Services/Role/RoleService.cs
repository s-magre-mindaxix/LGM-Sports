using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PayrollManagementAPI.DTO.Role;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PayrollManagementAPI.Services.Role
{
    public class RoleService : IRoleService
    {
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ILogger<RoleService> _logger;

        public RoleService(RoleManager<IdentityRole> roleManager, ILogger<RoleService> logger)
        {
            _roleManager = roleManager;
            _logger = logger;
        }

        public async Task<List<RoleResponseDto>> GetAllRolesAsync()
        {
            _logger.LogInformation("Fetching all roles from the database.");
            var roles = await _roleManager.Roles
                .Select(r => new RoleResponseDto
                {
                    Id = r.Id,
                    Name = r.Name
                })
                .ToListAsync();
            return roles;
        }

        public async Task<(IdentityResult, RoleResponseDto)> CreateRoleAsync(CreateRoleDto createRoleDto)
        {
            _logger.LogInformation("Attempting to create a new role with name: {RoleName}", createRoleDto.Name);

            if (await _roleManager.RoleExistsAsync(createRoleDto.Name))
            {
                var error = new IdentityError { Description = $"Role '{createRoleDto.Name}' already exists." };
                _logger.LogWarning("Role creation failed. Role '{RoleName}' already exists.", createRoleDto.Name);
                return (IdentityResult.Failed(error), null);
            }

            var newRole = new IdentityRole(createRoleDto.Name);
            var result = await _roleManager.CreateAsync(newRole);

            if (!result.Succeeded)
            {
                _logger.LogError("Failed to create role '{RoleName}'. Errors: {Errors}",
                    createRoleDto.Name, string.Join(", ", result.Errors.Select(e => e.Description)));
                return (result, null);
            }

            _logger.LogInformation("Successfully created role '{RoleName}' with ID: {RoleId}", newRole.Name, newRole.Id);
            var roleDto = new RoleResponseDto { Id = newRole.Id, Name = newRole.Name };
            return (result, roleDto);
        }

        public async Task<IdentityResult> DeleteRoleAsync(string roleName)
        {
            _logger.LogInformation("Attempting to delete role: {RoleName}", roleName);
            var role = await _roleManager.FindByNameAsync(roleName);

            if (role == null)
            {
                var error = new IdentityError { Description = $"Role '{roleName}' not found." };
                _logger.LogWarning("Role deletion failed. Role '{RoleName}' not found.", roleName);
                return IdentityResult.Failed(error);
            }

            var result = await _roleManager.DeleteAsync(role);

            if (result.Succeeded)
            {
                _logger.LogInformation("Successfully deleted role '{RoleName}'.", roleName);
            }
            else
            {
                _logger.LogError("Failed to delete role '{RoleName}'. Errors: {Errors}",
                    roleName, string.Join(", ", result.Errors.Select(e => e.Description)));
            }

            return result;
        }
        public async Task<IdentityResult> UpdateRoleAsync(string id, UpdateRoleDto updateRoleDto)
        {
            _logger.LogInformation("Attempting to update role with ID: {RoleId}", id);
            var role = await _roleManager.FindByIdAsync(id);

            if (role == null)
            {
                var error = new IdentityError { Description = $"Role with ID '{id}' not found." };
                _logger.LogWarning("Role update failed. Role with ID '{RoleId}' not found.", id);
                return IdentityResult.Failed(error);
            }

            // Check if the new role name is already taken by another role
            var existingRoleWithNewName = await _roleManager.FindByNameAsync(updateRoleDto.Name);
            if (existingRoleWithNewName != null && existingRoleWithNewName.Id != id)
            {
                var error = new IdentityError { Description = $"The role name '{updateRoleDto.Name}' is already taken." };
                _logger.LogWarning("Role update failed. The name '{RoleName}' is already taken.", updateRoleDto.Name);
                return IdentityResult.Failed(error);
            }

            role.Name = updateRoleDto.Name;
            var result = await _roleManager.UpdateAsync(role);

            if (result.Succeeded)
            {
                _logger.LogInformation("Successfully updated role with ID: {RoleId}", id);
            }
            else
            {
                _logger.LogError("Failed to update role with ID: {RoleId}. Errors: {Errors}",
                    id, string.Join(", ", result.Errors.Select(e => e.Description)));
            }

            return result;
        }
    }
}