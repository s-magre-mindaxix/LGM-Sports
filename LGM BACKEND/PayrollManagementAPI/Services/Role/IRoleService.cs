using Microsoft.AspNetCore.Identity;
using PayrollManagementAPI.DTO.Role;

namespace PayrollManagementAPI.Services.Role
{
    public interface IRoleService
    {
        Task<List<RoleResponseDto>> GetAllRolesAsync();
        Task<(IdentityResult, RoleResponseDto)> CreateRoleAsync(CreateRoleDto createRoleDto);
        Task<IdentityResult> DeleteRoleAsync(string roleName);
        Task<IdentityResult> UpdateRoleAsync(string id, UpdateRoleDto updateRoleDto);
    }
}
