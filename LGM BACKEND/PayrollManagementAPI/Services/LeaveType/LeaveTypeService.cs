using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using CompanyPlatform.Core.Data;
using PayrollManagementAPI.DTO.LeaveType;
using CompanyPlatform.Core.Models;
using PayrollManagementAPI.Services.LeaveType;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AnonymityAPI.Services
{
    public class LeaveTypeService : ILeaveTypeService
    {
        private readonly ApplicationDBContext _context;
        private readonly ILogger<LeaveTypeService> _logger;

        public LeaveTypeService(ApplicationDBContext context, ILogger<LeaveTypeService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<LeaveTypeViewDto> CreateLeaveTypeAsync(LeaveTypeCreateDto leaveTypeDto)
        {
            _logger.LogInformation("Attempting to create a new leave type with name: {LeaveTypeName}", leaveTypeDto.LeaveTypeName);
            var existingLeaveType = await _context.Tb_LeaveTypes
                .FirstOrDefaultAsync(lt => lt.LeaveTypeName.ToLower() == leaveTypeDto.LeaveTypeName.ToLower() && !lt.IsDeleted);

            if (existingLeaveType != null)
            {
                _logger.LogWarning("Leave type with name '{LeaveTypeName}' already exists.", leaveTypeDto.LeaveTypeName);
                throw new System.Exception("A leave type with this name already exists.");
            }

            var leaveType = new LeaveType
            {
                LeaveTypeName = leaveTypeDto.LeaveTypeName,
                IsDeleted = false
            };

            _context.Tb_LeaveTypes.Add(leaveType);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Successfully created leave type with ID: {LeaveTypeID}", leaveType.ID);

            return new LeaveTypeViewDto
            {
                ID = leaveType.ID,
                LeaveTypeName = leaveType.LeaveTypeName
            };
        }

        public async Task<bool> DeleteLeaveTypeAsync(int id)
        {
            _logger.LogInformation("Attempting to delete leave type with ID: {LeaveTypeID}", id);
            var leaveType = await _context.Tb_LeaveTypes.FindAsync(id);
            if (leaveType == null || leaveType.IsDeleted)
            {
                _logger.LogWarning("Leave type with ID: {LeaveTypeID} not found or already deleted.", id);
                return false;
            }

            leaveType.IsDeleted = true; // Soft delete
            await _context.SaveChangesAsync();
            _logger.LogInformation("Successfully soft-deleted leave type with ID: {LeaveTypeID}", id);
            return true;
        }

        public async Task<IEnumerable<LeaveTypeViewDto>> GetAllLeaveTypesAsync()
        {
            _logger.LogInformation("Fetching all active leave types.");
            return await _context.Tb_LeaveTypes
                .Where(lt => !lt.IsDeleted) // Return only non-deleted types
                .Select(lt => new LeaveTypeViewDto
                {
                    ID = lt.ID,
                    LeaveTypeName = lt.LeaveTypeName
                })
                .ToListAsync();
        }

        public async Task<LeaveTypeViewDto> GetLeaveTypeByIdAsync(int id)
        {
            _logger.LogInformation("Fetching leave type by ID: {LeaveTypeID}", id);
            var leaveType = await _context.Tb_LeaveTypes
                .FirstOrDefaultAsync(lt => lt.ID == id && !lt.IsDeleted);

            if (leaveType == null)
            {
                _logger.LogWarning("Leave type with ID: {LeaveTypeID} not found.", id);
                return null;
            }

            return new LeaveTypeViewDto
            {
                ID = leaveType.ID,
                LeaveTypeName = leaveType.LeaveTypeName
            };
        }

        public async Task<bool> UpdateLeaveTypeAsync(int id, LeaveTypeCreateDto leaveTypeDto)
        {
            _logger.LogInformation("Attempting to update leave type with ID: {LeaveTypeID}", id);
            var leaveType = await _context.Tb_LeaveTypes.FindAsync(id);
            if (leaveType == null || leaveType.IsDeleted)
            {
                _logger.LogWarning("Leave type with ID: {LeaveTypeID} not found for update.", id);
                return false;
            }

            var existingLeaveType = await _context.Tb_LeaveTypes
                .FirstOrDefaultAsync(lt => lt.LeaveTypeName.ToLower() == leaveTypeDto.LeaveTypeName.ToLower() && lt.ID != id && !lt.IsDeleted);

            if (existingLeaveType != null)
            {
                _logger.LogWarning("Another leave type with name '{LeaveTypeName}' already exists.", leaveTypeDto.LeaveTypeName);
                throw new System.Exception("Another leave type with this name already exists.");
            }

            leaveType.LeaveTypeName = leaveTypeDto.LeaveTypeName;
            await _context.SaveChangesAsync();
            _logger.LogInformation("Successfully updated leave type with ID: {LeaveTypeID}", id);
            return true;
        }
    }
}