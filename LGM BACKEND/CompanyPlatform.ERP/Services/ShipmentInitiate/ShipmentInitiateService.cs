using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models.ERP.Shipment;
using CompanyPlatform.ERP.DTO.ShipmentItem;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.Services.ShipmentInitiate
{
    public class ShipmentInitiateService : IShipmentInitiateService
    {
        private readonly ApplicationDBContext _context;

        public ShipmentInitiateService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<string> GetNextShipmentNoAsync()
        {
            var today = DateTime.Now;

            int startYear =
                today.Month >= 4
                ? today.Year
                : today.Year - 1;

            int endYear = startYear + 1;

            string financialYear =
                $"{startYear % 100:D2}-{endYear % 100:D2}";

            string prefix =
                $"GS-SHP-{financialYear}-";

            var allNos = await _context.Tbl_ShipmentInitiates
                .Where(x => x.ShipmentNo.Contains($"SHP-{financialYear}"))
                .Select(x => x.ShipmentNo)
                .ToListAsync();

            int nextSeq = allNos
                .Select(x => int.TryParse(x.Split('-').Last(), out int n)
                    ? n : 0)
                .DefaultIfEmpty(0)
                .Max() + 1;

            return $"{prefix}{nextSeq:D3}";
        }

        public async Task<List<ShipmentDropdownDto>> GetGBPOrderAcceptanceDropdownAsync()
        {
            var data = await (
                from oa in _context.Tbl_OrderAcceptances

                join oao in _context.Tbl_OrderAcceptanceOffers
                    on oa.OrderAcceptanceId equals oao.OrderAcceptanceId

                join c in _context.Tbl_Currencies
                    on oao.CurrencyId equals c.Id

                join v in _context.Tbl_Vendors
                on oa.VendorId equals v.Id into vendors
                from v in vendors.DefaultIfEmpty()

                where !oa.IsDeleted
                      && oa.Status == "FINAL"
                      && c.CurrencyName == "GBP"
                      && oa.TermsConditions != null
                      && EF.Functions.Like(oa.TermsConditions, "%CIF%")

                select new ShipmentDropdownDto
                {
                    Id = oa.OrderAcceptanceId,
                    Number = v != null ? oa.GaxcePurchaseOrderNo + " (" + v.VendorName + ")" : oa.GaxcePurchaseOrderNo
                }
            )
            .Distinct()
            .OrderBy(x => x.Number)
            .ToListAsync();

            return data;
        }
        public async Task<List<ShipmentDropdownDto>> GetPurchaseOrderDropdownAsync()
        {
            var data = await (
                from po in _context.Tbl_PurchaseOrders

                join c in _context.Tbl_Currencies
                 on po.CurrencyId equals c.Id

                join v in _context.Tbl_Vendors
                    on po.VendorId equals v.Id into vendors
                from v in vendors.DefaultIfEmpty()

                where !po.IsDeleted && po.Status == "FINAL" && c.CurrencyName == "GBP"

                select new
                {
                    po.PurchaseOrderId,
                    po.PurchaseOrderNo,
                    VendorName = v != null ? v.VendorName : null
                })
                .OrderBy(x => x.PurchaseOrderNo)
                .ToListAsync();

            return data.Select(x => new ShipmentDropdownDto
            {
                Id = x.PurchaseOrderId,
                Number = string.IsNullOrEmpty(x.VendorName) ? x.PurchaseOrderNo : x.PurchaseOrderNo + " (" + x.VendorName + ")"


            }).ToList();
        }

        public async Task<ShipmentAutoFillDto?> GetOrderAcceptanceDetailsAsync(int oaId)
        {
            var oa = await _context.Tbl_OrderAcceptances
                .FirstOrDefaultAsync(x =>
                    x.OrderAcceptanceId == oaId);

            if (oa == null)
                return null;

            var oaOffer = await _context.Tbl_OrderAcceptanceOffers
                .FirstOrDefaultAsync(x =>
                    x.OrderAcceptanceId == oaId);

            if (oaOffer == null)
                return null;

            var customer = await _context.Tbl_Customers
                .FirstOrDefaultAsync(x =>
                    x.Id == oaOffer.CustomerId);

            var customerAddress = await _context.Tbl_CustomerAddress
                .Where(x =>
                    x.CustomerId == oaOffer.CustomerId
                    && !x.IsDeleted)
                .FirstOrDefaultAsync();

            var companyAddress = await _context.Tbl_CompanyAddresses
                .Where(x =>
                    x.CompanyId == oaOffer.CompanyId
                    && !x.IsDeleted)
                .FirstOrDefaultAsync();

            var currency = await _context.Tbl_Currencies
                .FirstOrDefaultAsync(x =>
                    x.Id == oaOffer.CurrencyId);

            return new ShipmentAutoFillDto
            {
                CustomerId = customer?.Id,
                CustomerName = customer?.CustomerName,

                GSTNo = customer?.GSTIN,

                ConsigneeAddress =
                    customerAddress == null
                    ? ""
                    : string.Join(", ",
                        new[]
                        {
                    customerAddress.FlatBlockNo,
                    customerAddress.PremisesName,
                    customerAddress.Road,
                    customerAddress.Area,
                    customerAddress.Town,
                    customerAddress.PinNo
                        }
                        .Where(x => !string.IsNullOrWhiteSpace(x))),

                ShipperAddress =
                    companyAddress == null
                    ? ""
                    : string.Join(", ",
                        new[]
                        {
                    companyAddress.FlatBlock,
                    companyAddress.Premises,
                    companyAddress.Road,
                    companyAddress.Area,
                    companyAddress.Town,
                    companyAddress.PinCode
                        }
                        .Where(x => !string.IsNullOrWhiteSpace(x))),

                InvoiceValue = oa.GrandTotal,

                CurrencyId = currency?.Id,
                CurrencyName = currency?.CurrencyName
            };
        }

        public async Task<ShipmentAutoFillDto?> GetPurchaseOrderDetailsAsync(int poId)
        {
            var po = await _context.Tbl_PurchaseOrders
                .FirstOrDefaultAsync(x =>
                    x.PurchaseOrderId == poId);

            if (po == null)
                return null;

            var customer =
                await _context.Tbl_Customers
                .FirstOrDefaultAsync(x =>
                    x.Id == po.CustomerId);

            var customerAddress =
                await _context.Tbl_CustomerAddress
                .FirstOrDefaultAsync(x =>
                    x.CustomerId == po.CustomerId
                    && !x.IsDeleted);

            var companyAddress =
                await _context.Tbl_CompanyAddresses
                .FirstOrDefaultAsync(x =>
                    x.CompanyId == po.CompanyId
                    && !x.IsDeleted);

            var currency =
                await _context.Tbl_Currencies
                .FirstOrDefaultAsync(x =>
                    x.Id == po.CurrencyId);

            var purchaseItems = await _context.Tbl_PurchaseOrderItems
            .Where(x => x.PurchaseOrderId == poId)
            .ToListAsync();

            var shipmentItems = new List<ShipmentSourceItemDto>();

            foreach (var item in purchaseItems)
            {
                if (item.ItemType == "Product")
                {
                    var product = await _context.Tbl_Products
                        .FirstOrDefaultAsync(x => x.ProductId == item.ProductId);

                    shipmentItems.Add(new ShipmentSourceItemDto
                    {
                        ItemType = "Product",
                        ProductId = item.ProductId,
                        ItemCode = product?.ProductCode,
                        PartNo = product?.PartNo,
                        ItemName = product?.ProductName,
                        Quantity = item.Quantity,
                        Unit = product?.UOM,
                    });

                    // Fetch mapped accessories
                    var accessories = await _context.Tbl_PurchaseOrderItemAccessories
                        .Where(x => x.PurchaseOrderItemId == item.PurchaseOrderItemId)
                        .ToListAsync();

                    foreach (var acc in accessories)
                    {
                        var accessory = await _context.Tbl_Accessories
                            .FirstOrDefaultAsync(x =>
                                x.AccessoriesId == acc.AccessoryId);

                        if (accessory != null)
                        {
                            shipmentItems.Add(new ShipmentSourceItemDto
                            {
                                ItemType = "Accessory",
                                AccessoryId = accessory.AccessoriesId,
                                ItemCode = accessory.AccessoriesCode,
                                PartNo = accessory.PartNo,
                                ItemName = accessory.AccessoriesName,
                                Quantity = item.Quantity,
                                Unit = accessory.UOM,
                            });
                        }
                    }
                }
                else
                {
                    var accessory = await _context.Tbl_Accessories
                        .FirstOrDefaultAsync(x =>
                            x.AccessoriesId == item.AccessoryId);

                    shipmentItems.Add(new ShipmentSourceItemDto
                    {
                        ItemType = "Accessory",
                        AccessoryId = item.AccessoryId,
                        ItemCode = accessory?.AccessoriesCode,
                        PartNo = accessory.PartNo,
                        ItemName = accessory?.AccessoriesName,
                        Quantity = item.Quantity,
                        Unit = accessory?.UOM,
                    });
                }
            }

            return new ShipmentAutoFillDto
            {
                CustomerId = customer?.Id,
                CustomerName = customer?.CustomerName,
                GSTNo = customer?.GSTIN,

                ConsigneeAddress =
                 customerAddress == null
                 ? ""
                 : $"{customerAddress.FlatBlockNo}, {customerAddress.PremisesName}, {customerAddress.Road}, {customerAddress.Town}",

                ShipperAddress =
                 companyAddress == null
                 ? ""
                 : $"{companyAddress.FlatBlock}, {companyAddress.Premises}, {companyAddress.Road}, {companyAddress.Town}",

                InvoiceValue = po.GrandTotal,

                CurrencyId = currency?.Id,
                CurrencyName = currency?.CurrencyName,

                SourceItems = shipmentItems
            };
        }

        public async Task<int> CreateAsync(ShipmentInitiateDto dto)
        {
            var shipmentNo = await GetNextShipmentNoAsync();

            var shipment =new Core.Models.ERP.Shipment.ShipmentInitiate
            {
                ShipmentNo = shipmentNo,
                SourceType = dto.SourceType,
                OrderAcceptanceId = dto.OrderAcceptanceId,
                PurchaseOrderId = dto.PurchaseOrderId,
                SourceDocumentNo = dto.SourceDocumentNo,
                CustomerId = dto.CustomerId,
                CustomerName = dto.CustomerName,
                Email = dto.Email,
                GSTNo = dto.GSTNo,
                ConsigneeAddress = dto.ConsigneeAddress,
                ShipperAddress = dto.ShipperAddress,
                InvoiceValue = dto.InvoiceValue,
                CurrencyId = dto.CurrencyId,
                CurrencyName = dto.CurrencyName,
                ShipmentModeId = dto.ShipmentModeId,
                InvoiceNo = dto.InvoiceNo,
                InvoiceDate = dto.InvoiceDate,
                ImportPackingList = dto.ImportPackingList,
                ImportPackingDate = dto.ImportPackingDate,
                ShipmentDate = dto.ShipmentDate,
                Remarks = dto.Remarks,
                TotalNetWeightKg = dto.Items.Sum(x => x.NetWeightKg),
                TotalGrossWeightKg = dto.Items.Sum(x => x.GrossWeightKg),
                TotalCBM = dto.Items.Sum(x => (x.LengthCm * x.WidthCm * x.HeightCm) / 1000000m),

                Status = "Shipment Initiated",

                Items = dto.Items
                .Select(x => new ShipmentItem
                {
                   
                    BoxNo = x.BoxNo,
                    NetWeightKg = x.NetWeightKg,
                    GrossWeightKg = x.GrossWeightKg,
                    LengthCm = x.LengthCm,
                    WidthCm = x.WidthCm,
                    HeightCm = x.HeightCm,
                    CBM = (x.LengthCm * x.WidthCm * x.HeightCm) / 1000000m,
                    Remarks = x.Remarks
                })
                .ToList(),

                SourceItems = dto.SourceItems
                .Select(x => new ShipmentSourceItem
                {
                    ItemType = x.ItemType,
                    ProductId = x.ProductId,
                    AccessoryId = x.AccessoryId,
                    ItemCode = x.ItemCode,
                    PartNo = x.PartNo,
                    ItemName = x.ItemName,
                    Quantity = x.Quantity,
                    Unit = x.Unit
                })
                .ToList()
            };

            _context.Tbl_ShipmentInitiates.Add(shipment);

            await _context.SaveChangesAsync();

            return shipment.ShipmentInitiateId;
        }

        public async Task<List<ShipmentListDto>> GetAllAsync()
        {
            return await (from s in _context.Tbl_ShipmentInitiates
                          join sm in _context.Tbl_ShipmentModes
                          on s.ShipmentModeId equals sm.Id
                          where !s.IsDeleted
                          orderby s.ShipmentInitiateId descending

                select new ShipmentListDto
                {
                    ShipmentInitiateId = s.ShipmentInitiateId,
                    ShipmentNo = s.ShipmentNo,
                    SourceType = s.SourceType,
                    SourceDocumentNo = s.SourceDocumentNo,
                    CustomerName = s.CustomerName,
                    ShipmentMode = sm.ModeName,
                    InvoiceNo = s.InvoiceNo,
                    InvoiceValue = s.InvoiceValue,
                    ShipmentDate = s.ShipmentDate,
                    Status = s.Status
                })
                .ToListAsync();
        }

        public async Task<ShipmentInitiateDto?> GetByIdAsync(int id)
        {
            var shipment = await _context.Tbl_ShipmentInitiates
               .Include(x => x.Items)
                .Include(x => x.SourceItems)
                .FirstOrDefaultAsync(x =>
                    x.ShipmentInitiateId == id &&
                    !x.IsDeleted);

            if (shipment == null)
                return null;

            var mode = await _context.Tbl_ShipmentModes
                .FirstOrDefaultAsync(x =>
                    x.Id == shipment.ShipmentModeId);

            return new ShipmentInitiateDto
            {
                ShipmentInitiateId = shipment.ShipmentInitiateId,
                ShipmentNo = shipment.ShipmentNo,
                SourceType = shipment.SourceType,
                OrderAcceptanceId = shipment.OrderAcceptanceId,
                PurchaseOrderId = shipment.PurchaseOrderId,
                SourceDocumentNo = shipment.SourceDocumentNo,
                CustomerId = shipment.CustomerId,
                CustomerName = shipment.CustomerName,
                Email = shipment.Email,
                GSTNo = shipment.GSTNo,
                ConsigneeAddress = shipment.ConsigneeAddress,
                ShipperAddress = shipment.ShipperAddress,
                InvoiceValue = shipment.InvoiceValue,
                CurrencyId = shipment.CurrencyId,
                CurrencyName = shipment.CurrencyName,
                ShipmentModeId = shipment.ShipmentModeId,
                ShipmentModeName = mode?.ModeName,
                InvoiceNo = shipment.InvoiceNo,
                InvoiceDate = shipment.InvoiceDate,
                ImportPackingList = shipment.ImportPackingList,
                ImportPackingDate = shipment.ImportPackingDate,
                ShipmentDate = shipment.ShipmentDate,
                Remarks = shipment.Remarks,
                Status = shipment.Status,

                Items = shipment.Items
                    .Select(i => new ShipmentItemDto
                    {
                        ShipmentItemId = i.ShipmentItemId,
              
                        BoxNo = i.BoxNo,
                        NetWeightKg = i.NetWeightKg,
                        GrossWeightKg = i.GrossWeightKg,
                        LengthCm = i.LengthCm,
                        WidthCm = i.WidthCm,
                        HeightCm = i.HeightCm,
                        CBM = i.CBM,
                        Remarks = i.Remarks
                    }).ToList(),

                SourceItems = shipment.SourceItems
                .Select(i => new ShipmentSourceItemDto
                {
                    ShipmentSourceItemId = i.ShipmentSourceItemId,
                    ItemType = i.ItemType,
                    ProductId = i.ProductId,
                    AccessoryId = i.AccessoryId,
                    ItemCode = i.ItemCode,
                    PartNo = i.PartNo,
                    ItemName = i.ItemName,
                    Quantity = i.Quantity,
                    Unit = i.Unit
                }).ToList()
            };
        }

        public async Task<bool> UpdateAsync(ShipmentInitiateDto dto)
        {
            var shipment =
                await _context.Tbl_ShipmentInitiates
               .Include(x => x.Items)
                .Include(x => x.SourceItems)
                .FirstOrDefaultAsync(x =>
                    x.ShipmentInitiateId ==
                    dto.ShipmentInitiateId);

            if (shipment == null)
                return false;

            shipment.SourceType = dto.SourceType;
            shipment.OrderAcceptanceId = dto.OrderAcceptanceId;
            shipment.PurchaseOrderId = dto.PurchaseOrderId;
            shipment.SourceDocumentNo = dto.SourceDocumentNo;
            shipment.CustomerId = dto.CustomerId;
            shipment.CustomerName = dto.CustomerName;
            shipment.Email = dto.Email;
            shipment.GSTNo = dto.GSTNo;
            shipment.ConsigneeAddress = dto.ConsigneeAddress;
            shipment.ShipperAddress = dto.ShipperAddress;
            shipment.InvoiceValue = dto.InvoiceValue;
            shipment.CurrencyId = dto.CurrencyId;
            shipment.CurrencyName = dto.CurrencyName;
            shipment.ShipmentModeId = dto.ShipmentModeId;
            shipment.InvoiceNo = dto.InvoiceNo;
            shipment.InvoiceDate = dto.InvoiceDate;
            shipment.ImportPackingList = dto.ImportPackingList;
            shipment.ImportPackingDate = dto.ImportPackingDate;
            shipment.ShipmentDate = dto.ShipmentDate;
            shipment.Remarks = dto.Remarks;

            _context.Tbl_ShipmentItems.RemoveRange(shipment.Items);
            _context.Tbl_ShipmentSourceItems.RemoveRange(shipment.SourceItems);

            shipment.Items = dto.Items.Select(x => new ShipmentItem
            {
                BoxNo = x.BoxNo,
                NetWeightKg = x.NetWeightKg,
                GrossWeightKg = x.GrossWeightKg,
                LengthCm = x.LengthCm,
                WidthCm = x.WidthCm,
                HeightCm = x.HeightCm,
                CBM = (x.LengthCm * x.WidthCm * x.HeightCm) / 1000000m,

                Remarks = x.Remarks
            }).ToList();

            shipment.TotalNetWeightKg = shipment.Items.Sum(x => x.NetWeightKg);
            shipment.TotalGrossWeightKg = shipment.Items.Sum(x => x.GrossWeightKg);
            shipment.TotalCBM = shipment.Items.Sum(x => x.CBM);

            shipment.SourceItems = dto.SourceItems
            .Select(x => new ShipmentSourceItem
            {
                ItemType = x.ItemType,
                ProductId = x.ProductId,
                AccessoryId = x.AccessoryId,
                ItemCode = x.ItemCode,
                PartNo = x.PartNo,
                ItemName = x.ItemName,
                Quantity = x.Quantity,
                Unit = x.Unit
            }).ToList();

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var shipment = await _context.Tbl_ShipmentInitiates.FirstOrDefaultAsync(x => x.ShipmentInitiateId == id);

            if (shipment == null)
                return false;

            shipment.IsDeleted = true;

            await _context.SaveChangesAsync();

            return true;
        }
    }
}
