using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.DTO.EmployeeBankDetails;
using CompanyPlatform.Core.Models;
using PayrollManagementAPI.Services.Notification;
using System.Threading.Tasks;
using CompanyPlatform.Core.DTO.EmployeeBankDetails;
using CompanyPlatform.Core.Services.Notification;

namespace PayrollManagementAPI.Services.EmployeeBankDetails
{
    public class EmployeeBankDetailsService : IEmployeeBankDetailsService
    {
        private readonly ApplicationDBContext _context;
        private readonly ILogger<EmployeeBankDetailsService> _logger;
        private readonly INotificationHelper _notificationHelper;

        public EmployeeBankDetailsService(ApplicationDBContext context, ILogger<EmployeeBankDetailsService> logger, INotificationHelper notificationHelper)
        {
            _context = context;
            _logger = logger;
            _notificationHelper = notificationHelper;
        }

        public async Task<EmployeeBankFullResponseDto> GetEmployeeAndBankByIdAsync(int employeeId)
        {
            _logger.LogInformation("Fetching employee and bank details for EmployeeId: {EmployeeId}", employeeId);
            var employee = await _context.Employees
                .FirstOrDefaultAsync(e => e.ID == employeeId && e.IsDeleted == false);

            if (employee == null)
            {
                _logger.LogWarning("Employee with Id {EmployeeId} not found.", employeeId);
                return null;
            }

            var bank = await _context.EmployeeBankDetails
                .FirstOrDefaultAsync(b => b.EmployeeID == employee.ID && b.IsDeleted == false);

            if (bank == null)
            {
                _logger.LogInformation("Bank details not found for EmployeeID: {EmployeeId}", employee.ID);
            }

            return new EmployeeBankFullResponseDto
            {
                Employee = new EmployeeInfoDto
                {
                    ID = employee.ID,
                    FirstName = employee.FirstName,
                    LastName = employee.LastName,
                    EmailAddress = employee.EmailAddress,
                    MobileNumber = employee.MobileNumber
                },
                BankDetails = bank == null ? null : new EmployeeBankDetailsDto
                {
                    ID = bank.ID,
                    AccountHolderName = bank.AccountHolderName,
                    BankName = bank.BankName,
                    AccountNumber = bank.AccountNumber,
                    IFSCCode = bank.IFSCCode,
                    EmployeeID = employee.ID
                }
            };
        }
        public async Task<EmployeeBankDetailsDto> CreateAsync(CreateEmployeeBankDetailsDto dto)
        {
            _logger.LogInformation("Creating new bank details for EmployeeID: {EmployeeId}", dto.EmployeeID);
            var entity = new CompanyPlatform.Core.Models.CRM.Employee.EmployeeBankDetails
            {
                AccountHolderName = dto.AccountHolderName,
                BankName = dto.BankName,
                AccountNumber = dto.AccountNumber,
                IFSCCode = dto.IFSCCode,
                EmployeeID = dto.EmployeeID,
                IsDeleted = false
            };

            await _context.EmployeeBankDetails.AddAsync(entity);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully created bank details with ID: {BankDetailsId}", entity.ID);
            return new EmployeeBankDetailsDto
            {
                ID = entity.ID,
                AccountHolderName = entity.AccountHolderName,
                BankName = entity.BankName,
                AccountNumber = entity.AccountNumber,
                IFSCCode = entity.IFSCCode,
                EmployeeID = entity.EmployeeID,
                IsDeleted=entity.IsDeleted
            };
        }

        public async Task<EmployeeBankDetailsDto> UpdateAsync(int id, UpdateEmployeeBankDetailsDto dto)
        {
            _logger.LogInformation("Attempting to update bank details for ID: {BankDetailsId}", id);
            var entity = await _context.EmployeeBankDetails.FirstOrDefaultAsync(e => e.ID == id && e.IsDeleted==false);

            if (entity == null)
            {
                _logger.LogWarning("Update failed. Bank details with ID: {BankDetailsId} not found or is inactive.", id);
                return null;
            }

            entity.AccountHolderName = dto.BeneficiaryName;
            entity.BankName = dto.BankName;
            entity.AccountNumber = dto.AccountNumber;
            entity.IFSCCode = dto.IFSCCode;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully updated bank details for ID: {BankDetailsId}", id);
            await _notificationHelper.SendManagerNotificationAsync(entity.EmployeeID, "Bank Details");

            return new EmployeeBankDetailsDto
            {
                ID = entity.ID,
                AccountHolderName = entity.AccountHolderName,
                BankName = entity.BankName,
                AccountNumber = entity.AccountNumber,
                IFSCCode = entity.IFSCCode,
                EmployeeID = entity.EmployeeID
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            _logger.LogInformation("Attempting to deactivate bank details with ID: {BankDetailsId}", id);
            var entity = await _context.EmployeeBankDetails.FindAsync(id);

            if (entity == null)
            {
                _logger.LogWarning("Deactivation failed. Bank details with ID: {BankDetailsId} not found.", id);
                return false;
            }

            entity.IsDeleted = true;
            _context.EmployeeBankDetails.Update(entity);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully deactivated bank details with ID: {BankDetailsId}", id);
            return true;
        }
    }
}