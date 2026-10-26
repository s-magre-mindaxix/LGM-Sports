using CompanyPlatform.Core.Data;
using CompanyPlatform.ERP.DTO.CHABillDto;
using CompanyPlatform.ERP.Services.CHABill;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.Services.Finance.CHABill
{
    public class CHABillService : ICHABillService
    {
        private readonly ApplicationDBContext _context;

        public CHABillService(ApplicationDBContext context)
        {
            _context = context;
        }


        public async Task<int> CreateAsync(CreateCHABillDto dto)
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

            bool alreadyExists = await _context.Tbl_CHABills
                .AnyAsync(x =>
                    x.ShipmentInitiateId == dto.ShipmentInitiateId &&
                    !x.IsDeleted);

            if (alreadyExists)
                throw new Exception("CHA Bill already exists for this shipment.");

            var entity = new Core.Models.ERP.Finance.CHABill
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

            _context.Tbl_CHABills.Add(entity);

            await _context.SaveChangesAsync();

            return entity.CHABillId;
        }


        public async Task<List<CHABillListDto>> GetAllAsync()
        {
            return await
            (
                from c in _context.Tbl_CHABills

                join s in _context.Tbl_ShipmentInitiates
                    on c.ShipmentInitiateId equals s.ShipmentInitiateId

                join aa in _context.Tbl_ShipmentAgencyAssignments
                    on c.ShipmentAgencyAssignmentId equals aa.ShipmentAgencyAssignmentId

                join ag in _context.Tbl_Agencies
                    on aa.AgencyId equals ag.Id

                where !c.IsDeleted

                orderby c.CHABillId descending

                select new CHABillListDto
                {
                    CHABillId = c.CHABillId,
                    ShipmentNo = s.ShipmentNo,
                    AgencyName = ag.AgencyName,
                    BillNo = c.BillNo,
                    BillDate = c.BillDate,
                    BillAmount = c.BillAmount,
                    GstAmount = c.GstAmount,
                    TotalAmount = c.BillAmount + c.GstAmount,
                    PaymentStatus = c.PaymentStatus
                }

            ).ToListAsync();
        }




        public async Task<CHABillDetailsDto?> GetByIdAsync(int id)
        {
            return await
            (
                from c in _context.Tbl_CHABills

                join s in _context.Tbl_ShipmentInitiates
                    on c.ShipmentInitiateId equals s.ShipmentInitiateId

                join aa in _context.Tbl_ShipmentAgencyAssignments
                    on c.ShipmentAgencyAssignmentId equals aa.ShipmentAgencyAssignmentId

                join ag in _context.Tbl_Agencies
                    on aa.AgencyId equals ag.Id

                where
                    c.CHABillId == id &&
                    !c.IsDeleted

                select new CHABillDetailsDto
                {
                    CHABillId = c.CHABillId,
                    ShipmentInitiateId = c.ShipmentInitiateId,
                    ShipmentAgencyAssignmentId = c.ShipmentAgencyAssignmentId,
                    ShipmentNo = s.ShipmentNo,
                    AgencyName = ag.AgencyName,
                    BillNo = c.BillNo,
                    BillDate = c.BillDate,
                    BillAmount = c.BillAmount,
                    GstAmount = c.GstAmount,
                    TotalAmount = c.BillAmount + c.GstAmount,
                    ReceivingDate = c.ReceivingDate,
                    PaymentDate = c.PaymentDate,
                    PaymentStatus = c.PaymentStatus,
                    Remarks = c.Remarks
                }

            ).FirstOrDefaultAsync();
        }

        public async Task<bool> UpdateAsync(UpdateCHABillDto dto)
        {
            var entity = await _context.Tbl_CHABills
                .FirstOrDefaultAsync(x =>
                    x.CHABillId == dto.CHABillId &&
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
            var entity = await _context.Tbl_CHABills
                .FirstOrDefaultAsync(x =>
                    x.CHABillId == id &&
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
                    s.Status == "Closed" &&
                    at.AgencyTypeName == "CHA" &&

                    !_context.Tbl_CHABills.Any(f =>
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

