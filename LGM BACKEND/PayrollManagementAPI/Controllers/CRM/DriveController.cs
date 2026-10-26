using CompanyPlatform.Core.Data;
using CompanyPlatform.CRM.DTO.Dashboard;
using CompanyPlatform.CRM.Services.Dashboards.Drive;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace PayrollManagementAPI.Controllers.CRM
{
    [Route("api/[controller]")]
    [ApiController]
    public class DriveController : ControllerBase
    {
        private readonly IDriveService _driveService;

        private readonly ApplicationDBContext _context;
        public DriveController(IDriveService driveService, ApplicationDBContext context)
        {
            _driveService = driveService;
            _context = context;
        }

        [HttpGet("content")]
        public async Task<IActionResult> GetContent(int? folderId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Ok(await _driveService.GetFolderContent(userId, folderId));
        }

        [HttpPost("folder")]
        public async Task<IActionResult> CreateFolder([FromBody] CreateFolderRequest req)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Ok(await _driveService.CreateFolder(userId, req.Name, req.ParentId));
        }

        [HttpPost("upload")]
        public async Task<IActionResult> Upload([FromForm] IFormFile file, [FromForm] int? folderId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Ok(await _driveService.UploadFile(userId, file, folderId));
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteItem(int id, bool isFolder)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            await _driveService.DeleteItem(userId, id, isFolder);
            return Ok(new { message = "Deleted successfully" });
        }

        [HttpGet("download/{id}")]
        public async Task<IActionResult> DownloadFile(int id)
        {
            var file = await _context.Tbl_DriveFiles.FindAsync(id);

            if (file == null)
                return NotFound();

            var physicalPath = Path.Combine(
                Directory.GetCurrentDirectory(),
                "wwwroot",
                file.FilePath.TrimStart('/')
                    .Replace("/", Path.DirectorySeparatorChar.ToString())
            );

            if (!System.IO.File.Exists(physicalPath))
                return NotFound();

            var fileBytes = await System.IO.File.ReadAllBytesAsync(physicalPath);

            return File(
                fileBytes,
                file.FileType,
                file.FileName // ORIGINAL FILE NAME
            );
        }
    }
}
