
using CompanyPlatform.Core.DTOs.Inventory;
using CompanyPlatform.Core.Interfaces.Inventory;
using Microsoft.AspNetCore.Mvc;

namespace PayrollManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WarehouseController : ControllerBase
    {
        private readonly IWarehouseService _warehouseService;

        public WarehouseController(
            IWarehouseService warehouseService)
        {
            _warehouseService = warehouseService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var warehouses = await _warehouseService.GetAllAsync();

            return Ok(warehouses);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var warehouse = await _warehouseService.GetByIdAsync(id);

            if (warehouse == null)
            {
                return NotFound(new
                {
                    message = "Warehouse not found."
                });
            }

            return Ok(warehouse);
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] WarehouseDto warehouseDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var warehouse =
                    await _warehouseService.CreateAsync(warehouseDto);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = warehouse.WarehouseId },
                    warehouse);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] WarehouseDto warehouseDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var warehouse =
                    await _warehouseService.UpdateAsync(
                        id,
                        warehouseDto);

                if (warehouse == null)
                {
                    return NotFound(new
                    {
                        message = "Warehouse not found."
                    });
                }

                return Ok(warehouse);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var deleted =
                    await _warehouseService.DeleteAsync(id);

                if (!deleted)
                {
                    return NotFound(new
                    {
                        message = "Warehouse not found."
                    });
                }

                return Ok(new
                {
                    message = "Warehouse soft-deleted successfully."
                });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    message = ex.Message
                });
            }
        }
    }
}
