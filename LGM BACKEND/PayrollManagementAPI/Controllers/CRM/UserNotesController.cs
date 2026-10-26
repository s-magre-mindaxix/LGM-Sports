using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.CRM.DTO.Dashboard;
using CompanyPlatform.CRM.Services.Dashboards.UserNote;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace PayrollManagementAPI.Controllers.CRM
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UserNotesController : ControllerBase
    {
        private readonly IUserNoteService _noteService;

        public UserNotesController(IUserNoteService noteService)
        {
            _noteService = noteService;
        }

        [HttpGet]
        public async Task<IActionResult> GetMyNotes()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var notes = await _noteService.GetUserNotesAsync(userId);
            return Ok(notes);
        }

        [HttpPost]
        public async Task<IActionResult> CreateNote([FromBody] CreateNoteRequest req)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var result = await _noteService.CreateNoteAsync(userId, req);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNote(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var deleted = await _noteService.DeleteNoteAsync(userId, id);

            if (!deleted) return NotFound();
            return Ok(new { message = "Note deleted" });
        }
    }
}
