
using CompanyPlatform.Core.DTOs.Inventory;

namespace CompanyPlatform.Core.Interfaces.Inventory
{
    public interface IBranchService
    {
        Task<IEnumerable<BranchDto>> GetAllAsync();

        Task<BranchDto?> GetByIdAsync(int id);

        Task<BranchDto> CreateAsync(BranchDto branchDto);

        Task<BranchDto?> UpdateAsync(int id, BranchDto branchDto);

        Task<bool> DeleteAsync(int id);
    }
}
