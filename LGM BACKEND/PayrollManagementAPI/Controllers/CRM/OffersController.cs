using CompanyPlatform.CRM.DTO.Offer;
using CompanyPlatform.CRM.Services.Offer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace PayrollManagementAPI.Controllers.CRM
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    public class OffersController : ControllerBase
    {
        private readonly IOfferService _service;
        public OffersController(IOfferService service) => _service = service;

        [HttpGet("final-enquiries")]
        public async Task<IActionResult> GetFinalEnquiries() => Ok(await _service.GetFinalEnquiriesAsync());
        [HttpGet("final-services")]
        public async Task<IActionResult> GetFinalServices() => Ok(await _service.GetFinalServicesAsync());
        [HttpGet]
        public async Task<IActionResult> Get() => Ok(await _service.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id) => Ok(await _service.GetByIdAsync(id));

        //[HttpPost]
        //public async Task<IActionResult> Create(OfferDto dto) => Ok(await _service.CreateAsync(dto));

        [HttpPost]
        public async Task<IActionResult> Create(OfferDto dto)
        {
            var employeeIdStr = User.FindFirstValue("EmployeeId");

            if (int.TryParse(employeeIdStr, out int employeeId))
            {
                dto.CreatedByEmployeeId = employeeId;
            }

            return Ok(await _service.CreateAsync(dto));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, OfferDto dto)
        {
            dto.OfferId = id;
            return await _service.UpdateAsync(dto) ? Ok() : NotFound();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id) => Ok(await _service.DeleteAsync(id));
        [HttpGet("{offerId}/has-draft")]
        public async Task<ActionResult<bool>> HasDraftStatus(int offerId)
        {
            var result = await _service.HasDraftStatusAsync(offerId);
            return Ok(result);
        }

    }
}
