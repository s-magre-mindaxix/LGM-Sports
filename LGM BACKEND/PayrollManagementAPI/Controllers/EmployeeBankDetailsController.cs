using CompanyPlatform.Core.DTO.EmployeeBankDetails;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PayrollManagementAPI.Services.EmployeeBankDetails;
using System.Threading.Tasks;

namespace PayrollManagementAPI.Controllers
{
    [Route("api/employee-bank-details")]
    [ApiController]
    [Authorize]
    public class EmployeeBankDetailsController : ControllerBase
    {
        private readonly IEmployeeBankDetailsService _service;
        private readonly ILogger<EmployeeBankDetailsController> _logger;

        public EmployeeBankDetailsController(IEmployeeBankDetailsService service, ILogger<EmployeeBankDetailsController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet("{employeeId}")]
        public async Task<IActionResult> GetByEmployeeId(int employeeId)
        {
            _logger.LogInformation("API endpoint called: GetByEmployeeId for EmployeeId: {EmployeeId}", employeeId);
            var result = await _service.GetEmployeeAndBankByIdAsync(employeeId);
            if (result == null)
            {
                _logger.LogWarning("GetByEmployeeId failed. Employee with id {EmployeeId} not found.", employeeId);
                return NotFound(new { message = $"Employee with id '{employeeId}' not found or is inactive." });
            }

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateEmployeeBankDetailsDto dto)
        {
            _logger.LogInformation("API endpoint called: Create EmployeeBankDetails");
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var result = await _service.CreateAsync(dto);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateEmployeeBankDetailsDto dto)
        {
            _logger.LogInformation("API endpoint called: Update EmployeeBankDetails for ID: {BankDetailsId}", id);
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var result = await _service.UpdateAsync(id, dto);
            if (result == null)
            {
                _logger.LogWarning("Update failed. Bank details with ID {BankDetailsId} not found or is inactive.", id);
                return NotFound(new { message = $"Bank details with ID {id} not found or is inactive." });
            }

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            _logger.LogInformation("API endpoint called: Delete EmployeeBankDetails for ID: {BankDetailsId}", id);
            var result = await _service.DeleteAsync(id);
            if (!result)
            {
                _logger.LogWarning("Delete failed. Bank details with ID {BankDetailsId} not found.", id);
                return NotFound(new { message = $"Bank details with ID {id} not found." });
            }

            return Ok(new { message = $"Bank details with ID {id} has been deactivated successfully." });
        }
    }
}