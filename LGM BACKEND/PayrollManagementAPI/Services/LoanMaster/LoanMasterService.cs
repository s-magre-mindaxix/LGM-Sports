using Microsoft.EntityFrameworkCore;
using CompanyPlatform.Core.Data;
using PayrollManagementAPI.DTO.LoanMaster;
using CompanyPlatform.Core.Models;

namespace PayrollManagementAPI.Services.LoanMaster
{

        public class LoanMasterService : ILoanMasterService
        {
            private readonly ApplicationDBContext _context;
            private readonly ILogger<LoanMasterService> _logger;

            public LoanMasterService(ApplicationDBContext context, ILogger<LoanMasterService> logger)
            {
                _context = context;
                _logger = logger;
            }

            public async Task<List<LoanMasterViewDto>> GetAllAsync()
            {
                _logger.LogInformation("Fetching all loan master records.");

                return await _context.Tbl_LoanMasters
                    .Where(x => x.IsDeleted == false)
                    .OrderBy(x => x.LoanTypeName)
                    .Select(x => new LoanMasterViewDto
                    {
                        ID = x.ID,
                        LoanTypeName = x.LoanTypeName,
                        Description = x.Description,
                        IsDeleted = x.IsDeleted
                    })
                    .ToListAsync();
            }

            public async Task<LoanMasterViewDto> GetByIdAsync(int id)
            {
                _logger.LogInformation("Fetching loan master with ID: {ID}", id);

                var model = await _context.Tbl_LoanMasters.FindAsync(id);
                if (model == null)
                {
                    _logger.LogWarning("Loan master ID {ID} not found.", id);
                    return null;
                }

                return new LoanMasterViewDto
                {
                    ID = model.ID,
                    LoanTypeName = model.LoanTypeName,
                    Description = model.Description,
                    IsDeleted = model.IsDeleted
                };
            }

            public async Task<LoanMasterViewDto> CreateAsync(LoanMasterCreateDto dto)
            {
                _logger.LogInformation("Creating new loan master type: {Name}", dto.LoanTypeName);

                var model = new CompanyPlatform.Core.Models.LoanMaster
                {
                    LoanTypeName = dto.LoanTypeName,
                    Description = dto.Description,
                    IsDeleted = false
                };

                _context.Tbl_LoanMasters.Add(model);
                await _context.SaveChangesAsync();

                return new LoanMasterViewDto
                {
                    ID = model.ID,
                    LoanTypeName = model.LoanTypeName,
                    Description = model.Description,
                    IsDeleted = model.IsDeleted
                };
            }

            public async Task<bool> UpdateAsync(int id, LoanMasterUpdateDto dto)
            {
                _logger.LogInformation("Updating loan master ID: {ID}", id);

                var model = await _context.Tbl_LoanMasters.FindAsync(id);

                if (model == null)
                {
                    _logger.LogWarning("Loan master ID {ID} not found for update.", id);
                    return false;
                }

                model.LoanTypeName = dto.LoanTypeName;
                model.Description = dto.Description;
                model.IsDeleted = dto.IsDeleted;

                await _context.SaveChangesAsync();
                return true;
            }

            public async Task<bool> DeleteAsync(int id)
            {
                _logger.LogInformation("Deleting loan master ID: {ID}", id);

                var model = await _context.Tbl_LoanMasters.FindAsync(id);
                if (model == null)
                {
                    _logger.LogWarning("Loan master ID {ID} not found for delete.", id);
                    return false;
                }
            model.IsDeleted= true;
                await _context.SaveChangesAsync();
            _logger.LogInformation("Successfully soft-deleted loan type with ID: {ID}", id);

            return true;
            }


    }
    }



