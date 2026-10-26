
using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.DTO.CRM.Supplier;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.Core.Services.CRM;
using Microsoft.EntityFrameworkCore;

namespace CompanyPlatform.Core.Services.CRM
{
    public class SupplierService : ISupplierService
    {
        private readonly ApplicationDBContext _context;

        public SupplierService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SupplierResponseDto>> GetAllAsync()
        {
            return await _context.Set<Supplier>()
                .AsNoTracking()
                .Where(s => !s.IsDeleted)
                .Select(s => new SupplierResponseDto
                {
                    SupplierId = s.SupplierId,
                    BranchId = s.BranchId,
                    BranchName = s.Branch != null
                        ? s.Branch.BranchName : null,
                    SupplierCode = s.SupplierCode,
                    SupplierName = s.SupplierName,
                    SupplierGSTIN = s.SupplierGSTIN,
                    SupplierContact = s.SupplierContact,
                    SupplierAddress = s.SupplierAddress,
                    PaymentTerms = s.PaymentTerms,
                    IsActive = s.IsActive,
                    IsDeleted = s.IsDeleted,
                    CreatedAt = s.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<SupplierResponseDto?> GetByIdAsync(int id)
        {
            return await _context.Set<Supplier>()
                .AsNoTracking()
                .Where(s => s.SupplierId == id && !s.IsDeleted)
                .Select(s => new SupplierResponseDto
                {
                    SupplierId = s.SupplierId,
                    BranchId = s.BranchId,
                    BranchName = s.Branch != null
                        ? s.Branch.BranchName : null,
                    SupplierCode = s.SupplierCode,
                    SupplierName = s.SupplierName,
                    SupplierGSTIN = s.SupplierGSTIN,
                    SupplierContact = s.SupplierContact,
                    SupplierAddress = s.SupplierAddress,
                    PaymentTerms = s.PaymentTerms,
                    IsActive = s.IsActive,
                    IsDeleted = s.IsDeleted,
                    CreatedAt = s.CreatedAt
                })
                .FirstOrDefaultAsync();
        }

        public async Task<SupplierResponseDto> CreateAsync(
            CreateSupplierDto dto)
        {
            var branchExists = await _context.Set<
                CompanyPlatform.Core.Models.Inventory.Branch>()
                .AnyAsync(b =>
                    b.BranchId == dto.BranchId &&
                    !b.IsDeleted);

            if (!branchExists)
                throw new ArgumentException("Branch not found or deleted.");

            var codeExists = await _context.Set<Supplier>()
                .AnyAsync(s =>
                    s.SupplierCode == dto.SupplierCode &&
                    !s.IsDeleted);

            if (codeExists)
                throw new ArgumentException(
                    "Supplier code already exists.");

            var supplier = new Supplier
            {
                BranchId = dto.BranchId,
                SupplierCode = dto.SupplierCode,
                SupplierName = dto.SupplierName,
                SupplierGSTIN = dto.SupplierGSTIN,
                SupplierContact = dto.SupplierContact,
                SupplierAddress = dto.SupplierAddress,
                PaymentTerms = dto.PaymentTerms,
                IsActive = dto.IsActive,
                IsDeleted = false,
                CreatedAt = DateTime.Now
            };

            _context.Set<Supplier>().Add(supplier);
            await _context.SaveChangesAsync();

            return (await GetByIdAsync(supplier.SupplierId))!;
        }

        public async Task<SupplierResponseDto?> UpdateAsync(
            int id,
            UpdateSupplierDto dto)
        {
            var supplier = await _context.Set<Supplier>()
                .FirstOrDefaultAsync(s =>
                    s.SupplierId == id &&
                    !s.IsDeleted);

            if (supplier == null)
                return null;

            var branchExists = await _context.Set<
                CompanyPlatform.Core.Models.Inventory.Branch>()
                .AnyAsync(b =>
                    b.BranchId == dto.BranchId &&
                    !b.IsDeleted);

            if (!branchExists)
                throw new ArgumentException("Branch not found or deleted.");

            var codeExists = await _context.Set<Supplier>()
                .AnyAsync(s =>
                    s.SupplierCode == dto.SupplierCode &&
                    s.SupplierId != id &&
                    !s.IsDeleted);

            if (codeExists)
                throw new ArgumentException(
                    "Supplier code already exists.");

            supplier.BranchId = dto.BranchId;
            supplier.SupplierCode = dto.SupplierCode;
            supplier.SupplierName = dto.SupplierName;
            supplier.SupplierGSTIN = dto.SupplierGSTIN;
            supplier.SupplierContact = dto.SupplierContact;
            supplier.SupplierAddress = dto.SupplierAddress;
            supplier.PaymentTerms = dto.PaymentTerms;
            supplier.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();

            return await GetByIdAsync(id);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var supplier = await _context.Set<Supplier>()
                .FirstOrDefaultAsync(s =>
                    s.SupplierId == id &&
                    !s.IsDeleted);

            if (supplier == null)
                return false;

            supplier.IsDeleted = true;

            await _context.SaveChangesAsync();

            return true;
        }
    }
}
