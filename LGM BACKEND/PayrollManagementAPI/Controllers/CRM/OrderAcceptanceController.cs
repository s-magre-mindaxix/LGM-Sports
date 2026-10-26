

using CompanyPlatform.CRM.Services.OrderAcceptance;
using CompanyPlatform.CRM.DTO.OrderAcceptance;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class OrderAcceptanceController : ControllerBase
{
    private readonly IOrderAcceptanceService _service;

    public OrderAcceptanceController(IOrderAcceptanceService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        return result != null ? Ok(result) : NotFound();
    }

    [HttpPost]
    public async Task<IActionResult> Create(OrderAcceptanceDto dto) => Ok(new { id = await _service.CreateAsync(dto) });

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, OrderAcceptanceDto dto)
    {
        if (id != dto.OrderAcceptanceId) return BadRequest();
        return Ok(await _service.UpdateAsync(dto));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id) => Ok(await _service.DeleteAsync(id));

    [HttpGet("next-number")]
    public async Task<IActionResult> GetNextNumber() => Ok(new { number = await _service.GetNextOANumberAsync() });

    [HttpGet("final-offers")]
    public async Task<IActionResult> GetFinalOffers() => Ok(await _service.GetFinalOffersAsync());

    [HttpGet("final-service-offers")]
    public async Task<IActionResult> GetFinalServiceOffers()
        => Ok(await _service.GetFinalServiceOffersAsync());
    [HttpPost("aggregated-offer-data")]
    public async Task<IActionResult> GetAggregatedOfferData([FromBody] List<int> offerIds)
    {
        var result = await _service.GetAggregatedOfferDataAsync(offerIds);
        return result != null ? Ok(result) : NotFound();
    }
}