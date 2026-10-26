using OfficeOpenXml.FormulaParsing.Excel.Functions.Finance.Implementations;
using CompanyPlatform.Core.Data;
using PayrollManagementAPI.DTO.SalaryComponent;
using PayrollManagementAPI.DTO;
using Microsoft.EntityFrameworkCore;

namespace PayrollManagementAPI.Services.CompanyProfile
{
    public class CompanyProfileService:ICompanyProfileService
    {
        
        private readonly ApplicationDBContext _context;

        public CompanyProfileService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CompanyProfileDTO>> GetAllCompanyProfileAsync()
        {
            return await _context.Tbl_CompanyProfiles
                .Where(c => c.IsDeleted == false)
                .Select(c => new CompanyProfileDTO
                {
                    ID = c.ID,
                    CompanyName = c.CompanyName,
                    Address = c.Address,
                    PAN = c.PAN,
                    TAN = c.TAN,
                    SignatoryName = c.SignatoryName,
                    SignatoryDesignation = c.SignatoryDesignation,
                    CittdsAddress = c.CittdsAddress,
                    IsDeleted = c.IsDeleted,
                }).ToListAsync();
        }

        public async Task<CompanyProfileDTO> GetCompanyProfileByIdAsync(int id)
        {
            var company = await _context.Tbl_CompanyProfiles
                .Where(c => c.ID == id && c.IsDeleted == false)
                .Select(c => new CompanyProfileDTO
                {
                    ID = c.ID,
                    CompanyName = c.CompanyName,
                    Address = c.Address,
                    PAN = c.PAN,
                    TAN = c.TAN,
                    SignatoryName = c.SignatoryName,
                    SignatoryDesignation = c.SignatoryDesignation,
                    CittdsAddress = c.CittdsAddress,
                    IsDeleted = c.IsDeleted,
                }).FirstOrDefaultAsync();

            return company;
        }

        public async Task<CompanyProfileDTO> CreateCompanyProfileAsync(CompanyProfileDTO dto)
        {
            var company = new CompanyPlatform.Core.Models.CompanyProfile
            {
                    CompanyName = dto.CompanyName,
                    Address = dto.Address,
                    PAN = dto.PAN,
                    TAN = dto.TAN,
                    SignatoryName = dto.SignatoryName,
                    SignatoryDesignation = dto.SignatoryDesignation,
                    CittdsAddress = dto.CittdsAddress,
                IsDeleted = false
            };

            _context.Tbl_CompanyProfiles.Add(company);
            await _context.SaveChangesAsync();

            return new CompanyProfileDTO
            {
                ID = company.ID,
                CompanyName = dto.CompanyName,
                Address = dto.Address,
                PAN = dto.PAN,
                TAN = dto.TAN,
                SignatoryName = dto.SignatoryName,
                SignatoryDesignation = dto.SignatoryDesignation,
                CittdsAddress = dto.CittdsAddress,
            };
        }

        public async Task<bool> UpdateCompanyProfiletAsync(int ID, CompanyProfileDTO dto)
        {
            var comapany = await _context.Tbl_CompanyProfiles.FindAsync(ID);
            if (comapany == null || comapany.IsDeleted) return false;

            comapany.CompanyName = dto.CompanyName;
            comapany.Address = dto.Address;
            comapany.PAN = dto.PAN;
            comapany.TAN = dto.TAN;
            comapany.SignatoryName = dto.SignatoryName;
            comapany.SignatoryDesignation = dto.SignatoryDesignation;
            comapany.CittdsAddress = dto.CittdsAddress;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeletecompanyProfileAsync(int id)
        {
            var company = await _context.Tbl_CompanyProfiles.FindAsync(id);
            if (company == null) return false;

            company.IsDeleted = true; // Soft delete
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
