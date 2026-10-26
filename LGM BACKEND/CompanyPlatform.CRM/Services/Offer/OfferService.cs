using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.DTO.Enquiry;
using CompanyPlatform.Core.DTO.Vendor;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.Core.Models.CRM.Employee;
using CompanyPlatform.Core.Services.Notification;
using CompanyPlatform.CRM.DTO.Offer;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.Offer
{
    public class OfferService : IOfferService
    {
        private readonly ApplicationDBContext _context;
        private readonly INotificationHelper _notificationHelper;

        public OfferService( ApplicationDBContext context,INotificationHelper notificationHelper)
        {
            _context = context;
            _notificationHelper = notificationHelper;
        }

        private string GetBaseOfferNo(string offerNo)
        {
            if (string.IsNullOrWhiteSpace(offerNo)) return "";

            int rIndex = offerNo.LastIndexOf("-R", StringComparison.OrdinalIgnoreCase);

            if (rIndex > 0 && int.TryParse(offerNo.Substring(rIndex + 2), out _))
                return offerNo.Substring(0, rIndex);

            return offerNo;
        }

        private async Task<string> GenerateRevisionOfferNoAsync(int offerId, string currentOfferNo)
        {
            string baseOfferNo = GetBaseOfferNo(currentOfferNo);

            int draftRevisionCount = await _context.Tbl_OfferVersions
                .Where(v => v.OfferId == offerId && v.StatusAtMoment == "DRAFT")
                .CountAsync();

            // first created draft = base no, next draft edit = R1
            int nextRevision = draftRevisionCount;

            return $"{baseOfferNo}-R{nextRevision}";
        }

        public async Task<List<SelectOptionDto>> GetFinalEnquiriesAsync()
        {
            return await _context.Tbl_Enquiries
                .Where(x => x.Status == "FINAL" && x.EntryType != "SERVICE" && !x.IsDeleted)
                .Select(x => new SelectOptionDto
                {
                    Value = x.EnquiryId,
                    //Label = x.EnquiryNo ?? ""
                    Label = (x.EnquiryNo ?? "") + " (" +
                    (_context.Tbl_Customers
                        .Where(c => c.Id == x.CustomerId)
                        .Select(c => c.CustomerName)
                        .FirstOrDefault() ?? "") +
                    " - " +
                    x.OfferDate.Value.ToString("dd-MM-yyyy") +
                    ")"
                })
                .ToListAsync();
        }

        public async Task<List<SelectOptionDto>> GetFinalServicesAsync()
        {
            return await _context.Tbl_Enquiries
                .Where(x => x.EntryType == "SERVICE" && x.Status == "FINAL" && !x.IsDeleted)
                .Select(x => new SelectOptionDto
                {
                    Value = x.EnquiryId,
                    //Label = x.EnquiryNo ?? ""
                    Label = (x.EnquiryNo ?? "") + " (" +
                    (_context.Tbl_Customers
                        .Where(c => c.Id == x.CustomerId)
                        .Select(c => c.CustomerName)
                        .FirstOrDefault() ?? "") +
                    " - " +
                    x.OfferDate.Value.ToString("dd-MM-yyyy") +
                    ")"
                })
                .ToListAsync();
        }

       
        private async Task<string> GenerateSystemNumberAsync(string prefix)
        {
            var today = DateTime.Now;

            int startYear = today.Month >= 4 ? today.Year : today.Year - 1;
            int endYear = startYear + 1;

            string financialYear = $"{startYear % 100:D2}-{endYear % 100:D2}";

            if (prefix == "ENQUIRY")
            {
                // ✅ New format
                string systemPrefix = $"GS-EN-{financialYear}-";

                // ✅ Continue from old GAX-EN and new GS-EN both
                var allNos = await _context.Tbl_Enquiries
                    .Where(e => e.EnquiryNo != null &&
                                e.EnquiryNo.Contains($"-EN-{financialYear}-"))
                    .Select(e => e.EnquiryNo)
                    .ToListAsync();

                int nextSeq = allNos
                    .Select(x => int.TryParse(x.Split('-').Last(), out int n) ? n : 0)
                    .DefaultIfEmpty(0)
                    .Max() + 1;

                return $"{systemPrefix}{nextSeq:D3}";
            }
            
            else // OFFER
            {
                string systemPrefix = $"GS-QUOTE-{financialYear}-";

                var allNos = await _context.Tbl_Offers
                    .Where(o => o.OfferNo != null &&
                               (
                                   o.OfferNo.Contains($"-QUOTE-{financialYear}-") ||
                                   o.OfferNo.Contains($"-OFF-{financialYear}-")
                               ))
                    .Select(o => o.OfferNo)
                    .ToListAsync();

                int nextSeq = allNos
                    .Select(x =>
                    {
                        if (string.IsNullOrWhiteSpace(x)) return 0;

                        // remove revision part: GS-QUOTE-26-27-001-R1 => GS-QUOTE-26-27-001
                        var baseNo = GetBaseOfferNo(x);

                        // get main sequence: 001
                        var lastPart = baseNo.Split('-').Last();

                        return int.TryParse(lastPart, out int n) ? n : 0;
                    })
                    .DefaultIfEmpty(0)
                    .Max() + 1;

                return $"{systemPrefix}{nextSeq:D3}";
            }
        }

        private async Task AdjustInventory(int? productId, int? accessoryId, List<int> accIds, int qty, string action, string refNo)
        {
            int multiplier = (action == "Add") ? 1 : -1;

            // 1. Adjust Main Product stock
            if (productId.HasValue && productId > 0)
            {
                var product = await _context.Tbl_Products.FindAsync(productId);
                if (product != null) product.AvailableQuantity += (qty * multiplier);
            }

            // 2. Adjust Standalone Paid Accessory stock
            if (accessoryId.HasValue && accessoryId > 0)
            {
                var acc = await _context.Tbl_Accessories.FindAsync(accessoryId);
                if (acc != null) acc.AvailableQuantity += (qty * multiplier);
            }

            // 3. Adjust Free Linked Accessories stock
            foreach (var aid in accIds)
            {
                var acc = await _context.Tbl_Accessories.FindAsync(aid);
                if (acc != null)
                {
                    acc.AvailableQuantity += (qty * multiplier);
                    // Log entry logic...
                }
            }
        }

        public async Task<int> CreateAsync(OfferDto dto)
        {
            dto.OfferNo = await GenerateSystemNumberAsync("OFFER");

            if (dto.Source == "VERBAL")
            {
                var existingEnquiry = await _context.Tbl_Enquiries
                    .FirstOrDefaultAsync(x => x.EnquiryNo == dto.EnquiryNo && !string.IsNullOrEmpty(dto.EnquiryNo) && !x.IsDeleted);

                if (existingEnquiry == null)
                {

                    string newEnqNo = await GenerateSystemNumberAsync("ENQUIRY");
                    dto.EnquiryNo = newEnqNo;

                    var verbalEnquiry = new Core.Models.CRM.Enquiry
                    {
                        EnquiryNo = newEnqNo,
                        EntryType = "VERBAL",
                        //Status = "FINAL",
                        Status = "OFFER_GENERATED",
                        //OfferDate = dto.OfferDate,
                        OfferDate = dto.EnquiryId > 0
                        ? await _context.Tbl_Enquiries
                            .Where(e => e.EnquiryId == dto.EnquiryId && !e.IsDeleted)
                            .Select(e => e.OfferDate)
                            .FirstOrDefaultAsync() ?? dto.OfferDate
                        : dto.OfferDate,
                        ExpiryDate = dto.ExpiryDate,
                        CustomerId = dto.CustomerId,
                        ResponsiblePersonId = dto.ResponsiblePersonId,
                        ProductGroupId = dto.ProductGroupId,
                        CompanyId = dto.CompanyId,
                        VendorId = dto.VendorId,
                        CompanyGroupId = dto.CompanyGroupId,
                        CurrencyId = dto.CurrencyId,
                        PlaceOfSupplyId = dto.PlaceOfSupplyId,
                        BankDetailId = dto.BankDetailId,
                        Subtotal = dto.Subtotal,
                        FreightCharges = dto.FreightCharges,
                        GrandTotal = dto.GrandTotal,
                        GSTApplicable = dto.GSTApplicable,
                        TermsConditions = dto.TermsConditions ?? "",
                        CustomerNotes = dto.CustomerNotes ?? "",
                        AssignedToEmployeeId = dto.AssignedToEmployeeId,
                        Items = (dto.Items ?? new List<OfferItemDto>()).Select(i => new EnquiryItem
                        {
                            ItemType = i.ItemType ?? "Product",
                            ProductId = i.ProductId > 0 ? i.ProductId : (int?)null,
                            AccessoryId = i.AccessoryId > 0 ? i.AccessoryId : (int?)null,
                            Quantity = i.Quantity,
                            Rate = i.Rate,
                            LiveConversionRate = i.LiveConversionRate,
                            Discount = i.Discount,
                            TaxPercentage = i.TaxPercentage,
                            Total = i.Total,
                            GstAmount = i.GstAmount,
                            CgstAmount = i.CgstAmount ?? 0,
                            SgstAmount = i.SgstAmount ?? 0,
                            IgstAmount = i.IgstAmount ?? 0,
                            FinalPrice = i.FinalPrice,
                            Description = i.Description ?? "",
                            HsnSacCode = i.HsnSacCode,
                            SelectedAccessories = (i.AccessoryIds ?? new List<int>()).Select(a => new EnquiryItemAccessory { AccessoryId = a }).ToList()
                        }).ToList()
                    };

                    // Subtract stock only for new records
                    foreach (var item in dto.Items)
                    {
                        // Provide all 6 required arguments
                        await AdjustInventory(
                            item.ProductId,
                            item.AccessoryId,
                            item.AccessoryIds ?? new List<int>(),
                            item.Quantity,
                            "Subtract",
                            newEnqNo
                        );
                    }

                    _context.Tbl_Enquiries.Add(verbalEnquiry);
                    await _context.SaveChangesAsync();
                    dto.EnquiryId = verbalEnquiry.EnquiryId;
                }
                else
                {
                    // If exists, just link to the existing Enquiry ID
                    dto.EnquiryId = existingEnquiry.EnquiryId;
                    dto.EnquiryNo = existingEnquiry.EnquiryNo;
                }
            }
            else if (dto.Source == "ENQUIRY" && dto.EnquiryId > 0)
            {
                // ENQUIRY Source: Simply pull the existing EnquiryNo
                var existingEnq = await _context.Tbl_Enquiries.FindAsync(dto.EnquiryId);
                if (existingEnq != null)
                {
                    dto.EnquiryNo = existingEnq.EnquiryNo ?? "";
                    existingEnq.Status = "OFFER_GENERATED";
                }
            }
            else if (dto.Source == "SERVICE" && dto.EnquiryId > 0)
            {
                // SERVICE 
                var existingService = await _context.Tbl_Enquiries.FindAsync(dto.EnquiryId);
                if (existingService != null)
                {
                    dto.EnquiryNo = existingService.EnquiryNo ?? "";
                    existingService.Status = "OFFER_GENERATED"; // Update the service status
                }
            }

            if (dto.Status == "FINAL") dto.NextFollowUpDate = DateTime.Now;

            // 3. Save the Official Offer record to Tbl_Offers
            var offer = new Core.Models.CRM.Offer
            {
                EnquiryId = dto.EnquiryId,
                EnquiryNo = dto.EnquiryNo ?? "",
                OfferNo = dto.OfferNo ?? "",
                OfferDate = dto.OfferDate,
                ExpiryDate = dto.ExpiryDate,
                ServiceId = dto.ServiceId,
                Source = dto.Source ?? "ENQUIRY",
                NextFollowUpDate = dto.NextFollowUpDate,
                FollowUpReminderSent = false,
                ProductGroupId = dto.ProductGroupId,
                CompanyId = dto.CompanyId,
                VendorId = dto.VendorId,
                CompanyGroupId = dto.CompanyGroupId,
                CustomerId = dto.CustomerId,
                ResponsiblePersonId = dto.ResponsiblePersonId,
                AssignedToEmployeeId = dto.AssignedToEmployeeId,
                CurrencyId = dto.CurrencyId,
                PlaceOfSupplyId = dto.PlaceOfSupplyId,
                BankDetailId = dto.BankDetailId,
                Subtotal = dto.Subtotal,
                FreightCharges = dto.FreightCharges,
                GrandTotal = dto.GrandTotal,
                GSTApplicable = dto.GSTApplicable,
                TermsConditions = dto.TermsConditions ?? "",
                CustomerNotes = dto.CustomerNotes ?? "",
                Status = dto.Status ?? "DRAFT",
                IsDeleted = false,
                Items = (dto.Items ?? new List<OfferItemDto>()).Select(i => new OfferItem
                {
                    ItemType = i.ItemType ?? "Product",
                    //ProductId = i.ProductId,
                    //AccessoryId = i.AccessoryId,
                    ProductId = i.ItemType == "Product" ? i.ProductId : null,
                    AccessoryId = i.ItemType == "Accessory" ? i.AccessoryId : null,
                    ServiceId = i.ItemType == "Service" ? i.ServiceId : null,
                    ServicePartNo = i.ItemType == "Service" ? i.ServicePartNo : null,
                    Description = i.Description ?? "",
                    HsnSacCode = i.HsnSacCode,
                    Quantity = i.Quantity,
                    Rate = i.Rate,
                    LiveConversionRate = i.LiveConversionRate,
                    Discount = i.Discount,
                    TaxPercentage = i.TaxPercentage,
                    Total = i.Total,
                    GstAmount = i.GstAmount,
                    CgstAmount = i.CgstAmount ?? 0,
                    SgstAmount = i.SgstAmount ?? 0,
                    IgstAmount = i.IgstAmount ?? 0,
                    FinalPrice = i.FinalPrice,
                    SelectedAccessories = (i.AccessoryIds ?? new List<int>()).Select(aid => new OfferItemAccessory { AccessoryId = aid }).ToList()
                }).ToList(),
                OfferNotes = (dto.Notes ?? new List<OfferNoteDto>())
                .Select(n => new OfferNote
                {
                    Note = n.Note ?? "",
                    CreatedAt = n.CreatedAt ?? DateTime.Now,
                    CreatedByEmployeeId = n.CreatedByEmployeeId ?? 0,
                    AuthorName = n.AuthorName ?? "Unknown"
                }).ToList()
            };

            _context.Tbl_Offers.Add(offer);
            await _context.SaveChangesAsync();

            if (offer.AssignedToEmployeeId > 0 &&
                offer.AssignedToEmployeeId != dto.CreatedByEmployeeId)
            {
                var message =
                    $"A new offer '{offer.OfferNo}' has been assigned to you.";

                await _notificationHelper.SendNotificationToEmployeeAsync(
                    offer.AssignedToEmployeeId,
                    message
                );
            }

            // 4. Save Version Snapshot for the History Log
            await SaveSnapshotAsync(offer.OfferId, dto);

            return offer.OfferId;
        }

        public async Task<OfferDto> GetByIdAsync(int id)
        {
            //return await _context.Tbl_Offers
            var result = await _context.Tbl_Offers
                .Include(o => o.OfferNotes)
                .Where(o => o.OfferId == id && !o.IsDeleted)

                .Select(o => new OfferDto
                {
                    OfferId = o.OfferId,

                    OfferNo = o.OfferNo ?? "",
                    EnquiryNo = o.EnquiryNo ?? "",
                    LatestRevisionDate = _context.Tbl_OfferVersions
                    .Where(v => v.OfferId == o.OfferId)
                    .OrderByDescending(v => v.VersionNumber)
                    .Select(v => (DateTime?)v.SavedAt)
                    .FirstOrDefault(),
                    ServiceId = o.ServiceId,
                    EnquiryId = o.EnquiryId,
                    ServiceDescription =
                        (
                            from oi in _context.Tbl_OfferItems
                            join sm in _context.Tbl_ServiceMaster
                                on oi.ServiceId equals sm.ServiceId
                            where oi.OfferId == o.OfferId
                                  && oi.ItemType == "Service"
                            select sm.ServiceDescription
                        ).FirstOrDefault(),
                   // OfferDate = o.OfferDate,

                    OfferDate = _context.Tbl_OfferVersions
    .Where(v => v.OfferId == o.OfferId)
    .OrderByDescending(v => v.VersionNumber)
    .Select(v => (DateTime?)v.SavedAt)
    .FirstOrDefault() ?? o.OfferDate,
                    //OfferDate = o.EnquiryId != null
                    //? _context.Tbl_Enquiries
                    //    .Where(e => e.EnquiryId == o.EnquiryId && !e.IsDeleted)
                    //    .Select(e => e.OfferDate)
                    //    .FirstOrDefault() ?? o.OfferDate
                    //: o.OfferDate,
                    ExpiryDate = o.ExpiryDate,
                    Source = o.Source ?? "",
                    NextFollowUpDate = o.NextFollowUpDate,
                    ProductGroupId = o.ProductGroupId,
                    CompanyId = o.CompanyId,
                    CompanyName = _context.Tbl_Companies
                     .Where(c => c.CompanyId == o.CompanyId && !c.IsDeleted)
                     .Select(c => c.CompanyName)
                     .FirstOrDefault(),

                    CompanyGST = _context.Tbl_Companies
                      .Where(c => c.CompanyId == o.CompanyId && !c.IsDeleted)
                      .Select(c => c.GSTIN)
                      .FirstOrDefault(),

                    CompanyPAN = _context.Tbl_Companies
                      .Where(c => c.CompanyId == o.CompanyId && !c.IsDeleted)
                      .Select(c => c.PAN)
                      .FirstOrDefault(),

                    CompanyFullAddress = _context.Set<CompanyAddress>()
                      .Where(a => a.CompanyId == o.CompanyId && !a.IsDeleted)
                      .Select(a =>
                          (a.FlatBlock != null ? a.FlatBlock + " " : "") +
                          (a.Premises != null ? a.Premises + ", " : "") +
                          (a.Road != null ? a.Road + ", " : "") +
                          (a.Area != null ? a.Area + ", " : "") +
                          (a.Town != null ? a.Town + ", " : "") +
                          (a.PinCode != null ? a.PinCode + ", " : "") +
                          (a.State != null ? a.State + ", " : "") +
                          (a.Country ?? "")
                      )
                      .FirstOrDefault(),
                    VendorId = o.VendorId,
                    CompanyGroupId = o.CompanyGroupId,
                    CustomerId = o.CustomerId,
                    ResponsiblePersonId = o.ResponsiblePersonId,
                    ResponsiblePersonName = _context.Tbl_CustomerContacts
                      .Where(c => c.Id == o.ResponsiblePersonId && !c.IsDeleted)
                      .Select(c => c.ResPersonName)
                      .FirstOrDefault(),
                    AssignedToEmployeeId = o.AssignedToEmployeeId,
                    AssignedEmployeeName = _context.Set<Employees>()
                      .Where(e => e.ID == o.AssignedToEmployeeId && !e.IsDeleted)
                      .Select(e =>
                          (e.FirstName ?? "") + " " +
                          (e.MiddleName ?? "") + " " +
                          (e.LastName ?? "")
                      )
                      .FirstOrDefault(),
                                      AssignedEmployeeMobile = _context.Set<Employees>()
                      .Where(e => e.ID == o.AssignedToEmployeeId && !e.IsDeleted)
                      .Select(e => e.MobileNumber)
                      .FirstOrDefault(),
                    CurrencyId = o.CurrencyId,
                    PlaceOfSupplyId = o.PlaceOfSupplyId,
                    BankDetailId = o.BankDetailId,
                    Subtotal = o.Subtotal,
                    FreightCharges = o.FreightCharges,
                    GrandTotal = o.GrandTotal,
                    GSTApplicable = o.GSTApplicable,
                    TermsConditions = o.TermsConditions ?? "",
                    CustomerNotes = o.CustomerNotes ?? "",
                    Status = o.Status ?? "",
                    CurrencyName = _context.Tbl_Currencies
                       .Where(c => c.Id == o.CurrencyId && !c.IsDeleted)
                       .Select(c => c.CurrencyName)
                       .FirstOrDefault(),
                      
                     CurrencySymbol = _context.Tbl_Currencies
                       .Where(c => c.Id == o.CurrencyId && !c.IsDeleted)
                       .Select(c => c.CurrencySymbol)
                       .FirstOrDefault(),
                      
                     CurrencyValue = _context.Tbl_Currencies
                       .Where(c => c.Id == o.CurrencyId && !c.IsDeleted)
                       .Select(c => c.CurrencyValue)
                       .FirstOrDefault(),
                    CustomerName = _context.Tbl_Customers
                        .Where(c => c.Id == o.CustomerId && !c.IsDeleted)
                        .Select(c => c.CustomerName)
                        .FirstOrDefault(),

                    CustomerAddress = _context.Tbl_CustomerAddress
                        .Where(a => a.CustomerId == o.CustomerId && !a.IsDeleted && a.AddressType == "Correspondence")
                        .Select(a =>
                            (a.FlatBlockNo ?? "") + " " +
                            (a.PremisesName ?? "") + ", " +
                            (a.Road ?? "") + ", " +
                            (a.Area ?? "") + ", " +
                            (a.Town ?? "") + " - " +
                            (a.PinNo ?? "") + " - " +
                            (a.State != null ? a.State.StateName : "") + ", " +
                            (a.Country != null ? a.Country.CountryName : "")
                        )
                        .FirstOrDefault(),
                    CompanyCode = _context.Tbl_Companies
                    .Where(c => c.CompanyId == o.CompanyId && !c.IsDeleted)
                    .Select(c => c.CompanyCode)
                    .FirstOrDefault(),
                    VendorName = _context.Tbl_Vendors
                    .Where(v => v.Id == o.VendorId && !v.IsDeleted)
                    .Select(v => v.VendorName)
                    .FirstOrDefault(),

                    VendorGSTIN = _context.Tbl_Vendors
                    .Where(v => v.Id == o.VendorId && !v.IsDeleted)
                    .Select(v => v.GSTIN)
                    .FirstOrDefault(),

                    VendorPAN = _context.Tbl_Vendors
                     .Where(v => v.Id == o.VendorId && !v.IsDeleted)
                     .Select(v => v.VendorPAN)
                     .FirstOrDefault(),

                    //VendorCode = _context.Tbl_Vendors
                    //.Where(v => v.Id == o.VendorId && !v.IsDeleted)
                    //.Select(v => v.VendorCode)
                    //.FirstOrDefault(),

                    //VendorCode = _context.Tbl_Customers
                    //.Where(v => v.Id == o.CustomerId && !v.IsDeleted)
                    //.Select(v => v.VendorCode)
                    //.FirstOrDefault(),

                    VendorCode = _context.Tbl_Customers
                        .Where(c => c.Id == o.CustomerId && !c.IsDeleted)
                        .Select(c =>

                            (
                                _context.Tbl_Currencies
                                    .Where(curr => curr.Id == o.CurrencyId && !curr.IsDeleted)
                                    .Select(curr => curr.CurrencyName)
                                    .FirstOrDefault() ?? ""
                            ).Trim().ToUpper() == "INR"

                            ? (c.VendorCode ?? "")

                            : (!string.IsNullOrEmpty(c.ForeignVendorCode)
                                ? c.ForeignVendorCode
                                : c.VendorCode)
                        )
                        .FirstOrDefault(),

                    VendorContactPerson = _context.Tbl_VendorContacts
                        .Where(c => c.VendorId == o.VendorId && !c.IsDeleted)
                        .Select(c => c.PersonName)
                        .FirstOrDefault(),

                    VendorAddress = _context.Tbl_VendorAddresses
                        .Where(a => a.VendorId == o.VendorId && !a.IsDeleted && a.AddressType == "Correspondence")
                        .Select(a =>
                            (a.Premises ?? "") + ", " +
                            (a.RoadStrLane ?? "") + ", " +
                            (a.Town ?? "") + ", " +
                            (a.PinNo ?? "")
                        )
                        .FirstOrDefault(),

                    Items = o.Items.Select(i => new OfferItemDto
                    {
                        ItemType = i.ItemType ?? "Product",
                        ProductId = i.ProductId ?? 0,
                        AccessoryId = i.AccessoryId ?? 0,
                        ServiceId = i.ServiceId,
                        ServicePartNo = i.ServicePartNo,
                        Description = i.Description ?? "",
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

                        ProductCode = (i.ItemType == "Product" && i.ProductId != null)
                            ? _context.Set<CompanyPlatform.Core.Models.CRM.Product>()
                                .Where(p => p.ProductId == i.ProductId && !p.IsDeleted)
                                .Select(p => p.ProductCode)
                                .FirstOrDefault()

                           : (i.ItemType == "Accessory" && i.AccessoryId != null)
                                ? _context.Set<CompanyPlatform.Core.Models.CRM.Accessories>()
                                    .Where(a => a.AccessoriesId == i.AccessoryId && !a.IsDeleted)
                                    .Select(a => a.AccessoriesCode)
                                    .FirstOrDefault()

                            : null,


                        HsnSacCode = i.HsnSacCode,
                        Quantity = i.Quantity,
                        Rate = i.Rate,
                        LiveConversionRate = i.LiveConversionRate,
                        Discount = i.Discount,
                        TaxPercentage = i.TaxPercentage,
                        Total = i.Total,
                        GstAmount = i.GstAmount,
                        CgstAmount = i.CgstAmount ?? 0,
                        SgstAmount = i.SgstAmount ?? 0,
                        IgstAmount = i.IgstAmount ?? 0,
                        FinalPrice = i.FinalPrice,
                        AccessoryIds = i.SelectedAccessories.Select(a => a.AccessoryId).ToList()
                    }).ToList(),

                    Notes = o.OfferNotes
                    .Select(n => new OfferNoteDto
                    {
                        Note = n.Note,
                        CreatedAt = n.CreatedAt,
                        CreatedByEmployeeId = n.CreatedByEmployeeId,
                        AuthorName = n.AuthorName
                    })
                    .OrderByDescending(n => n.CreatedAt)
                    .ToList(),

                    VersionHistory = o.Versions
                        .OrderByDescending(v => v.VersionNumber)
                        .Select(v => new OfferVersionDto
                        {
                            VersionNumber = v.VersionNumber,
                            SavedAt = v.SavedAt,
                            AuthorName = v.AuthorName ?? "",
                            StatusAtMoment = v.StatusAtMoment ?? "",
                            SnapshotDataJson = v.SnapshotDataJson ?? "{}"
                        }).ToList()
                })
                .FirstOrDefaultAsync();

            if (result == null)
                return null;

            // ✅ NOW your condition works perfectly
            if (result.CurrencyId == 1) // Company Bank
            {
                result.BankDetails = await _context.Tbl_CompanyBankDetails
                    .Where(b => b.CompanyId == result.CompanyId && !b.IsDeleted)
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
            else if (result.CurrencyId == 3) // Vendor Bank
            {
                result.BankDetails = await _context.Tbl_VendorBankDetails
                    .Where(b => b.VendorId == result.VendorId && !b.IsDeleted)
                    .Select(b => new VendorBankDetailDto
                    {
                        BankName = b.BankName,
                        BankAddress = b.BankAddress,
                        AccountNo = b.AccountNo,
                        IFSCCode = b.IFSCCode,
                        AccountHolderName = b.AccountHolderName,
                        SwiftCode = b.SwiftCode,
                        IBANNo = b.IBANNo,
                        EmailAddress = b.EmailAddress
                    })
                    .FirstOrDefaultAsync();
            }

            return result;
        }

        public async Task<bool> UpdateAsync(OfferDto dto)
        {
            
            var existing = await _context.Tbl_Offers
                .Include(o => o.Items)
                 .ThenInclude(i => i.SelectedAccessories)
                 .Include(o => o.OfferNotes)
                .FirstOrDefaultAsync(x => x.OfferId == dto.OfferId);

            if (existing == null)
            {
                return false; 
            }

            var oldEmployeeId = existing.AssignedToEmployeeId;
            var oldFollowUpDate = existing.NextFollowUpDate?.Date;

            bool hasCommercialChanges = HasCommercialChanges(existing, dto);

            // ✅ Revision offer number logic
            if ((dto.Status ?? "").ToUpper() == "DRAFT")
            {
                if (hasCommercialChanges)
                {
                    existing.OfferNo = await GenerateRevisionOfferNoAsync(
                    existing.OfferId,
                    existing.OfferNo
                );

                    dto.OfferNo = existing.OfferNo;
                }
                else
                {
                    dto.OfferNo = existing.OfferNo;
                }
            }
            else if ((dto.Status ?? "").ToUpper() == "FINAL")
            {
                dto.OfferNo = existing.OfferNo;
            }

            if ((dto.Status ?? "").ToUpper() == "FINAL")
            {
                
                if (dto.EnquiryId.HasValue && dto.EnquiryId > 0)
                {
                  
                    var sourceEnquiry = await _context.Tbl_Enquiries.FindAsync(dto.EnquiryId.Value);
                    if (sourceEnquiry != null)
                    {
                       
                        sourceEnquiry.Status = "OFFER_GENERATED";
                    }
                }

                if (existing.Status != "FINAL")
                {
                    dto.NextFollowUpDate = DateTime.Now;
                }
            }
            existing.OfferNo = dto.OfferNo ?? existing.OfferNo;
            existing.EnquiryId = dto.EnquiryId;
            existing.ServiceId = dto.ServiceId;
            existing.EnquiryNo = dto.EnquiryNo ?? "";
            existing.OfferDate = dto.OfferDate;
            existing.ExpiryDate = dto.ExpiryDate;
            existing.Source = dto.Source ?? "ENQUIRY";
            existing.NextFollowUpDate = dto.NextFollowUpDate;
            var newFollowUpDate = dto.NextFollowUpDate?.Date;

            if (oldFollowUpDate != newFollowUpDate ||
                oldEmployeeId != dto.AssignedToEmployeeId)
            {
                existing.FollowUpReminderSent = false;
            }
            existing.ProductGroupId = dto.ProductGroupId;
            existing.CompanyId = dto.CompanyId;
            existing.VendorId = dto.VendorId;
            existing.CompanyGroupId = dto.CompanyGroupId;
            existing.CustomerId = dto.CustomerId;
            existing.ResponsiblePersonId = dto.ResponsiblePersonId;
            existing.AssignedToEmployeeId = dto.AssignedToEmployeeId;
            existing.CurrencyId = dto.CurrencyId;
            existing.PlaceOfSupplyId = dto.PlaceOfSupplyId;
            existing.BankDetailId = dto.BankDetailId;
            existing.Subtotal = dto.Subtotal;
            existing.FreightCharges = dto.FreightCharges;
            existing.GrandTotal = dto.GrandTotal;
            existing.GSTApplicable = dto.GSTApplicable;
            existing.TermsConditions = dto.TermsConditions ?? "";
            existing.CustomerNotes = dto.CustomerNotes ?? "";
            existing.Status = dto.Status ?? "DRAFT";

          
            _context.Tbl_OfferItems.RemoveRange(existing.Items);

            existing.Items = (dto.Items ?? new List<OfferItemDto>()).Select(i => new OfferItem
            {
                ItemType = i.ItemType ?? "Product",
                //ProductId = i.ProductId,
                //AccessoryId = i.AccessoryId,
                ProductId = i.ItemType == "Product" ? i.ProductId : null,
                AccessoryId = i.ItemType == "Accessory" ? i.AccessoryId : null,
                ServiceId = i.ItemType == "Service" ? i.ServiceId : null,
                ServicePartNo = i.ItemType == "Service" ? i.ServicePartNo : null,
                CgstAmount = i.CgstAmount ?? 0,
                SgstAmount = i.SgstAmount ?? 0,
                IgstAmount = i.IgstAmount ?? 0,
                Description = i.Description ?? "",
                HsnSacCode = i.HsnSacCode,
                Quantity = i.Quantity,
                Rate = i.Rate,
                LiveConversionRate = i.LiveConversionRate,
                Discount = i.Discount,
                TaxPercentage = i.TaxPercentage,
                Total = i.Total,
                GstAmount = i.GstAmount,
                FinalPrice = i.FinalPrice,
                SelectedAccessories = (i.AccessoryIds ?? new List<int>())
                    .Select(aid => new OfferItemAccessory { AccessoryId = aid })
                    .ToList()
            }).ToList();

            if (dto.Notes != null)
            {
                foreach (var noteDto in dto.Notes)
                {
                    bool noteExists = existing.OfferNotes.Any(n =>
                        n.Note == noteDto.Note &&
                        n.CreatedByEmployeeId == noteDto.CreatedByEmployeeId);

                    if (!noteExists && !string.IsNullOrEmpty(noteDto.Note))
                    {
                        existing.OfferNotes.Add(new OfferNote
                        {
                            Note = noteDto.Note,
                            CreatedAt = noteDto.CreatedAt ?? DateTime.Now,
                            CreatedByEmployeeId = noteDto.CreatedByEmployeeId ?? 0,
                            AuthorName = noteDto.AuthorName ?? "Unknown"
                        });
                    }
                }
            }

            await _context.SaveChangesAsync();

            //await SaveSnapshotAsync(existing.OfferId, dto);

            if (hasCommercialChanges)
            {
                await SaveSnapshotAsync(existing.OfferId, dto);
            }

            return true;
        }

        private async Task SaveSnapshotAsync(int offerId, OfferDto dto)
        {
            var lastVN = await _context.Tbl_OfferVersions
                .Where(v => v.OfferId == offerId)
                .OrderByDescending(v => v.VersionNumber)
                .Select(v => v.VersionNumber)
                .FirstOrDefaultAsync();

            var fullSnapshot = await GetByIdAsync(offerId);

            if (fullSnapshot == null)
                return;

            fullSnapshot.Status = dto.Status ?? fullSnapshot.Status;
            fullSnapshot.OfferNo = dto.OfferNo ?? fullSnapshot.OfferNo;

            var snapshot = new OfferVersion
            {
                OfferId = offerId,
                VersionNumber = lastVN + 1,
                SavedAt = DateTime.Now,
                SavedByEmployeeId = dto.AssignedToEmployeeId,
                StatusAtMoment = dto.Status ?? "DRAFT",
                AuthorName = dto.Status == "FINAL" ? "System (Finalized)" : "Draft Log",
                SnapshotDataJson = JsonSerializer.Serialize(fullSnapshot)
            };

            _context.Tbl_OfferVersions.Add(snapshot);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var o = await _context.Tbl_Offers.FindAsync(id);
            if (o == null) return false;
            o.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<OfferDto>> GetAllAsync()
        {
            return await _context.Tbl_Offers
                .Where(x => !x.IsDeleted)
                .OrderByDescending(x => x.OfferId)
                .Select(o => new OfferDto
                {
                    OfferId = o.OfferId,
                    OfferNo = o.OfferNo ?? "",
                    EnquiryNo = o.EnquiryNo ?? "",
                    //OfferDate = o.OfferDate,
                    OfferDate = _context.Tbl_OfferVersions
                    .Where(v => v.OfferId == o.OfferId)
                    .OrderByDescending(v => v.VersionNumber)
                    .Select(v => (DateTime?)v.SavedAt)
                    .FirstOrDefault() ?? o.OfferDate,
                    GrandTotal = o.GrandTotal,
                    Status = o.Status ?? "",
                    Source = o.Source ?? "",
                    CurrencyId = o.CurrencyId,
                    // JOIN LOGIC: Fetch Currency Name and Symbol
                    CurrencyName = _context.Tbl_Currencies.Where(c => c.Id == o.CurrencyId).Select(c => c.CurrencyName).FirstOrDefault() ?? "INR",
                    CurrencySymbol = _context.Tbl_Currencies.Where(c => c.Id == o.CurrencyId).Select(c => c.CurrencySymbol).FirstOrDefault() ?? "₹",
                    CustomerName = _context.Tbl_Customers.Where(c => c.Id == o.CustomerId).Select(c => c.CustomerName).FirstOrDefault() ?? "N/A"
                }).ToListAsync();
        }

        public async Task<bool> HasDraftStatusAsync(int offerId)
        {
            // Check current status
            var offer = await _context.Tbl_Offers
                .Where(o => o.OfferId == offerId && !o.IsDeleted)
                .Select(o => o.Status)
                .FirstOrDefaultAsync();

            if (offer == "DRAFT") return true;

            // Check version history for any DRAFT snapshot
            var hasDraftVersion = await _context.Tbl_OfferVersions
                .AnyAsync(v => v.OfferId == offerId && v.StatusAtMoment == "DRAFT");

            return hasDraftVersion;
        }

        private bool HasCommercialChanges(
     Core.Models.CRM.Offer existingOffer,
     OfferDto dto)
        {
            var oldItems = existingOffer.Items
                .Select(x => new
                {
                    ProductId = x.ProductId ?? 0,
                    AccessoryId = x.AccessoryId ?? 0,
                    ServiceId = x.ServiceId ?? 0,
                    Qty = x.Quantity,
                    Rate = x.Rate,
                    Discount = x.Discount,
                    Tax = x.TaxPercentage
                })
                .OrderBy(x => x.ProductId)
                .ThenBy(x => x.AccessoryId)
                .ThenBy(x => x.ServiceId)
                .ToList();

            var newItems = (dto.Items ?? new List<OfferItemDto>())
                .Select(x => new
                {
                    ProductId = x.ProductId,
                    AccessoryId = x.AccessoryId,
                    ServiceId = x.ServiceId ?? 0,
                    Qty = x.Quantity,
                    Rate = x.Rate,
                    Discount = x.Discount,
                    Tax = x.TaxPercentage
                })
                .OrderBy(x => x.ProductId)
                .ThenBy(x => x.AccessoryId)
                .ThenBy(x => x.ServiceId)
                .ToList();

            if (oldItems.Count != newItems.Count)
                return true;

            for (int i = 0; i < oldItems.Count; i++)
            {
                if (oldItems[i].ProductId != newItems[i].ProductId)
                    return true;

                if (oldItems[i].AccessoryId != newItems[i].AccessoryId)
                    return true;

                if (oldItems[i].ServiceId != newItems[i].ServiceId)
                    return true;

                if (oldItems[i].Qty != newItems[i].Qty)
                    return true;

                if (oldItems[i].Rate != newItems[i].Rate)
                    return true;

                if (oldItems[i].Discount != newItems[i].Discount)
                    return true;

                if (oldItems[i].Tax != newItems[i].Tax)
                    return true;
            }

            return false;
        }
    }
}