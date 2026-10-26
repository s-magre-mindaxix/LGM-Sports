using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.CRM.DTO.PurchaseOrder;
using CompanyPlatform.Core.DTO.Enquiry;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.PurchaseOrder
{
    public class PurchaseOrderService : IPurchaseOrderService
    {
        private readonly ApplicationDBContext _context;
        public PurchaseOrderService(ApplicationDBContext context) => _context = context;
        
        public async Task<List<SelectOptionDto>> GetFinalOAsAsync()
        {
            var query =
                from oa in _context.Tbl_OrderAcceptances
                join oao in _context.Tbl_OrderAcceptanceOffers
                    on oa.OrderAcceptanceId equals oao.OrderAcceptanceId
                join o in _context.Tbl_Offers
                    on oao.OfferId equals o.OfferId
                // 1. Join with Currency table
                join cur in _context.Tbl_Currencies
                    on oao.CurrencyId equals cur.Id
                join cust in _context.Tbl_Customers
                    on oa.CustomerId equals cust.Id

                where oa.Status == "FINAL"
                      && oa.IsDeleted == false
                      && o.Source != "SERVICE"
                      // 2. Filter for INR only
                      && (cur.CurrencyName == "INR" || cur.CurrencyName == "INR")

                select new SelectOptionDto
                {
                    Value = oa.OrderAcceptanceId,
                    //Label = (oa.CustomerOrderNo != null && oa.CustomerOrderNo != "")
                    //        ? $"{oa.CustomerOrderNo} ({oa.GaxcePurchaseOrderNo})"
                    //        : oa.GaxcePurchaseOrderNo,
                    Label =
                       (oa.CustomerOrderNo != null && oa.CustomerOrderNo != ""
                           ? $"{oa.CustomerOrderNo} ({oa.GaxcePurchaseOrderNo})"
                           : oa.GaxcePurchaseOrderNo)
                       + $" - {cust.CustomerName}",
                    CurrencyId = oao.CurrencyId
                };

            return await query.Distinct().ToListAsync();
        }

        public async Task<List<SelectOptionDto>> GetFinalServiceOAsAsync()
        {
            var query =
                from oa in _context.Tbl_OrderAcceptances

                join oao in _context.Tbl_OrderAcceptanceOffers
                    on oa.OrderAcceptanceId equals oao.OrderAcceptanceId

                join o in _context.Tbl_Offers
                    on oao.OfferId equals o.OfferId

                join c in _context.Tbl_Customers
                    on oa.CustomerId equals c.Id

                where oa.Status == "FINAL"
                      && oa.IsDeleted == false
                      && o.Source == "SERVICE"   // ✅ ONLY SERVICE

                select new SelectOptionDto
                {
                    Value = oa.OrderAcceptanceId,
                    Label = (oa.GaxcePurchaseOrderNo ?? "") + " (" + c.CustomerName + ")",
                    CurrencyId = oao.CurrencyId
                };

            return await query.Distinct().ToListAsync();
        }
        
        public async Task<string> GetNextPONumberAsync()
        {
            var today = DateTime.Now;

            int startYear = today.Month >= 4 ? today.Year : today.Year - 1;
            int endYear = startYear + 1;

            string financialYear = $"{startYear % 100:D2}-{endYear % 100:D2}";

            // ✅ New prefix
            string prefix = $"GS-PO-{financialYear}-";

            // ✅ Continue from old GAX-PO and new GS-PO both
            var allNos = await _context.Tbl_PurchaseOrders
                .Where(x => x.PurchaseOrderNo != null &&
                            x.PurchaseOrderNo.Contains($"-PO-{financialYear}-"))
                .Select(x => x.PurchaseOrderNo)
                .ToListAsync();

            int nextSeq = allNos
                .Select(x => int.TryParse(x.Split('-').Last(), out int n) ? n : 0)
                .DefaultIfEmpty(0)
                .Max() + 1;

            return $"{prefix}{nextSeq:D3}";
        }

        public async Task<int> CreateAsync(PurchaseOrderDto dto)
        {
            // 1. Auto-generate Unique PO Number (e.g., PO-2026-00001)
            dto.PurchaseOrderNo = await GetNextPONumberAsync();

            // 2. Fetch Gaxce OA Number from DB (Common field from Acceptance table)
            // Use the primary OrderAcceptanceId to get the OA Number
            var primaryOaId = dto.OrderAcceptanceId > 0 ? dto.OrderAcceptanceId : (dto.Offers?.FirstOrDefault()?.OfferId ?? 0);

            string fetchedGaxceOaNo = await _context.Tbl_OrderAcceptances
                .Where(x => x.OrderAcceptanceId == primaryOaId)
                .Select(x => x.GaxcePurchaseOrderNo)
                .FirstOrDefaultAsync() ?? "";

            var po = new Core.Models.CRM.PurchaseOrder
            {
                OrderAcceptanceId = primaryOaId,
                PurchaseOrderNo = dto.PurchaseOrderNo, // Auto-generated
                GaxcePurchaseOrderNo = fetchedGaxceOaNo, // Common from OA Table

                CustomerOrderNo = dto.CustomerOrderNo ?? "",
                CustomerOrderDate = dto.CustomerOrderDate,
                PurchaseOrderDate = dto.PurchaseOrderDate ?? DateTime.Now,

                InvoiceNo = dto.InvoiceNo ?? "",
                InvoiceDate = dto.InvoiceDate,
                OfferCreateDate = dto.OfferCreateDate,
                OfferExpiryDate = dto.OfferExpiryDate,

                CompanyCode = dto.CompanyCode ?? "",
                VendorCode = dto.VendorCode ?? "",
                Address = dto.Address ?? "",

                CustomerId = dto.CustomerId ?? 0,
                VendorId = dto.VendorId ?? 0,
                CompanyId = dto.CompanyId ?? 0,
                ProductGroupId = dto.ProductGroupId ?? 0,
                CompanyGroupId = dto.CompanyGroupId ?? 0,
                CurrencyId = dto.CurrencyId ?? 0,
                PlaceOfSupplyId = dto.PlaceOfSupplyId ?? 0,
                BankDetailId = dto.BankDetailId ?? 0,
                ResponsiblePersonId = dto.ResponsiblePersonId ?? 0,
                AssignedToEmployeeId = dto.AssignedToEmployeeId ?? 0,

                Subtotal = dto.Subtotal ?? 0,
                FreightCharges = dto.FreightCharges ?? 0,
                GrandTotal = dto.GrandTotal ?? 0,

                TermsConditions = dto.TermsConditions ?? "",
                CustomerNotes = dto.CustomerNotes ?? "",
                Status = dto.Status ?? "DRAFT",
                IsDeleted = false,

                Items = (dto.Items ?? new List<PurchaseOrderItemDto>())
                .Select(i => new Core.Models.CRM.PurchaseOrderItem
                {
                    ItemType = (i.ProductId == 0 && i.AccessoryId > 0) ? "Accessory" : (i.ItemType ?? "Product"),

                    ProductId = i.ProductId > 0 ? i.ProductId : (int?)null,
                    AccessoryId = i.AccessoryId > 0 ? i.AccessoryId : (int?)null,
                    Description = i.Description ?? "",
                    HsnSacCode = i.HsnSacCode ?? "",
                    Quantity = i.Quantity,
                    Rate = i.Rate,
                    Discount = i.Discount,
                    TaxPercentage = i.TaxPercentage,
                    Total = i.Total,
                    GstAmount = i.GstAmount,
                    CgstAmount = i.CgstAmount,
                    SgstAmount = i.SgstAmount,
                    IgstAmount = i.IgstAmount,
                    FinalPrice = i.FinalPrice,
                    SourceOA = i.SourceOA ?? "",
                    ProductSource = i.ProductSource,
                    SelectedAccessories = (i.AccessoryIds ?? new List<int>()).Select(accId => new PurchaseOrderItemAccessory
                    {
                        AccessoryId = accId
                    }).ToList()
                }).ToList(),

                SelectedOffers = (dto.Offers ?? new List<PurchaseOrderOfferDto>())
                .Select(o => new PurchaseOrderOffer
                {
                    OfferId = o.OfferId,
                    GaxcePurchaseOrderNo = o.GaxcePurchaseOrderNo,
                    CustomerId = o.CustomerId,
                    VendorId = o.VendorId,
                    CompanyId = o.CompanyId,
                    ProductGroupId = o.ProductGroupId,
                    CompanyGroupId = o.CompanyGroupId,
                    CurrencyId = o.CurrencyId,
                    
                    PlaceOfSupplyId = o.PlaceOfSupplyId,
                    BankDetailId = o.BankDetailId,
                    ResponsiblePersonId = o.ResponsiblePersonId,
                    AssignedToEmployeeId = o.AssignedToEmployeeId,
                    OfferCreateDate = o.OfferCreateDate,
                    OfferExpiryDate = o.OfferExpiryDate,
                    CompanyCode = o.CompanyCode ?? "",
                    //VendorCode = o.VendorCode ?? "",
                    VendorCode = string.IsNullOrWhiteSpace(o.VendorCode) ? "" : o.VendorCode,
                    Address = o.Address ?? "",
                    FreightCharges = o.FreightCharges ?? 0,
                    CustomerNotes = o.CustomerNotes ?? ""
                }).ToList()
            };

            _context.Tbl_PurchaseOrders.Add(po);
            await _context.SaveChangesAsync();

            if (!string.IsNullOrEmpty(dto.Status) && dto.Status.ToLower() == "final")
            {
                var oaIds = new List<int>();

                // ✅ 1. MULTIPLE OA (MAIN SOURCE)
                if (dto.OrderAcceptanceIds != null && dto.OrderAcceptanceIds.Any())
                {
                    oaIds.AddRange(dto.OrderAcceptanceIds);
                }

                // ✅ 2. SINGLE OA (fallback)
                if (dto.OrderAcceptanceId.HasValue && dto.OrderAcceptanceId.Value > 0)
                {
                    oaIds.Add(dto.OrderAcceptanceId.Value);
                }

                // ✅ 3. OFFERS → OA mapping (extra safety)
                if (dto.Offers != null && dto.Offers.Any())
                {
                    var offerIds = dto.Offers.Select(o => o.OfferId).ToList();

                    var mappedOaIds = await _context.Set<OrderAcceptanceOffer>()
                        .Where(x => offerIds.Contains(x.OfferId))
                        .Select(x => x.OrderAcceptanceId)
                        .Distinct()
                        .ToListAsync();

                    oaIds.AddRange(mappedOaIds);
                }

                // ✅ REMOVE DUPLICATES
                oaIds = oaIds.Distinct().Where(x => x > 0).ToList();

                // ❌ If still empty → STOP
                if (!oaIds.Any())
                {
                    Console.WriteLine("❌ No OA IDs found to update.");
                    return po.PurchaseOrderId;
                }

                // ✅ UPDATE STATUS
                var oas = await _context.Tbl_OrderAcceptances
                    .Where(x => oaIds.Contains(x.OrderAcceptanceId))
                    .ToListAsync();

                foreach (var oaItem in oas)
                {
                    oaItem.Status = "Order Purchase";
                }

                Console.WriteLine("✅ Updated OA IDs: " + string.Join(",", oaIds));

                await _context.SaveChangesAsync();
            }
            return po.PurchaseOrderId;
        }

        public async Task<List<PurchaseOrderDto>> GetAllAsync()
        {
            return await _context.Tbl_PurchaseOrders
                .Where(x => !x.IsDeleted)
                .OrderByDescending(x => x.PurchaseOrderId)
                .Select(p => new PurchaseOrderDto
                {
                    PurchaseOrderId = p.PurchaseOrderId,
                    PurchaseOrderNo = p.PurchaseOrderNo,
                    GaxcePurchaseOrderNo = p.GaxcePurchaseOrderNo, // Common OA Number
                    PurchaseOrderDate = p.PurchaseOrderDate,
                    GrandTotal = p.GrandTotal,
                    Status = p.Status,
                    CurrencyId = p.CurrencyId,
                    CurrencySymbol = _context.Tbl_Currencies
                      .Where(c => c.Id == p.CurrencyId)
                      .Select(c => c.CurrencySymbol)
                      .FirstOrDefault() ?? ""
                }).ToListAsync();
        }

        public async Task<PurchaseOrderDto> GetByIdAsync(int id)
        {
            var p = await _context.Tbl_PurchaseOrders
        .Include(x => x.Items)
            .ThenInclude(i => i.SelectedAccessories) // ✅ ADD THIS to fetch linked accessories
        .AsNoTracking()
        .FirstOrDefaultAsync(x => x.PurchaseOrderId == id && !x.IsDeleted);

            if (p == null) return null;

            var offersWithNames = await (from poOffer in _context.Tbl_PurchaseOrderOffers
                                         where poOffer.PurchaseOrderId == id
                                         join oa in _context.Tbl_OrderAcceptances on poOffer.OfferId equals oa.OrderAcceptanceId
                                         select new PurchaseOrderOfferDto
                                         {
                                             OfferId = poOffer.OfferId,
                                             GaxcePurchaseOrderNo = oa.GaxcePurchaseOrderNo,
                                             CustomerId = poOffer.CustomerId,
                                             VendorId = poOffer.VendorId,
                                             CompanyId = poOffer.CompanyId,
                                             ProductGroupId = poOffer.ProductGroupId,
                                             CompanyGroupId = poOffer.CompanyGroupId,
                                             CurrencyId = p.CurrencyId,
                                             CurrencySymbol = _context.Tbl_Currencies
                                                .Where(c => c.Id == p.CurrencyId)
                                                .Select(c => c.CurrencySymbol)
                                                .FirstOrDefault() ?? "",
                                             PlaceOfSupplyId = poOffer.PlaceOfSupplyId,
                                             BankDetailId = poOffer.BankDetailId,
                                             ResponsiblePersonId = poOffer.ResponsiblePersonId,
                                             AssignedToEmployeeId = poOffer.AssignedToEmployeeId,
                                             OfferCreateDate = poOffer.OfferCreateDate,
                                             OfferExpiryDate = poOffer.OfferExpiryDate,
                                             CompanyCode = poOffer.CompanyCode,
                                             //VendorCode = poOffer.VendorCode,
                                             VendorCode = _context.Tbl_Customers
                                              .Where(c => c.Id == poOffer.CustomerId && !c.IsDeleted)
                                              .Select(c => c.ForeignVendorCode)
                                              .FirstOrDefault(),
                                             Address = poOffer.Address,
                                             FreightCharges = poOffer.FreightCharges,
                                             CustomerNotes = poOffer.CustomerNotes
                                         }).ToListAsync();

            return new PurchaseOrderDto
            {
                PurchaseOrderId = p.PurchaseOrderId,
                PurchaseOrderNo = p.PurchaseOrderNo,
                GaxcePurchaseOrderNo = p.GaxcePurchaseOrderNo,
                PurchaseOrderDate = p.PurchaseOrderDate,
                NextFollowUpDate = p.NextFollowUpDate,
                Status = p.Status,
                Subtotal = p.Subtotal,
                FreightCharges = p.FreightCharges,
                GrandTotal = p.GrandTotal,
                TermsConditions = p.TermsConditions,
                CustomerNotes = p.CustomerNotes,

                // ✅ ADD THESE MAPPINGS TO FIX EMPTY DROPDOWNS
                CustomerId = p.CustomerId,
                VendorId = p.VendorId,
                CompanyId = p.CompanyId,
                ProductGroupId = p.ProductGroupId,
                CompanyGroupId = p.CompanyGroupId,
                CurrencyId = p.CurrencyId,
                PlaceOfSupplyId = p.PlaceOfSupplyId,
                BankDetailId = p.BankDetailId,
                ResponsiblePersonId = p.ResponsiblePersonId,
                AssignedToEmployeeId = p.AssignedToEmployeeId,
                CompanyCode = p.CompanyCode,
                //VendorCode = p.VendorCode,
                VendorCode = _context.Tbl_Customers
                  .Where(c => c.Id == p.CustomerId && !c.IsDeleted)
                  .Select(c => c.ForeignVendorCode)
                  .FirstOrDefault(),
                Address = p.Address,

                Offers = offersWithNames,
                OrderAcceptanceIds = offersWithNames.Select(x => x.OfferId).ToList(),
                Items = p.Items.Select(i => new PurchaseOrderItemDto
                {
                    PurchaseOrderItemId = i.PurchaseOrderItemId,
                    ProductId = i.ProductId ?? 0,
                    AccessoryId = i.AccessoryId ?? 0,
                    ItemType = i.ItemType ?? "Product",
                    Description = i.Description,
                    HsnSacCode = i.HsnSacCode,
                    Quantity = i.Quantity,
                    Rate = i.Rate,
                    Discount = i.Discount,
                    TaxPercentage = i.TaxPercentage,
                    Total = i.Total,
                    GstAmount = i.GstAmount,
                    CgstAmount = i.CgstAmount,
                    SgstAmount = i.SgstAmount,
                    IgstAmount = i.IgstAmount,
                    FinalPrice = i.FinalPrice,
                    SourceOA = i.SourceOA,
                    ProductSource = i.ProductSource,
                    AccessoryIds = i.SelectedAccessories.Select(a => a.AccessoryId).ToList()
                }).ToList()
            };
        }

        public async Task<bool> UpdateAsync(PurchaseOrderDto dto)
        {
            var existing = await _context.Tbl_PurchaseOrders
                .Include(x => x.Items)
                .Include(x => x.SelectedOffers)
                .FirstOrDefaultAsync(x => x.PurchaseOrderId == dto.PurchaseOrderId);

            if (existing == null) return false;

            // Update header common fields
            existing.PurchaseOrderDate = dto.PurchaseOrderDate;
            existing.Status = dto.Status;
            existing.GrandTotal = dto.GrandTotal;
            existing.FreightCharges = dto.FreightCharges ?? 0;
            existing.Subtotal = dto.Subtotal ?? 0;
            existing.CustomerNotes = dto.CustomerNotes;
            existing.TermsConditions = dto.TermsConditions;

            // Note: PurchaseOrderNo is never updated as it is unique/permanent
            // GaxcePurchaseOrderNo is updated if the selection changes
            var primaryOaId = dto.OrderAcceptanceId > 0 ? dto.OrderAcceptanceId : (dto.Offers?.FirstOrDefault()?.OfferId ?? 0);
            existing.GaxcePurchaseOrderNo = await _context.Tbl_OrderAcceptances
                .Where(x => x.OrderAcceptanceId == primaryOaId)
                .Select(x => x.GaxcePurchaseOrderNo)
                .FirstOrDefaultAsync() ?? existing.GaxcePurchaseOrderNo;

            _context.Tbl_PurchaseOrderItems.RemoveRange(existing.Items);
            _context.Tbl_PurchaseOrderOffers.RemoveRange(existing.SelectedOffers);

            await _context.SaveChangesAsync();

            existing.Items = dto.Items.Select(i => new PurchaseOrderItem
            {
                ItemType = (i.ProductId == 0 && i.AccessoryId > 0) ? "Accessory" : (i.ItemType ?? "Product"),
                ProductId = i.ProductId > 0 ? i.ProductId : (int?)null,
                AccessoryId = i.AccessoryId > 0 ? i.AccessoryId : (int?)null,
                Description = i.Description ?? "",
                HsnSacCode = i.HsnSacCode ?? "",
                Quantity = i.Quantity,
                Rate = i.Rate,
                Discount = i.Discount,
                TaxPercentage = i.TaxPercentage,
                Total = i.Total,
                GstAmount = i.GstAmount,
                CgstAmount = i.CgstAmount,
                SgstAmount = i.SgstAmount,
                IgstAmount = i.IgstAmount,
                FinalPrice = i.FinalPrice,
                SourceOA = i.SourceOA ?? "",
                ProductSource = i.ProductSource,
                SelectedAccessories = (i.AccessoryIds ?? new List<int>()).Select(accId => new PurchaseOrderItemAccessory
                {
                    AccessoryId = accId
                }).ToList()
            }).ToList();

            existing.SelectedOffers = dto.Offers.Select(o => new PurchaseOrderOffer
            {
                OfferId = o.OfferId,
                CustomerId = o.CustomerId,
                VendorId = o.VendorId,
                CompanyId = o.CompanyId,
                ProductGroupId = o.ProductGroupId,
                CompanyGroupId = o.CompanyGroupId,
                CurrencyId = o.CurrencyId,
                PlaceOfSupplyId = o.PlaceOfSupplyId,
                BankDetailId = o.BankDetailId,
                ResponsiblePersonId = o.ResponsiblePersonId,
                AssignedToEmployeeId = o.AssignedToEmployeeId,
                OfferCreateDate = o.OfferCreateDate,
                OfferExpiryDate = o.OfferExpiryDate,
                CompanyCode = o.CompanyCode,
                //VendorCode = o.VendorCode,
                VendorCode = string.IsNullOrWhiteSpace(o.VendorCode) ? "" : o.VendorCode,
                Address = o.Address,
                FreightCharges = o.FreightCharges,
                CustomerNotes = o.CustomerNotes
            }).ToList();

            _context.Tbl_PurchaseOrders.Update(existing);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var po = await _context.Tbl_PurchaseOrders.FindAsync(id);
            if (po == null) return false;
            po.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<PurchaseOrderPdfDto> GetPurchaseOrderPdf(int id)
        {
            var po = await _context.Tbl_PurchaseOrders
                .Include(x => x.Items)
                .FirstOrDefaultAsync(x => x.PurchaseOrderId == id);

            if (po == null)
                throw new Exception("Purchase Order not found");

            var company = await _context.Tbl_Companies
               .Include(c => c.Addresses)
               .Include(c => c.Directors) 
               .FirstOrDefaultAsync(x => x.CompanyId == po.CompanyId);

            var poOffer = await _context.Tbl_PurchaseOrderOffers
            .Where(x => x.PurchaseOrderId == id && x.VendorId != null)
            .Select(x => x.VendorId)
            .FirstOrDefaultAsync();

            var vendor = await _context.Tbl_Vendors
            .Include(v => v.Addresses)
            .Include(v => v.PrincipalContacts)
            .FirstOrDefaultAsync(v => v.Id == poOffer);

            var companyAddress = company?.Addresses?.FirstOrDefault();
            var vendorAddress = vendor?.Addresses?.FirstOrDefault();

            // ✅ DIRECT FETCH INTO FINAL DTO (BEST APPROACH)
            var finalItems = await (
                from item in _context.Tbl_PurchaseOrderItems
                join product in _context.Tbl_Products
                    on item.ProductId equals (int?)product.ProductId into prodGroup
                from product in prodGroup.DefaultIfEmpty()

                join accessory in _context.Tbl_Accessories
                on item.AccessoryId equals (int?)accessory.AccessoriesId into accGroup
                from accessory in accGroup.DefaultIfEmpty()

                where item.PurchaseOrderId == id
                select new PurchaseOrderItemDto
                {
                    PurchaseOrderItemId = item.PurchaseOrderItemId,
                    ItemType = item.ItemType ?? "Product",

                    PartNo =product != null && accessory != null? product.PartNo + " / " + accessory.PartNo: product != null
                            ? product.PartNo ?? product.ProductCode
                            : accessory != null
                                ? accessory.PartNo ?? accessory.AccessoriesCode
                                : "",

                    ProductId = item.ProductId ?? 0,
                    AccessoryId = item.AccessoryId ?? 0,
                    Description = item.Description,
                    ProductDescription = (item.ItemType == "Product" && item.ProductId != null)
                            ? _context.Set<CompanyPlatform.Core.Models.CRM.Product>()
                                .Where(p => p.ProductId == item.ProductId && !p.IsDeleted)
                                .Select(p => p.ProductDescription)
                                .FirstOrDefault()
                            : null,

                    AccessoriesDescription = (item.ItemType == "Accessory" && item.AccessoryId != null)
                             ? _context.Set<CompanyPlatform.Core.Models.CRM.Accessories>()
                                 .Where(a => a.AccessoriesId == item.AccessoryId && !a.IsDeleted)
                                 .Select(a => a.AccessoriesDescription)
                                 .FirstOrDefault()
                             : null,
                    HsnSacCode = item.HsnSacCode,
                    Quantity = item.Quantity,
                    Rate = item.Rate,
                    Discount = item.Discount,
                    TaxPercentage = item.TaxPercentage,
                    Total = item.Total,
                    GstAmount = item.GstAmount,
                    CgstAmount = item.CgstAmount,
                    SgstAmount = item.SgstAmount,
                    IgstAmount = item.IgstAmount,
                    FinalPrice = item.FinalPrice,

                    // If you want accessories later, we can include here
                    AccessoryIds = item.SelectedAccessories
                                        .Select(a => a.AccessoryId)
                                        .ToList()
                }
            ).ToListAsync();

            var currencySymbol = await _context.Tbl_Currencies
                .Where(c => c.Id == po.CurrencyId)
                .Select(c => c.CurrencySymbol)
                .FirstOrDefaultAsync() ?? "";

            return new PurchaseOrderPdfDto
            {
                CompanyName = company?.CompanyName ?? "",
                CompanyContactPerson = company?.Directors?
                .FirstOrDefault(d => !d.IsDeleted)?.DirectorName ?? "",

                CompanyAddress = companyAddress != null
                    ? $"{companyAddress.FlatBlock}, {companyAddress.Premises}, {companyAddress.Road}, {companyAddress.Area}, {companyAddress.Town}, {companyAddress.State} - {companyAddress.PinCode}, {companyAddress.Country}"
                    : "",

                VendorName = vendor?.VendorName ?? "",
                VendorCode = po.VendorCode ?? "",
                VendorContactPerson = vendor?.PrincipalContacts
                ?.FirstOrDefault(c => !c.IsDeleted)?.PersonName ?? "",
                VendorAddress = _context.Tbl_VendorAddresses
                        .Where(a => a.VendorId == po.VendorId && !a.IsDeleted && a.AddressType == "Correspondence")
                        .Select(a =>
                            (a.Premises ?? "") + ", " +
                            (a.RoadStrLane ?? "") + ", " +
                            (a.Town ?? "") + ", " +
                            (a.PinNo ?? "")
                        )
                        .FirstOrDefault(),

                PurchaseOrderNo = po.PurchaseOrderNo,
                PurchaseOrderDate = po.PurchaseOrderDate,

                Items = finalItems, 

                GrandTotal = po.GrandTotal ?? 0,
                FreightCharges = po.FreightCharges ?? 0,
                TermsConditions = po.TermsConditions,
                CustomerNotes = po.CustomerNotes,
                CurrencySymbol = currencySymbol,
            };
        }

        public async Task<PurchaseOrderDto> GetDataForPOFromOAsAsync(List<int> oaIds)
        {
            if (oaIds == null || !oaIds.Any())
                throw new ArgumentException("At least one Order Acceptance ID must be provided.");

            // 1. Fetch OAs with Items and their Selected (Linked) Accessories
            var oas = await _context.Tbl_OrderAcceptances
                .Include(oa => oa.Items)
                    .ThenInclude(i => i.SelectedAccessories)
                .Where(oa => oaIds.Contains(oa.OrderAcceptanceId) && !oa.IsDeleted)
                .AsNoTracking()
                .ToListAsync();

            if (!oas.Any())
                throw new Exception("No valid Order Acceptances found.");

            // 2. Identify Target Currency Info (from the OA/Offer)
            var primaryOaId = oas.First().OrderAcceptanceId;
            var currencyInfo = await (
                from oao in _context.Tbl_OrderAcceptanceOffers
                join o in _context.Tbl_Offers on oao.OfferId equals o.OfferId
                join c in _context.Tbl_Currencies on o.CurrencyId equals c.Id
                where oao.OrderAcceptanceId == primaryOaId
                select new { c.CurrencyName, c.Id }
            ).FirstOrDefaultAsync();

            //bool isTargetINR = currencyInfo?.CurrencyName?.ToUpper() == "INR";

            // 3. Prepare IDs for Master Data lookup
            var productIds = oas.SelectMany(oa => oa.Items).Where(i => i.ProductId > 0).Select(i => i.ProductId.Value).Distinct().ToList();
            var accessoryIds = oas.SelectMany(oa => oa.Items).Where(i => i.AccessoryId > 0).Select(i => i.AccessoryId.Value).Distinct().ToList();

            // 4. Fetch Master Data (Prices and Currency IDs from Product/Accessory tables)
            var productDict = await _context.Tbl_Products
                  .Where(p => productIds.Contains(p.ProductId))
                  .Select(p => new
                  {
                      p.ProductId,
                      p.PurchasePrice,
                      p.CurrencyId,
                      p.ProductSource,
                      CurrencyPrices = new List<PurchaseOrderItemDto.ItemCurrencyPriceDto>
                        {
                            new PurchaseOrderItemDto.ItemCurrencyPriceDto
                            {
                                CurrencyId = p.CurrencyId ?? 0,
                                CurrencyName = _context.Tbl_Currencies
                                    .Where(c => c.Id == p.CurrencyId)
                                    .Select(c => c.CurrencyName)
                                    .FirstOrDefault(),
                                Price = p.PurchasePrice
                            }
                        }
                  })
                 .ToDictionaryAsync(p => p.ProductId);

            var accessoryDict = await _context.Tbl_Accessories
               .Where(a => accessoryIds.Contains(a.AccessoriesId))
               .Select(a => new
               {
                   a.AccessoriesId,
                   a.PurchasePrice,
                   a.CurrencyId,
                   a.ProductSource,
                   CurrencyPrices = new List<PurchaseOrderItemDto.ItemCurrencyPriceDto>
                    {
                        new PurchaseOrderItemDto.ItemCurrencyPriceDto
                        {
                            CurrencyId = a.CurrencyId ?? 0,
                            CurrencyName = _context.Tbl_Currencies
                                .Where(c => c.Id == a.CurrencyId)
                                .Select(c => c.CurrencyName)
                                .FirstOrDefault(),

                            Price = a.PurchasePrice
                        }
                    }
               })
               .ToDictionaryAsync(a => a.AccessoriesId);

            // 5. Map Items and Set Master Rates/Currencies
            var allItems = new List<PurchaseOrderItemDto>();
            
            foreach (var oa in oas)
            {
                foreach (var item in oa.Items)
                {
                    decimal masterPurchaseRate = item.Rate;
                    int? masterCurrencyId = null;
                    string? productSource = null;


                    // ✅ PRODUCT
                    if (item.ProductId > 0 && productDict.TryGetValue(item.ProductId.Value, out var prod))
                    {
                        productSource = prod.ProductSource;
                        masterPurchaseRate = prod.PurchasePrice;
                        masterCurrencyId = prod.CurrencyId;
                    }

                    // ✅ ACCESSORY
                    else if (item.AccessoryId > 0 && accessoryDict.TryGetValue(item.AccessoryId.Value, out var acc))
                    {
                        productSource = acc.ProductSource;
                        masterPurchaseRate = acc.PurchasePrice;
                        masterCurrencyId = acc.CurrencyId;
                    }

                    List<PurchaseOrderItemDto.ItemCurrencyPriceDto> currencyPrices = new();

                    if (item.ProductId > 0 &&
                        productDict.TryGetValue(item.ProductId.Value, out var product))
                    {
                        currencyPrices = product.CurrencyPrices.ToList();
                    }
                    else if (item.AccessoryId > 0 &&
                             accessoryDict.TryGetValue(item.AccessoryId.Value, out var accessory))
                    {
                        currencyPrices = accessory.CurrencyPrices.ToList();
                    }

                    allItems.Add(new PurchaseOrderItemDto
                    {
                        ProductId = item.ProductId ?? 0,
                        AccessoryId = item.AccessoryId ?? 0,
                        ItemType = item.ItemType,
                        Description = item.Description,
                        HsnSacCode = item.HsnSacCode,
                        Quantity = item.Quantity,
                        Rate = masterPurchaseRate,
                        MasterCurrencyId = masterCurrencyId,
                        Discount = 0,
                        SourceOA = oa.GaxcePurchaseOrderNo,

                        ProductSource = productSource, // ✅ NOW WORKS FOR BOTH
                        CurrencyPrices = currencyPrices,
                        AccessoryIds = item.SelectedAccessories.Select(a => a.AccessoryId).ToList()
                    });
                }
            }
            // 6. Fetch Metadata (Offer/Customer/Vendor details)
            var allOfferIds = await _context.Tbl_OrderAcceptanceOffers
                .Where(oao => oaIds.Contains(oao.OrderAcceptanceId))
                .Select(oao => oao.OfferId)
                .Distinct()
                .ToListAsync();

            var offersData = await _context.Tbl_Offers
                .Where(o => allOfferIds.Contains(o.OfferId))
                .AsNoTracking()
                .ToDictionaryAsync(o => o.OfferId, o => o);

            var customerForeignVendorCodes = await _context.Tbl_Customers
                 .Select(c => new
                 {
                     c.Id,
                     c.ForeignVendorCode
                 })
                 .ToListAsync();

            var oaToOfferMap = await _context.Tbl_OrderAcceptanceOffers
                .Where(oao => oaIds.Contains(oao.OrderAcceptanceId))
                .ToDictionaryAsync(oao => oao.OrderAcceptanceId, oao => oao.OfferId);

            var mappedOffers = new List<PurchaseOrderOfferDto>();
            foreach (var oa in oas)
            {
                if (oaToOfferMap.TryGetValue(oa.OrderAcceptanceId, out int offerId) && offersData.TryGetValue(offerId, out var offerData))
                {
                    mappedOffers.Add(new PurchaseOrderOfferDto
                    {
                        OfferId = oa.OrderAcceptanceId,
                        GaxcePurchaseOrderNo = oa.GaxcePurchaseOrderNo,
                        CustomerId = offerData.CustomerId,
                        VendorId = offerData.VendorId,
                        CompanyId = offerData.CompanyId,
                        ProductGroupId = offerData.ProductGroupId,
                        CompanyGroupId = offerData.CompanyGroupId,
                        CurrencyId = offerData.CurrencyId,
                        PlaceOfSupplyId = offerData.PlaceOfSupplyId,
                        BankDetailId = offerData.BankDetailId,
                        ResponsiblePersonId = offerData.ResponsiblePersonId,
                        AssignedToEmployeeId = offerData.AssignedToEmployeeId,
                        OfferCreateDate = offerData.OfferDate,
                        OfferExpiryDate = offerData.ExpiryDate,
                        CustomerNotes = oa.CustomerNotes,
                        CompanyCode = oa.CompanyCode,
                        VendorCode = customerForeignVendorCodes
                            .FirstOrDefault(c => c.Id == offerData.CustomerId)
                            ?.ForeignVendorCode ?? "",
                        Address = oa.Address,
                        FreightCharges = oa.FreightCharges,
                    });
                }
            }

            // 7. Return Final DTO
            var firstOa = oas.FirstOrDefault();
            var firstOffer = mappedOffers.FirstOrDefault();
            return new PurchaseOrderDto
            {
                OrderAcceptanceIds = oaIds,
                Offers = mappedOffers,
                Items = allItems,
                CurrencyId = currencyInfo?.Id ?? 0,
                FreightCharges = 0,
                Status = "DRAFT",
                CustomerId = firstOffer?.CustomerId ?? 0,
                CompanyId = firstOffer?.CompanyId ?? 0,
                VendorId = firstOffer?.VendorId ?? 0,
                ProductGroupId = firstOffer?.ProductGroupId ?? 0,
                CompanyGroupId = firstOffer?.CompanyGroupId ?? 0,
                PlaceOfSupplyId = firstOffer?.PlaceOfSupplyId ?? 0,
                BankDetailId = firstOffer?.BankDetailId ?? 0,
                ResponsiblePersonId = firstOffer?.ResponsiblePersonId ?? 0,
                AssignedToEmployeeId = firstOffer?.AssignedToEmployeeId ?? 0,
                Address = firstOffer?.Address ?? "",
                CompanyCode = firstOffer?.CompanyCode ?? "",
                VendorCode = firstOffer?.VendorCode ?? "",
                TermsConditions = firstOa?.TermsConditions ?? "",
                CustomerNotes = firstOa?.CustomerNotes ?? ""
            };
        }
    
    }
}