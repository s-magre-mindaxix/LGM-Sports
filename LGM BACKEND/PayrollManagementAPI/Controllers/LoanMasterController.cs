using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using CompanyPlatform.Core.Data;
using PayrollManagementAPI.DTO.LoanMaster;
using CompanyPlatform.Core.Models;
using PayrollManagementAPI.Services.LoanMaster;

namespace PayrollManagementAPI.Controllers
{
        [Route("api/loan-master")]
        [ApiController]
        [Authorize(Roles = "Admin,HR,Employee")]
        public class LoanMasterController : ControllerBase
        {
            private readonly ILoanMasterService _service;

            public LoanMasterController(ILoanMasterService service)
            {
                _service = service;
            }

            [HttpGet]
            public async Task<IActionResult> GetAll()
                => Ok(await _service.GetAllAsync());

            [HttpGet("{id}")]
            public async Task<IActionResult> Get(int id)
            {
                var result = await _service.GetByIdAsync(id);
                return result == null ? NotFound() : Ok(result);
            }

            [HttpPost]
            public async Task<IActionResult> Create(LoanMasterCreateDto dto)
                => Ok(await _service.CreateAsync(dto));

            [HttpPut("{id}")]
            public async Task<IActionResult> Update(int id, LoanMasterUpdateDto dto)
            {
                var updated = await _service.UpdateAsync(id, dto);
                return updated ? Ok(new { message = "Updated successfully" }) : NotFound();
            }

            [HttpDelete("{id}")]
            public async Task<IActionResult> Delete(int id)
            {
                var deleted = await _service.DeleteAsync(id);
                return deleted ? Ok(new { message = "Deleted successfully" }) : NotFound();
            }
        }
    }




