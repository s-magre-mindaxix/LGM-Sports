using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PayrollManagementAPI.DTO;
using PayrollManagementAPI.DTO.SalaryComponent;
using CompanyPlatform.Core.Models;
using PayrollManagementAPI.Services.SalaryComponent;

namespace PayrollManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SalaryComponentController : ControllerBase
    {
        private readonly ISalaryComponentService _salaryComponentService;

        public SalaryComponentController(ISalaryComponentService salaryComponentService)
        {
            _salaryComponentService = salaryComponentService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _salaryComponentService.GetAllAsync();
            if (result == null)
            {
                return BadRequest();
            }
            else
            {
                return Ok(result);
            }

        }

        [HttpGet("GetMainComponent")]
        public async Task<IActionResult> GetMainComponent()
        {
            var result = await _salaryComponentService.GetComponent();
            if (result == null)
            {
                return BadRequest();
            }
            else
            {
                return Ok(result);
            }

        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id) => Ok(await _salaryComponentService.GetByIdAsync(id));

        [HttpPost]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Add(SalaryComponentCreateDto Dto)
        {
            await _salaryComponentService.CreateAsync(Dto);
            return Ok();
        }


        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Update(int id, SalaryComponentCreateDto Dto)
        {
          

            await _salaryComponentService.UpdateAsync(id, Dto);

            return Ok(new { message = "SalaryComponent updated successfully." });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            await _salaryComponentService.DeleteAsync(id);
            return Ok();
        }
    }
}
