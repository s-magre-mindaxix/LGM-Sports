using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using CompanyPlatform.Core.DTO.Department;
using PayrollManagementAPI.DTO.ExpenseType;
using PayrollManagementAPI.Services.ExpenseType;

namespace PayrollManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExpenseTypeController : ControllerBase
    {
        private readonly IExpenseTypeService _expenseTypeService;
        private readonly ILogger<ExpenseTypeController> _logger;

        public ExpenseTypeController(IExpenseTypeService expenseTypeService, ILogger<ExpenseTypeController> logger)
        {
            _expenseTypeService = expenseTypeService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var expensetype = await _expenseTypeService.GetAllExpenseTypesAsync();
                return Ok(expensetype);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching all expense types.");
                return StatusCode(500, "An internal server error has occurred.");
            }
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var expensetype = await _expenseTypeService.GetExpenseTypeByIdAsync(id);
                if (expensetype == null)
                {
                    return NotFound(new { message = $"ExpenseType with ID {id} not found." });
                }
                return Ok(expensetype);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching expense type with ID {Id}.", id);
                return StatusCode(500, "An internal server error has occurred.");
            }
        }


        [HttpPost]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Create([FromBody] ExpenseTypeDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var createdExpense = await _expenseTypeService.CreateExpenseTypeAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = createdExpense.Id }, createdExpense);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while creating a new expense type.");
                return StatusCode(500, "An internal server error has occurred.");
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Update(int id, [FromBody] ExpenseTypeDto dto)
        {
            if (id != dto.Id)
            {
                return BadRequest("ID in URL and body do not match.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var result = await _expenseTypeService.UpdateExpenseTypeAsync(id, dto);
                if (!result)
                {
                    return NotFound(new { message = $"ExpenseType with ID {id} not found." });
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while updating expense type with ID {Id}.", id);
                return StatusCode(500, "An internal server error has occurred.");
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            await _expenseTypeService.DeleteExpenseTypeAsync(id);
            return Ok();
        }
    }
}
