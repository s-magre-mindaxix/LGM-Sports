using CompanyPlatform.CRM.DTO.BDEUser;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.BDEUser
{
    public interface IBDEUserService
    {
        Task<IEnumerable<BDEUserDto>> GetAllBDEUsersAsync();

        Task<BDEUserDto> GetBDEUserByIdAsync(int id);

        Task<BDEUserDto> CreateBDEUserAsync(BDEUserDto dto);

        Task<bool> UpdateBDEUserAsync(int id, BDEUserDto dto);

        Task<bool> DeleteBDEUserAsync(int id);
    }
}