using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.CRM.DTO.Inventory;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.Inventory
{
    public class QualityAssuranceService : IQualityAssuranceService
    {
        private readonly ApplicationDBContext _context;
        public QualityAssuranceService(ApplicationDBContext context) => _context = context;

        public async Task<List<QualityAssuranceDto>> GetPendingItemsAsync()
        {
            return await _context.Tbl_QualityAssurance
                .Where(x => x.Status == "Pending" && !x.IsDeleted)
                .Select(x => new QualityAssuranceDto
                {
                    Id = x.Id,
                    ShipmentNo = x.ShipmentNo,
                    PurchaseOrderNo = x.PurchaseOrderNo,
                    ItemType = x.ItemType,
                    ItemId = x.ItemId,
                    ItemName = x.ItemName,
                    ItemCode = x.ItemCode,
                    Quantity = x.Quantity,
                    Status = x.Status,
                    CreatedDate = x.CreatedDate
                }).ToListAsync();
        }

        //public async Task<bool> UpdateQAStatusAsync(QAStatusUpdateDto dto)
        //{
        //    using var transaction = await _context.Database.BeginTransactionAsync();
        //    try
        //    {
        //        var qaItem = await _context.Tbl_QualityAssurance.FindAsync(dto.Id);
        //        if (qaItem == null || qaItem.Status != "Pending") return false;

        //        qaItem.Status = dto.Status; // Accepted or Rejected
        //        qaItem.Remarks = dto.Remarks;
        //        qaItem.ActionDate = DateTime.Now;

        //        if (dto.Status == "Accepted")
        //        {
        //            // Update Main Tables
        //            if (qaItem.ItemType == "Product")
        //            {
        //                var product = await _context.Tbl_Products.FindAsync(qaItem.ItemId);
        //                if (product != null) product.AvailableQuantity += qaItem.Quantity;
        //            }
        //            else if (qaItem.ItemType == "Accessory")
        //            {
        //                var acc = await _context.Tbl_Accessories.FindAsync(qaItem.ItemId);
        //                if (acc != null) acc.AvailableQuantity += qaItem.Quantity;
        //            }

        //            // Create Transaction Log
        //            _context.Tbl_InventoryTransactions.Add(new InventoryTransaction
        //            {
        //                ItemType = qaItem.ItemType,
        //                ItemId = qaItem.ItemId,
        //                TransactionType = "Stock In (QA Approved)",
        //                Quantity = qaItem.Quantity,
        //                Remarks = "QA Approved: " + dto.Remarks,
        //                Timestamp = DateTime.Now
        //            });
        //        }

        //        await _context.SaveChangesAsync();
        //        await transaction.CommitAsync();
        //        return true;
        //    }
        //    catch
        //    {
        //        await transaction.RollbackAsync();
        //        return false;
        //    }
        //}

        public async Task<bool> UpdateQAStatusAsync(QAStatusUpdateDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var qaItem = await _context.Tbl_QualityAssurance.FindAsync(dto.Id);
                // Safety check: handle null and status case
                if (qaItem == null || qaItem.Status.ToUpper() != "PENDING") return false;

                qaItem.Status = dto.Status.ToUpper(); // Save as "ACCEPTED" or "REJECTED"
                qaItem.Remarks = dto.Remarks;
                qaItem.ActionDate = DateTime.Now;

                // FIX: Compare using ToUpper()
                if (qaItem.Status == "ACCEPTED")
                {
                    int previousStock = 0;
                    int newStock = 0;

                    // Update Main Tables
                    if (qaItem.ItemType.ToUpper() == "PRODUCT")
                    {
                        var product = await _context.Tbl_Products.FindAsync(qaItem.ItemId);

                        if (product != null)
                        {
                            previousStock = product.AvailableQuantity;

                            product.AvailableQuantity += qaItem.Quantity;

                            newStock = product.AvailableQuantity;
                        }
                    }
                    else if (qaItem.ItemType.ToUpper() == "ACCESSORY")
                    {
                        var acc = await _context.Tbl_Accessories.FindAsync(qaItem.ItemId);

                        if (acc != null)
                        {
                            previousStock = acc.AvailableQuantity;

                            acc.AvailableQuantity += qaItem.Quantity;

                            newStock = acc.AvailableQuantity;
                        }
                    }

                    _context.Tbl_InventoryTransactions.Add(new InventoryTransaction
                    {
                        ItemType = qaItem.ItemType,

                        ItemId = qaItem.ItemId,

                        TransactionType = "Stock In (QA Approved)",

                        Quantity = qaItem.Quantity,

                        PreviousStock = previousStock,

                        NewStock = newStock,

                        // ===============================
                        // Shipment Tracking
                        // ===============================

                        ShipmentInitiateId = qaItem.ShipmentInitiateId,

                        ShipmentUnderTransitId = qaItem.ShipmentUnderTransitId,

                        PurchaseOrderId = qaItem.PurchaseOrderId,

                        ReferenceNo = qaItem.ShipmentNo,

                        // ===============================

                        Remarks = "QA Approved Entry : " + dto.Remarks,

                        Timestamp = DateTime.Now
                    });
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return false;
            }
        }

        public async Task<List<QualityAssuranceDto>> GetQAHistoryAsync()
        {
            return await _context.Tbl_QualityAssurance
                .Where(x => x.Status != "Pending")
                .OrderByDescending(x => x.ActionDate)
                .Select(x => new QualityAssuranceDto
                {
                    Id = x.Id,
                    ShipmentNo = x.ShipmentNo,
                    PurchaseOrderNo = x.PurchaseOrderNo,
                    ItemType = x.ItemType,
                    ItemName = x.ItemName,
                    ItemCode = x.ItemCode,
                    Quantity = x.Quantity,
                    Status = x.Status,
                    Remarks = x.Remarks,
                    ActionDate = x.ActionDate,
                    CreatedDate = x.CreatedDate
                }).ToListAsync();
        }
    }
}
