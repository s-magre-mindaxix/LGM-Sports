
using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.DTOs.Inventory;
using CompanyPlatform.Core.Interfaces.Inventory;
using CompanyPlatform.Core.Models.Inventory;
using Microsoft.EntityFrameworkCore;

namespace CompanyPlatform.Core.Services.Inventory
{
    public class BranchService : IBranchService
    {
        private readonly ApplicationDBContext _context;

        public BranchService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<BranchDto>> GetAllAsync()
        {
            return await _context.Branches
                .AsNoTracking()
                .Where(b => !b.IsDeleted)
                .Select(b => new BranchDto
                {
                    BranchId = b.BranchId,
                    CompanyId = b.CompanyId,
                    BranchCode = b.BranchCode,
                    BranchName = b.BranchName,
                    Address = b.Address,
                    Contact = b.Contact,
                    IsActive = b.IsActive,
                    IsDeleted = b.IsDeleted
                })
                .ToListAsync();
        }

        public async Task<BranchDto?> GetByIdAsync(int id)
        {
            return await _context.Branches
                .AsNoTracking()
                .Where(b => b.BranchId == id && !b.IsDeleted)
                .Select(b => new BranchDto
                {
                    BranchId = b.BranchId,
                    CompanyId = b.CompanyId,
                    BranchCode = b.BranchCode,
                    BranchName = b.BranchName,
                    Address = b.Address,
                    Contact = b.Contact,
                    IsActive = b.IsActive,
                    IsDeleted = b.IsDeleted
                })
                .FirstOrDefaultAsync();
        }

        public async Task<BranchDto> CreateAsync(BranchDto branchDto)
        {
            var branch = new Branch
            {
                CompanyId = branchDto.CompanyId,
                BranchCode = branchDto.BranchCode,
                BranchName = branchDto.BranchName,
                Address = branchDto.Address,
                Contact = branchDto.Contact,
                IsActive = branchDto.IsActive,
                IsDeleted = false,
                CreatedAt = DateTime.Now
            };

            _context.Branches.Add(branch);

            await _context.SaveChangesAsync();

            branchDto.BranchId = branch.BranchId;
            branchDto.IsDeleted = branch.IsDeleted;

            return branchDto;
        }

        public async Task<BranchDto?> UpdateAsync(
            int id,
            BranchDto branchDto)
        {
            var branch = await _context.Branches
                .FirstOrDefaultAsync(b => b.BranchId == id && !b.IsDeleted);

            if (branch == null)
                return null;

            branch.CompanyId = branchDto.CompanyId;
            branch.BranchCode = branchDto.BranchCode;
            branch.BranchName = branchDto.BranchName;
            branch.Address = branchDto.Address;
            branch.Contact = branchDto.Contact;
            branch.IsActive = branchDto.IsActive;

            await _context.SaveChangesAsync();

            branchDto.BranchId = branch.BranchId;
            branchDto.IsDeleted = branch.IsDeleted;

            return branchDto;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var branch = await _context.Branches
                .FirstOrDefaultAsync(b => b.BranchId == id && !b.IsDeleted);

            if (branch == null)
                return false;

            branch.IsDeleted = true;

            await _context.SaveChangesAsync();

            return true;
        }
    }
}
