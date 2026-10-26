using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.AddressType;
using CompanyPlatform.CRM.Services.AddressType;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/address-type")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AddressTypeController : ControllerBase
    {
        private readonly IAddressTypeService _addressTypeService;
        private readonly ILogger<AddressTypeController> _logger;

        public AddressTypeController( IAddressTypeService addressTypeService,ILogger<AddressTypeController> logger)
        {
            _addressTypeService = addressTypeService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("Fetching all Address Type records.");

            var addressTypes =await _addressTypeService.GetAllAddressTypesAsync();

            return Ok(addressTypes);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            _logger.LogInformation("Fetching Address Type with ID: {Id}",id);

            var addressType =await _addressTypeService.GetAddressTypeByIdAsync(id);

            if (addressType == null)
            {
                return NotFound(new
                {
                    Message = "Address Type not found."
                });
            }

            return Ok(addressType);
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] AddressTypeDto addressTypeDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var createdAddressType =await _addressTypeService.CreateAddressTypeAsync(addressTypeDto);

            return Ok(createdAddressType);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id,[FromBody] AddressTypeDto addressTypeDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated =await _addressTypeService.UpdateAddressTypeAsync(id, addressTypeDto);

            if (!updated)
            {
                return NotFound(new
                {
                    Message = "Address Type not found."
                });
            }

            return Ok(new
            {
                Message = "Address Type updated successfully."
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _addressTypeService.DeleteAddressTypeAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    Message = "Address Type not found."
                });
            }

            return Ok(new
            {
                Message = "Address Type deleted successfully."
            });
        }
    }
}