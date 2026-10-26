using CompanyPlatform.Core.Data;
using CompanyPlatform.CRM.DTO.Inventory.CompanyPlatform.CRM.DTO.Inventory;
using CompanyPlatform.CRM.Services.Inventory;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace PayrollManagementAPI.Controllers.CRM
{
    [Route("api/[controller]")]
    [ApiController]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryService _service;
        private readonly ApplicationDBContext _context; // To get item names for logs/scrap history

        public InventoryController(IInventoryService service, ApplicationDBContext context)
        {
            _service = service;
            _context = context;
        }

        // --- GET Stock Summary (with filter) ---
        [HttpGet("summary")]
        public async Task<IActionResult> GetStockSummary([FromQuery] string typeFilter = "All")
        {
            var summary = await _service.GetFullInventoryAsync(typeFilter);
            return Ok(summary);
        }

        // --- POST Adjust Stock (Add/Subtract) ---
        [HttpPost("adjust")]
        public async Task<IActionResult> AdjustStock(StockAdjustmentDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await _service.AdjustStockAsync(dto);
            return result ? Ok(new { message = "Stock adjusted successfully." }) : BadRequest(new { message = "Failed to adjust stock." });
        }

        // --- POST Move to Scrap ---
        [HttpPost("scrap")]
        public async Task<IActionResult> MoveToScrap(ScrapRequestDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await _service.MoveToScrapAsync(dto);
            return result ? Ok(new { message = "Item moved to scrap." }) : BadRequest(new { message = "Failed to move item to scrap. Check quantity." });
        }

        // --- GET Scrap History ---
        [HttpGet("scrap-history")]
        public async Task<IActionResult> GetScrapHistory()
        {
            // The Service now returns the list with ItemName included
            var history = await _service.GetScrapHistoryAsync();
            return Ok(history);
        }

        [HttpGet("transactions")]
        public async Task<IActionResult> GetTransactions()
        {
            // The Service now returns the list with ItemName included
            var transactions = await _service.GetTransactionHistoryAsync();
            return Ok(transactions);
        }

        // --- GET Transaction History for a specific item ---
        [HttpGet("{itemType}/{itemId}/transactions")]
        public async Task<IActionResult> GetItemTransactions(string itemType, int itemId)
        {
            var transactions = await _service.GetItemTransactionsAsync(itemId, itemType);
            return Ok(transactions);
        }
        //[HttpGet("transactions")]
        //public async Task<IActionResult> GetTransactions()
        //{
        //    return Ok(await _service.GetTransactionHistoryAsync());
        //}
    }
}
