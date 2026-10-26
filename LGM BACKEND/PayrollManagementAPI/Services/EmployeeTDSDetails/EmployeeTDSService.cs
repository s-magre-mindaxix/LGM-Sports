using Microsoft.EntityFrameworkCore;
using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.DTO.EmployeeTDSDetails;

namespace CompanyPlatform.Core.Services.EmployeeTDSDetails
{
    public class EmployeeTDSService : IEmployeeTDSService
    {
        private readonly ApplicationDBContext _context;

        public EmployeeTDSService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<ViewTDSDetailsDto> GetByEmployeeIdAsync(int employeeId)
        {
            var tds = await _context.EmployeeTDSDetails
                .FirstOrDefaultAsync(t => t.EmployeeID == employeeId && !t.IsDeleted);

            if (tds == null) return null;

            return new ViewTDSDetailsDto { ID = tds.ID, EmployeeID = tds.EmployeeID, TDSAmount = tds.TDSAmount };
        }

        public async Task<ViewTDSDetailsDto> UpsertAsync(UpsertTDSDetailsDto dto)
        {
            var existing = await _context.EmployeeTDSDetails
                .FirstOrDefaultAsync(t => t.EmployeeID == dto.EmployeeID && !t.IsDeleted);

            if (existing != null)
            {
                existing.TDSAmount = dto.TDSAmount;
            }
            else
            {
                existing = new Models.EmployeeTDSDetails { EmployeeID = dto.EmployeeID, TDSAmount = dto.TDSAmount };
                _context.EmployeeTDSDetails.Add(existing);
            }
            await _context.SaveChangesAsync();
            return await GetByEmployeeIdAsync(dto.EmployeeID);
        }
    }
}
