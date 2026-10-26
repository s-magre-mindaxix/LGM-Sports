
using CompanyPlatform.Core.DTOs.Inventory;
using CompanyPlatform.Core.Interfaces.Inventory;
using Microsoft.AspNetCore.Mvc;

namespace PayrollManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BranchController : ControllerBase
    {
        private readonly IBranchService _branchService;

        public BranchController(IBranchService branchService)
        {
            _branchService = branchService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var branches = await _branchService.GetAllAsync();

            return Ok(branches);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var branch = await _branchService.GetByIdAsync(id);

            if (branch == null)
            {
                return NotFound(new
                {
                    message = "Branch not found."
                });
            }

            return Ok(branch);
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] BranchDto branchDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var branch = await _branchService.CreateAsync(branchDto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = branch.BranchId },
                branch);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] BranchDto branchDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var branch = await _branchService.UpdateAsync(
                id,
                branchDto);

            if (branch == null)
            {
                return NotFound(new
                {
                    message = "Branch not found."
                });
            }

            return Ok(branch);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _branchService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    message = "Branch not found."
                });
            }

            return Ok(new
            {
                message = "Branch soft-deleted successfully."
            });
        }
    }
}
