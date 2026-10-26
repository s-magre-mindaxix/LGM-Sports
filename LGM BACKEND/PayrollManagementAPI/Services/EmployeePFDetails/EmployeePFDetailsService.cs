using Microsoft.EntityFrameworkCore;
using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.DTO.EmployeePFDetails;
using CompanyPlatform.Core.Services.Notification;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace CompanyPlatform.Core.Services.EmployeePFDetails
{
    public class EmployeePFDetailsService : IEmployeePFDetailsService
    {
        private readonly ApplicationDBContext _context;
        private readonly ILogger<EmployeePFDetailsService> _logger;
        private readonly INotificationHelper _notificationHelper;

        public EmployeePFDetailsService(ApplicationDBContext context, ILogger<EmployeePFDetailsService> logger, INotificationHelper notificationHelper)
        {
            _context = context;
            _logger = logger;
            _notificationHelper = notificationHelper;
        }

        public async Task<ViewPFDetailsDto> GetByEmployeeIdAsync(int employeeId)
        {
            var pfDetails = await _context.EmployeePFDetails
                .FirstOrDefaultAsync(p => p.EmployeeID == employeeId && !p.IsDeleted);

            if (pfDetails == null) return null;

            return new ViewPFDetailsDto
            {
                ID = pfDetails.ID,
                EmployeeID = pfDetails.EmployeeID,
                PFDeductionPercentage = pfDetails.PFDeductionPercentage,
                IsCappedAt15k = pfDetails.IsCappedAt15k
            };
        }

        public async Task<ViewPFDetailsDto> UpsertAsync(UpsertPFDetailsDto dto)
        {
            var isUpdate = false;
            var existingDetails = await _context.EmployeePFDetails
                .FirstOrDefaultAsync(p => p.EmployeeID == dto.EmployeeID && !p.IsDeleted);

            if (existingDetails != null)
            {
                isUpdate = true;
                existingDetails.PFDeductionPercentage = dto.PFDeductionPercentage;
                existingDetails.IsCappedAt15k = dto.IsCappedAt15k;
            }
            else
            {
                _logger.LogInformation("Creating new PF details for EmployeeID: {EmployeeId}", dto.EmployeeID);
                existingDetails = new CompanyPlatform.Core.Models.CRM.Employee.EmployeePFDetails
                {
                    EmployeeID = dto.EmployeeID,
                    PFDeductionPercentage = dto.PFDeductionPercentage,
                    IsCappedAt15k = dto.IsCappedAt15k,
                    IsDeleted = false
                };
                await _context.EmployeePFDetails.AddAsync(existingDetails);
            }

            await _context.SaveChangesAsync();

            if (isUpdate)
            {
                await _notificationHelper.SendManagerNotificationAsync(dto.EmployeeID, "PF Details");
            }

            return await GetByEmployeeIdAsync(dto.EmployeeID);
        }
    }
}
