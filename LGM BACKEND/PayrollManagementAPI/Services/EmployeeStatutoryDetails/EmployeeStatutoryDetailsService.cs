using Microsoft.EntityFrameworkCore;
using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Services.Notification;
using CompanyPlatform.Core.Services.EmployeeStatutoryDetails;
using CompanyPlatform.Core.DTO.EmployeeStatutoryDetails;

namespace PayrollManagementAPI.Services.EmployeeStatutoryDetails
{
    public class EmployeeStatutoryDetailsService : IEmployeeStatutoryDetailsService
    {
        private readonly ApplicationDBContext _context;
        private readonly ILogger<EmployeeStatutoryDetailsService> _logger;
        private readonly INotificationHelper _notificationHelper;

        public EmployeeStatutoryDetailsService(ApplicationDBContext context, ILogger<EmployeeStatutoryDetailsService> logger, INotificationHelper notificationHelper)
        {
            _context = context;
            _logger = logger;
            _notificationHelper = notificationHelper;
        }

        public async Task<StatutoryDetailsDto> GetByEmployeeIdAsync(int employeeId)
        {
            _logger.LogInformation("Fetching statutory details for EmployeeID: {EmployeeId}", employeeId);
            var entity = await _context.Tb_EmployeeStatutoryDetails
                .FirstOrDefaultAsync(s => s.EmployeeID == employeeId && !s.IsDeleted);

            if (entity == null)
            {
                _logger.LogWarning("Statutory details not found for EmployeeID: {EmployeeId}", employeeId);
                return null;
            }

            return new StatutoryDetailsDto
            {
                ID = entity.ID,
                AadhaarNumber = entity.AadhaarNumber,
                PANNumber = entity.PANNumber,
                UANNo = entity.UANNo,
                PFNo = entity.PFNo,
                ESINo = entity.ESINo,
                EmployeeID = entity.EmployeeID,
                IsDeleted = entity.IsDeleted
            };
        }

        public async Task<StatutoryDetailsDto> CreateAsync(CreateStatutoryDetailsDto dto)
        {
            _logger.LogInformation("Attempting to create statutory details for EmployeeID: {EmployeeId}", dto.EmployeeID);

            var existing = await _context.Tb_EmployeeStatutoryDetails
                .AnyAsync(s => s.EmployeeID == dto.EmployeeID && !s.IsDeleted);
            if (existing)
            {
                _logger.LogWarning("Statutory details already exist for EmployeeID: {EmployeeId}", dto.EmployeeID);
                return null;
            }

            var entity = new CompanyPlatform.Core.Models.CRM.Employee.EmployeeStatutoryDetails
            {
                AadhaarNumber = dto.AadhaarNumber,
                PANNumber = dto.PANNumber,
                UANNo = dto.UANNo,
                PFNo = dto.PFNo,
                ESINo = dto.ESINo,
                EmployeeID = dto.EmployeeID,
                IsDeleted = false
            };

            await _context.Tb_EmployeeStatutoryDetails.AddAsync(entity);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully created statutory details for EmployeeID: {EmployeeId} with new ID: {Id}", dto.EmployeeID, entity.ID);

            return new StatutoryDetailsDto
            {
                ID = entity.ID,
                AadhaarNumber = entity.AadhaarNumber,
                PANNumber = entity.PANNumber,
                UANNo = entity.UANNo,
                PFNo = entity.PFNo,
                ESINo = entity.ESINo,
                EmployeeID = entity.EmployeeID,
                IsDeleted = entity.IsDeleted
            };
        }

        public async Task<StatutoryDetailsDto> UpdateByEmployeeIdAsync(int employeeId, UpdateStatutoryDetailsDto dto)
        {
            _logger.LogInformation("Attempting to update statutory details for EmployeeID: {EmployeeId}", employeeId);
            var entity = await _context.Tb_EmployeeStatutoryDetails
                .FirstOrDefaultAsync(s => s.EmployeeID == employeeId && !s.IsDeleted);

            if (entity == null)
            {
                _logger.LogWarning("Update failed. Statutory details not found for EmployeeID: {EmployeeId}", employeeId);
                return null;
            }

            entity.AadhaarNumber = dto.AadhaarNumber;
            entity.PANNumber = dto.PANNumber;
            entity.UANNo = dto.UANNo;
            entity.PFNo = dto.PFNo;
            entity.ESINo = dto.ESINo;
            entity.IsDeleted = dto.IsDeleted;

            _context.Tb_EmployeeStatutoryDetails.Update(entity);
            await _context.SaveChangesAsync();

            await _notificationHelper.SendManagerNotificationAsync(employeeId, "Statutory Details");

            return new StatutoryDetailsDto
            {
                ID = entity.ID,
                AadhaarNumber = entity.AadhaarNumber,
                PANNumber = entity.PANNumber,
                UANNo = entity.UANNo,
                PFNo = entity.PFNo,
                ESINo = entity.ESINo,
                EmployeeID = entity.EmployeeID,
                IsDeleted = entity.IsDeleted
            };
        }

        public async Task<bool> DeleteByEmployeeIdAsync(int employeeId)
        {
            _logger.LogInformation("Attempting to soft delete statutory details for EmployeeID: {EmployeeId}", employeeId);
            var entity = await _context.Tb_EmployeeStatutoryDetails
                .FirstOrDefaultAsync(s => s.EmployeeID == employeeId && !s.IsDeleted);

            if (entity == null)
            {
                _logger.LogWarning("Soft delete failed. Statutory details not found for EmployeeID: {EmployeeId}", employeeId);
                return false;
            }

            entity.IsDeleted = true;
            _context.Tb_EmployeeStatutoryDetails.Update(entity);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully soft deleted statutory details for EmployeeID: {EmployeeId}", employeeId);
            return true;
        }
    }
}