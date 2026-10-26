using CompanyPlatform.CRM.DTO.BDEUser;
using CompanyPlatform.CRM.Services.BDEUser;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/bdeuser")]
    [ApiController]
    [Authorize]
    public class BDEUserController : ControllerBase
    {
        private readonly IBDEUserService _bdeUserService;
        private readonly ILogger<BDEUserController> _logger;

        public BDEUserController(
            IBDEUserService bdeUserService,
            ILogger<BDEUserController> logger)
        {
            _bdeUserService = bdeUserService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var users = await _bdeUserService.GetAllBDEUsersAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while fetching BDE users.");
                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var user = await _bdeUserService.GetBDEUserByIdAsync(id);

                if (user == null)
                    return NotFound();

                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error while fetching BDE user with ID {Id}",
                    id);

                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create(BDEUserDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var user = await _bdeUserService.CreateBDEUserAsync(dto);
                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while creating BDE user.");
                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            BDEUserDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result =
                    await _bdeUserService.UpdateBDEUserAsync(id, dto);

                if (!result)
                    return NotFound();

                return Ok(new
                {
                    message = "BDE User updated successfully."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error while updating BDE user with ID {Id}",
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
                    await _bdeUserService.DeleteBDEUserAsync(id);

                if (!result)
                    return NotFound();

                return Ok(new
                {
                    message = "BDE User deleted successfully."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error while deleting BDE user with ID {Id}",
                    id);

                return StatusCode(500, "Internal server error.");
            }
        }
    }
}