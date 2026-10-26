using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.Industry;
using CompanyPlatform.CRM.Services.Industry;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/industry")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class IndustryController : ControllerBase
    {
        private readonly IIndustryService _industryService;
        private readonly ILogger<IndustryController> _logger;

        public IndustryController(
            IIndustryService industryService,
            ILogger<IndustryController> logger)
        {
            _industryService = industryService;
            _logger = logger;
        }


        // GET: api/industry
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation(
                "Fetching all Industry records.");

            var industries =
                await _industryService.GetAllIndustriesAsync();

            return Ok(industries);
        }


        // GET: api/industry/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            _logger.LogInformation(
                "Fetching Industry with ID: {Id}",
                id);

            var industry =
                await _industryService.GetIndustryByIdAsync(id);

            if (industry == null)
            {
                return NotFound(new
                {
                    Message = "Industry not found."
                });
            }

            return Ok(industry);
        }


        // POST: api/industry
        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] IndustryDto industryDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var createdIndustry =
                await _industryService
                    .CreateIndustryAsync(industryDto);

            return Ok(createdIndustry);
        }


        // PUT: api/industry/1
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] IndustryDto industryDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated =
                await _industryService
                    .UpdateIndustryAsync(id, industryDto);

            if (!updated)
            {
                return NotFound(new
                {
                    Message = "Industry not found."
                });
            }

            return Ok(new
            {
                Message = "Industry updated successfully."
            });
        }


        // DELETE: api/industry/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted =
                await _industryService
                    .DeleteIndustryAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    Message = "Industry not found."
                });
            }

            return Ok(new
            {
                Message = "Industry deleted successfully."
            });
        }
    }
}





//    [Route("api/industries")]
//    [ApiController]
//    [Authorize]
//    public class IndustryController : ControllerBase
//    {
//        private readonly IIndustryService _industryService;
//        private readonly ILogger<IndustryController> _logger;

//        public IndustryController(IIndustryService industryService, ILogger<IndustryController> logger)
//        {
//            _industryService = industryService;
//            _logger = logger;
//        }

//        [HttpGet]
//        public async Task<IActionResult> GetAll()
//        {
//            _logger.LogInformation("API endpoint called: GetAll Industries");
//            var industries = await _industryService.GetAllIndustriesAsync();
//            return Ok(industries);
//        }

//        [HttpGet("{id}")]
//        public async Task<IActionResult> GetById(int id)
//        {
//            _logger.LogInformation("API endpoint called: GetById for Industry ID: {IndustryId}", id);
//            var industry = await _industryService.GetIndustryByIdAsync(id);

//            if (industry == null)
//            {
//                _logger.LogWarning("GetById failed. Industry with ID {IndustryId} not found or is inactive.", id);
//                return NotFound(new { message = $"Industry with ID {id} not found or is inactive." });
//            }

//            return Ok(industry);
//        }

//        [HttpPost]
//        [Authorize(Roles = "Admin,HR")]
//        public async Task<IActionResult> Create([FromBody] IndustryDto industryDto)
//        {
//            _logger.LogInformation("API endpoint called: Create Industry");

//            if (!ModelState.IsValid)
//            {
//                return BadRequest(ModelState);
//            }

//            var createdIndustry = await _industryService.CreateIndustryAsync(industryDto);

//            return CreatedAtAction(nameof(GetById), new { id = createdIndustry.ID }, createdIndustry);
//        }

//        [HttpPut("{id}")]
//        [Authorize(Roles = "Admin,HR")]
//        public async Task<IActionResult> Update(int id, [FromBody] IndustryDto industryDto)
//        {
//            _logger.LogInformation("API endpoint called: Update Industry for ID: {IndustryId}", id);

//            if (!ModelState.IsValid)
//            {
//                return BadRequest(ModelState);
//            }

//            var result = await _industryService.UpdateIndustryAsync(id, industryDto);

//            if (!result)
//            {
//                _logger.LogWarning("Update failed. Industry with ID {IndustryId} not found or is inactive.", id);
//                return NotFound(new { message = $"Industry with ID {id} not found or is inactive." });
//            }

//            return NoContent();
//        }

//        [HttpDelete("{id}")]
//        [Authorize(Roles = "Admin")]
//        public async Task<IActionResult> Delete(int id)
//        {
//            _logger.LogInformation("API endpoint called: Delete Industry for ID: {IndustryId}", id);
//            var result = await _industryService.DeleteIndustryAsync(id);

//            if (!result)
//            {
//                _logger.LogWarning("Delete failed. Industry with ID {IndustryId} not found.", id);
//                return NotFound(new { message = $"Industry with ID {id} not found." });
//            }

//            return Ok(new { message = $"Industry with ID {id} has been deactivated." });
//        }
//    }
//}
