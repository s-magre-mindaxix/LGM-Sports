
using CompanyPlatform.Core.DTO.Company;
using CompanyPlatform.Core.Services.Company;
using Microsoft.AspNetCore.Mvc;

namespace PayrollManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompanyController : ControllerBase
    {
        private readonly ICompanyService _service;

        public CompanyController(ICompanyService service)
        {
            _service = service;
        }

        // CREATE COMPANY
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Create([FromForm] CompanyDto dto)
        {
            var result = await _service.CreateCompanyAsync(dto);
            return Ok(result);
        }

        // UPDATE COMPANY
        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Update(
            int id,
            [FromForm] CompanyDto dto)
        {
            dto.CompanyId = id;

            var result = await _service.UpdateCompanyAsync(dto);

            if (!result)
            {
                return NotFound(new
                {
                    message = "Company not found"
                });
            }

            return Ok(new
            {
                message = "Company updated successfully"
            });
        }

        // SOFT DELETE COMPANY
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var company = await _service.GetCompanyAsync(id);

            if (company == null)
            {
                return NotFound(new
                {
                    message = "Company not found"
                });
            }

            await _service.SoftDeleteCompanyAsync(id);

            return Ok(new
            {
                message = "Company deleted successfully"
            });
        }

        // ADD COMPANY ADDRESS
        [HttpPost("{companyId}/address")]
        public async Task<IActionResult> AddAddress(
            int companyId,
            [FromBody] CompanyAddressDto dto)
        {
            dto.CompanyId = companyId;

            await _service.AddAddressAsync(dto);

            return Ok(new
            {
                message = "Company address added successfully"
            });
        }

        // ADD COMPANY DIRECTOR
        [HttpPost("{companyId}/director")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> AddDirector(
            int companyId,
            [FromForm] CompanyDirectorDto dto)
        {
            dto.CompanyId = companyId;

            await _service.AddDirectorAsync(dto);

            return Ok(new
            {
                message = "Company director added successfully"
            });
        }

        // ADD COMPANY BANK DETAIL
        [HttpPost("{companyId}/bank")]
        public async Task<IActionResult> AddBank(
            int companyId,
            [FromBody] CompanyBankDetailDto dto)
        {
            dto.CompanyId = companyId;

            await _service.AddBankAsync(dto);

            return Ok(new
            {
                message = "Company bank detail added successfully"
            });
        }

        // GET ALL COMPANIES
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var companies = await _service.GetCompaniesAsync();
            return Ok(companies);
        }

        // GET COMPANY BY ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var company = await _service.GetCompanyAsync(id);

            if (company == null)
            {
                return NotFound(new
                {
                    message = "Company not found"
                });
            }

            return Ok(company);
        }

        // GET BANK DETAILS BY COMPANY
        [HttpGet("{id}/banks")]
        public async Task<IActionResult> GetBanksByCompany(int id)
        {
            var banks = await _service.GetBankDetailsByCompanyIdAsync(id);
            return Ok(banks);
        }

        // GET ALL BANK DETAILS
        [HttpGet("bank-details/all")]
        public async Task<IActionResult> GetAllBanks()
        {
            var banks = await _service.GetAllBankDetailsAsync();
            return Ok(banks);
        }
    }
}
