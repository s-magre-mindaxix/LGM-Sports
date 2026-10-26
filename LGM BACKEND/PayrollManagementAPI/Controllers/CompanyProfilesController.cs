using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PayrollManagementAPI.DTO;
using PayrollManagementAPI.DTO.SalaryComponent;
using PayrollManagementAPI.Services.CompanyProfile;

namespace PayrollManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompanyProfilesController : ControllerBase
    {
        private readonly ICompanyProfileService _companyProfileService;

        public CompanyProfilesController(ICompanyProfileService companyProfileService)
        {
            _companyProfileService = companyProfileService;
        }


        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _companyProfileService.GetAllCompanyProfileAsync();
            if (result == null)
            {
                return BadRequest();
            }
            else
            {
                return Ok(result);
            }

        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id) => Ok(await _companyProfileService.GetCompanyProfileByIdAsync(id));

        [HttpPost]
        public async Task<IActionResult> Add([FromBody] CompanyProfileDTO Dto)
        {
            await _companyProfileService.CreateCompanyProfileAsync(Dto);
            return Ok();
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CompanyProfileDTO Dto)
        {


            await _companyProfileService.UpdateCompanyProfiletAsync(id, Dto);

            return Ok(new { message = "CompanyProfile updated successfully." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _companyProfileService.DeletecompanyProfileAsync(id);
            return Ok();
        }
    }
}
