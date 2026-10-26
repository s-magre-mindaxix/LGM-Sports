using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CompanyPlatform.Core.DTO.Department;
using PayrollManagementAPI.Services.Department;
using System.Threading.Tasks;
using CompanyPlatform.Core.Services.Department;

namespace PayrollManagementAPI.Controllers
{
    [Route("api/departments")]
    [ApiController]
    [Authorize]
    public class DepartmentController : ControllerBase
    {
        private readonly IDepartmentService _departmentService;
        private readonly ILogger<DepartmentController> _logger;

        public DepartmentController(IDepartmentService departmentService, ILogger<DepartmentController> logger)
        {
            _departmentService = departmentService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("API endpoint called: GetAll Departments");
            var departments = await _departmentService.GetAllDepartmentsAsync();
            return Ok(departments);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            _logger.LogInformation("API endpoint called: GetById for Department ID: {DepartmentId}", id);
            var department = await _departmentService.GetDepartmentByIdAsync(id);

            if (department == null)
            {
                _logger.LogWarning("GetById failed. Department with ID {DepartmentId} not found or is inactive.", id);
                return NotFound(new { message = $"Department with ID {id} not found or is inactive." });
            }

            return Ok(department);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Create([FromBody] DepartmentDto departmentDto)
        {
            _logger.LogInformation("API endpoint called: Create Department");
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var createdDepartment = await _departmentService.CreateDepartmentAsync(departmentDto);

            return CreatedAtAction(nameof(GetById), new { id = createdDepartment.ID }, createdDepartment);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Update(int id, [FromBody] DepartmentDto departmentDto)
        {
            _logger.LogInformation("API endpoint called: Update Department for ID: {DepartmentId}", id);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _departmentService.UpdateDepartmentAsync(id, departmentDto);
            if (!result)
            {
                _logger.LogWarning("Update failed. Department with ID {DepartmentId} not found or is inactive.", id);
                return NotFound(new { message = $"Department with ID {id} not found or is inactive." });
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            _logger.LogInformation("API endpoint called: Delete Department for ID: {DepartmentId}", id);
            var result = await _departmentService.DeleteDepartmentAsync(id);

            if (!result)
            {
                _logger.LogWarning("Delete failed. Department with ID {DepartmentId} not found.", id);
                return NotFound(new { message = $"Department with ID {id} not found." });
            }

            return Ok(new { message = $"Department with ID {id} has been deactivated." });
        }
    }
}