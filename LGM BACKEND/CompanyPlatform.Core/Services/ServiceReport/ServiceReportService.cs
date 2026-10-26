using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.DTO.ServiceReport;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.Core.Services.Common;
using CompanyPlatform.Core.Services.Notification;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Services.ServiceReport
{
    public class ServiceReportService : IServiceReportService
    {
        private readonly ApplicationDBContext _context;
        private readonly IFileService _fileService;
        private readonly INotificationHelper _notificationHelper;
        public ServiceReportService(ApplicationDBContext context, IFileService fileService, INotificationHelper notificationHelper)
        {
            _context = context;
            _fileService = fileService;
            _notificationHelper = notificationHelper;
        }


        public async Task<IEnumerable<ServiceReportDto>> GetAllServiceReportsAsync()
        {
            return await _context.Tbl_ServiceReports
                .Where(sr => !sr.IsDeleted)
                .Include(sr => sr.Customer)
                .Include(sr => sr.Product)
                .Include(sr => sr.Accessory)
                .OrderByDescending(sr => sr.Id)
                .Select(sr => new ServiceReportDto
                {
                    Id = sr.Id,
                    ReportNo = sr.ReportNo,
                    Date = sr.Date,
                    CustomerId = sr.CustomerId,
                    CustomerName = sr.Customer.CustomerName,
                    ProductId = sr.ProductId,
                    //ProductName = sr.Product != null ? sr.Product.ProductName : null,
                    ProductName = sr.Product != null ? sr.Product.ProductName : sr.Items
                              .Select(i => i.Description)
                              .FirstOrDefault(),
                    AccessoryId = sr.AccessoryId,
                    AccessoryName = sr.Accessory != null ? sr.Accessory.AccessoriesName : null,
                    SerialNumber = sr.SerialNumber,
                    InspectionSummary = sr.InspectionSummary,
                    CustomerReported = sr.CustomerReported,
                    FinalComments = sr.FinalComments,
                    UploadedFiles = sr.UploadedFiles
                    // Note: Items are usually not needed in the "List View", 
                    // but you can add them here if your UI requires it.
                }).ToListAsync();
        }
       

        private string SanitizeFolderName(string name)
        {
            if (string.IsNullOrEmpty(name)) return "default_report";
            var trimmedName = name.Trim();
            return string.Join("_", trimmedName.Split(Path.GetInvalidFileNameChars()));
        }



        public async Task<ServiceReportDto> GetServiceReportByIdAsync(int id)
        {
            var serviceReport = await _context.Tbl_ServiceReports
                .Where(sr => !sr.IsDeleted && sr.Id == id)
                .Include(sr => sr.Customer)
                .Include(sr => sr.Product)
                .Include(sr => sr.Accessory)
                .Include(sr => sr.Items) // Crucial: Load the items list
                .FirstOrDefaultAsync();

            if (serviceReport == null) return null;

            return new ServiceReportDto
            {
                Id = serviceReport.Id,
                ReportNo = serviceReport.ReportNo,
                Date = serviceReport.Date,
                CustomerId = serviceReport.CustomerId,
                CustomerName = serviceReport.Customer?.CustomerName,
                ProductId = serviceReport.ProductId ?? 0,
                ProductName = serviceReport.Product?.ProductName,
                AccessoryId = serviceReport.AccessoryId ?? 0,
                AccessoryName = serviceReport.Accessory?.AccessoriesName,
                SerialNumber = serviceReport.SerialNumber,
                InspectionSummary = serviceReport.InspectionSummary,
                SoftwareCheck = serviceReport.SoftwareCheck,
                PortTesting = serviceReport.PortTesting,
                FirmwareCheck = serviceReport.FirmwareCheck,
                PhysicalInspection = serviceReport.PhysicalInspection,
                ICReplacement = serviceReport.ICReplacement,
                FinalComments = serviceReport.FinalComments,
                UploadedFiles = serviceReport.UploadedFiles,
                CustomerReported = serviceReport.CustomerReported,
                Items = serviceReport.Items.Select(i => new ServiceReportItemDto
                {
                    //ItemType = i.ItemType,
                    //ProductId = i.ProductId ?? 0,
                    //AccessoryId = i.AccessoryId ?? 0,
                    ItemType = string.IsNullOrWhiteSpace(i.ItemType) ? "Product" : i.ItemType,
                    ProductId = i.ItemType == "Product" ? (i.ProductId ?? 0) : 0,
                    AccessoryId = i.ItemType == "Accessory" ? (i.AccessoryId ?? 0) : 0,
                    ServiceId = i.ItemType == "Service" ? (i.ServiceId ?? 0) : 0,
                    ServicePartNo = i.ItemType == "Service" ? i.ServicePartNo : null,
                    Quantity = i.Quantity,
                    Description = i.Description,
                    Rate = i.Rate,
                    FinalPrice = i.FinalPrice,
                    HsnSacCode = i.HsnSacCode
                    //HsnSacCode = i.ItemType == "Service" ? null : i.HsnSacCode
                }).ToList()
            };
        }



        public async Task<ServiceReportDto> CreateServiceReportAsync(ServiceReportDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var serviceReport = new Models.CRM.ServiceReport
                {
                    Date = dto.Date,
                    CustomerId = dto.CustomerId,
                    ReportNo = "",
                    //OrderAcceptanceId = dto.OrderAcceptanceId,
                    OrderAcceptanceId = dto.OrderAcceptanceId > 0
                    ? dto.OrderAcceptanceId
                    : null,
                    ProductId = dto.ProductId > 0 ? dto.ProductId : null,
                    AccessoryId = dto.AccessoryId > 0 ? dto.AccessoryId : null,
                    SerialNumber = dto.SerialNumber ?? "",
                    InspectionSummary = dto.InspectionSummary ?? "",
                    SoftwareCheck = dto.SoftwareCheck ?? "",
                    PortTesting = dto.PortTesting ?? "",
                    FirmwareCheck = dto.FirmwareCheck ?? "",
                    PhysicalInspection = dto.PhysicalInspection ?? "",
                    ICReplacement = dto.ICReplacement ?? "",
                    FinalComments = dto.FinalComments ?? "",
                    CustomerReported = dto.CustomerReported ?? "",
                    UploadedFiles = ""
                };

                _context.Tbl_ServiceReports.Add(serviceReport);
                await _context.SaveChangesAsync(); // Saves Header to get serviceReport.Id

                serviceReport.ReportNo = $"GS-SR-{serviceReport.Id:D3}";
                await _context.SaveChangesAsync();


                if (dto.Items != null && dto.Items.Any())
                {
                    foreach (var item in dto.Items)
                    {
                        var itemType = string.IsNullOrWhiteSpace(item.ItemType)
                            ? "Product"
                            : item.ItemType.Trim();

                        var reportItem = new ServiceReportItem
                        {
                            ServiceReportId = serviceReport.Id,
                            ItemType = itemType,

                            ProductId = itemType.Equals("Product", StringComparison.OrdinalIgnoreCase) && item.ProductId > 0
                                ? item.ProductId
                                : null,

                            AccessoryId = itemType.Equals("Accessory", StringComparison.OrdinalIgnoreCase) && item.AccessoryId > 0
                                ? item.AccessoryId
                                : null,

                            ServiceId = itemType.Equals("Service", StringComparison.OrdinalIgnoreCase) && item.ServiceId > 0
                                ? item.ServiceId
                                : null,

                            ServicePartNo = itemType.Equals("Service", StringComparison.OrdinalIgnoreCase)
                                ? item.ServicePartNo
                                : null,

                            Quantity = item.Quantity,
                            Description = item.Description ?? "",
                            Rate = item.Rate,
                            Discount = item.Discount,
                            TaxPercentage = item.TaxPercentage,
                            GstTax = item.GstTax,
                            FinalPrice = item.FinalPrice,

                            //HsnSacCode = itemType.Equals("Service", StringComparison.OrdinalIgnoreCase)
                            //    ? null
                            //    : item.HsnSacCode
                            HsnSacCode = item.HsnSacCode
                        };
                        _context.Set<ServiceReportItem>().Add(reportItem);
                    }
                    await _context.SaveChangesAsync();
                }

                
                if (dto.ReportFiles != null && dto.ReportFiles.Any())
                {
                    var customer = await _context.Tbl_Customers.FindAsync(serviceReport.CustomerId);
                    var folderName = SanitizeFolderName($"{customer?.CustomerName}_Report_{serviceReport.Id}");
                    var filePaths = new List<string>();
                    foreach (var file in dto.ReportFiles)
                    {
                        filePaths.Add(await _fileService.SaveFileAsync(file, folderName));
                    }
                    serviceReport.UploadedFiles = string.Join(";", filePaths);
                    await _context.SaveChangesAsync();
                }

                await transaction.CommitAsync();

                if (serviceReport.OrderAcceptanceId.HasValue)
                {
                    var accountEmployees = await (
                        from user in _context.Users
                        join userRole in _context.UserRoles
                            on user.Id equals userRole.UserId
                        join role in _context.Roles
                            on userRole.RoleId equals role.Id
                        where role.Name == "Account"
                        select user.EmployeeId
                    ).ToListAsync();

                    var customerName = await _context.Tbl_Customers
                        .Where(c => c.Id == serviceReport.CustomerId)
                        .Select(c => c.CustomerName)
                        .FirstOrDefaultAsync();

                    var oaNo = await _context.Tbl_OrderAcceptances
                        .Where(x => x.OrderAcceptanceId == serviceReport.OrderAcceptanceId)
                        .Select(x => x.GaxcePurchaseOrderNo)
                        .FirstOrDefaultAsync();

                    foreach (var employeeId in accountEmployees.Distinct())
                    {
                        await _notificationHelper.SendNotificationToEmployeeAsync(
                            employeeId,
                            $"Service Report for OA '{oaNo}' and customer '{customerName}' is ready for invoicing."
                        );
                    }
                }

                dto.Id = serviceReport.Id;
                dto.ReportNo = serviceReport.ReportNo;
                return dto;
            }
            catch { await transaction.RollbackAsync(); throw; }
        }

        public async Task<bool> UpdateServiceReportAsync(int id, ServiceReportDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var serviceReport = await _context.Tbl_ServiceReports
                    .Include(sr => sr.Items)
                    .FirstOrDefaultAsync(sr => sr.Id == id && !sr.IsDeleted);

                if (serviceReport == null) return false;

              
                serviceReport.Date = dto.Date;
                serviceReport.CustomerId = dto.CustomerId;
                serviceReport.ProductId = dto.ProductId > 0 ? dto.ProductId : null;
                serviceReport.AccessoryId = dto.AccessoryId > 0 ? dto.AccessoryId : null;
                serviceReport.SerialNumber = dto.SerialNumber;
                serviceReport.InspectionSummary = dto.InspectionSummary;
                serviceReport.SoftwareCheck = dto.SoftwareCheck;
                serviceReport.PortTesting = dto.PortTesting;
                serviceReport.FirmwareCheck = dto.FirmwareCheck;
                serviceReport.PhysicalInspection = dto.PhysicalInspection;
                serviceReport.ICReplacement = dto.ICReplacement;
                serviceReport.FinalComments = dto.FinalComments;
                serviceReport.CustomerReported = dto.CustomerReported ?? "";

                _context.Set<ServiceReportItem>().RemoveRange(serviceReport.Items);
                if (dto.Items != null)
                {
                    foreach (var item in dto.Items)
                    {
                        _context.Set<ServiceReportItem>().Add(new ServiceReportItem
                        {
                            ServiceReportId = serviceReport.Id,
                            //ItemType = item.ItemType,
                            ItemType = string.IsNullOrWhiteSpace(item.ItemType) ? "Product" : item.ItemType,
                            ProductId = item.ItemType == "Product" && item.ProductId > 0
                            ? item.ProductId
                            : null,
                            AccessoryId = item.ItemType == "Accessory" && item.AccessoryId > 0
                            ? item.AccessoryId
                            : null,
                            ServiceId = item.ItemType == "Service" && item.ServiceId > 0
                            ? item.ServiceId
                            : null,
                            ServicePartNo = item.ItemType == "Service"
                            ? item.ServicePartNo
                            : null,
                            Quantity = item.Quantity,
                            Description = item.Description ?? "",
                            Rate = item.Rate,
                            FinalPrice = item.FinalPrice,
                            //HsnSacCode = item.ItemType == "Service" ? null : item.HsnSacCode
                            HsnSacCode = item.HsnSacCode
                        });
                    }
                }

        
                var existingFileList = serviceReport.UploadedFiles?.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>();
                if (dto.FilesToDelete != null)
                {
                    foreach (var f in dto.FilesToDelete)
                    {
                        await _fileService.DeleteFileAsync(f);
                        existingFileList.Remove(f);
                    }
                }
               
                if (dto.ReportFiles != null)
                {
                    var customer = await _context.Tbl_Customers.FindAsync(serviceReport.CustomerId);
                    var folder = SanitizeFolderName($"{customer?.CustomerName}_Report_{id}");
                    foreach (var f in dto.ReportFiles)
                    {
                        existingFileList.Add(await _fileService.SaveFileAsync(f, folder));
                    }
                }
                serviceReport.UploadedFiles = string.Join(";", existingFileList);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch { await transaction.RollbackAsync(); throw; }
        }

        public async Task<bool> DeleteServiceReportAsync(int id)
        {
            var serviceReport = await _context.Tbl_ServiceReports.FindAsync(id);
            if (serviceReport == null)
            {
                return false;
            }

            serviceReport.IsDeleted = true; // Soft delete
            _context.Entry(serviceReport).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return true;
        }

        private bool ServiceReportExists(int id)
        {
            return _context.Tbl_ServiceReports.Any(e => e.Id == id && !e.IsDeleted);
        }
    }
}
