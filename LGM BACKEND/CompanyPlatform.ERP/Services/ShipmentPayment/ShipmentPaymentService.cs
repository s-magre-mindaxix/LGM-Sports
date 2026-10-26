using CompanyPlatform.Core.Data;
using CompanyPlatform.ERP.DTO.ShipmentPaymentDto;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.Services.ShipmentPayment
{
    public class ShipmentPaymentService : IShipmentPaymentService
    {
        private readonly ApplicationDBContext _context;

        public ShipmentPaymentService(ApplicationDBContext context)
        {
            _context = context;
        }

      
        public async Task<int> CreateAsync(CreateShipmentPaymentDto dto)
        {
            var transit = await _context.Tbl_ShipmentUnderTransits
                .Include(x => x.ShipmentInitiate)
                .FirstOrDefaultAsync(x =>
                    x.ShipmentUnderTransitId == dto.ShipmentUnderTransitId &&
                    !x.IsDeleted);

            if (transit == null)
                throw new Exception("Shipment not found.");

            if (!transit.IsDelivered)
                throw new Exception("Shipment is not delivered.");

            bool alreadyExists = await _context.Tbl_ShipmentPayments
                .AnyAsync(x =>
                    x.ShipmentUnderTransitId == dto.ShipmentUnderTransitId &&
                    !x.IsDeleted);

            if (alreadyExists)
                throw new Exception("Finance payment already created.");

            var entity = new Core.Models.ERP.Finance.ShipmentPayment
            {
                ShipmentUnderTransitId = dto.ShipmentUnderTransitId,

                DeliveredDate = dto.DeliveredDate,

                PendingDays =
                    (DateTime.Today - dto.DeliveredDate.Date).Days,

                FinanceRemarks = dto.FinanceRemarks,

                PaymentCompleted = false,

                PaymentCompletedDate = null,

                IsDeleted = false
            };

            _context.Tbl_ShipmentPayments.Add(entity);

            await _context.SaveChangesAsync();

            return entity.ShipmentPaymentId;
        }
        public async Task<List<ShipmentPaymentListDto>> GetAllAsync()
        {
            return await
            (
                from payment in _context.Tbl_ShipmentPayments

                join transit in _context.Tbl_ShipmentUnderTransits
                    on payment.ShipmentUnderTransitId
                    equals transit.ShipmentUnderTransitId

                join shipment in _context.Tbl_ShipmentInitiates
                    on transit.ShipmentInitiateId
                    equals shipment.ShipmentInitiateId

                where
                    !payment.IsDeleted
                    &&
                    transit.IsDelivered

                orderby payment.ShipmentPaymentId descending

                select new ShipmentPaymentListDto
                {
                    ShipmentPaymentId = payment.ShipmentPaymentId,

                    ShipmentUnderTransitId = transit.ShipmentUnderTransitId,

                    ShipmentNo = shipment.ShipmentNo,

                    CustomerName = shipment.CustomerName,

                    InvoiceNo = shipment.InvoiceNo,

                    DeliveredDate = payment.DeliveredDate,

                    PendingDays =
                        payment.PaymentCompleted
                            ? payment.PendingDays
                            : EF.Functions.DateDiffDay(
                                payment.DeliveredDate,
                                DateTime.Today),

                    PaymentCompleted = payment.PaymentCompleted,

                    PaymentCompletedDate =
                        payment.PaymentCompletedDate,

                    FinanceRemarks =
                        payment.FinanceRemarks,

                    Status =
                        payment.PaymentCompleted
                            ? "Shipment Completed"
                            : "Delivered"
                }

            ).ToListAsync();
        }

        public async Task<ShipmentPaymentDetailsDto?> GetByIdAsync(int id)
        {
            return await
            (
                from payment in _context.Tbl_ShipmentPayments

                join transit in _context.Tbl_ShipmentUnderTransits
                    on payment.ShipmentUnderTransitId
                    equals transit.ShipmentUnderTransitId

                join shipment in _context.Tbl_ShipmentInitiates
                    on transit.ShipmentInitiateId
                    equals shipment.ShipmentInitiateId

                where payment.ShipmentPaymentId == id
                      && !payment.IsDeleted

                select new ShipmentPaymentDetailsDto
                {
                    ShipmentPaymentId = payment.ShipmentPaymentId,

                    ShipmentUnderTransitId = payment.ShipmentUnderTransitId,

                    ShipmentNo = shipment.ShipmentNo,

                    CustomerName = shipment.CustomerName,

                    InvoiceNo = shipment.InvoiceNo,

                    DeliveredDate = payment.DeliveredDate,

                    PendingDays = payment.PaymentCompleted
                        ? payment.PendingDays
                        : EF.Functions.DateDiffDay(payment.DeliveredDate, DateTime.Today),

                    FinanceRemarks = payment.FinanceRemarks,

                    PaymentCompleted = payment.PaymentCompleted,

                    PaymentCompletedDate = payment.PaymentCompletedDate
                }

            ).FirstOrDefaultAsync();
        }

       

        public async Task<bool> UpdateAsync(UpdateShipmentPaymentDto dto)
        {
            var entity = await _context.Tbl_ShipmentPayments
                .FirstOrDefaultAsync(x =>
                    x.ShipmentPaymentId == dto.ShipmentPaymentId &&
                    !x.IsDeleted);

            if (entity == null)
                return false;

            entity.DeliveredDate = dto.DeliveredDate;

            entity.FinanceRemarks = dto.FinanceRemarks;

            entity.PaymentCompleted = dto.PaymentCompleted;

            entity.PaymentCompletedDate =
                dto.PaymentCompleted
                    ? dto.PaymentCompletedDate ?? DateTime.Now
                    : null;

            entity.PendingDays =
                dto.PaymentCompleted
                    ? (entity.PaymentCompletedDate.Value.Date - entity.DeliveredDate.Date).Days
                    : (DateTime.Today - entity.DeliveredDate.Date).Days;

            var transit = await _context.Tbl_ShipmentUnderTransits
            .FirstOrDefaultAsync(x =>
                x.ShipmentUnderTransitId == entity.ShipmentUnderTransitId &&
                !x.IsDeleted);

            if (transit != null)
            {
                transit.Status = entity.PaymentCompleted
                    ? "Shipment Completed"
                    : "Delivered";
            }

            await _context.SaveChangesAsync();

            return true;
        }

     
        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.Tbl_ShipmentPayments
                .FirstOrDefaultAsync(x =>
                    x.ShipmentPaymentId == id &&
                    !x.IsDeleted);

            if (entity == null)
                return false;

            entity.IsDeleted = true;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<EligibleTransitDto>> GetEligibleTransitsAsync()
        {
            var data =
                await (
                    from transit in _context.Tbl_ShipmentUnderTransits

                    join shipment in _context.Tbl_ShipmentInitiates
                        on transit.ShipmentInitiateId equals shipment.ShipmentInitiateId

                    where
                        transit.IsDelivered
                        &&
                        !transit.IsDeleted
                        &&
                         shipment.SourceType == "PURCHASEORDER"
                        &&
                        !_context.Tbl_ShipmentPayments.Any(p =>
                            p.ShipmentUnderTransitId == transit.ShipmentUnderTransitId &&
                            !p.IsDeleted)

                    orderby shipment.ShipmentNo

                    select new EligibleTransitDto
                    {
                        ShipmentUnderTransitId = transit.ShipmentUnderTransitId,

                        ShipmentNo = shipment.ShipmentNo,

                        CustomerName = shipment.CustomerName,

                        InvoiceNo = shipment.InvoiceNo,

                        FinalDeliveryDate = transit.FinalDeliveryDate
                    }

                ).ToListAsync();

            return data;
        }


    }
}
