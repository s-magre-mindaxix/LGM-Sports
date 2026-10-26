using CompanyPlatform.CRM.DTO.ContactTypes;
using CompanyPlatform.CRM.Services.ContactType;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/contacttype")]
    [ApiController]
    [Authorize]
    public class ContactTypeController : ControllerBase
    {
        private readonly IContactTypeService _contactTypeService;
        private readonly ILogger<ContactTypeController> _logger;

        public ContactTypeController(
            IContactTypeService contactTypeService,
            ILogger<ContactTypeController> logger)
        {
            _contactTypeService = contactTypeService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var contactTypes =
                    await _contactTypeService.GetAllContactTypesAsync();

                return Ok(contactTypes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while fetching contact types.");
                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var contactType =
                    await _contactTypeService.GetContactTypeByIdAsync(id);

                if (contactType == null)
                    return NotFound();

                return Ok(contactType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Error while fetching contact type with ID {Id}", id);

                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create(ContactTypeDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var contactType =
                    await _contactTypeService.CreateContactTypeAsync(dto);

                return Ok(contactType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while creating contact type.");
                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            ContactTypeDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result =
                    await _contactTypeService
                        .UpdateContactTypeAsync(id, dto);

                if (!result)
                    return NotFound();

                return Ok(new
                {
                    message = "Contact Type updated successfully."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Error while updating contact type with ID {Id}", id);

                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result =
                    await _contactTypeService.DeleteContactTypeAsync(id);

                if (!result)
                    return NotFound();

                return Ok(new
                {
                    message = "Contact Type deleted successfully."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Error while deleting contact type with ID {Id}", id);

                return StatusCode(500, "Internal server error.");
            }
        }
    }
}