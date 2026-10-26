using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.Core.Services.Notification;
using CompanyPlatform.ERP.DTO.ShipmentItem;
using CompanyPlatform.ERP.DTO.ShipmentUnderTransitDto;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.Services.ShipmentUnderTransit
{
    public class ShipmentUnderTransitService : IShipmentUnderTransitService
    {
        private readonly ApplicationDBContext _context;
        private readonly INotificationHelper _notificationHelper;

        public ShipmentUnderTransitService(ApplicationDBContext context, INotificationHelper notificationHelper)
        {
            _context = context;
            _notificationHelper = notificationHelper;
        }

        public async Task<int> CreateAsync(CreateShipmentUnderTransitDto dto)
        {
            var shipment =
                await _context.Tbl_ShipmentInitiates.FirstOrDefaultAsync(x => x.ShipmentInitiateId == dto.ShipmentInitiateId && !x.IsDeleted);

            if (shipment == null)
                throw new Exception("Shipment not found.");

            var alreadyExists =
                await _context.Tbl_ShipmentUnderTransits
                .AnyAsync(x =>
                    x.ShipmentInitiateId ==
                    dto.ShipmentInitiateId &&
                    !x.IsDeleted);

            if (alreadyExists)
                throw new Exception(
                    "Shipment already moved to transit.");

            shipment.Status = "In Transit";
            _context.Tbl_ShipmentInitiates.Update(shipment);

            var entity = new Core.Models.ERP.Shipment.ShipmentUnderTransit
            {
                MAWBNo = dto.MAWBNo,
                HAWBNo = dto.HAWBNo,
                MBLNo = dto.MBLNo,
                HBLNo = dto.HBLNo,

                BOENo = dto.BOENo,
                BOEDate = dto.BOEDate,

                ChecklistReceivingDate = dto.ChecklistReceivingDate,
                ChecklistApprovingDate = dto.ChecklistApprovingDate,

                ETDDate = dto.ETDDate ?? null,
                ETADate = dto.ETADate ?? null,

                ShipmentInitiateId = dto.ShipmentInitiateId,
                ShipmentAgencyAssignmentId = dto.ShipmentAgencyAssignmentId,
                ContainerNo = dto.ContainerNo,
    
                VesselFlightNo = dto.VesselFlightNo,

                DepartureDate = dto.DepartureDate,
                ExpectedArrivalDate = dto.ExpectedArrivalDate,
                DutyPaymentDate = dto.DutyPaymentDate,
                OOCDate = dto.OOCDate,
                FinalDeliveryDate = dto.FinalDeliveryDate,
                PortOfLoading = dto.PortOfLoading,
                PortOfDischarge = dto.PortOfDischarge,
                Destination = dto.Destination,
                TransitRemarks = dto.TransitRemarks,
                // Checklist Details
                ChecklistExchangeRate = dto.ChecklistExchangeRate,
                ChecklistAssessableValue = dto.ChecklistAssessableValue,
                ChecklistTotalDuty = dto.ChecklistTotalDuty,
                ChecklistGST = dto.ChecklistGST,
                ChecklistTotalPayable = dto.ChecklistTotalPayable,

                // Bill Of Entry Details
                BOEExchangeRate = dto.BOEExchangeRate,
                BOEAssessableValue = dto.BOEAssessableValue,
                BOECustomDuty = dto.BOECustomDuty,
                BOEGST = dto.BOEGST,
                BOETotalPayable = dto.BOETotalPayable,
                DutyPenalty = dto.DutyPenalty,      // <-- ADD
                DutyInterest = dto.DutyInterest,
                IsChecklistApproved = dto.IsChecklistApproved,
                IsBOEApproved = dto.IsBOEApproved,
                Status = "In Transit"
            };

            _context.Tbl_ShipmentUnderTransits.Add(entity);


            await _context.SaveChangesAsync();

            return entity.ShipmentUnderTransitId;
        }

        public async Task<List<ShipmentUnderTransitListDto>> GetAllAsync()

        {
            return await (
                from t in _context.Tbl_ShipmentUnderTransits

                join s in _context.Tbl_ShipmentInitiates
                on t.ShipmentInitiateId
                equals s.ShipmentInitiateId

                where !t.IsDeleted

                orderby
                (t.Status == "Delivered" ? 1 : 0),
                t.ShipmentUnderTransitId descending

                select new ShipmentUnderTransitListDto
                {
                    ShowAddInventoryButton = t.IsDelivered && s.SourceType == "PURCHASEORDER",

                    ShipmentUnderTransitId = t.ShipmentUnderTransitId,
                    ShipmentInitiateId = s.ShipmentInitiateId,
                    ShipmentNo = s.ShipmentNo,
                    CustomerName = s.CustomerName,
                    Status = t.Status,
                    DepartureDate = t.DepartureDate,
                    ExpectedArrivalDate = t.ExpectedArrivalDate

                })
                .ToListAsync();
        }

        public async Task<ShipmentUnderTransitDetailsDto?> GetByIdAsync(int id)
        {
            return await (
                from t in _context.Tbl_ShipmentUnderTransits

                join s in _context.Tbl_ShipmentInitiates
                on t.ShipmentInitiateId
                equals s.ShipmentInitiateId

                where t.ShipmentUnderTransitId == id
                      && !t.IsDeleted

                select new ShipmentUnderTransitDetailsDto
                {
                    ShipmentUnderTransitId = t.ShipmentUnderTransitId,
                    ShipmentInitiateId = s.ShipmentInitiateId,
                    ShipmentNo = s.ShipmentNo,
                    CustomerName = s.CustomerName,
                    ContainerNo = t.ContainerNo,
                
                    VesselFlightNo = t.VesselFlightNo,

                    MAWBNo = t.MAWBNo,
                    HAWBNo = t.HAWBNo,

                    MBLNo = t.MBLNo,
                    HBLNo = t.HBLNo,

                    BOENo = t.BOENo,
                    BOEDate = t.BOEDate,

                    ChecklistReceivingDate = t.ChecklistReceivingDate,
                    ChecklistApprovingDate = t.ChecklistApprovingDate,
                    ETDDate = t.ETDDate,
                    ETADate = t.ETADate,
                    DepartureDate = t.DepartureDate,
                    ExpectedArrivalDate = t.ExpectedArrivalDate,
                    DutyPaymentDate = t.DutyPaymentDate,
                    OOCDate = t.OOCDate,
                    FinalDeliveryDate = t.FinalDeliveryDate,
                    PortOfLoading = t.PortOfLoading,
                    PortOfDischarge = t.PortOfDischarge,
                    Destination = t.Destination,
                    TransitRemarks = t.TransitRemarks,
                    // Checklist Details
                    ChecklistExchangeRate = t.ChecklistExchangeRate,
                    ChecklistAssessableValue = t.ChecklistAssessableValue,
                    ChecklistTotalDuty = t.ChecklistTotalDuty,
                    ChecklistGST = t.ChecklistGST,
                    ChecklistTotalPayable = t.ChecklistTotalPayable,

                    // Bill Of Entry Details
                    BOEExchangeRate = t.BOEExchangeRate,
                    BOEAssessableValue = t.BOEAssessableValue,
                    BOECustomDuty = t.BOECustomDuty,
                    BOEGST = t.BOEGST,
                    BOETotalPayable = t.BOETotalPayable,
                    DutyPenalty = t.DutyPenalty,      // <-- ADD
                    DutyInterest = t.DutyInterest,
                    IsChecklistApproved = t.IsChecklistApproved,
                    IsBOEApproved = t.IsBOEApproved,
                    Status = t.Status

                })
                .FirstOrDefaultAsync();
        }

        public async Task<bool> UpdateAsync(UpdateShipmentUnderTransitDto dto)

        {
            var entity =
                await _context.Tbl_ShipmentUnderTransits
                .FirstOrDefaultAsync(x =>
                    x.ShipmentUnderTransitId ==
                    dto.ShipmentUnderTransitId);

            if (entity == null)
                return false;

            entity.ContainerNo = dto.ContainerNo;
         
            entity.VesselFlightNo = dto.VesselFlightNo;
            entity.MAWBNo = dto.MAWBNo;
            entity.HAWBNo = dto.HAWBNo;

            entity.MBLNo = dto.MBLNo;
            entity.HBLNo = dto.HBLNo;

            entity.BOENo = dto.BOENo;
            entity.BOEDate = dto.BOEDate;

            entity.ChecklistReceivingDate = dto.ChecklistReceivingDate;
            entity.ChecklistApprovingDate = dto.ChecklistApprovingDate;

            entity.ETDDate = dto.ETDDate ?? null;
            entity.ETADate = dto.ETADate ?? null;

            entity.DepartureDate = dto.DepartureDate;
            entity.ExpectedArrivalDate = dto.ExpectedArrivalDate;
            entity.DutyPaymentDate = dto.DutyPaymentDate;
            entity.OOCDate = dto.OOCDate;
            entity.FinalDeliveryDate = dto.FinalDeliveryDate;
            entity.PortOfLoading = dto.PortOfLoading;
            entity.PortOfDischarge = dto.PortOfDischarge;
            entity.Destination = dto.Destination;
            entity.TransitRemarks = dto.TransitRemarks;
            // Checklist Details
            entity.ChecklistExchangeRate = dto.ChecklistExchangeRate;
            entity.ChecklistAssessableValue = dto.ChecklistAssessableValue;
            entity.ChecklistTotalDuty = dto.ChecklistTotalDuty;
            entity.ChecklistGST = dto.ChecklistGST;
            entity.ChecklistTotalPayable = dto.ChecklistTotalPayable;

            // Bill Of Entry Details
            entity.BOEExchangeRate = dto.BOEExchangeRate;
            entity.BOEAssessableValue = dto.BOEAssessableValue;
            entity.BOECustomDuty = dto.BOECustomDuty;
            entity.BOEGST = dto.BOEGST;
            entity.BOETotalPayable = dto.BOETotalPayable;

            entity.DutyPenalty = dto.DutyPenalty;      // <-- ADD
            entity.DutyInterest = dto.DutyInterest;

            entity.IsChecklistApproved = dto.IsChecklistApproved;
            entity.IsBOEApproved = dto.IsBOEApproved;
            entity.Status = dto.Status;

            if (dto.Status?.Trim().ToLower() == "delivered")
            {
                entity.IsDelivered = true;
                entity.IsClosed = true;

                

                var shipment = await _context.Tbl_ShipmentInitiates
                    .FirstOrDefaultAsync(x =>
                        x.ShipmentInitiateId == entity.ShipmentInitiateId);

                if (shipment != null)
                {
                    shipment.Status = "Closed";

                    _context.Tbl_ShipmentInitiates.Update(shipment);
                }
            }
            else
            {
                entity.IsDelivered = dto.IsDelivered;
                entity.IsClosed = dto.IsClosed;
            }
            entity.UpdatedDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> CloseShipmentAsync(int id)
        {
            var transit =
                await _context.Tbl_ShipmentUnderTransits
                .FirstOrDefaultAsync(x =>
                    x.ShipmentUnderTransitId == id);

            if (transit == null)
                return false;

            transit.IsDelivered = true;
            transit.IsClosed = true;
            transit.Status = "Delivered";

            var shipment =
                await _context.Tbl_ShipmentInitiates
                .FirstOrDefaultAsync(x =>
                    x.ShipmentInitiateId ==
                    transit.ShipmentInitiateId);

            if (shipment != null)
            {
                shipment.Status = "Closed";
            }

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity =
                await _context.Tbl_ShipmentUnderTransits
                .FirstOrDefaultAsync(x =>
                    x.ShipmentUnderTransitId == id);

            if (entity == null)
                return false;

            entity.IsDeleted = true;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<ShipmentDropdownDtos>> GetOpenShipmentDropdownAsync()
        {
            return await (
                from s in _context.Tbl_ShipmentInitiates
                join m in _context.Tbl_ShipmentModes
                    on s.ShipmentModeId equals m.Id

                where !s.IsDeleted
                      && s.Status != "Closed"

                orderby s.ShipmentInitiateId descending

                select new ShipmentDropdownDtos
                {
                    ShipmentInitiateId = s.ShipmentInitiateId,
                    ShipmentNo = s.ShipmentNo,

                    ShipmentModeId = m.Id,
                    ShipmentModeName = m.ModeName
                }
            ).ToListAsync();
        }

        public async Task<bool> AddToInventoryAsync(int shipmentUnderTransitId)
        {
            var transit = await _context.Tbl_ShipmentUnderTransits
                .FirstOrDefaultAsync(x =>
                    x.ShipmentUnderTransitId == shipmentUnderTransitId &&
                    !x.IsDeleted);

            if (transit == null)
                return false;

            if (!transit.IsDelivered)
                throw new Exception("Shipment is not delivered.");

            var shipment = await _context.Tbl_ShipmentInitiates
                .FirstOrDefaultAsync(x =>
                    x.ShipmentInitiateId == transit.ShipmentInitiateId &&
                    !x.IsDeleted);

            if (shipment == null)
                return false;

            // Only Purchase Order shipment
            if (shipment.SourceType != "PURCHASEORDER")
                throw new Exception("Inventory can be added only for Purchase Order shipments.");

            var sourceItems = await _context.Tbl_ShipmentSourceItems
                .Where(x => x.ShipmentInitiateId == shipment.ShipmentInitiateId)
                .ToListAsync();

            if (!sourceItems.Any())
                throw new Exception("No shipment source items found.");

            foreach (var item in sourceItems)
            {
                bool alreadyExists = await _context.Tbl_QualityAssurance
                  .AnyAsync(x =>
                      !x.IsDeleted &&
                      x.Status == "PENDING" &&
                      x.ShipmentInitiateId == shipment.ShipmentInitiateId &&
                      x.ItemType == item.ItemType &&
                      x.ItemId ==
                          (item.ItemType == "Product"
                              ? item.ProductId.Value
                              : item.AccessoryId.Value));

                if (alreadyExists)
                    continue;

                _context.Tbl_QualityAssurance.Add(new QualityAssurance
                {
                    ItemType = item.ItemType,

                    ItemId = item.ItemType == "Product"
                 ? item.ProductId.Value
                 : item.AccessoryId.Value,

                    ItemName = item.ItemName,

                    ItemCode = item.ItemCode,

                    Quantity = item.Quantity,

                    Status = "PENDING",

                    // ============================
                    // Tracking Information
                    // ============================

                    ShipmentInitiateId = shipment.ShipmentInitiateId,

                    ShipmentUnderTransitId = transit.ShipmentUnderTransitId,

                    PurchaseOrderId = shipment.PurchaseOrderId,

                    ShipmentNo = shipment.ShipmentNo,

                    PurchaseOrderNo = shipment.SourceDocumentNo,

                    Remarks = $"Received from Shipment {shipment.ShipmentNo}",

                    CreatedDate = DateTime.Now
                });
            }

            await _context.SaveChangesAsync();

            return true;
        }
    }
}
