using CompanyPlatform.CRM.DTO.SalesUserManager;
using CompanyPlatform.CRM.Services.SalesUserManager;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/salesusermanager")]
    [ApiController]
    [Authorize]
    public class SalesUserManagerController : ControllerBase
    {
        private readonly ISalesUserManagerService _salesUserManagerService;
        private readonly ILogger<SalesUserManagerController> _logger;

        public SalesUserManagerController(
            ISalesUserManagerService salesUserManagerService,
            ILogger<SalesUserManagerController> logger)
        {
            _salesUserManagerService = salesUserManagerService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var users =
                    await _salesUserManagerService
                        .GetAllSalesUserManagersAsync();

                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error while fetching sales user managers.");

                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var user =
                    await _salesUserManagerService
                        .GetSalesUserManagerByIdAsync(id);

                if (user == null)
                    return NotFound();

                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error while fetching sales user manager with ID {Id}",
                    id);

                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            SalesUserManagerDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var user =
                    await _salesUserManagerService
                        .CreateSalesUserManagerAsync(dto);

                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error while creating sales user manager.");

                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            SalesUserManagerDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result =
                    await _salesUserManagerService
                        .UpdateSalesUserManagerAsync(id, dto);

                if (!result)
                    return NotFound();

                return Ok(new
                {
                    message = "Sales User Manager updated successfully."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error while updating sales user manager with ID {Id}",
                    id);

                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result =
                    await _salesUserManagerService
                        .DeleteSalesUserManagerAsync(id);

                if (!result)
                    return NotFound();

                return Ok(new
                {
                    message = "Sales User Manager deleted successfully."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error while deleting sales user manager with ID {Id}",
                    id);

                return StatusCode(500, "Internal server error.");
            }
        }
    }
}