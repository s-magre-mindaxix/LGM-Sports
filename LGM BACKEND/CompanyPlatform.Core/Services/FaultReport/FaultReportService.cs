using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.DTO.FaultReport;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.Core.Services.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Services.FaultReport
{
    public class FaultReportService : IFaultReportService
    {
        private readonly ApplicationDBContext _context;
        private readonly IFileService _fileService;


        public FaultReportService(ApplicationDBContext context, IFileService fileService) 
        {
            _context = context;
            _fileService = fileService;
        }

        private string SanitizeFolderName(string name)
        {
            if (string.IsNullOrEmpty(name)) return "default_fault_report";
            var trimmedName = name.Trim();
            return string.Join("_", trimmedName.Split(Path.GetInvalidFileNameChars()));
        }
        public async Task<IEnumerable<FaultReportDto>> GetAllAsync()
        {
            return await _context.Tbl_FaultReports 
                .Where(fr => !fr.IsDeleted)
                .Include(fr => fr.Customer) 
                .Select(fr => new FaultReportDto
                {
                    // Map Entity to DTO
                    Id = fr.Id,
                    Device = fr.Device,
                    CustomerId = fr.CustomerId,
                    CustomerName = fr.Customer.CustomerName,
                    SerialNumber = fr.SerialNumber,
                    Firmware = fr.Firmware,
                    Software = fr.Software,
                    SoftwareVersion = fr.SoftwareVersion,
                    SpecialSoftware = fr.SpecialSoftware,
                    Configuration = fr.Configuration,
                    PowerSource = fr.PowerSource,
                    CabelsConnected = fr.CabelsConnected,
                    ModulesConnected = fr.ModulesConnected,
                    ModulesFirmware = fr.ModulesFirmware,
                    Voltage = fr.Voltage,
                    LED = fr.LED,
                    InternalBattery = fr.InternalBattery,
                    GpsBattery = fr.GpsBattery,
                    ColdStarted = fr.ColdStarted,
                    DefaultReset = fr.DefaultReset,
                    SettingChecked = fr.SettingChecked,
                    FirmwareUpdated = fr.FirmwareUpdated,
                    Notes = fr.Notes,
                    Comments = fr.Comments,
                    ReportDate = fr.ReportDate,
                    UploadedFiles = fr.UploadedFiles
                })
                .ToListAsync();
        }

        public async Task<FaultReportDto> GetByIdAsync(int id)
        {
            var faultReport = await _context.Tbl_FaultReports
                .Include(fr => fr.Customer)
                .FirstOrDefaultAsync(fr => fr.Id == id && !fr.IsDeleted);

            if (faultReport == null) return null;

            return new FaultReportDto
            {
                Id = faultReport.Id,
                Device = faultReport.Device,
                CustomerId = faultReport.CustomerId,
                CustomerName = faultReport.Customer.CustomerName,
                SerialNumber = faultReport.SerialNumber,
                Firmware = faultReport.Firmware,
                Software = faultReport.Software,
                SoftwareVersion = faultReport.SoftwareVersion,
                SpecialSoftware = faultReport.SpecialSoftware,
                Configuration = faultReport.Configuration,
                PowerSource = faultReport.PowerSource,
                CabelsConnected = faultReport.CabelsConnected,
                ModulesConnected = faultReport.ModulesConnected,
                ModulesFirmware = faultReport.ModulesFirmware,
                Voltage = faultReport.Voltage,
                LED = faultReport.LED,
                InternalBattery = faultReport.InternalBattery,
                GpsBattery = faultReport.GpsBattery,
                ColdStarted = faultReport.ColdStarted,
                DefaultReset = faultReport.DefaultReset,
                SettingChecked = faultReport.SettingChecked,
                FirmwareUpdated = faultReport.FirmwareUpdated,
                Notes = faultReport.Notes,
                Comments = faultReport.Comments,
                ReportDate = faultReport.ReportDate,
                UploadedFiles = faultReport.UploadedFiles
            };
        }

        public async Task<FaultReportDto> CreateAsync(FaultReportDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var entity = new Models.CRM.FaultReport
                {
                // Map DTO to Entity
                Device = dto.Device,
                CustomerId = dto.CustomerId,
                SerialNumber = dto.SerialNumber,
                Firmware = dto.Firmware,
                Software = dto.Software,
                SoftwareVersion = dto.SoftwareVersion,
                SpecialSoftware = dto.SpecialSoftware,
                Configuration = dto.Configuration,
                PowerSource = dto.PowerSource,
                CabelsConnected = dto.CabelsConnected,
                ModulesConnected = dto.ModulesConnected,
                ModulesFirmware = dto.ModulesFirmware,
                Voltage = dto.Voltage,
                LED = dto.LED,
                InternalBattery = dto.InternalBattery,
                GpsBattery = dto.GpsBattery,
                ColdStarted = dto.ColdStarted,
                DefaultReset = dto.DefaultReset,
                SettingChecked = dto.SettingChecked,
                FirmwareUpdated = dto.FirmwareUpdated,
                Notes = dto.Notes,
                Comments = dto.Comments,
                ReportDate = DateTime.UtcNow,
                UploadedFiles = "",
                IsDeleted = false
            };

            _context.Tbl_FaultReports.Add(entity);
            await _context.SaveChangesAsync();

                if (dto.ReportFiles != null && dto.ReportFiles.Any())
                {
                    var customer = await _context.Tbl_Customers.FindAsync(entity.CustomerId);
                    var folderName = SanitizeFolderName($"{customer?.CustomerName}_FaultReport_{entity.Id}");
                    var filePaths = new List<string>();
                    foreach (var file in dto.ReportFiles)
                    {
                        filePaths.Add(await _fileService.SaveFileAsync(file, folderName));
                    }
                    entity.UploadedFiles = string.Join(";", filePaths);
                    await _context.SaveChangesAsync(); // Save the file paths
                }

                await transaction.CommitAsync();
                dto.Id = entity.Id;
                return dto;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> UpdateAsync(int id, FaultReportDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var entity = await _context.Tbl_FaultReports.FindAsync(id);

            if (entity == null || entity.IsDeleted) return false;

            // Update properties
            entity.Device = dto.Device;
            entity.CustomerId = dto.CustomerId;
            entity.SerialNumber = dto.SerialNumber;
            entity.Firmware = dto.Firmware;
            entity.Software = dto.Software;
            entity.SoftwareVersion = dto.SoftwareVersion;
            entity.SpecialSoftware = dto.SpecialSoftware;
            entity.Configuration = dto.Configuration;
            entity.PowerSource = dto.PowerSource;
            entity.CabelsConnected = dto.CabelsConnected;
            entity.ModulesConnected = dto.ModulesConnected;
            entity.ModulesFirmware = dto.ModulesFirmware;
            entity.Voltage = dto.Voltage;
            entity.LED = dto.LED;
            entity.InternalBattery = dto.InternalBattery;
            entity.GpsBattery = dto.GpsBattery;
            entity.ColdStarted = dto.ColdStarted;
            entity.DefaultReset = dto.DefaultReset;
            entity.SettingChecked = dto.SettingChecked;
            entity.FirmwareUpdated = dto.FirmwareUpdated;
            entity.Notes = dto.Notes;
            entity.Comments = dto.Comments;
            var existingFileList = entity.UploadedFiles?.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>();

                if (dto.FilesToDelete != null)
                {
                    foreach (var f in dto.FilesToDelete)
                    {
                        await _fileService.DeleteFileAsync(f);
                        existingFileList.Remove(f);
                    }
                }

                // 2. Add new files
                if (dto.ReportFiles != null)
                {
                    var customer = await _context.Tbl_Customers.FindAsync(entity.CustomerId);
                    var folder = SanitizeFolderName($"{customer?.CustomerName}_FaultReport_{id}");
                    foreach (var f in dto.ReportFiles)
                    {
                        existingFileList.Add(await _fileService.SaveFileAsync(f, folder));
                    }
                }
                entity.UploadedFiles = string.Join(";", existingFileList);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }


        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.Tbl_FaultReports.FindAsync(id);

            if (entity == null || entity.IsDeleted) return false;

            // Soft delete
            entity.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
