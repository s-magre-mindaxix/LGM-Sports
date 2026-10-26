using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PayrollManagementAPI.Services.Bonus;
using System.Security.Claims;

namespace PayrollManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BonusController : ControllerBase
    {
        private readonly IBonusService _bonusService;

        public BonusController(IBonusService bonusService)
        {
            _bonusService = bonusService;
        }

        [HttpGet("{financialYear}")]
        public async Task<IActionResult> GetBonusData(string financialYear)
        {
            var records = await _bonusService.GetBonusRecordsForYear(financialYear);
            // We'll create a DTO (Data Transfer Object) to shape the data for the UI
            var response = records.Select(r => new {
                employeeName = $"{r.Employee.FirstName} {r.Employee.LastName}",
                eligibleSalary = r.EligibleSalaryForCalculation, // This might need clarification based on rule
                workingDays = r.TenureInDays, // You can link to attendance for more accuracy
                bonusAmount = r.BonusAmount,
                status = r.Status
            });
            return Ok(response);
        }

        [HttpPost("process/{financialYear}")]
        public async Task<IActionResult> ProcessBonus(string financialYear)
        {
            // Add validation for financialYear format e.g., "2024-2025"
            var success = await _bonusService.ProcessAnnualBonus(financialYear);
            if (success)
            {
                return Ok(new { message = $"Annual bonus calculation for FY {financialYear} completed successfully." });
            }
            return StatusCode(500, new { message = "An error occurred during bonus processing." });
        }


        [HttpGet("my-record/{financialYear}")]
        public async Task<IActionResult> GetMyBonusData(string financialYear)
        {
           
            var employeeIdString = User.FindFirstValue("EmployeeId"); 

            if (string.IsNullOrEmpty(employeeIdString) || !int.TryParse(employeeIdString, out int employeeId))
            {
                return Unauthorized("Employee ID claim not found in token.");
            }

            var record = await _bonusService.GetMyBonusRecordForYear(employeeId, financialYear);

            if (record == null)
            {
                return NotFound();
            }

            var response = new
            {
                employeeName = $"{record.Employee.FirstName} {record.Employee.LastName}",
                eligibleSalary = record.EligibleSalaryForCalculation,
                workingDays = record.TenureInDays,
                bonusAmount = record.BonusAmount,
                status = record.Status,
                appliedRule = record.AppliedRule 
            };

            return Ok(response);
        }

        [HttpPost("process-diwali/{financialYear}")]
        public async Task<IActionResult> ProcessDiwaliBonus(string financialYear)
        {
            try
            {
                if (!IsValidFinancialYear(financialYear))
                {
                    return BadRequest(new { message = "Invalid financial year format. Use YYYY-YYYY." });
                }

                var success = await _bonusService.ProcessDiwaliBonus(financialYear);

                if (success)
                {
                    return Ok(new
                    {
                        message = $"Diwali bonus for FY {financialYear} processed successfully."
                    });
                }

                return StatusCode(500, new { message = "Failed to process Diwali bonus." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "An error occurred while processing Diwali bonus.",
                    error = ex.Message
                });
            }
        }

        
        private bool IsValidFinancialYear(string financialYear)
        {
            if (string.IsNullOrWhiteSpace(financialYear)) return false;

            var parts = financialYear.Split('-');
            if (parts.Length != 2) return false;

            bool isStartValid = int.TryParse(parts[0], out int startYear);
            bool isEndValid = int.TryParse(parts[1], out int endYear);

            return isStartValid && isEndValid && endYear == startYear + 1;
        }
    }
}
