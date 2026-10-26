using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PayrollManagementAPI.DTO;
using PayrollManagementAPI.DTO.SalaryComponent;
using PayrollManagementAPI.Services.Holiday;

namespace PayrollManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HolidayController : ControllerBase
    {
        private readonly IHolidayService _holidayService;

        public HolidayController(IHolidayService holidayService)
        {
            _holidayService = holidayService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _holidayService.GetAllAsync();
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
        public async Task<IActionResult> GetById(int id) => Ok(await _holidayService.GetByIdAsync(id));

        [HttpPost]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Add(HolidayDto Dto)
        {
            await _holidayService.CreateAsync(Dto);
            return Ok();
        }


        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Update(int id, HolidayDto Dto)
        {


            await _holidayService.UpdateAsync(id, Dto);

            return Ok(new { message = "HolidayData updated successfully." });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            await _holidayService.DeleteAsync(id);
            return Ok();
        }
    }
}
