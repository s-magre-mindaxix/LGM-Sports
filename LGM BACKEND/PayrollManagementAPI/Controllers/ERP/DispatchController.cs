using CompanyPlatform.ERP.DTO.DispatchDto;
using CompanyPlatform.ERP.Services.Dispatch;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PayrollManagementAPI.Controllers.ERP
{
    [Route("api/[controller]")]
    [ApiController]
    public class DispatchController : ControllerBase
    {
        private readonly IDispatchService _dispatchService;

        public DispatchController(IDispatchService dispatchService)
        {
            _dispatchService = dispatchService;
        }

        #region Create

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateDispatchDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _dispatchService.CreateAsync(dto);

                return Ok(new
                {
                    Success = true,
                    Message = "Dispatch created successfully.",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = ex.Message
                });
            }
        }

        #endregion

        #region Get All

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _dispatchService.GetAllAsync();
            return Ok(result);
        }

        #endregion

        #region Shipment Dropdown

        [HttpGet("shipment-dropdown")]
        public async Task<IActionResult> GetShipmentDropdown()
        {
            var result = await _dispatchService.GetShipmentDropdownAsync();
            return Ok(result);
        }

        #endregion

        #region Shipment Details

        [HttpGet("shipment-details/{shipmentInitiateId:int}")]
        public async Task<IActionResult> GetShipmentDetails(int shipmentInitiateId)
        {
            var result = await _dispatchService.GetShipmentDetailsAsync(shipmentInitiateId);

            if (result == null)
            {
                return NotFound(new
                {
                    Success = false,
                    Message = "Shipment not found."
                });
            }

            return Ok(result);
        }

        #endregion

        #region Get By Id

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _dispatchService.GetByIdAsync(id);

            if (result == null)
            {
                return NotFound(new
                {
                    Success = false,
                    Message = "Dispatch not found."
                });
            }

            return Ok(result);
        }

        #endregion

        #region Update

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] UpdateDispatchDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _dispatchService.UpdateAsync(dto);

                if (!result)
                {
                    return NotFound(new
                    {
                        Success = false,
                        Message = "Dispatch not found."
                    });
                }

                return Ok(new
                {
                    Success = true,
                    Message = "Dispatch updated successfully."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = ex.Message
                });
            }
        }

        #endregion

        #region Delete

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _dispatchService.DeleteAsync(id);

                if (!result)
                {
                    return NotFound(new
                    {
                        Success = false,
                        Message = "Dispatch not found."
                    });
                }

                return Ok(new
                {
                    Success = true,
                    Message = "Dispatch deleted successfully."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = ex.Message
                });
            }
        }

        #endregion
    }
}
