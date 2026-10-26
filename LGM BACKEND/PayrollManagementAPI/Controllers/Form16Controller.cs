using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CompanyPlatform.Core.Data;
using PayrollManagementAPI.Services.Form16;
using System.Security.Claims;

namespace PayrollManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class Form16Controller : ControllerBase
    {
        private readonly IForm16Service _form16Service;
        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly ApplicationDBContext _context;
        public Form16Controller(IForm16Service form16Service, IWebHostEnvironment hostingEnvironment, ApplicationDBContext context)
        {
            _form16Service = form16Service;
            _hostingEnvironment = hostingEnvironment;
            _context = context;
        }

        public class FileUploadModel
        {
            public IFormFile File { get; set; }
        }

        [HttpGet("dashboard/{financialYear}")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> GetDashboardData(string financialYear)
        {
            var result = await _form16Service.GetForm16DashboardAsync(financialYear);
            return Ok(result);
        }

        [HttpGet("employee-view/{financialYear}")]
        [Authorize(Roles = "Employee")]
        public async Task<IActionResult> GetEmployeeViewData(string financialYear)
        {
            var employeeId = GetCurrentEmployeeId();
            if (employeeId == null) return Unauthorized("Invalid token.");

            var result = await _form16Service.GetEmployeeForm16StatusAsync(employeeId.Value, financialYear);
            return Ok(result);
        }

        [HttpPost("generate-part-b")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> GeneratePartB([FromBody] GeneratePartBRequest request)
        {
            return await _form16Service.GeneratePartBAsync(request.EmployeeId, request.FinancialYear);
        }

        [HttpPost("publish")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Publish([FromBody] PublishRequest request)
        {
            return await _form16Service.PublishFormAsync(request.Form16StatusId);
        }

        [HttpGet("data/{form16StatusId}")]
        [Authorize]
        public async Task<IActionResult> GetDataForPdf(int form16StatusId)
        {
            var data = await _form16Service.GetForm16DataAsync(form16StatusId);
            if (data == null) return NotFound("Form 16 data could not be found.");
            return Ok(data);
        }

        [HttpPost("upload-part-a/{financialYear}")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> UploadPartABulk(
          [FromRoute] string financialYear,
          [FromForm] FileUploadModel model)
        {
            if (model?.File == null || model.File.Length == 0)
                return BadRequest(new { message = "No file uploaded." });

            if (Path.GetExtension(model.File.FileName).ToLower() != ".zip")
                return BadRequest(new { message = "Only ZIP files allowed." });

            using var stream = model.File.OpenReadStream();
            var result = await _form16Service.ProcessPartAUploadAsync(stream, financialYear);

            if (result.SuccessCount == 0 && result.FailureCount > 0)
                return BadRequest(result);

            return Ok(result);
        }


        private int? GetCurrentEmployeeId()
        {
            var employeeIdClaim = User.Claims.FirstOrDefault(c => c.Type == "EmployeeId");
            return int.TryParse(employeeIdClaim?.Value, out var employeeId) ? employeeId : (int?)null;
        }

        // Request Body Models
        public class GeneratePartBRequest { public int EmployeeId { get; set; } public string FinancialYear { get; set; } }
        public class PublishRequest { public int Form16StatusId { get; set; } }
    }
}