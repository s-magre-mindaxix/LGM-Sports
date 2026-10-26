using CompanyPlatform.Core.Data;
using CompanyPlatform.ERP.DTO.ShipmentItem;
using CompanyPlatform.ERP.Services.Email;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.Services.ShipmentAgencyAssignment
{
    public class ShipmentAgencyAssignmentService : IShipmentAgencyAssignmentService
    {
        private readonly ApplicationDBContext _context;
        private readonly IShipmentEmailService _emailService;

        public ShipmentAgencyAssignmentService(ApplicationDBContext context, IShipmentEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        public async Task<ShipmentAgencyAssignmentDetailsDto> CreateAsync(CreateShipmentAgencyAssignmentDto dto)
        {
            var shipment = await _context.Tbl_ShipmentInitiates
                .Include(x => x.Items)
                .FirstOrDefaultAsync(x =>
                    x.ShipmentInitiateId == dto.ShipmentInitiateId &&
                    !x.IsDeleted);

            if (shipment == null)
                throw new Exception("Shipment not found");

            var agency = await _context.Tbl_Agencies
                .FirstOrDefaultAsync(x =>
                    x.Id == dto.AgencyId);

            if (agency == null)
                throw new Exception("Agency not found");

            var entity = new Core.Models.ERP.Shipment.ShipmentAgencyAssignment
            {
                ShipmentInitiateId = dto.ShipmentInitiateId,
                AgencyId = dto.AgencyId,
                Remarks = dto.Remarks
            };

            _context.Tbl_ShipmentAgencyAssignments.Add(entity);

            await _context.SaveChangesAsync();

            return new ShipmentAgencyAssignmentDetailsDto
            {
                ShipmentAgencyAssignmentId = entity.ShipmentAgencyAssignmentId,
                ShipmentInitiateId = shipment.ShipmentInitiateId,
                ShipmentNo = shipment.ShipmentNo,
                CustomerName = shipment.CustomerName,
                GSTNo = shipment.GSTNo,
                ConsigneeAddress = shipment.ConsigneeAddress,
                ShipperAddress = shipment.ShipperAddress,
                InvoiceValue = shipment.InvoiceValue,
                CurrencyName = shipment.CurrencyName,
                InvoiceNo = shipment.InvoiceNo,
                InvoiceDate = shipment.InvoiceDate,
                ShipmentDate = shipment.ShipmentDate,
                AgencyId = agency.Id,
                AgencyName = agency.AgencyName,
                PickerAddress = dto.PickerAddress,
                DeliveryAddress = dto.DeliveryAddress,
                Remarks = entity.Remarks,

                ShipmentItems = shipment.Items
                    .Select(item => new ShipmentItemDtos
                    {
                        ShipmentItemId = item.ShipmentItemId,
                        BoxNo = item.BoxNo,
                        NetWeightKg = item.NetWeightKg,
                        GrossWeightKg = item.GrossWeightKg,
                        LengthCm = item.LengthCm,
                        WidthCm = item.WidthCm,
                        HeightCm = item.HeightCm,
                        CBM = item.CBM,
                        Remarks = item.Remarks
                    })
                    .ToList()
            };
        }

        public async Task<List<ShipmentAgencyAssignmentResponseDto>> GetAllAsync()
        {
            return await _context.Tbl_ShipmentAgencyAssignments
                .Where(x => !x.IsDeleted)
                .Include(x => x.ShipmentInitiate)
                .Include(x => x.Agency)
                .ThenInclude(x => x.AgencyType)
                .Select(x => new ShipmentAgencyAssignmentResponseDto
                {
                    ShipmentAgencyAssignmentId = x.ShipmentAgencyAssignmentId,
                    ShipmentInitiateId = x.ShipmentInitiateId,
                    ShipmentNo = x.ShipmentInitiate.ShipmentNo,
                    AgencyId = x.AgencyId,
                    AgencyName = x.Agency.AgencyName,
                    AgencyType = x.Agency.AgencyType.AgencyTypeName,
                    AssignedDate = x.AssignedDate,
                    Remarks = x.Remarks

                })
                .ToListAsync();
        }

        public async Task<List<ShipmentAgencyAssignmentResponseDto>> GetByShipmentIdAsync(int shipmentId)
        {
            return await _context.Tbl_ShipmentAgencyAssignments
                .Where(x =>
                    !x.IsDeleted &&
                    x.ShipmentInitiateId == shipmentId)
                .Include(x => x.ShipmentInitiate)
                .Include(x => x.Agency)
                .ThenInclude(x => x.AgencyType)
                .Select(x => new ShipmentAgencyAssignmentResponseDto
                {
                    ShipmentAgencyAssignmentId = x.ShipmentAgencyAssignmentId,
                    ShipmentInitiateId = x.ShipmentInitiateId,
                    ShipmentNo = x.ShipmentInitiate.ShipmentNo,
                    AgencyId = x.AgencyId,
                    AgencyName = x.Agency.AgencyName,
                    AgencyType = x.Agency.AgencyType.AgencyTypeName,
                    AssignedDate = x.AssignedDate,
                    Remarks = x.Remarks

                })
                .ToListAsync();
        }

        public async Task<ShipmentAgencyAssignmentResponseDto> UpdateAsync(UpdateShipmentAgencyAssignmentDto dto)
        {
            var entity =
                await _context.Tbl_ShipmentAgencyAssignments
                .FirstOrDefaultAsync(x =>
                    x.ShipmentAgencyAssignmentId ==
                    dto.ShipmentAgencyAssignmentId);

            if (entity == null)
                throw new Exception("Record not found");

            entity.ShipmentInitiateId = dto.ShipmentInitiateId;
            entity.AgencyId = dto.AgencyId;
            entity.Remarks = dto.Remarks;
            entity.PickerAddress = dto.PickerAddress;
            entity.DeliveryAddress = dto.DeliveryAddress;
            await _context.SaveChangesAsync();

            return await GetAssignment(entity.ShipmentAgencyAssignmentId);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity =
                await _context.Tbl_ShipmentAgencyAssignments
                .FirstOrDefaultAsync(x =>
                    x.ShipmentAgencyAssignmentId == id);

            if (entity == null)
                return false;

            entity.IsDeleted = true;

            await _context.SaveChangesAsync();

            return true;
        }

        private async Task<ShipmentAgencyAssignmentResponseDto> GetAssignment(int id)
        {
            return await _context.Tbl_ShipmentAgencyAssignments
                .Where(x =>
                    x.ShipmentAgencyAssignmentId == id)
                .Include(x => x.ShipmentInitiate)
                .Include(x => x.Agency)
                .ThenInclude(x => x.AgencyType)
                .Select(x => new ShipmentAgencyAssignmentResponseDto
                {
                    ShipmentAgencyAssignmentId = x.ShipmentAgencyAssignmentId,
                    ShipmentInitiateId = x.ShipmentInitiateId,
                    ShipmentNo = x.ShipmentInitiate.ShipmentNo,
                    AgencyId = x.AgencyId,
                    AgencyName = x.Agency.AgencyName,
                    AgencyType = x.Agency.AgencyType.AgencyTypeName,
                    AssignedDate = x.AssignedDate,
                    Remarks = x.Remarks

                })
                .FirstAsync();
        }

        public async Task<List<ShipmentDropdownDtos>> GetShipmentDropdownAsync()
        {
            return await _context.Tbl_ShipmentInitiates
                .Where(x => !x.IsDeleted)
                .OrderByDescending(x => x.ShipmentInitiateId)
                .Select(x => new ShipmentDropdownDtos
                {
                    ShipmentInitiateId = x.ShipmentInitiateId,
                    ShipmentNo = x.ShipmentNo
                })
                .ToListAsync();
        }

        public async Task<ShipmentDetailsDto> GetShipmentDetailsAsync(int shipmentInitiateId)
        {
            var shipment = await _context.Tbl_ShipmentInitiates
                .Include(x => x.Items)
                .FirstOrDefaultAsync(x =>
                    x.ShipmentInitiateId == shipmentInitiateId &&
                    !x.IsDeleted);

            if (shipment == null)
                throw new Exception("Shipment not found");

            return new ShipmentDetailsDto
            {
                ShipmentInitiateId = shipment.ShipmentInitiateId,
                ShipmentNo = shipment.ShipmentNo,
                SourceType = shipment.SourceType,
                SourceDocumentNo = shipment.SourceDocumentNo,
                CustomerId = shipment.CustomerId,
                CustomerName = shipment.CustomerName,
                GSTNo = shipment.GSTNo,
                ConsigneeAddress = shipment.ConsigneeAddress,
                ShipperAddress = shipment.ShipperAddress,
                InvoiceValue = shipment.InvoiceValue,
                CurrencyName = shipment.CurrencyName,
                ShipmentModeId = shipment.ShipmentModeId,
                InvoiceNo = shipment.InvoiceNo,
                InvoiceDate = shipment.InvoiceDate,
                ShipmentDate = shipment.ShipmentDate,
                Remarks = shipment.Remarks,
                Status = shipment.Status,

                ShipmentItems = shipment.Items
                    .Select(item => new ShipmentItemDtos
                    {
                        ShipmentItemId = item.ShipmentItemId,
                        BoxNo = item.BoxNo,
                        NetWeightKg = item.NetWeightKg,
                        GrossWeightKg = item.GrossWeightKg,
                        LengthCm = item.LengthCm,
                        WidthCm = item.WidthCm,
                        HeightCm = item.HeightCm,
                        CBM = item.CBM,
                        Remarks = item.Remarks
                    })
                    .ToList()
            };
        }

        public async Task<object> GetAgencyDetailsAsync(int agencyId)
        {
            return await _context.Tbl_Agencies
                .Where(x => x.Id == agencyId)
                .Select(x => new
                {
                    x.Id,
                    x.AgencyName,

                    Contacts = x.Contacts
                        .Where(c => !c.IsDeleted)
                        .Select(c => new AgencyContactDto
                        {
                            PersonName = c.PersonName,
                            Designation = c.Designation,
                            Department = c.Department,
                            MobileNo = c.MobileNo,
                            EmailAddress = c.EmailAddress
                        })
                        .ToList()
                })
                .FirstOrDefaultAsync();
        }

        public async Task<bool> SendAgencyDocumentAsync(int agencyId, int shipmentInitiateId, List<IFormFile> documents)
        {

            var shipment = await _context.Tbl_ShipmentInitiates
              .Include(x => x.Items)
              .FirstOrDefaultAsync(x =>
                x.ShipmentInitiateId == shipmentInitiateId);

            if (shipment == null)
                throw new Exception("Shipment not found");

            var agency = await _context.Tbl_Agencies
                .Include(x => x.Contacts)
                .FirstOrDefaultAsync(x => x.Id == agencyId);

            if (agency == null)
                throw new Exception("Agency not found");

            var contact = agency.Contacts
                .FirstOrDefault(x =>
                    !x.IsDeleted &&
                    !string.IsNullOrEmpty(x.EmailAddress));

            if (contact == null)
                throw new Exception("Agency email not found");

            await _emailService.SendAgencyDocumentAsync(
            shipment,
            contact.EmailAddress,
            agency.AgencyName,
            documents);

            return true;
        }
    }
}
