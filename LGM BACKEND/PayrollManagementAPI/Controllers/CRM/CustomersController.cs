
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

        // GET: api/Customer
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var customers = await _customerService.GetAllAsync();
            return Ok(customers);
        }

        // GET: api/Customer/5
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

        // GET: api/Customer/generate-code
        [HttpGet("generate-code")]
        public async Task<IActionResult> GenerateCode()
        {
            try
            {
                var code = await _customerService.GenerateCustomerCodeAsync();
                return Ok(code);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Failed to generate customer code.",
                    detail = ex.Message
                });
            }
        }

        // POST: api/Customer
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

        // PUT: api/Customer/5
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

                return Ok(new
                {
                    message = "Customer updated successfully."
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/Customer/5
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
