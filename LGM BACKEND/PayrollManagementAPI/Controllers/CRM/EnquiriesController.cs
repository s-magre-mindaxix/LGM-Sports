using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.DTO.Enquiry;
using CompanyPlatform.CRM.Services.Enquiry;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace PayrollManagementAPI.Controllers.CRM
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class EnquiriesController : ControllerBase
    {
        private readonly IEnquiryService _service;
        private readonly ApplicationDBContext _context;

        public EnquiriesController(IEnquiryService service, ApplicationDBContext context)
        {
            _service = service;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Get() => Ok(await _service.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id) => Ok(await _service.GetByIdAsync(id));

        //[HttpPost]
        //public async Task<IActionResult> Post(EnquiryDto dto) => Ok(await _service.CreateAsync(dto));

        [HttpPost]
        public async Task<IActionResult> Post(EnquiryDto dto)
        {
            var employeeIdStr = User.FindFirstValue("EmployeeId");

            if (int.TryParse(employeeIdStr, out int employeeId))
            {
                dto.CreatedByEmployeeId = employeeId;
            }

            return Ok(await _service.CreateAsync(dto));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, EnquiryDto dto)
        {
            dto.EnquiryId = id;
            return await _service.UpdateAsync(dto) ? Ok() : NotFound();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id) => Ok(await _service.DeleteAsync(id));

        // SPECIAL: Filter Contacts by Customer
        [HttpGet("customer-contacts/{customerId}")]
        public async Task<IActionResult> GetContacts(int customerId)
        {
            var contacts = await _context.Tbl_CustomerContacts
                .Where(c => c.CustomerId == customerId && !c.IsDeleted)
                .Select(c => new { value = c.Id, label = c.ResPersonName })
                .ToListAsync();
            return Ok(contacts);
        }
    }
}
