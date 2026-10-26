using CompanyPlatform.ERP.DTO.AgencyDTO;
using CompanyPlatform.ERP.Services.Agency;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PayrollManagementAPI.Controllers.ERP
{
    [Route("api/[controller]")]
    [ApiController]
    public class AgencyController : ControllerBase
    {
        private readonly IAgencyService _agencyService;

        public AgencyController(IAgencyService agencyService)
        {
            _agencyService = agencyService;
        }

        // GET: api/Agency
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _agencyService.GetAllAsync();
            return Ok(data);
        }

        // GET: api/Agency/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var data = await _agencyService.GetByIdAsync(id);

            if (data == null)
                return NotFound(new
                {
                    Message = "Agency Not Found"
                });

            return Ok(data);
        }

        // POST: api/Agency
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Create(
            [FromForm] AgencyDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _agencyService.CreateAsync(dto);

            return Ok(new
            {
                Message = "Agency Created Successfully",
                Data = result
            });
        }

        // PUT: api/Agency
        [HttpPut]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Update(
            [FromForm] AgencyDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _agencyService.UpdateAsync(dto);

            if (!result)
            {
                return NotFound(new
                {
                    Message = "Agency Not Found"
                });
            }

            return Ok(new
            {
                Message = "Agency Updated Successfully"
            });
        }

        // DELETE: api/Agency/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _agencyService.DeleteAsync(id);

            if (!result)
            {
                return NotFound(new
                {
                    Message = "Agency Not Found"
                });
            }

            return Ok(new
            {
                Message = "Agency Deleted Successfully"
            });
        }
    }
}
