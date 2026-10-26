using CompanyPlatform.ERP.DTO.AgencyTypeDTO;
using CompanyPlatform.ERP.Services.AgencyType;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PayrollManagementAPI.Controllers.ERP
{
    [Route("api/[controller]")]
    [ApiController]
    public class AgencyTypeController : ControllerBase
    {
        private readonly IAgencyTypeService _service;

        public AgencyTypeController(IAgencyTypeService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _service.GetAllAsync();
            return Ok(data);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var data = await _service.GetByIdAsync(id);

            if (data == null)
                return NotFound("Agency Type not found.");

            return Ok(data);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateAgencyTypeDto dto)
        {
            var result = await _service.CreateAsync(dto);

            return Ok(new
            {
                Message = "Agency Type created successfully.",
                Data = result
            });
        }

        [HttpPut]
        public async Task<IActionResult> Update(UpdateAgencyTypeDto dto)
        {
            var result = await _service.UpdateAsync(dto);

            if (!result)
                return NotFound("Agency Type not found.");

            return Ok(new
            {
                Message = "Agency Type updated successfully."
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);

            if (!result)
                return NotFound("Agency Type not found.");

            return Ok(new
            {
                Message = "Agency Type deleted successfully."
            });
        }
    }
}
