using Microsoft.EntityFrameworkCore;
using CompanyPlatform.Core.Data;
using PayrollManagementAPI.DTO.ProfessionalTaxSlab;
namespace PayrollManagementAPI.Services.ProfessionalTaxSlab
{
    public class ProfessionalTaxSlabService: IProfessionalTaxSlabService
    {
        private readonly ApplicationDBContext _context;

        public ProfessionalTaxSlabService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ProfessionalTaxSlabDto>> GetAllAsync()
        {
            return await _context.Tb_ProfessionalTaxSlabs
                .Where(p => !p.IsDeleted)
                .Select(p => new ProfessionalTaxSlabDto
                {
                    Id = p.Id,
                    State = p.State,
                    Gender = p.Gender,
                    MinGrossSalary = p.MinGrossSalary,
                    MaxGrossSalary = p.MaxGrossSalary,
                    TaxAmount = p.TaxAmount
                }).ToListAsync();
        }

        public async Task<ProfessionalTaxSlabDto> GetByIdAsync(int id)
        {
            var slab = await _context.Tb_ProfessionalTaxSlabs
                .Where(p => p.Id == id && !p.IsDeleted)
                .Select(p => new ProfessionalTaxSlabDto
                {
                    Id = p.Id,
                    State = p.State,
                    Gender = p.Gender,
                    MinGrossSalary = p.MinGrossSalary,
                    MaxGrossSalary = p.MaxGrossSalary,
                    TaxAmount = p.TaxAmount
                }).FirstOrDefaultAsync();
            return slab;
        }

        public async Task<ProfessionalTaxSlabDto> CreateAsync(ProfessionalTaxSlabDto dto)
        {
            var slab = new CompanyPlatform.Core.Models.ProfessionalTaxSlab
            {
                State = dto.State,
                Gender = dto.Gender,
                MinGrossSalary = dto.MinGrossSalary,
                MaxGrossSalary = dto.MaxGrossSalary,
                TaxAmount = dto.TaxAmount
            };
            _context.Tb_ProfessionalTaxSlabs.Add(slab);
            await _context.SaveChangesAsync();
            dto.Id = slab.Id;
            return dto;
        }

        public async Task<bool> UpdateAsync(int id, ProfessionalTaxSlabDto dto)
        {
            var slab = await _context.Tb_ProfessionalTaxSlabs.FindAsync(id);
            if (slab == null || slab.IsDeleted) return false;

            slab.State = dto.State;
            slab.Gender = dto.Gender;
            slab.MinGrossSalary = dto.MinGrossSalary;
            slab.MaxGrossSalary = dto.MaxGrossSalary;
            slab.TaxAmount = dto.TaxAmount;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var slab = await _context.Tb_ProfessionalTaxSlabs.FindAsync(id);
            if (slab == null) return false;

            slab.IsDeleted = true; // Soft delete
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
