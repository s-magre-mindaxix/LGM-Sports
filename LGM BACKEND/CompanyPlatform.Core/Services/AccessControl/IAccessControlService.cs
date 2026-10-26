//using CompanyPlatform.Core.DTO.AccessControl;

//namespace CompanyPlatform.Core.Services.AccessControl
//{
//    public interface IAccessControlService
//    {
//        Task<List<AccessControlDto>> GetPermissionsByRoleAsync(string roleId);
//        Task UpdatePermissionsAsync(string roleId, List<AccessControlDto> permissions);
//    }
//}


using CompanyPlatform.Core.DTO.AccessControl;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Services.AccessControl
{
    public interface IAccessControlService
    {
        // Gets permissions for a specific Role and System (for the management UI)
        Task<List<AccessControlDto>> GetPermissionsByRoleAndSystemAsync(string roleId, string systemName);

        // Gets ALL permissions for a Role (for the login process)
        Task<List<AccessControlDto>> GetAllPermissionsByRoleAsync(string roleId);

        // Updates permissions for a specific Role and System
        Task UpdatePermissionsAsync(string roleId, string systemName, List<AccessControlDto> permissions);
        Task DeletePermissionAsync(string roleId, string systemName, string formName);


    }
}
