using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.Core.Models.CRM.Dashboards;
using CompanyPlatform.CRM.DTO;
using CompanyPlatform.CRM.DTO.Dashboard;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace PayrollManagementAPI.Controllers.CRM
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class CommonDriveController : ControllerBase
    {
        private readonly ApplicationDBContext _context;
        private readonly string _commonPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "CommonDrive");

        public CommonDriveController(ApplicationDBContext context)
        {
            _context = context;
            if (!Directory.Exists(_commonPath)) Directory.CreateDirectory(_commonPath);
        }

        [HttpGet("files/{departmentId}")]
        public async Task<IActionResult> GetFilesByDepartment(int departmentId)
        {
            var files = await _context.Tbl_DriveFiles
                .Where(f => f.DepartmentId == departmentId)
                .Select(f => new FileResponse
                {
                    Id = f.Id,
                    FileName = f.FileName,
                    FilePath = f.FilePath,
                    FileType = f.FileType,
                    UploadedBy = f.UploadedBy,
                    UploadedAt = f.UploadedAt
                }).ToListAsync();
            return Ok(files);
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadCommonFile([FromForm] IFormFile file, [FromForm] int departmentId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var userRecord = await _context.Users
                .Include(u => u.Employee)
                .FirstOrDefaultAsync(u => u.Id == userId);

            string uploaderName = "System User";

            if (userRecord?.Employee != null)
            {
                uploaderName = $"{userRecord.Employee.FirstName} {userRecord.Employee.LastName}";
            }
            else if (!string.IsNullOrEmpty(userRecord?.UserName))
            {
                uploaderName = userRecord.UserName; // Fallback to Email
            }

            var dept = await _context.Departments.FindAsync(departmentId);
            if (dept == null) return BadRequest("Department not found");

            var deptFolder = Path.Combine(_commonPath, dept.DepartmentName);
            if (!Directory.Exists(deptFolder)) Directory.CreateDirectory(deptFolder);

            var fileName = $"{Guid.NewGuid()}_{file.FileName}";
            var fullPath = Path.Combine(deptFolder, fileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var driveFile = new DriveFile
            {
                FileName = file.FileName,
                FilePath = $"/CommonDrive/{dept.DepartmentName}/{fileName}",
                FileType = file.ContentType,
                FileSize = file.Length,
                DepartmentId = departmentId,
                UserId = userId,
                UploadedBy = uploaderName, // Now guaranteed to be a string
                UploadedAt = DateTime.UtcNow
            };

            _context.Tbl_DriveFiles.Add(driveFile);
            await _context.SaveChangesAsync();

            return Ok(driveFile);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCommonFile(int id)
        {
            var file = await _context.Tbl_DriveFiles.FindAsync(id);

            if (file == null) return NotFound();

            // 1. Delete physical file
            var physicalPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", file.FilePath.TrimStart('/'));
            if (System.IO.File.Exists(physicalPath))
            {
                System.IO.File.Delete(physicalPath);
            }

            // 2. Remove from DB
            _context.Tbl_DriveFiles.Remove(file);
            await _context.SaveChangesAsync();

            return Ok(new { message = "File deleted successfully" });
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
                file.FilePath.TrimStart('/').Replace("/", Path.DirectorySeparatorChar.ToString())
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
