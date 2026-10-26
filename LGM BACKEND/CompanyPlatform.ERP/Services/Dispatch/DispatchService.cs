using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.Core.Models.ERP;
using CompanyPlatform.ERP.DTO.DispatchDto;
using CompanyPlatform.ERP.DTO.ShipmentItem;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace CompanyPlatform.ERP.Services.Dispatch
{
    public class DispatchService : IDispatchService
    {
        private readonly ApplicationDBContext _context;

        public DispatchService(ApplicationDBContext context)
        {
            _context = context;
        }

        #region Create Dispatch

        public async Task<DispatchDto> CreateAsync(CreateDispatchDto dto)
        {

            //================ STOCK DISPATCH ==================
            if (dto.ShipmentInitiateId == 0)
            {
                var stockDispatch = new Core.Models.ERP.Dispatch
                {
                    ShipmentInitiateId = 0,
                    ShipmentNo = "STOCK",
                    DispatchDate = dto.DispatchDate,
                    MaterialDispatch = dto.MaterialDispatch,
                    DocketNo = dto.DocketNo,
                    DeliveredDate = dto.DeliveredDate,
                    DeliveredOnDate = dto.DeliveredOnDate,
                    Remarks = dto.Remarks,
                    Status = "Pending",
                    CreatedDate = DateTime.Now,
                    IsDeleted = false
                };

                _context.Tbl_Dispatchs.Add(stockDispatch);
                await _context.SaveChangesAsync();

                //================ AUTO GENERATE DISPATCH NO FOR STOCK =================

                string stockDispatchNo = $"DISP-STOCK-{stockDispatch.DispatchId:D5}";

                _context.Tbl_DispatchDetails.Add(new DispatchDetail
                {
                    DispatchId = stockDispatch.DispatchId,
                    OrderAcceptanceId = 0,
                    DispatchNo = stockDispatchNo,
                    CustomerName = "Stock Dispatch",
                    IsSelected = true,
                    Status = "Pending",
                    CreatedDate = DateTime.Now,
                    IsDeleted = false
                });

                if (dto.StockItems != null)
                {
                    foreach (var item in dto.StockItems)
                    {
                        _context.Tbl_DispatchStockItems.Add(new DispatchStockItem
                        {
                            DispatchId = stockDispatch.DispatchId,
                            ItemType = item.ItemType,
                            ProductId = item.ProductId,
                            AccessoryId = item.AccessoryId,
                            ItemCode = item.ItemCode,
                            Description = item.Description,
                            Qty = item.Qty,
                            CreatedDate = DateTime.Now,
                            IsDeleted = false
                        });
                    }
                }

                if (dto.DispatchItems != null)
                {
                    foreach (var item in dto.DispatchItems)
                    {
                        _context.Tbl_DispatchItems.Add(new DispatchItem
                        {
                            DispatchId = stockDispatch.DispatchId,
                            BoxNo = item.BoxNo,
                            NetWeightKg = item.NetWeightKg,
                            GrossWeightKg = item.GrossWeightKg,
                            LengthCm = item.LengthCm,
                            WidthCm = item.WidthCm,
                            HeightCm = item.HeightCm,
                            CBM = item.CBM,
                            Remarks = item.Remarks,
                            CreatedDate = DateTime.Now,
                            IsDeleted = false
                        });
                    }
                }

               //================ SUBTRACT INVENTORY ONLY WHEN DISPATCH DATE IS GIVEN =================

                if (dto.DispatchDate.HasValue && dto.StockItems != null)
                {
                    foreach (var item in dto.StockItems)
                    {
                        int itemId = item.ItemType == "Product"
                            ? item.ProductId ?? 0
                            : item.AccessoryId ?? 0;

                        if (itemId == 0)
                            continue;

                        var lastTransaction = await _context.Tbl_InventoryTransactions
                            .Where(x => x.ItemType == item.ItemType &&
                                        x.ItemId == itemId)
                            .OrderByDescending(x => x.Id)
                            .FirstOrDefaultAsync();

                        int previousStock = lastTransaction?.NewStock ?? 0;

                        int newStock = previousStock - (int)item.Qty;

                        if (newStock < 0)
                            newStock = 0;

                        _context.Tbl_InventoryTransactions.Add(new InventoryTransaction
                        {
                            ItemType = item.ItemType,
                            ItemId = itemId,
                            TransactionType = "Dispatch",
                            Quantity = (int)item.Qty,
                            PreviousStock = previousStock,
                            NewStock = newStock,
                            Remarks = "Dispatch From Stock",
                            DispatchId = stockDispatch.DispatchId,
                            ReferenceNo = stockDispatchNo,
                            Timestamp = DateTime.Now
                        });
                    }
                }

                await _context.SaveChangesAsync();

                return await GetByIdAsync(stockDispatch.DispatchId);
            }

            var shipment = await _context.Tbl_ShipmentInitiates
                .FirstOrDefaultAsync(x =>
                    x.ShipmentInitiateId == dto.ShipmentInitiateId &&
                    !x.IsDeleted);

            if (shipment == null)
                throw new Exception("Shipment not found.");


            // STEP-1 : Get Source OA Numbers
            var sourceOANos = await _context.Tbl_PurchaseOrderItems
                .Where(x => x.PurchaseOrderId == shipment.PurchaseOrderId)
                .Select(x => x.SourceOA)
                .Distinct()
                .ToListAsync();

            // STEP-2 : Get Order Acceptance Ids
            var orderAcceptanceIds = await _context.Tbl_OrderAcceptances
                .Where(x => sourceOANos.Contains(x.GaxcePurchaseOrderNo))
                .Select(x => x.OrderAcceptanceId)
                .ToListAsync();

           
         


            // Dispatch numbers already saved in database
            var existingDispatchNos = await _context.Tbl_DispatchDetails
                .Where(x => !x.IsDeleted)
                .Select(x => x.DispatchNo)
                .ToListAsync();

            // Only save NEW dispatch numbers
            var selectedDispatches = dto.DispatchDetails
                .Where(x => x.IsSelected &&
                            !existingDispatchNos.Contains(x.DispatchNo))
                .ToList();

            // Validate Invoice only for selected Dispatch Numbers
            foreach (var item in selectedDispatches)
            {
                bool invoiceExists = await _context.Tbl_Invoices
                    .AnyAsync(x =>
                        x.OrderAcceptanceId == item.OrderAcceptanceId &&
                        !x.IsDeleted);

                if (!invoiceExists)
                {
                    throw new Exception(
                        $"Invoice is not created for Dispatch No {item.DispatchNo}. Please create the Invoice first."
                    );
                }
            }

            var dispatch = new Core.Models.ERP.Dispatch
            {
                ShipmentInitiateId = shipment.ShipmentInitiateId,
                ShipmentNo = shipment.ShipmentNo,
                DispatchDate = dto.DispatchDate,
                MaterialDispatch = dto.MaterialDispatch,
                DocketNo = dto.DocketNo,
                DeliveredDate = dto.DeliveredDate,
                DeliveredOnDate = dto.DeliveredOnDate,
                Remarks = dto.Remarks,
                Status = "Pending",
                CreatedDate = DateTime.Now,
                IsDeleted = false
            };

            _context.Tbl_Dispatchs.Add(dispatch);
            await _context.SaveChangesAsync();

            foreach (var item in selectedDispatches)
            {
                _context.Tbl_DispatchDetails.Add(new DispatchDetail
                {
                    DispatchId = dispatch.DispatchId,
                    OrderAcceptanceId = item.OrderAcceptanceId,
                    DispatchNo = item.DispatchNo,
                    CustomerName = item.CustomerName,
                    IsSelected = true,
                    Status = "Pending",
                    CreatedDate = DateTime.Now,
                    IsDeleted = false
                });
            }

            foreach (var item in dto.DispatchItems)
            {
                _context.Tbl_DispatchItems.Add(new DispatchItem
                {
                    DispatchId = dispatch.DispatchId,
                    BoxNo = item.BoxNo,
                    NetWeightKg = item.NetWeightKg,
                    GrossWeightKg = item.GrossWeightKg,
                    LengthCm = item.LengthCm,
                    WidthCm = item.WidthCm,
                    HeightCm = item.HeightCm,
                    CBM = item.CBM,
                    Remarks = item.Remarks,
                    CreatedDate = DateTime.Now,
                    IsDeleted = false
                });
            }

            foreach (var item in dto.StockItems)
            {
                _context.Tbl_DispatchStockItems.Add(new DispatchStockItem
                {
                    DispatchId = dispatch.DispatchId,
                    ItemType = item.ItemType,
                    ProductId = item.ProductId,
                    AccessoryId = item.AccessoryId,
                    ItemCode = item.ItemCode,
                    Description = item.Description,
                    Qty = item.Qty,
                    CreatedDate = DateTime.Now,
                    IsDeleted = false
                });
            }

            await _context.SaveChangesAsync();

            return await GetByIdAsync(dispatch.DispatchId);
        }

        #endregion

        #region Get All

        public async Task<List<DispatchDto>> GetAllAsync()
        {
            return await (
                from d in _context.Tbl_Dispatchs

                join dd in _context.Tbl_DispatchDetails
                    on d.DispatchId equals dd.DispatchId

                where !d.IsDeleted
                      && !dd.IsDeleted

                orderby d.DispatchId descending

                select new DispatchDto
                {
                    DispatchId = d.DispatchId,
                    ShipmentInitiateId = d.ShipmentInitiateId,
                    ShipmentNo = d.ShipmentNo,

                    CustomerName = dd.CustomerName,

                    DispatchDate = d.DispatchDate,
                    MaterialDispatch = d.MaterialDispatch,
                    DocketNo = d.DocketNo,
                    DeliveredDate = d.DeliveredDate,
                    DeliveredOnDate = d.DeliveredOnDate,
                    Remarks = d.Remarks,
                    Status = d.Status,

                    DispatchDetails = new List<DispatchSelectionDto>
                    {
                new DispatchSelectionDto
                {
                    OrderAcceptanceId = dd.OrderAcceptanceId,
                    DispatchNo = dd.DispatchNo,
                    CustomerName = dd.CustomerName,
                    IsSelected = dd.IsSelected
                }
                    }
                }
            ).ToListAsync();
        }

        #endregion

        #region Get By Id

        public async Task<DispatchDto?> GetByIdAsync(int id)
        {
            var dispatch = await _context.Tbl_Dispatchs
                .FirstOrDefaultAsync(x =>
                    x.DispatchId == id &&
                    !x.IsDeleted);

            if (dispatch == null)
                return null;

            var dispatchDetails = await _context.Tbl_DispatchDetails
            .Where(x => x.DispatchId == dispatch.DispatchId && !x.IsDeleted)
            .Select(x => new DispatchSelectionDto
            {
                OrderAcceptanceId = x.OrderAcceptanceId,
                DispatchNo = x.DispatchNo,
                CustomerName = x.CustomerName,
                IsSelected = x.IsSelected
            })
            .ToListAsync();

            var dispatchItems = await _context.Tbl_DispatchItems
                .Where(x =>
                    x.DispatchId == dispatch.DispatchId &&
                    !x.IsDeleted)
                .Select(x => new CreateDispatchItemDto
                {
                    BoxNo = x.BoxNo,
                    NetWeightKg = x.NetWeightKg,
                    GrossWeightKg = x.GrossWeightKg,
                    LengthCm = x.LengthCm,
                    WidthCm = x.WidthCm,
                    HeightCm = x.HeightCm,
                    CBM = x.CBM,
                    Remarks = x.Remarks
                })
                .ToListAsync();

            var stockItems = await _context.Tbl_DispatchStockItems
                .Where(x => x.DispatchId == dispatch.DispatchId && !x.IsDeleted)
                .Select(x => new CreateDispatchStockItemDto
                {
                    ItemType = x.ItemType,
                    ProductId = x.ProductId,
                    AccessoryId = x.AccessoryId,
                    ItemCode = x.ItemCode,
                    Description = x.Description,
                    Qty = x.Qty
                })
                .ToListAsync();

            return new DispatchDto
            {
                DispatchId = dispatch.DispatchId,
                ShipmentInitiateId = dispatch.ShipmentInitiateId,
                ShipmentNo = dispatch.ShipmentNo,
                CustomerId = dispatch.CustomerId,
                CustomerName = dispatch.CustomerName,
                DispatchDate = dispatch.DispatchDate,
                MaterialDispatch = dispatch.MaterialDispatch,
                DocketNo = dispatch.DocketNo,
                DeliveredDate = dispatch.DeliveredDate,
                DeliveredOnDate = dispatch.DeliveredOnDate,
                Remarks = dispatch.Remarks,
                Status = dispatch.Status,

                DispatchDetails = dispatchDetails,
                DispatchItems = dispatchItems,
                StockItems = stockItems,
            };
        }

        #endregion

        #region Update

        public async Task<bool> UpdateAsync(UpdateDispatchDto dto)
        {
            var dispatch = await _context.Tbl_Dispatchs
                .FirstOrDefaultAsync(x =>
                    x.DispatchId == dto.DispatchId &&
                    !x.IsDeleted);

            if (dispatch == null)
                return false;

            dispatch.DispatchDate = dto.DispatchDate;
            dispatch.MaterialDispatch = dto.MaterialDispatch;
            dispatch.DocketNo = dto.DocketNo;
            dispatch.DeliveredDate = dto.DeliveredDate;
            dispatch.DeliveredOnDate = dto.DeliveredOnDate;
            dispatch.Remarks = dto.Remarks;
            dispatch.Status = dto.Status;
            dispatch.UpdatedDate = DateTime.Now;
           
            // Delete existing Dispatch Items
            var oldItems = await _context.Tbl_DispatchItems
                .Where(x => x.DispatchId == dispatch.DispatchId && !x.IsDeleted)
                .ToListAsync();

            _context.Tbl_DispatchItems.RemoveRange(oldItems);

            var oldStockItems = await _context.Tbl_DispatchStockItems
            .Where(x => x.DispatchId == dispatch.DispatchId && !x.IsDeleted)
            .ToListAsync();

            _context.Tbl_DispatchStockItems.RemoveRange(oldStockItems);

            // Delete old Dispatch Details
            var oldDetails = await _context.Tbl_DispatchDetails
                .Where(x => x.DispatchId == dispatch.DispatchId && !x.IsDeleted)
                .ToListAsync();

            _context.Tbl_DispatchDetails.RemoveRange(oldDetails);

            //================ STOCK DISPATCH ===================
            if (dispatch.ShipmentInitiateId == 0)
            {
                string stockDispatchNo = $"DISP-STOCK-{dispatch.DispatchId:D5}";

                _context.Tbl_DispatchDetails.Add(new DispatchDetail
                {
                    DispatchId = dispatch.DispatchId,
                    OrderAcceptanceId = 0,
                    DispatchNo = stockDispatchNo,
                    CustomerName = "Stock Dispatch",
                    IsSelected = true,
                    Status = dispatch.Status,
                    CreatedDate = DateTime.Now,
                    IsDeleted = false
                });
            }
            else
            {
                foreach (var detail in dto.DispatchDetails.Where(x => x.IsSelected))
                {
                    _context.Tbl_DispatchDetails.Add(new DispatchDetail
                    {
                        DispatchId = dispatch.DispatchId,
                        OrderAcceptanceId = detail.OrderAcceptanceId,
                        DispatchNo = detail.DispatchNo,
                        CustomerName = detail.CustomerName,
                        IsSelected = true,
                        Status = dispatch.Status,
                        CreatedDate = DateTime.Now,
                        IsDeleted = false
                    });
                }
            }

            // Insert updated Dispatch Items
            foreach (var item in dto.DispatchItems)
            {
                _context.Tbl_DispatchItems.Add(new DispatchItem
                {
                    DispatchId = dispatch.DispatchId,
                    BoxNo = item.BoxNo,
                    NetWeightKg = item.NetWeightKg,
                    GrossWeightKg = item.GrossWeightKg,
                    LengthCm = item.LengthCm,
                    WidthCm = item.WidthCm,
                    HeightCm = item.HeightCm,
                    CBM = item.CBM,
                    Remarks = item.Remarks,
                    CreatedDate = DateTime.Now,
                    IsDeleted = false
                });
            }

            foreach (var item in dto.StockItems)
            {
                _context.Tbl_DispatchStockItems.Add(new DispatchStockItem
                {
                    DispatchId = dispatch.DispatchId,
                    ItemType = item.ItemType,
                    ProductId = item.ProductId,
                    AccessoryId = item.AccessoryId,
                    ItemCode = item.ItemCode,
                    Description = item.Description,
                    Qty = item.Qty,
                    CreatedDate = DateTime.Now,
                    IsDeleted = false
                });
            }
            await _context.SaveChangesAsync();

            return true;
        }

        #endregion

        #region Delete

        public async Task<bool> DeleteAsync(int id)
        {
            var dispatch = await _context.Tbl_Dispatchs
                .FirstOrDefaultAsync(x =>
                    x.DispatchId == id &&
                    !x.IsDeleted);

            if (dispatch == null)
                return false;

            dispatch.IsDeleted = true;
            dispatch.UpdatedDate = DateTime.Now;

            await _context.SaveChangesAsync();

            return true;
        }

        #endregion

        #region Shipment Dropdown

        public async Task<List<DispatchShipmentDropdownDto>> GetShipmentDropdownAsync()
        {
            return await (
                from shipment in _context.Tbl_ShipmentInitiates
                join transit in _context.Tbl_ShipmentUnderTransits
                    on shipment.ShipmentInitiateId equals transit.ShipmentInitiateId
                where !shipment.IsDeleted
                      && !transit.IsDeleted
                      && transit.Status == "Delivered"
                orderby shipment.ShipmentInitiateId descending
                select new DispatchShipmentDropdownDto
                {
                    ShipmentInitiateId = shipment.ShipmentInitiateId,
                    ShipmentNo = shipment.ShipmentNo +
                        (transit.FinalDeliveryDate.HasValue
                            ? $" ({transit.FinalDeliveryDate.Value:dd-MM-yyyy})"
                            : "")
                }
            ).ToListAsync();
        }

        #endregion

        #region Shipment Details

        public async Task<DispatchShipmentDetailsDto?> GetShipmentDetailsAsync(int shipmentInitiateId)
        {
            var shipment = await _context.Tbl_ShipmentInitiates
                .FirstOrDefaultAsync(x =>
                    x.ShipmentInitiateId == shipmentInitiateId &&
                    !x.IsDeleted);

            if (shipment == null)
                return null;

            // STEP-1 : Get Source OA Numbers
            var sourceOANos = await _context.Tbl_PurchaseOrderItems
                .Where(x => x.PurchaseOrderId == shipment.PurchaseOrderId)
                .Select(x => x.SourceOA)
                .Distinct()
                .ToListAsync();

            // STEP-2 : Get OA Details with Customer Name
            var orderAcceptances = await (
                from oa in _context.Tbl_OrderAcceptances
                join customer in _context.Tbl_Customers
                    on oa.CustomerId equals customer.Id
                where sourceOANos.Contains(oa.GaxcePurchaseOrderNo)
                select new
                {
                    oa.OrderAcceptanceId,
                    CustomerName = customer.CustomerName
                }
            ).ToListAsync();

            // Already created Dispatch Numbers for this Shipment
            var existingDispatchNos = await _context.Tbl_DispatchDetails
                .Where(x => !x.IsDeleted)
                .Select(x => x.DispatchNo)
                .ToListAsync();

            var dispatches = orderAcceptances
                 .Select((oa, index) =>
                 {
                     var dispatchNo = $"DISP-{shipment.ShipmentNo}-{index + 1}";

                     return new DispatchSelectionDto
                     {
                         OrderAcceptanceId = oa.OrderAcceptanceId,
                         DispatchNo = dispatchNo,
                         CustomerName = oa.CustomerName,
                         IsSelected = existingDispatchNos.Contains(dispatchNo)
                     };
                 })
                 .ToList();

            var items = new List<ShipmentItemDto>();

            return new DispatchShipmentDetailsDto
            {
                ShipmentInitiateId = shipment.ShipmentInitiateId,
                ShipmentNo = shipment.ShipmentNo,
                Dispatches = dispatches,
                Items = items
            };
        }

        #endregion
    }
}

