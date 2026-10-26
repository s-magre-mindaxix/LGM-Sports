using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.DTO.Installation;
using CompanyPlatform.Core.Models.CRM;
using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Crypto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Services.InstallationReport
{
    public class InstallationReportService : IInstallationReportService
    {
        private readonly ApplicationDBContext _context;

        public InstallationReportService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<InstallationReportDto>> GetAllInstallationReportsAsync()
        {
            return await _context.Tbl_InstallationReports
                .AsNoTracking() // Improves performance for read-only queries
                .Include(r => r.Company)
                .Include(r => r.Customer)
                .Include(r => r.Contacts)
                .Where(r => !r.IsDeleted)
                .Select(report => new InstallationReportDto
                {
                    Id = report.Id,
                    CompanyId = report.CompanyId,
                    CompanyName = report.Company.CompanyName,
                    CustomerId = report.CustomerId,
                    CustomerName = report.Customer.CustomerName,
                    InstallationDate = report.InstallationDate,
                    ProductInformation = report.ProductInformation,
                    InspectionSummary = report.InspectionSummary,
                    CustomerNotes = report.CustomerNotes,
                    Place = report.Place,
                    CreatedOn = report.CreatedOn,
                    Contacts = report.Contacts.Select(c => new InstallationContactDto
                    {
                        Id = c.Id,
                        Name = c.Name,
                        Designation = c.Designation
                    }).ToList()
                }).ToListAsync();
        }

        public async Task<InstallationReportDto> GetInstallationReportByIdAsync(int id)
        {
            var report = await _context.Tbl_InstallationReports
                .AsNoTracking()
                .Include(r => r.Company)
                .Include(r => r.Customer)
                .ThenInclude(c => c.Addresses)
                .Include(r => r.Contacts)
                .Where(r => r.Id == id && !r.IsDeleted)
                .Select(report => new InstallationReportDto
                {
                    Id = report.Id,
                    CompanyId = report.CompanyId,
                    CompanyName = report.Company.CompanyName,
                    CustomerId = report.CustomerId,
                    CustomerName = report.Customer.CustomerName,
                    AddressObj = report.Customer.Addresses
                    .Where(a => !a.IsDeleted)
                    .OrderByDescending(a => a.AddressType == "Correspondence")
                    .Select(a => new AddressDto
                    {
                        FlatBlockNo = a.FlatBlockNo,
                        PremisesName = a.PremisesName,
                        Road = a.Road,
                        Area = a.Area,
                        Town = a.Town,
                        PinNo = a.PinNo
                    })
                    .FirstOrDefault(),
                    InstallationDate = report.InstallationDate,
                    ProductInformation = report.ProductInformation,
                    InspectionSummary = report.InspectionSummary,
                    CustomerNotes = report.CustomerNotes,
                    Place = report.Place,
                    CreatedOn = report.CreatedOn,
                    Contacts = report.Contacts.Select(c => new InstallationContactDto
                    {
                        Id = c.Id,
                        Name = c.Name,
                        Designation = c.Designation
                    }).ToList()
                }).FirstOrDefaultAsync();

            if (report != null && report.AddressObj != null)
            {
                var a = report.AddressObj;

                report.CustomerAddress = string.Join(", ",
                    new[]
                    {
            $"{a.FlatBlockNo} {a.PremisesName}".Trim(),
            a.Road,
            a.Area,
            a.Town
                    }
                    .Where(x => !string.IsNullOrWhiteSpace(x))
                ) + (string.IsNullOrWhiteSpace(a.PinNo) ? "" : $" - {a.PinNo}");
            }
            else
            {
                report.CustomerAddress = "";
            }

            return report;
        }

        public async Task<InstallationReportDto> CreateInstallationReportAsync(CreateInstallationReportDto createDto)
        {
            // Manually map DTO to the entity
            var reportEntity = new Models.CRM.InstallationReport
            {
                CompanyId = createDto.CompanyId,
                CustomerId = createDto.CustomerId,
                InstallationDate = createDto.InstallationDate,
                ProductInformation = createDto.ProductInformation,
                InspectionSummary = createDto.InspectionSummary,
                CustomerNotes = createDto.CustomerNotes,
                Place = createDto.Place,
                CreatedOn = DateTime.UtcNow,
                IsDeleted = false,
                Contacts = createDto.Contacts.Select(c => new InstallationContact
                {
                    Name = c.Name,
                    Designation = c.Designation
                }).ToList()
            };

            _context.Tbl_InstallationReports.Add(reportEntity);
            await _context.SaveChangesAsync();

            return new InstallationReportDto
            {
                Id = reportEntity.Id,
                CompanyId = reportEntity.CompanyId,
                CustomerId = reportEntity.CustomerId,
                InstallationDate = reportEntity.InstallationDate,
                ProductInformation = reportEntity.ProductInformation,
                InspectionSummary = reportEntity.InspectionSummary,
                CustomerNotes = reportEntity.CustomerNotes,
                Place = reportEntity.Place,
                CreatedOn = reportEntity.CreatedOn,
                Contacts = reportEntity.Contacts.Select(c => new InstallationContactDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Designation = c.Designation
                }).ToList()
            };
        }

        public async Task<bool> UpdateInstallationReportAsync(int id, CreateInstallationReportDto updateDto)
        {
            var reportToUpdate = await _context.Tbl_InstallationReports
                .Include(r => r.Contacts)
                .FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted);

            if (reportToUpdate == null)
            {
                return false; 
            }

            reportToUpdate.CompanyId = updateDto.CompanyId;
            reportToUpdate.CustomerId = updateDto.CustomerId;
            reportToUpdate.InstallationDate = updateDto.InstallationDate;
            reportToUpdate.ProductInformation = updateDto.ProductInformation;
            reportToUpdate.InspectionSummary = updateDto.InspectionSummary;
            reportToUpdate.CustomerNotes = updateDto.CustomerNotes;
            reportToUpdate.Place = updateDto.Place;

            _context.Tbl_InstallationContacts.RemoveRange(reportToUpdate.Contacts);

            reportToUpdate.Contacts = updateDto.Contacts.Select(c => new InstallationContact
            {
                Name = c.Name,
                Designation = c.Designation
            }).ToList();

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteInstallationReportAsync(int id)
        {
            var report = await _context.Tbl_InstallationReports.FindAsync(id);
            if (report == null || report.IsDeleted)
            {
                return false;
            }

            report.IsDeleted = true; 
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
