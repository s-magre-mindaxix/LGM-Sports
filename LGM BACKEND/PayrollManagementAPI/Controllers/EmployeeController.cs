using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CompanyPlatform.Core.DTO.Employee;
using CompanyPlatform.Core.Services.Employee;

namespace PayrollManagementAPI.Controllers
{
    [Route("api/payroll-employees")]
    [ApiController]
    [Authorize]
    public class EmployeeController : ControllerBase
    {
        private readonly IEmployeeService _employeeService;
        private readonly ILogger<EmployeeController> _logger;

        public EmployeeController(IEmployeeService employeeService, ILogger<EmployeeController> logger)
        {
            _employeeService = employeeService;
            _logger = logger;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAllEmployees()
        {
            _logger.LogInformation("API endpoint called: GetAllEmployees");
            var employees = await _employeeService.GetAllEmployeesAsync(User);
            return Ok(employees);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetEmployeeById(int id)
        {
            _logger.LogInformation("API endpoint called: GetEmployeeById with ID: {EmployeeId}", id);
            var employee = await _employeeService.GetEmployeeByIdAsync(id);
            if (employee == null)
            {
                _logger.LogWarning("GetEmployeeById failed. Employee with ID {EmployeeId} not found.", id);
                return NotFound(new { message = $"Employee with ID {id} not found." });
            }
            return Ok(employee);
        }

        [HttpGet("{id}/full-details")]
        public async Task<IActionResult> GetEmployeeFullDetails(int id)
        {
            _logger.LogInformation("API endpoint called: GetEmployeeFullDetails with ID: {EmployeeId}", id);
            var employee = await _employeeService.GetEmployeeFullDetailsByIdAsync(id);
            if (employee == null)
            {
                _logger.LogWarning("GetEmployeeFullDetails failed. Employee with ID {EmployeeId} not found.", id);
                return NotFound(new { message = $"Employee with ID {id} not found." });
            }
            return Ok(employee);
        }

        [HttpPut("{id}")]
        [Authorize]
        [Consumes("multipart/form-data")] // Required for Photo upload
        public async Task<IActionResult> UpdateEmployee(int id, [FromForm] UpdateEmployeeDto updateDto)
        {
            _logger.LogInformation("API endpoint called: UpdateEmployee with ID: {EmployeeId}", id);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updatedEmployee = await _employeeService.UpdateEmployeeAsync(id, updateDto);

            if (updatedEmployee == null)
            {
                return NotFound(new { message = $"Employee with ID {id} not found." });
            }

            return Ok(updatedEmployee);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> DeleteEmployee(int id)
        {
            _logger.LogInformation("API endpoint called: DeleteEmployee with ID: {EmployeeId}", id);
            var result = await _employeeService.DeleteEmployeeAsync(id);
            if (!result)
            {
                _logger.LogWarning("DeleteEmployee failed. Employee with ID {EmployeeId} not found.", id);
                return NotFound(new { message = $"Employee with ID {id} not found." });
            }

            return Ok(new { message = $"Employee with ID {id} has been marked as inactive." });
        }

        [HttpGet("by-code/{employeeCode}")]
        public async Task<IActionResult> GetEmployeeByCode(string employeeCode)
        {
            _logger.LogInformation("API endpoint called: GetEmployeeByCode with Code: {EmployeeCode}", employeeCode);
            if (string.IsNullOrWhiteSpace(employeeCode))
                return BadRequest(new { message = "EmployeeCode is required." });

            var employee = await _employeeService.GetEmployeeByCodeAsync(employeeCode);
            if (employee == null)
            {
                _logger.LogWarning("GetEmployeeByCode failed. Employee with code '{EmployeeCode}' not found.", employeeCode);
                return NotFound(new { message = $"Employee with code '{employeeCode}' not found." });
            }

            return Ok(employee);
        }

        [HttpGet("selection-list")]
        public async Task<IActionResult> GetSelectionList()
        {
            var employees = await _employeeService.GetEmployeeSelectionListAsync();
            return Ok(employees);
        }

        [HttpGet("by-role/{role}")]
        public async Task<IActionResult> GetEmployeesByRole(string role)
        {
            var employees = await _employeeService.GetEmployeesByRoleAsync(role);
            return Ok(employees);
        }

        [HttpGet("by-role-and-department")]
        public async Task<IActionResult> GetEmployeesByRoleAndDepartment([FromQuery] string role, [FromQuery] int departmentId)
        {
            if (string.IsNullOrEmpty(role) || departmentId <= 0)
            {
                return BadRequest("Both role and departmentId are required.");
            }
            var employees = await _employeeService.GetEmployeesByRoleAndDepartmentAsync(role, departmentId);
            return Ok(employees);
        }

        [HttpPatch("{id}/status")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> UpdateEmployeeStatus(int id, [FromBody] UpdateEmployeeStatusDto dto)
        {
            var result = await _employeeService.UpdateEmployeeStatusAsync(id, dto.IsActive);
            if (!result) return NotFound();

            return Ok(new { message = "Status updated successfully" });
        }

        [HttpPut("set-reporting")]
        public async Task<IActionResult> SetEmployeeReporting(SetReportingDto dto)
        {
            var result = await _employeeService.SetEmployeeReportingAsync(dto);

            if (!result)
                return BadRequest("Unable to update reporting.");

            return Ok("Reporting updated successfully.");
        }
    }
}