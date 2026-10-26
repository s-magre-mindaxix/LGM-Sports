using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models;

namespace PayrollManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,HR")]
    public class TaxSlabController : ControllerBase
    {
        private readonly ApplicationDBContext _context;

        public TaxSlabController(ApplicationDBContext context)
        {
            _context = context;
        }

        // GET: api/TaxSlab/2023-2024/Old
        [HttpGet("{financialYear}/{taxRegime}")]
        public async Task<IActionResult> GetSlabs(string financialYear, string taxRegime)
        {
            var slabs = await _context.Tbl_TaxSlabs
                .Where(s => s.FinancialYear == financialYear && s.TaxRegime == taxRegime)
                .OrderBy(s => s.FromAmount)
                .ToListAsync();
            return Ok(slabs);
        }

        // POST: api/TaxSlab
        // This now expects a TaxSlab object WITHOUT BaseTaxAmount from the frontend
        [HttpPost]
        public async Task<IActionResult> CreateSlab([FromBody] TaxSlab newSlab)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            _context.Tbl_TaxSlabs.Add(newSlab);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetSlabs), new { financialYear = newSlab.FinancialYear, taxRegime = newSlab.TaxRegime }, newSlab);
        }

        // PUT: api/TaxSlab/5
        // This now expects a TaxSlab object WITHOUT BaseTaxAmount from the frontend
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSlab(int id, [FromBody] TaxSlab updatedSlab)
        {
            if (id != updatedSlab.Id) return BadRequest();
            _context.Entry(updatedSlab).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Tbl_TaxSlabs.Any(e => e.Id == id)) return NotFound();
                else throw;
            }
            return NoContent();
        }

        // DELETE: api/TaxSlab/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSlab(int id)
        {
            var slab = await _context.Tbl_TaxSlabs.FindAsync(id);
            if (slab == null) return NotFound();
            _context.Tbl_TaxSlabs.Remove(slab);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}