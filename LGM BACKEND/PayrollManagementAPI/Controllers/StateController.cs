using CompanyPlatform.Core.DTO;
using CompanyPlatform.Core.Services.State;
using Microsoft.AspNetCore.Mvc;

[Route("api/[controller]")]
[ApiController]
public class StateController : ControllerBase
{
    private readonly IStateService _service;

    public StateController(IStateService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

    [HttpPost]
   
        public async Task<IActionResult> Create([FromBody] StateDto dto) =>

        Ok(await _service.CreateAsync(dto));

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] StateDto dto) =>
        Ok(await _service.UpdateAsync(id, dto));

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id) =>
        Ok(await _service.DeleteAsync(id));
}
