using CompanyPlatform.Core.Data;
using CompanyPlatform.ERP.DTO.ForwarderBillDto;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.Services.ForwarderBill
{
    public class ForwarderBillService : IForwarderBillService
    {
        private readonly ApplicationDBContext _context;

        public ForwarderBillService(ApplicationDBContext context)
        {
            _context = context;
        }


        public async Task<int> CreateAsync(CreateForwarderBillDto dto)
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

            bool alreadyExists = await _context.Tbl_ForwarderBills
                .AnyAsync(x =>
                    x.ShipmentInitiateId == dto.ShipmentInitiateId &&
                    !x.IsDeleted);

            if (alreadyExists)
                throw new Exception("Forwarder bill already exists for this shipment.");

            var entity = new Core.Models.ERP.Finance.ForwarderBill
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

            _context.Tbl_ForwarderBills.Add(entity);
            await _context.SaveChangesAsync();

            return entity.ForwarderBillId;
        }


        public async Task<List<ForwarderBillListDto>> GetAllAsync()
        {
            return await (
                from f in _context.Tbl_ForwarderBills

                join s in _context.Tbl_ShipmentInitiates
                on f.ShipmentInitiateId equals s.ShipmentInitiateId

                join a in _context.Tbl_ShipmentAgencyAssignments
                on f.ShipmentAgencyAssignmentId equals a.ShipmentAgencyAssignmentId

                join ag in _context.Tbl_Agencies
                on a.AgencyId equals ag.Id

                where !f.IsDeleted

                orderby f.ForwarderBillId descending

                select new ForwarderBillListDto
                {
                    ForwarderBillId = f.ForwarderBillId,
                    ShipmentNo = s.ShipmentNo,
                    AgencyName = ag.AgencyName,
                    BillNo = f.BillNo,
                    BillDate = f.BillDate,
                    BillAmount = f.BillAmount,
                    GstAmount = f.GstAmount,
                    TotalAmount = f.BillAmount + f.GstAmount,
                    PaymentStatus = f.PaymentStatus
                }).ToListAsync();
        }



        public async Task<ForwarderBillDetailsDto?> GetByIdAsync(int id)
        {
            return await (
                from f in _context.Tbl_ForwarderBills

                join s in _context.Tbl_ShipmentInitiates
                on f.ShipmentInitiateId equals s.ShipmentInitiateId

                join a in _context.Tbl_ShipmentAgencyAssignments
                on f.ShipmentAgencyAssignmentId equals a.ShipmentAgencyAssignmentId

                join ag in _context.Tbl_Agencies
                on a.AgencyId equals ag.Id

                where
                    f.ForwarderBillId == id &&
                    !f.IsDeleted

                select new ForwarderBillDetailsDto
                {
                    ForwarderBillId = f.ForwarderBillId,
                    ShipmentInitiateId = f.ShipmentInitiateId,
                    ShipmentAgencyAssignmentId = f.ShipmentAgencyAssignmentId,
                    ShipmentNo = s.ShipmentNo,
                    AgencyName = ag.AgencyName,
                    BillNo = f.BillNo,
                    BillDate = f.BillDate,
                    BillAmount = f.BillAmount,
                    GstAmount = f.GstAmount,
                    TotalAmount = f.BillAmount + f.GstAmount,
                    ReceivingDate = f.ReceivingDate,
                    PaymentDate = f.PaymentDate,
                    PaymentStatus = f.PaymentStatus,
                    Remarks = f.Remarks

                }).FirstOrDefaultAsync();
        }



        public async Task<bool> UpdateAsync(UpdateForwarderBillDto dto)
        {
            var entity = await _context.Tbl_ForwarderBills
                .FirstOrDefaultAsync(x =>
                    x.ForwarderBillId == dto.ForwarderBillId &&
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
            var entity = await _context.Tbl_ForwarderBills
                .FirstOrDefaultAsync(x =>
                    x.ForwarderBillId == id &&
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

                join at in _context.Tbl_AgencyTypes
                    on ag.AgencyTypeId equals at.Id

                  where
                 !s.IsDeleted &&
                 !aa.IsDeleted &&
                 !ag.IsDeleted &&
                 !at.IsDeleted &&
                 s.Status == "Closed" &&
                 at.AgencyTypeName == "Forwarder" &&

                     !_context.Tbl_ForwarderBills.Any(f =>
                        !f.IsDeleted &&
                        f.ShipmentInitiateId == s.ShipmentInitiateId)

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
