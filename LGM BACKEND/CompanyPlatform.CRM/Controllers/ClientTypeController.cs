using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

using CompanyPlatform.CRM.DTO.ClientType;
using CompanyPlatform.CRM.Services.ClientType;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/client-type")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class ClientTypeController : ControllerBase
    {
        private readonly IClientTypeService
            _clientTypeService;

        private readonly ILogger<ClientTypeController>
            _logger;

        public ClientTypeController(
            IClientTypeService clientTypeService,
            ILogger<ClientTypeController> logger)
        {
            _clientTypeService =
                clientTypeService;

            _logger = logger;
        }


        // =========================================================
        // GET ALL
        // GET: api/client-type
        // =========================================================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation(
                "Fetching all Client Type records.");

            var clientTypes =
                await _clientTypeService
                    .GetAllClientTypesAsync();

            return Ok(clientTypes);
        }


        // =========================================================
        // GET BY ID
        // GET: api/client-type/{id}
        // =========================================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            _logger.LogInformation(
                "Fetching Client Type with ID: {Id}",
                id);

            var clientType =
                await _clientTypeService
                    .GetClientTypeByIdAsync(id);

            if (clientType == null)
            {
                return NotFound(new
                {
                    Message =
                        "Client Type not found."
                });
            }

            return Ok(clientType);
        }


        // =========================================================
        // CREATE
        // POST: api/client-type
        // =========================================================
        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] ClientTypeDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var created =
                await _clientTypeService
                    .CreateClientTypeAsync(dto);

            return Ok(created);
        }


        // =========================================================
        // UPDATE
        // PUT: api/client-type/{id}
        // =========================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] ClientTypeDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated =
                await _clientTypeService
                    .UpdateClientTypeAsync(
                        id,
                        dto);

            if (!updated)
            {
                return NotFound(new
                {
                    Message =
                        "Client Type not found."
                });
            }

            return Ok(new
            {
                Message =
                    "Client Type updated successfully."
            });
        }


        // =========================================================
        // DELETE
        // DELETE: api/client-type/{id}
        // =========================================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted =
                await _clientTypeService
                    .DeleteClientTypeAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    Message =
                        "Client Type not found."
                });
            }

            return Ok(new
            {
                Message =
                    "Client Type deleted successfully."
            });
        }
    }
}