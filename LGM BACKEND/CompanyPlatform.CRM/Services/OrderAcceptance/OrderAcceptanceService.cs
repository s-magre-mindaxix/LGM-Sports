using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.DTO.Vendor;
using CompanyPlatform.Core.Models;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.Core.Services.Notification;
using CompanyPlatform.CRM.DTO.OrderAcceptance;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.OrderAcceptance
{
    public class OrderAcceptanceService : IOrderAcceptanceService
    {
        private readonly ApplicationDBContext _context;
        private readonly INotificationHelper _notificationHelper;
        public OrderAcceptanceService(
            ApplicationDBContext context, 
            INotificationHelper notificationHelper)
        {
            _context = context;
            _notificationHelper = notificationHelper;
        }
   

        public async Task<List<OfferSelectionDto>> GetFinalOffersAsync()
        {
            var usedOfferIds = await _context.Tbl_OrderAcceptanceOffers
            .Select(x => x.OfferId)
            .ToListAsync();

            return await _context.Tbl_Offers
                .Where(x => x.Status == "FINAL" && x.Source != "SERVICE" && !x.IsDeleted && !usedOfferIds.Contains(x.OfferId))
                .Select(x => new OfferSelectionDto
                {
                    Value = x.OfferId,
                    //Label = x.OfferNo,
                    Label = (x.OfferNo ?? "") + " (" +
                    (_context.Tbl_Customers
                        .Where(c => c.Id == x.CustomerId)
                        .Select(c => c.CustomerName)
                        .FirstOrDefault() ?? "") +
                    " - " +
                    x.OfferDate.ToString("dd-MM-yyyy") +
                    ")",
                    CurrencyId = x.CurrencyId
                })
                .ToListAsync();
        }

        public async Task<List<OfferSelectionDto>> GetFinalServiceOffersAsync()
        {
            var usedOfferIds = await _context.Tbl_OrderAcceptanceOffers
              .Select(x => x.OfferId)
              .ToListAsync();

            return await _context.Tbl_Offers
                .Where(x => x.Status == "FINAL"
                            && !x.IsDeleted
                            && x.Source == "SERVICE" &&
                            !usedOfferIds.Contains(x.OfferId))
                .Select(x => new OfferSelectionDto
                {
                    Value = x.OfferId,
                    //Label = x.OfferNo,
                    Label = (x.OfferNo ?? "") + " (" +
                    (_context.Tbl_Customers
                        .Where(c => c.Id == x.CustomerId)
                        .Select(c => c.CustomerName)
                        .FirstOrDefault() ?? "") +
                    " - " +
                    x.OfferDate.ToString("dd-MM-yyyy") +
                    ")",
                    CurrencyId = x.CurrencyId
                })
                .ToListAsync();
        }

        public async Task<OrderAcceptanceDto> GetAggregatedOfferDataAsync(List<int> offerIds)
        {
            if (offerIds == null || !offerIds.Any()) return null;

            var offers = await _context.Tbl_Offers
                .Include(o => o.Items).ThenInclude(i => i.SelectedAccessories)
                .Where(o => offerIds.Contains(o.OfferId))
                .ToListAsync();

            if (!offers.Any()) return null;

            var offerSummariesQuery = from o in _context.Tbl_Offers
                                      where offerIds.Contains(o.OfferId)
                                      join c in _context.Tbl_Customers on o.CustomerId equals c.Id into cj
                                      from customer in cj.DefaultIfEmpty() // LEFT JOIN
                                      join co in _context.Tbl_Companies on o.CompanyId equals co.CompanyId into coj
                                      from company in coj.DefaultIfEmpty() // LEFT JOIN
                                      join v in _context.Tbl_Vendors on o.VendorId equals v.Id into vj
                                      from vendor in vj.DefaultIfEmpty() // LEFT JOIN
                                      join pg in _context.Tbl_ProductGroups on o.ProductGroupId equals pg.Id into pgj
                                      from pgroup in pgj.DefaultIfEmpty() // LEFT JOIN
                                      select new OfferSummaryDto
                                      {
                                          OfferId = o.OfferId,
                                          OfferNo = o.OfferNo,
                                          OfferDate = o.OfferDate,
                                          CustomerName = customer != null ? customer.CustomerName : "N/A",
                                          CompanyName = company != null ? company.CompanyName : "N/A",
                                          CompanyCode = company != null ? company.CompanyCode : "N/A",
                                          VendorCode = vendor != null ? vendor.VendorCode : "N/A",
                                          VendorName = vendor != null ? vendor.VendorName : "N/A",
                                          GroupName = pgroup != null ? pgroup.GroupName : "N/A"
                                      };

            var summaries = await offerSummariesQuery.ToListAsync();
            var summaryDict = summaries.ToDictionary(s => s.OfferId);

            var aggregatedDto = new OrderAcceptanceDto
            {
                OfferIds = offers.Select(o => o.OfferId).ToList(),
                

                Offers = offers.Select(o => new OrderAcceptanceOfferDto
                {
                    OfferId = o.OfferId,
                    CustomerId = o.CustomerId,
                    VendorId = o.VendorId,
                    CompanyId = o.CompanyId,
                    CompanyCode = summaryDict.ContainsKey(o.OfferId)
                        ? summaryDict[o.OfferId].CompanyCode
                        : null,

                    VendorCode = summaryDict.ContainsKey(o.OfferId)
                        ? summaryDict[o.OfferId].VendorCode
                        : null,

                    ProductGroupId = o.ProductGroupId,
                    CompanyGroupId = o.CompanyGroupId,
                    CurrencyId = o.CurrencyId,
                    PlaceOfSupplyId = o.PlaceOfSupplyId,
                    BankDetailId = o.BankDetailId,
                    ResponsiblePersonId = o.ResponsiblePersonId,
                    AssignedToEmployeeId = o.AssignedToEmployeeId,
                    OfferCreateDate = o.OfferDate,
                    OfferExpiryDate = o.ExpiryDate,
                    TermsConditions = o.TermsConditions,
                    OrderDate = o.OfferDate
                }).ToList(),
                Items = offers.SelectMany(o => o.Items.Select(i => new OrderAcceptanceItemDto
                {
                    OfferNo = o.OfferNo,
                    //ItemType = i.ItemType ?? "Product",
                    ItemType = string.IsNullOrWhiteSpace(i.ItemType) ? "Product" : i.ItemType,
                    //ProductId = i.ProductId ?? 0,
                    //AccessoryId = i.AccessoryId ?? 0,
                    //Description = i.Description,
                    //HsnSacCode = i.HsnSacCode,
                    ProductId = i.ItemType == "Product" ? (i.ProductId ?? 0) : 0,
                    AccessoryId = i.ItemType == "Accessory" ? (i.AccessoryId ?? 0) : 0,

                    ServiceId = i.ItemType == "Service"
                    ? (i.ServiceId ?? o.ServiceId ?? 0)
                    : 0,
                    
                    ServicePartNo = i.ItemType == "Service"
                    ? i.ServicePartNo
                    : null,
                    Description = i.Description,
                    //HsnSacCode = i.ItemType == "Service" ? null : i.HsnSacCode,
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
                    AccessoryIds = i.SelectedAccessories.Select(a => a.AccessoryId).ToList()
                })).ToList(),

                // Assign the summaries we fetched with the JOIN query
                SourceOfferSummaries = summaries
            };

            aggregatedDto.Subtotal = aggregatedDto.Items.Sum(i => i.Total);
            var totalGst = aggregatedDto.Items.Sum(i => i.GstAmount);
            aggregatedDto.GrandTotal = (aggregatedDto.Subtotal ?? 0) + totalGst;

            return aggregatedDto;
        }
        public async Task<string> GetNextOANumberAsync()
        {
            var today = DateTime.Now;

            int startYear = today.Month >= 4 ? today.Year : today.Year - 1;
            int endYear = startYear + 1;

            string financialYear = $"{startYear % 100:D2}-{endYear % 100:D2}";

            // ✅ New prefix
            string prefix = $"GS-OA-{financialYear}-";

            // ✅ Continue number from old GAX-OA and new GS-OA both
            var allNos = await _context.Tbl_OrderAcceptances
                .Where(x => x.GaxcePurchaseOrderNo != null &&
                            x.GaxcePurchaseOrderNo.Contains($"-OA-{financialYear}-"))
                .Select(x => x.GaxcePurchaseOrderNo)
                .ToListAsync();

            int nextSeq = allNos
                .Select(x => int.TryParse(x.Split('-').Last(), out int n) ? n : 0)
                .DefaultIfEmpty(0)
                .Max() + 1;

            return $"{prefix}{nextSeq:D3}";
        }

        public async Task<int> CreateAsync(OrderAcceptanceDto dto)
        {
            if (string.IsNullOrEmpty(dto.GaxcePurchaseOrderNo))
                dto.GaxcePurchaseOrderNo = await GetNextOANumberAsync();
            var mainResponsiblePersonId = dto.ResponsiblePersonId > 0
                ? dto.ResponsiblePersonId
                : dto.Offers.FirstOrDefault()?.ResponsiblePersonId;

            var selectedOfferIds = dto.Offers?
            .Select(x => x.OfferId)
            .Distinct()
            .ToList() ?? new List<int>();

            var offerNotes = await _context.Tbl_OfferNotes
                .Where(x => selectedOfferIds.Contains(x.OfferId))
                .OrderBy(x => x.CreatedAt)
                .ToListAsync();

            var oa = new Core.Models.CRM.OrderAcceptance
            {
                GaxcePurchaseOrderNo = dto.GaxcePurchaseOrderNo,
                CustomerOrderNo = dto.CustomerOrderNo,
                CustomerOrderDate = dto.CustomerOrderDate,
                OrderDate = dto.OrderDate ?? DateTime.Now,
                OfferCreateDate = dto.OfferCreateDate,
                OfferExpiryDate = dto.OfferExpiryDate,
                CompanyCode = dto.CompanyCode,
                //VendorCode = dto.VendorCode,
                VendorCode = string.IsNullOrWhiteSpace(dto.VendorCode) ? null : dto.VendorCode,
                Address = dto.Address,
                CustomerId = dto.CustomerId,
                VendorId = dto.VendorId,
                CompanyId = dto.CompanyId,
                ProductGroupId = dto.ProductGroupId,
                CompanyGroupId = dto.CompanyGroupId,
                CurrencyId = dto.CurrencyId,
                PlaceOfSupplyId = dto.PlaceOfSupplyId,
                BankDetailId = dto.BankDetailId,
                ResponsiblePersonId = mainResponsiblePersonId,
                AssignedToEmployeeId = dto.AssignedToEmployeeId,
                Subtotal = dto.Subtotal,
                FreightCharges = dto.FreightCharges,
                GrandTotal = dto.GrandTotal,
                TermsConditions = dto.TermsConditions,
                CustomerNotes = dto.CustomerNotes,
                Status = dto.Status,
                GstApplicable = dto.GstApplicable,
                OrderAcceptanceNotes = new List<OrderAcceptanceNote>(),

                Items = dto.Items.Select(i => new OrderAcceptanceItem
                {
                    //ItemType = i.ItemType ?? "Product",
                    ItemType = string.IsNullOrWhiteSpace(i.ItemType) ? "Product" : i.ItemType,
                    //ProductId = i.ProductId > 0 ? i.ProductId : (int?)null,
                    //AccessoryId = i.AccessoryId > 0 ? i.AccessoryId : (int?)null,
                    //Description = i.Description,
                    //HsnSacCode = i.HsnSacCode,
                    ProductId = (i.ItemType == "Product" && i.ProductId > 0)
                    ? i.ProductId
                    : (int?)null,
                    
                    AccessoryId = (i.ItemType == "Accessory" && i.AccessoryId > 0)
                    ? i.AccessoryId
                    : (int?)null,
                    
                    ServiceId = (i.ItemType == "Service" && i.ServiceId > 0)
                    ? i.ServiceId
                    : (int?)null,
                    
                     ServicePartNo = i.ItemType == "Service"
                    ? i.ServicePartNo
                    : null,

                    Description = i.Description,
                    //HsnSacCode = i.ItemType == "Service" ? null : i.HsnSacCode,
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
                    SelectedAccessories = i.AccessoryIds
                        .Select(aid => new OrderAcceptanceItemAccessory { AccessoryId = aid })
                        .ToList()
                }).ToList(),

                SelectedOffers = dto.Offers.Select(o => new OrderAcceptanceOffer
                {
                    OfferId = o.OfferId,
                    ServiceId = o.ServiceId,
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
                    TermsConditions = o.TermsConditions,
                    OrderDate = o.OrderDate,
                    CompanyCode = o.CompanyCode,
                    //VendorCode = o.VendorCode,
                    VendorCode = string.IsNullOrWhiteSpace(o.VendorCode) ? null : o.VendorCode,
                    Address = o.Address,
                    FreightCharges = o.FreightCharges,
                    CustomerNotes = o.CustomerNotes
                }).ToList()
            };

            // Existing Offer Notes
            foreach (var n in offerNotes)
            {
                oa.OrderAcceptanceNotes.Add(new OrderAcceptanceNote
                {
                    Note = n.Note,
                    CreatedAt = n.CreatedAt,
                    CreatedByEmployeeId = n.CreatedByEmployeeId,
                    AuthorName = n.AuthorName
                });
            }

            // New Manually Added Notes
            if (dto.OrderAcceptanceNotes != null)
            {
                foreach (var n in dto.OrderAcceptanceNotes)
                {
                    bool alreadyExists = oa.OrderAcceptanceNotes.Any(x =>
                        x.Note == n.Note &&
                        x.CreatedAt == n.CreatedAt);

                    if (!alreadyExists)
                    {
                        oa.OrderAcceptanceNotes.Add(new OrderAcceptanceNote
                        {
                            Note = n.Note,
                            CreatedAt = n.CreatedAt ?? DateTime.Now,
                            CreatedByEmployeeId = n.CreatedByEmployeeId ?? 0,
                            AuthorName = n.AuthorName
                        });
                    }
                }
            }

            _context.Tbl_OrderAcceptances.Add(oa);
            await _context.SaveChangesAsync();

            if (!string.IsNullOrEmpty(dto.Status) && dto.Status.ToLower() == "final")
            {
                var offerIds = dto.Offers.Select(o => o.OfferId).ToList();

                var offersToUpdate = await _context.Tbl_Offers
                    .Where(o => offerIds.Contains(o.OfferId))
                    .ToListAsync();

                foreach (var offer in offersToUpdate)
                {
                    offer.Status = "Offer Accepted";
                }

                await _context.SaveChangesAsync();
            }

            if (!string.IsNullOrEmpty(dto.Status) &&
                dto.Status.Equals("FINAL", StringComparison.OrdinalIgnoreCase) &&
                dto.CurrencyId == 1) // INR
            {
                var accountsEmployees = await (
                    from user in _context.Users
                    join userRole in _context.UserRoles
                        on user.Id equals userRole.UserId
                    join role in _context.Roles
                        on userRole.RoleId equals role.Id
                    where role.Name == "Account"
                    select user.EmployeeId
                ).ToListAsync();

                var customerName = await _context.Tbl_Customers
                   .Where(c => c.Id == oa.CustomerId && !c.IsDeleted)
                   .Select(c => c.CustomerName)
                   .FirstOrDefaultAsync();

                Console.WriteLine($"Accounts Count = {accountsEmployees.Count}");

                foreach (var employeeId in accountsEmployees.Distinct())
                {
                    await _notificationHelper.SendNotificationToEmployeeAsync(
                        employeeId,
                        $"Order Acceptance '{oa.GaxcePurchaseOrderNo}' for '{customerName}' is ready for invoicing."
                    );
                }
            }

            return oa.OrderAcceptanceId;
        }
        public async Task<List<OrderAcceptanceDto>> GetAllAsync()
        {
            var query = from oa in _context.Tbl_OrderAcceptances
                        where !oa.IsDeleted

                        join oao in _context.Tbl_OrderAcceptanceOffers
                            on oa.OrderAcceptanceId equals oao.OrderAcceptanceId

                        join c in _context.Tbl_Customers
                            on oao.CustomerId equals c.Id into cj
                        from customer in cj.DefaultIfEmpty()

                        join cu in _context.Tbl_Currencies
                            on oao.CurrencyId equals cu.Id into cuj
                        from currency in cuj.DefaultIfEmpty()

                        join o in _context.Tbl_Offers
                            on oao.OfferId equals o.OfferId into oj
                        from offer in oj.DefaultIfEmpty()

                        orderby oa.OrderAcceptanceId descending

                        select new
                        {
                            oa.OrderAcceptanceId,
                            oa.GaxcePurchaseOrderNo,
                            oa.OrderDate,
                            oa.GrandTotal,
                            oa.Status,

                            CustomerName = customer != null ? customer.CustomerName : "N/A",
                            CurrencyName = currency != null ? currency.CurrencyName : "N/A",
                            CurrencySymbol = currency != null ? currency.CurrencySymbol : "N/A",

                            CustomerOrderNo = oa.CustomerOrderNo,
                            CustomerOrderDate = oa.CustomerOrderDate,

                            OfferNo = offer != null ? offer.OfferNo : "",
                             Source = offer != null ? offer.Source : "PRODUCT"
                        };

            var results = await query.ToListAsync();

            return results
                .GroupBy(x => x.OrderAcceptanceId)
                .Select(g => new OrderAcceptanceDto
                {
                    OrderAcceptanceId = g.Key,
                    GaxcePurchaseOrderNo = g.First().GaxcePurchaseOrderNo,
                    OrderDate = g.First().OrderDate,
                    GrandTotal = g.First().GrandTotal,
                    Status = g.First().Status,

                    CustomerName = g.First().CustomerName,
                    CurrencyName = g.First().CurrencyName,
                    CurrencySymbol = g.First().CurrencySymbol,

                    CustomerOrderNo = g.First().CustomerOrderNo,
                    CustomerOrderDate = g.First().CustomerOrderDate,

                    OfferNo = string.Join(", ", g.Select(x => x.OfferNo).Distinct()),
                    Source = string.Join(", ", g.Select(x => x.Source).Distinct())
                })
                .ToList();
        }
        public async Task<OrderAcceptanceDto> GetByIdAsync(int id)
        {
            var o = await _context.Tbl_OrderAcceptances
                .Include(x => x.Items)
                    .ThenInclude(i => i.SelectedAccessories)
                .Include(x => x.SelectedOffers)
                    .ThenInclude(so => so.Offer)
                    .Include(x => x.OrderAcceptanceNotes)
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.OrderAcceptanceId == id);

            if (o == null) return null;

            var offerNos = o.SelectedOffers
                .Select(x => x.Offer.OfferNo)
                .ToList();

            var firstOffer = o.SelectedOffers.FirstOrDefault();

            var mainRespId = o.ResponsiblePersonId > 0
                ? o.ResponsiblePersonId
                : (firstOffer?.ResponsiblePersonId ?? 0);

            var result = new OrderAcceptanceDto
            {
                OrderAcceptanceId = o.OrderAcceptanceId,

                OfferIds = o.SelectedOffers.Select(x => x.OfferId).ToList(),
                InvoiceNo = o.InvoiceNo,
                GaxcePurchaseOrderNo = o.GaxcePurchaseOrderNo,
                CustomerOrderNo = o.CustomerOrderNo,
                CustomerOrderDate = o.CustomerOrderDate,
                OrderDate = o.OrderDate,

                Subtotal = o.Subtotal,
                FreightCharges = o.FreightCharges,
                GrandTotal = o.GrandTotal,
                GstApplicable = o.GstApplicable,
                Status = o.Status,
                TermsConditions = o.TermsConditions,
                CustomerNotes = o.CustomerNotes,

                CompanyCode = o.CompanyCode,

                //VendorCode = o.VendorCode,
                VendorCode = firstOffer != null
                   ? _context.Tbl_Customers
                       .Where(c => c.Id == firstOffer.CustomerId && !c.IsDeleted)
                       .Select(c => c.VendorCode)
                       .FirstOrDefault()
                   : null,

                ForeignVendorCode = firstOffer != null
                   ? _context.Tbl_Customers
                       .Where(c => c.Id == firstOffer.CustomerId && !c.IsDeleted)
                       .Select(c => c.ForeignVendorCode)
                       .FirstOrDefault()
                   : null,

                VendorVatNo = _context.Tbl_Vendors
                    .Where(v => v.Id == o.VendorId && !v.IsDeleted)
                    .Select(v => v.VATNo)
                    .FirstOrDefault(),

                Address = o.Address,


                CurrencyName = firstOffer != null
                 ? _context.Tbl_Currencies
                     .Where(c => c.Id == firstOffer.CurrencyId && !c.IsDeleted)
                     .Select(c => c.CurrencyName)
                     .FirstOrDefault()
                 : null,

                CurrencySymbol = firstOffer != null
                 ? _context.Tbl_Currencies
                     .Where(c => c.Id == firstOffer.CurrencyId && !c.IsDeleted)
                     .Select(c => c.CurrencySymbol)
                     .FirstOrDefault()
                 : null,

                CurrencyValue = firstOffer != null
                  ? _context.Tbl_Currencies
                      .Where(c => c.Id == firstOffer.CurrencyId && !c.IsDeleted)
                      .Select(c => c.CurrencyValue)
                      .FirstOrDefault()
                  : 0,

               
                CustomerId = firstOffer?.CustomerId,
                CustomerName = firstOffer != null
                    ? _context.Tbl_Customers
                        .Where(c => c.Id == firstOffer.CustomerId && !c.IsDeleted)
                        .Select(c => c.CustomerName)
                        .FirstOrDefault()
                    : null,

                   InvoiceAddress = firstOffer != null
                    ? _context.Tbl_CustomerAddress
                        .Where(a => a.CustomerId == firstOffer.CustomerId && !a.IsDeleted)
                        .Select(a =>
                            (a.FlatBlockNo ?? "") +
                            (!string.IsNullOrEmpty(a.PremisesName) ? ", " + a.PremisesName : "") +
                            (!string.IsNullOrEmpty(a.Road) ? ", " + a.Road : "") +
                            (!string.IsNullOrEmpty(a.Area) ? ", " + a.Area : "") +
                            (!string.IsNullOrEmpty(a.Town) ? ", " + a.Town : "") +
                            (!string.IsNullOrEmpty(a.PinNo) ? " - " + a.PinNo : "")
                        )
                        .FirstOrDefault()
                    : null,

                ShippingAddress = firstOffer != null
                    ? _context.Tbl_CustomerAddress
                        .Where(a => a.CustomerId == firstOffer.CustomerId && !a.IsDeleted && a.AddressType == "Correspondence")
                        .Select(a =>
                            (a.FlatBlockNo ?? "") + ", " +
                            (a.PremisesName ?? "") + ", " +
                            (a.Road ?? "") + ", " +
                            (a.Town ?? "") + ", " +
                            (a.PinNo ?? "")
                        )
                        .FirstOrDefault()
                    : null,

                VendorId = firstOffer?.VendorId,
                VendorName = firstOffer != null
                    ? _context.Tbl_Vendors
                        .Where(v => v.Id == firstOffer.VendorId && !v.IsDeleted)
                        .Select(v => v.VendorName)
                        .FirstOrDefault()
                    : null,

                VendorAddress = firstOffer != null
                    ? _context.Tbl_VendorAddresses
                        .Where(a => a.VendorId == firstOffer.VendorId && !a.IsDeleted && a.AddressType == "Correspondence")
                        .Select(a =>
                            (a.Premises ?? "") + ", " +
                            (a.RoadStrLane ?? "") + ", " +
                            (a.Town ?? "") + ", " +
                            (a.PinNo ?? "")
                        )
                        .FirstOrDefault()
                    : null,

                ResponsiblePersonId = mainRespId,
                ResponsiblePersonName = _context.Tbl_CustomerContacts
                      .Where(c => c.Id == o.ResponsiblePersonId && !c.IsDeleted)
                      .Select(c => c.ResPersonName)
                      .FirstOrDefault(),

                AssignedToEmployeeId = firstOffer?.AssignedToEmployeeId,

               
                Offers = o.SelectedOffers.Select(so => new OrderAcceptanceOfferDto
                {
                    OfferId = so.OfferId,
                    OfferNo = so.Offer.OfferNo,
                    ResponsiblePersonId = so.ResponsiblePersonId,
                    ResponsiblePersonName = _context.Tbl_CustomerContacts
                      .Where(c => c.Id == o.ResponsiblePersonId && !c.IsDeleted)
                      .Select(c => c.ResPersonName)
                      .FirstOrDefault(),

                    Source = so.Offer.Source,
                    ServiceDescription = _context.Tbl_ServiceMaster
                    .Where(s => s.ServiceId == (so.ServiceId ?? so.Offer.ServiceId))
                    .Select(s => s.ServiceDescription)
                    .FirstOrDefault(),
                    ServiceId = so.ServiceId ?? so.Offer.ServiceId,
                    CurrencyName = _context.Tbl_Currencies
                    .Where(c => c.Id == (so.CurrencyId ?? so.Offer.CurrencyId) && !c.IsDeleted)
                    .Select(c => c.CurrencyName)
                    .FirstOrDefault(),

                    CurrencySymbol = _context.Tbl_Currencies
                    .Where(c => c.Id == (so.CurrencyId ?? so.Offer.CurrencyId) && !c.IsDeleted)
                    .Select(c => c.CurrencySymbol)
                    .FirstOrDefault(),
                 
                    CustomerId = so.CustomerId,
                    CustomerName = _context.Tbl_Customers
                        .Where(x => x.Id == so.CustomerId)
                        .Select(x => x.CustomerName)
                        .FirstOrDefault(),

                    VendorId = so.VendorId,
                    VendorName = _context.Tbl_Vendors
                        .Where(x => x.Id == so.VendorId)
                        .Select(x => x.VendorName)
                        .FirstOrDefault(),

                    CompanyId = so.CompanyId,
                    CompanyName = _context.Tbl_Companies
                        .Where(x => x.CompanyId == so.CompanyId)
                        .Select(x => x.CompanyName)
                        .FirstOrDefault(),

                    ProductGroupId = so.ProductGroupId ?? so.Offer.ProductGroupId,
                    CompanyGroupId = so.CompanyGroupId ?? so.Offer.CompanyGroupId,
                    CurrencyId = so.CurrencyId ?? so.Offer.CurrencyId,
                    PlaceOfSupplyId = so.PlaceOfSupplyId ?? so.Offer.PlaceOfSupplyId,
                    BankDetailId = so.BankDetailId ?? so.Offer.BankDetailId,
                   
                    AssignedToEmployeeId = so.AssignedToEmployeeId ?? so.Offer.AssignedToEmployeeId,

                    OfferCreateDate = so.OfferCreateDate ?? so.Offer.OfferDate,
                    OfferExpiryDate = so.OfferExpiryDate ?? so.Offer.ExpiryDate,

                    TermsConditions = so.TermsConditions ?? so.Offer.TermsConditions,
                    OrderDate = so.OrderDate,

                    CompanyCode = so.CompanyCode,
                    //VendorCode = so.VendorCode,
                    VendorCode = firstOffer != null
                      ? _context.Tbl_Customers
                          .Where(c => c.Id == firstOffer.CustomerId && !c.IsDeleted)
                          .Select(c => c.VendorCode)
                          .FirstOrDefault()
                      : null,

                    ForeignVendorCode = firstOffer != null
                      ? _context.Tbl_Customers
                          .Where(c => c.Id == firstOffer.CustomerId && !c.IsDeleted)
                          .Select(c => c.ForeignVendorCode)
                          .FirstOrDefault()
                      : null,
                    Address = so.Address,

                    FreightCharges = so.FreightCharges ?? so.Offer.FreightCharges,
                    CustomerNotes = so.CustomerNotes ?? so.Offer.CustomerNotes

                }).ToList(),


                OrderAcceptanceNotes = o.OrderAcceptanceNotes
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new OrderAcceptanceNoteDto
                {
                    Id = n.Id,
                    Note = n.Note,
                    CreatedAt = n.CreatedAt,
                    CreatedByEmployeeId = n.CreatedByEmployeeId,
                    AuthorName = n.AuthorName
                }).ToList(),
                // =========================
                // ✅ ITEMS
                // =========================
                Items = o.Items.Select((i, index) => new OrderAcceptanceItemDto
                {
                    OrderAcceptanceItemId = i.OrderAcceptanceItemId,
                    //ItemType = i.ProductId != null && i.ProductId != 0
                    //    ? "Product"
                    //    : "Accessory",
                    ItemType = string.IsNullOrWhiteSpace(i.ItemType) ? "Product" : i.ItemType,
                    //ProductId = i.ProductId ?? 0,
                    //AccessoryId = i.AccessoryId ?? 0,
                    ProductId = i.ItemType == "Product" ? (i.ProductId ?? 0) : 0,
                    AccessoryId = i.ItemType == "Accessory" ? (i.AccessoryId ?? 0) : 0,

                    ServiceId = i.ItemType == "Service" ? (i.ServiceId ?? 0) : 0,
                    ServicePartNo = i.ItemType == "Service" ? i.ServicePartNo : null,
                    Description = i.Description,
                    PartNo = (i.ItemType == "Product" && i.ProductId != null)
                             ? _context.Set<CompanyPlatform.Core.Models.CRM.Product>()
                                 .Where(p => p.ProductId == i.ProductId && !p.IsDeleted)
                                 .Select(p => p.PartNo)
                                 .FirstOrDefault()
                             : (i.ItemType == "Accessory" && i.AccessoryId != null)
                                 ? _context.Set<CompanyPlatform.Core.Models.CRM.Accessories>()
                                     .Where(a => a.AccessoriesId == i.AccessoryId && !a.IsDeleted)
                                     .Select(a => a.PartNo)
                                     .FirstOrDefault()
                                 : null,
                    ProductDescription = (i.ItemType == "Product" && i.ProductId != null)
                            ? _context.Set<CompanyPlatform.Core.Models.CRM.Product>()
                                .Where(p => p.ProductId == i.ProductId && !p.IsDeleted)
                                .Select(p => p.ProductDescription)
                                .FirstOrDefault()
                            : null,

                    AccessoriesDescription = (i.ItemType == "Accessory" && i.AccessoryId != null)
                             ? _context.Set<CompanyPlatform.Core.Models.CRM.Accessories>()
                                 .Where(a => a.AccessoriesId == i.AccessoryId && !a.IsDeleted)
                                 .Select(a => a.AccessoriesDescription)
                                 .FirstOrDefault()
                             : null,
                    HsnSacCode = i.HsnSacCode,
                    //HsnSacCode = i.ItemType == "Service" ? null : i.HsnSacCode,
                    Quantity = i.Quantity,
                    Rate = i.Rate,
                    Discount = i.Discount,
                    TaxPercentage = i.TaxPercentage,
                    Total = i.Total,
                    CgstAmount = i.CgstAmount,
                    SgstAmount = i.SgstAmount,
                    IgstAmount = i.IgstAmount,
                    GstAmount = i.GstAmount,
                    FinalPrice = i.FinalPrice,

                    OfferNo = offerNos.Count > 0
                        ? offerNos[index % offerNos.Count]
                        : null,
                    Source = o.SelectedOffers
                       .Select(x => x.Offer.Source)
                       .FirstOrDefault(),

                    AccessoryIds = i.SelectedAccessories
                        .Select(a => a.AccessoryId)
                        .ToList()
                }).ToList()
            };

            if (firstOffer != null)
            {
                var currencyId = firstOffer.CurrencyId ?? firstOffer.Offer.CurrencyId;
                var companyId = firstOffer.CompanyId ?? firstOffer.Offer.CompanyId;
                var vendorId = firstOffer.VendorId ?? firstOffer.Offer.VendorId;

                if (currencyId == 1) // Company Bank
                {                    
                    result.BankDetails = await _context.Tbl_CompanyBankDetails
                        .Where(b => b.CompanyId == companyId && !b.IsDeleted)
                        .Select(b => new VendorBankDetailDto
                        {
                            BankName = b.BankName,
                            BankAddress = b.BankAddress,
                            AccountNo = b.AccountNo,
                            IFSCCode = b.IFSC,
                            AccountHolderName = b.AccountHolderName,
                            SwiftCode = b.SwiftCode,
                            IBANNo = b.IBAN
                        })
                        .FirstOrDefaultAsync();
                }
                else if (currencyId == 3) // Vendor Bank
                {
                    result.BankDetails = await _context.Tbl_VendorBankDetails
                        .Where(b => b.VendorId == vendorId && !b.IsDeleted)
                        .Select(b => new VendorBankDetailDto
                        {
                            Id = b.Id,
                            BankName = b.BankName,
                            BankAddress = b.BankAddress,
                            EmailAddress = b.EmailAddress,
                            AccountNo = b.AccountNo,
                            IFSCCode = b.IFSCCode,
                            AccountHolderName = b.AccountHolderName,
                            SwiftCode = b.SwiftCode,
                            IBANNo = b.IBANNo
                        })
                        .FirstOrDefaultAsync();
                }
            }

            // Step 3: Return the final DTO
            return result;
        }

     
        public async Task<bool> UpdateAsync(OrderAcceptanceDto dto)
        {
            // 1. Fetch the existing Order Acceptance and its child collections
            var oa = await _context.Tbl_OrderAcceptances
                .Include(x => x.Items).ThenInclude(i => i.SelectedAccessories)
                .Include(x => x.SelectedOffers)
                .Include(x => x.OrderAcceptanceNotes)
                .FirstOrDefaultAsync(x => x.OrderAcceptanceId == dto.OrderAcceptanceId);

            var customerName = await _context.Tbl_Customers
               .Where(c => c.Id == oa.CustomerId && !c.IsDeleted)
               .Select(c => c.CustomerName)
               .FirstOrDefaultAsync();

            if (oa == null)
            {
                return false; 
            }

            var oldStatus = oa.Status;

            oa.GaxcePurchaseOrderNo = dto.GaxcePurchaseOrderNo;
            oa.CustomerOrderNo = dto.CustomerOrderNo;
            oa.CustomerOrderDate = dto.CustomerOrderDate;
            oa.OrderDate = dto.OrderDate;
            oa.OfferCreateDate = dto.OfferCreateDate;
            oa.OfferExpiryDate = dto.OfferExpiryDate;
            oa.CompanyCode = dto.CompanyCode;
            //oa.VendorCode = dto.VendorCode;
            oa.VendorCode = string.IsNullOrWhiteSpace(dto.VendorCode) ? null : dto.VendorCode;
            oa.Address = dto.Address;
            oa.CustomerId = dto.CustomerId;
            oa.VendorId = dto.VendorId;
            oa.CompanyId = dto.CompanyId;
            oa.ProductGroupId = dto.ProductGroupId;
            oa.CompanyGroupId = dto.CompanyGroupId;
            oa.CurrencyId = dto.CurrencyId;
            oa.PlaceOfSupplyId = dto.PlaceOfSupplyId;
            oa.BankDetailId = dto.BankDetailId;
            oa.ResponsiblePersonId = dto.ResponsiblePersonId;
            oa.AssignedToEmployeeId = dto.AssignedToEmployeeId;
            oa.Subtotal = dto.Subtotal;
            oa.FreightCharges = dto.FreightCharges;
            oa.GrandTotal = dto.GrandTotal;
            oa.TermsConditions = dto.TermsConditions;
            oa.CustomerNotes = dto.CustomerNotes;
            oa.Status = dto.Status;
            oa.GstApplicable = dto.GstApplicable;            
            _context.Tbl_OrderAcceptanceItems.RemoveRange(oa.Items);
            _context.Set<OrderAcceptanceOffer>().RemoveRange(oa.SelectedOffers);
            _context.Set<OrderAcceptanceNote>().RemoveRange(oa.OrderAcceptanceNotes);

            // Second, create the new children from the DTO and assign them to the tracked entity
            oa.Items = dto.Items.Select(i => new OrderAcceptanceItem
            {
                //ItemType = i.ItemType ?? "Product",
                ItemType = string.IsNullOrWhiteSpace(i.ItemType) ? "Product" : i.ItemType,

                ProductId = (i.ItemType == "Product" && i.ProductId > 0)
                            ? i.ProductId
                            : (int?)null,
                            
                 AccessoryId = (i.ItemType == "Accessory" && i.AccessoryId > 0)
                            ? i.AccessoryId
                            : (int?)null,
                            
                  ServiceId = (i.ItemType == "Service" && i.ServiceId > 0)
                            ? i.ServiceId
                            : (int?)null,
                            
                  ServicePartNo = i.ItemType == "Service"
                            ? i.ServicePartNo
                            : null,

                Description = i.Description,
                //HsnSacCode = i.ItemType == "Service" ? null : i.HsnSacCode,
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
                SelectedAccessories = i.AccessoryIds
                    .Select(aid => new OrderAcceptanceItemAccessory { AccessoryId = aid })
                    .ToList()
            }).ToList();

            oa.SelectedOffers = dto.Offers.Select(o => new OrderAcceptanceOffer
            {
                OfferId = o.OfferId,
                CustomerId = o.CustomerId,
                VendorId = o.VendorId,
                ServiceId = o.ServiceId,
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
                TermsConditions = o.TermsConditions,
                OrderDate = o.OrderDate,
                CompanyCode = o.CompanyCode,
                //VendorCode = o.VendorCode,
                VendorCode = string.IsNullOrWhiteSpace(o.VendorCode) ? null : o.VendorCode,
                Address = o.Address,
                FreightCharges = o.FreightCharges,
                CustomerNotes = o.CustomerNotes
            }).ToList();

             oa.OrderAcceptanceNotes = dto.OrderAcceptanceNotes?
            .Select(n => new OrderAcceptanceNote
            {
                Note = n.Note,
                CreatedAt = n.CreatedAt ?? DateTime.Now,
                CreatedByEmployeeId = n.CreatedByEmployeeId ?? 0,
                AuthorName = n.AuthorName
            }).ToList()
            ?? new List<OrderAcceptanceNote>();

            // 4. Save ALL changes (parent and children) in a single transaction
            await _context.SaveChangesAsync();

            if (!string.IsNullOrEmpty(dto.Status) && dto.Status.ToLower() == "final")
            {
                var offerIds = dto.Offers.Select(o => o.OfferId).ToList();
                var offersToUpdate = await _context.Tbl_Offers
                    .Where(o => offerIds.Contains(o.OfferId))
                    .ToListAsync();

                foreach (var offer in offersToUpdate)
                {
                    offer.Status = "Offer Accepted";
                }

                var isServiceOA = await _context.Tbl_Offers
                    .AnyAsync(x => offerIds.Contains(x.OfferId)
                    && x.Source == "SERVICE");

                // Send notification only when OA becomes FINAL
                if (dto.Status?.Equals("FINAL", StringComparison.OrdinalIgnoreCase) == true
                    && oldStatus != "FINAL"
                    && dto.CurrencyId == 1 // INR
                    && !isServiceOA) 
                {
                    var accountEmployees = await (
                        from user in _context.Users
                        join userRole in _context.UserRoles
                            on user.Id equals userRole.UserId
                        join role in _context.Roles
                            on userRole.RoleId equals role.Id
                        where role.Name == "Account"
                        select user.EmployeeId
                    ).ToListAsync();


                    foreach (var employeeId in accountEmployees.Distinct())
                    {
                        await _notificationHelper.SendNotificationToEmployeeAsync(
                            employeeId,
                            $"Order Acceptance '{oa.GaxcePurchaseOrderNo}' for '{customerName}' is ready for invoicing."
                        );
                    }
                }

                // Save this secondary change
                await _context.SaveChangesAsync();
            }

            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var o = await _context.Tbl_OrderAcceptances.FindAsync(id);
            if (o == null) return false;
            o.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}