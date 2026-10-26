using CompanyPlatform.Core.Data;
using CompanyPlatform.ERP.DTO.TransporterBillDto;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.Services.TransporterBill
{
    public class TransporterBillService: ITransporterBillService
    {
        private readonly ApplicationDBContext _context;

        public TransporterBillService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<int> CreateAsync(CreateTransporterBillDto dto)
        {
            var shipment = await _context.Tbl_ShipmentInitiates
                .FirstOrDefaultAsync(x =>
                    x.ShipmentInitiateId == dto.ShipmentInitiateId &&
                    !x.IsDeleted);

            if (shipment == null)
                throw new Exception("Shipment not found.");

            var agencyAssignment = await _context.Tbl_ShipmentAgencyAssignments
                .FirstOrDefaultAsync(x =>
                    x.ShipmentAgencyAssignmentId == dto.ShipmentAgencyAssignmentId &&
                    !x.IsDeleted);

            if (agencyAssignment == null)
                throw new Exception("Agency assignment not found.");

            bool alreadyExists = await _context.Tbl_TransporterBills
                .AnyAsync(x =>
                    x.ShipmentInitiateId == dto.ShipmentInitiateId &&
                    !x.IsDeleted);

            if (alreadyExists)
                throw new Exception("Transporter Bill already exists for this shipment.");

            var entity = new Core.Models.ERP.Finance.TransporterBill
            {
                ShipmentInitiateId = dto.ShipmentInitiateId,
                ShipmentAgencyAssignmentId = dto.ShipmentAgencyAssignmentId,

                BillNo = dto.BillNo,
                BillDate = dto.BillDate,

                BillAmount = dto.BillAmount,
                GstAmount = dto.GstAmount,

                ReceivingDate = dto.ReceivingDate,
                PaymentDate = dto.PaymentDate,

                PaymentStatus = dto.PaymentDate == null
                    ? "Pending"
                    : "Paid",

                Remarks = dto.Remarks,

                CreatedDate = DateTime.UtcNow
            };

            _context.Tbl_TransporterBills.Add(entity);

            await _context.SaveChangesAsync();

            return entity.TransporterBillId;
        }

        public async Task<List<TransporterBillListDto>> GetAllAsync()
        {
            return await
            (
                from t in _context.Tbl_TransporterBills

                join s in _context.Tbl_ShipmentInitiates
                    on t.ShipmentInitiateId equals s.ShipmentInitiateId

                join aa in _context.Tbl_ShipmentAgencyAssignments
                    on t.ShipmentAgencyAssignmentId equals aa.ShipmentAgencyAssignmentId

                join ag in _context.Tbl_Agencies
                    on aa.AgencyId equals ag.Id

                where !t.IsDeleted

                orderby t.TransporterBillId descending

                select new TransporterBillListDto
                {
                    TransporterBillId = t.TransporterBillId,

                    ShipmentNo = s.ShipmentNo,

                    AgencyName = ag.AgencyName,

                    BillNo = t.BillNo,

                    BillDate = t.BillDate,

                    BillAmount = t.BillAmount,

                    GstAmount = t.GstAmount,

                    TotalAmount = t.BillAmount + t.GstAmount,

                    PaymentStatus = t.PaymentStatus
                }

            ).ToListAsync();
        }

        public async Task<TransporterBillDetailsDto?> GetByIdAsync(int id)
        {
            return await
            (
                from t in _context.Tbl_TransporterBills

                join s in _context.Tbl_ShipmentInitiates
                    on t.ShipmentInitiateId equals s.ShipmentInitiateId

                join aa in _context.Tbl_ShipmentAgencyAssignments
                    on t.ShipmentAgencyAssignmentId equals aa.ShipmentAgencyAssignmentId

                join ag in _context.Tbl_Agencies
                    on aa.AgencyId equals ag.Id

                where
                    t.TransporterBillId == id &&
                    !t.IsDeleted

                select new TransporterBillDetailsDto
                {
                    TransporterBillId = t.TransporterBillId,

                    ShipmentInitiateId = t.ShipmentInitiateId,

                    ShipmentAgencyAssignmentId = t.ShipmentAgencyAssignmentId,

                    ShipmentNo = s.ShipmentNo,

                    AgencyName = ag.AgencyName,

                    BillNo = t.BillNo,

                    BillDate = t.BillDate,

                    BillAmount = t.BillAmount,

                    GstAmount = t.GstAmount,

                    TotalAmount = t.BillAmount + t.GstAmount,

                    ReceivingDate = t.ReceivingDate,

                    PaymentDate = t.PaymentDate,

                    PaymentStatus = t.PaymentStatus,

                    Remarks = t.Remarks
                }

            ).FirstOrDefaultAsync();
        }

        public async Task<bool> UpdateAsync(UpdateTransporterBillDto dto)
        {
            var entity = await _context.Tbl_TransporterBills
                .FirstOrDefaultAsync(x =>
                    x.TransporterBillId == dto.TransporterBillId &&
                    !x.IsDeleted);

            if (entity == null)
                return false;

            entity.BillNo = dto.BillNo;

            entity.BillDate = dto.BillDate;

            entity.BillAmount = dto.BillAmount;

            entity.GstAmount = dto.GstAmount;

            entity.ReceivingDate = dto.ReceivingDate;

            entity.PaymentDate = dto.PaymentDate;

            entity.PaymentStatus = dto.PaymentDate == null
                ? "Pending"
                : "Paid";

            entity.Remarks = dto.Remarks;

            entity.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.Tbl_TransporterBills
                .FirstOrDefaultAsync(x =>
                    x.TransporterBillId == id &&
                    !x.IsDeleted);

            if (entity == null)
                return false;

            entity.IsDeleted = true;
            entity.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<EligibleShipmentDto>> GetEligibleShipmentsAsync()
        {
            return await
            (
                from s in _context.Tbl_ShipmentInitiates

                join aa in _context.Tbl_ShipmentAgencyAssignments
                    on s.ShipmentInitiateId equals aa.ShipmentInitiateId

                join ag in _context.Tbl_Agencies
                    on aa.AgencyId equals ag.Id

                where
                    !s.IsDeleted &&
                    !aa.IsDeleted &&
                    s.Status == "Closed" &&

                    !_context.Tbl_TransporterBills.Any(t =>
                    !t.IsDeleted &&
                    t.ShipmentInitiateId == s.ShipmentInitiateId &&
                    t.ShipmentAgencyAssignmentId == aa.ShipmentAgencyAssignmentId)

                orderby s.ShipmentInitiateId descending

                select new EligibleShipmentDto
                {
                    ShipmentInitiateId = s.ShipmentInitiateId,
                    ShipmentAgencyAssignmentId = aa.ShipmentAgencyAssignmentId,
                    ShipmentNo = s.ShipmentNo,
                    AgencyName = ag.AgencyName
                }

            ).ToListAsync();
        }

    }
}
