
using CompanyPlatform.Core.Services.CRM;
using CompanyPlatform.CRM.DTO.Customer;
using Microsoft.AspNetCore.Mvc;

namespace CompanyPlatform.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomerController : ControllerBase
    {
        private readonly ICustomerService _customerService;

        public CustomerController(ICustomerService customerService)
        {
            _customerService = customerService;
        }


        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var customers = await _customerService.GetAllAsync();
            return Ok(customers);
        }


        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var customer = await _customerService.GetByIdAsync(id);

            if (customer == null)
            {
                return NotFound(new
                {
                    message = $"Customer with ID {id} was not found."
                });
            }

            return Ok(customer);
        }


        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Create(
    [FromForm] CreateCustomerDto dto)
        {
            try
            {
                var customer = await _customerService.CreateAsync(dto);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = customer.Id },
                    customer
                );
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id:int}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Update(
            int id,
            [FromForm] UpdateCustomerDto dto)
        {
            try
            {
                var updated = await _customerService.UpdateAsync(id, dto);

                if (!updated)
                {
                    return NotFound(new
                    {
                        message = $"Customer with ID {id} was not found."
                    });
                }

                return Ok(new { message = "Customer updated successfully." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _customerService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    message = $"Customer with ID {id} was not found."
                });
            }

            return Ok(new
            {
                message = "Customer deleted successfully."
            });
        }
    }
}
