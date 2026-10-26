using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.DTO.Enquiry;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.Core.Models.CRM.Employee;
using CompanyPlatform.Core.Services.Notification;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.Enquiry
{
    public class EnquiryService : IEnquiryService
    {
        private readonly ApplicationDBContext _context;
        private readonly INotificationHelper _notificationHelper;
        public EnquiryService(ApplicationDBContext context, INotificationHelper notificationHelper)
        { 
           _context = context;
           _notificationHelper = notificationHelper;  
        }

        public async Task<string> GenerateEnquiryNoAsync(string entryType = "ENQUIRY")
        {
            var today = DateTime.Now;

            int startYear = today.Month >= 4 ? today.Year : today.Year - 1;
            int endYear = startYear + 1;

            string financialYear = $"{startYear % 100:D2}-{endYear % 100:D2}";

            // ✅ NEW PREFIX
            string prefix = $"GS-EN-{financialYear}-";

            // ✅ IMPORTANT: ignore company prefix (GAX / GS)
            var lastEnquiry = await _context.Tbl_Enquiries
                .Where(x => x.EnquiryNo.Contains($"-EN-{financialYear}-"))
                .OrderByDescending(x => x.EnquiryNo)
                .Select(x => x.EnquiryNo)
                .FirstOrDefaultAsync();

            int nextNumber = 1;

            if (!string.IsNullOrEmpty(lastEnquiry))
            {
                var lastNumber = lastEnquiry.Split('-').Last();
                if (int.TryParse(lastNumber, out int num))
                    nextNumber = num + 1;
            }

            return $"{prefix}{nextNumber:D3}";
        }


        private async Task AdjustInventory(EnquiryItemDto item, string action, string? enquiryNo)
        {
            if (item.ItemType == "Service") return;
            if (item.Quantity == null || item.Quantity <= 0) return;

            int multiplier = (action == "Add") ? 1 : -1;
            int finalQty = item.Quantity.Value;

            // Case 1: Item is a Product (adjusts product stock and its FREE accessories)
            if (item.ItemType == "Product" && item.ProductId.HasValue && item.ProductId > 0)
            {
                var product = await _context.Tbl_Products.FindAsync(item.ProductId.Value);
                if (product != null)
                    product.AvailableQuantity += (finalQty * multiplier);

                if (item.AccessoryIds != null)
                {
                    foreach (var aid in item.AccessoryIds)
                    {
                        var acc = await _context.Tbl_Accessories.FindAsync(aid);
                        if (acc != null)
                        {
                            acc.AvailableQuantity += (finalQty * multiplier);
                            _context.Tbl_AccessoryLogs.Add(new AccessoryLog
                            {
                                AccessoryId = aid,
                                ActionType = action == "Add" ? "Addition" : "Subtraction",
                                Quantity = finalQty,
                                Reason = $"Included with Product in Enquiry {enquiryNo}",
                                Timestamp = DateTime.Now
                            });
                        }
                    }
                }
            }
            // Case 2: Item is a PAID Accessory (adjusts only the accessory's stock)
            else if (item.ItemType == "Accessory" && item.AccessoryId.HasValue && item.AccessoryId > 0)
            {
                var acc = await _context.Tbl_Accessories.FindAsync(item.AccessoryId.Value);
                if (acc != null)
                {
                    acc.AvailableQuantity += (finalQty * multiplier);
                    _context.Tbl_AccessoryLogs.Add(new AccessoryLog
                    {                        
                        AccessoryId = acc.AccessoriesId,
                        ActionType = action == "Add" ? "Addition" : "Subtraction",
                        Quantity = finalQty,
                        Reason = $"Paid Item in Enquiry {enquiryNo}",
                        Timestamp = DateTime.Now
                    });
                }
            }
        }

        public async Task<int> CreateAsync(EnquiryDto dto)
        {
            string currentEntryType = !string.IsNullOrEmpty(dto.EntryType) ? dto.EntryType.ToUpper() : "ENQUIRY";

           
            string enquiryNo = await GenerateEnquiryNoAsync(currentEntryType);

            var enquiry = new Core.Models.CRM.Enquiry
            {
                EnquiryNo = enquiryNo,
                ServiceId = dto.ServiceId,
                OfferDate = dto.OfferDate ?? DateTime.Now,
                ExpiryDate = dto.ExpiryDate ?? DateTime.Now.AddDays(30),
                CustomerId = dto.CustomerId,
                GSTApplicable = dto.GSTApplicable,
                ResponsiblePersonId = dto.ResponsiblePersonId,
                ProductGroupId = dto.ProductGroupId,
                CompanyId = dto.CompanyId,
                VendorId = dto.VendorId,
                CompanyGroupId = dto.CompanyGroupId,
                CurrencyId = dto.CurrencyId,
                PlaceOfSupplyId = dto.PlaceOfSupplyId,
                BankDetailId = null,
                Subtotal = dto.Subtotal ?? 0,
                FreightCharges = dto.FreightCharges ?? 0,
                GrandTotal = dto.GrandTotal ?? 0,
                TermsConditions = dto.TermsConditions,
                NextFollowUpDate= dto.NextFollowUpDate,
                CustomerNotes = dto.CustomerNotes,
                EntryType = currentEntryType,
                FollowUpReminderSent = false,
                Status = dto.Status ?? "DRAFT",
                AssignedToEmployeeId = dto.AssignedToEmployeeId,
                Items = (dto.Items ?? new List<EnquiryItemDto>()).Select(i => new EnquiryItem
                {
                    ItemType = i.ItemType ?? "Product",
                    ProductId = i.ItemType == "Product" ? i.ProductId : null,
                    AccessoryId = i.ItemType == "Accessory" ? i.AccessoryId : null,
                    ServiceId = i.ItemType == "Service" ? i.ServiceId : null,
                    ServicePartNo = i.ItemType == "Service" ? i.ServicePartNo : null,
                    Quantity = i.Quantity ?? 0,
                    Rate = i.Rate ?? 0,
                    LiveConversionRate = i.LiveConversionRate,
                    Discount = i.Discount ?? 0,
                    TaxPercentage = i.TaxPercentage ?? 0,
                    Total = i.Total ?? 0,
                    GstAmount = i.GstAmount ?? 0,
                    CgstAmount = i.CgstAmount ?? 0,
                    SgstAmount = i.SgstAmount ?? 0,
                    IgstAmount = i.IgstAmount ?? 0,
                    FinalPrice = i.FinalPrice ?? 0,
                    Description = i.Description,
                    HsnSacCode = i.HsnSacCode,
                    SelectedAccessories = (i.AccessoryIds ?? new List<int>()).Select(a => new EnquiryItemAccessory { AccessoryId = a }).ToList()
                }).ToList(),
                EnquiryNotes = (dto.Notes ?? new List<EnquiryNoteDto>()).Select(n => new Core.Models.CRM.EnquiryNote
                {
                    Note = n.Note ?? "",
                    CreatedAt = n.CreatedAt ?? DateTime.Now,
                    CreatedByEmployeeId = n.CreatedByEmployeeId ?? 0,
                    AuthorName = n.AuthorName ?? "Unknown"
                }).ToList()
            };


            if (dto.Items != null)
            {
                foreach (var item in dto.Items)
                {
                    await AdjustInventory(item, "Subtract", enquiry.EnquiryNo);
                }
            }

            _context.Tbl_Enquiries.Add(enquiry);
            await _context.SaveChangesAsync();

           
            if (enquiry.AssignedToEmployeeId.HasValue &&
                enquiry.AssignedToEmployeeId.Value != dto.CreatedByEmployeeId)
            {
                var message = $"A new enquiry '{enquiry.EnquiryNo}' has been assigned to you.";

                await _notificationHelper.SendNotificationToEmployeeAsync(
                    enquiry.AssignedToEmployeeId.Value,
                    message);
            }
            return enquiry.EnquiryId;
        }

        public async Task<bool> UpdateAsync(EnquiryDto dto)
        {
            var existing = await _context.Tbl_Enquiries
                .Include(e => e.Items).ThenInclude(i => i.SelectedAccessories)
                .Include(e => e.EnquiryNotes)
                .FirstOrDefaultAsync(x => x.EnquiryId == dto.EnquiryId);

            if (existing == null) return false;

            var oldItemsDto = existing.Items.Select(i => new EnquiryItemDto
            {
                ItemType = i.ItemType,
                ProductId = i.ProductId,
                AccessoryId = i.AccessoryId,
                ServiceId = i.ServiceId,
                ServicePartNo = i.ServicePartNo,
                Quantity = i.Quantity,
                AccessoryIds = i.SelectedAccessories.Select(a => a.AccessoryId).ToList()
            }).ToList();

            foreach (var item in oldItemsDto)
            {
                await AdjustInventory(item, "Add", existing.EnquiryNo);
            }

            var oldEmployeeId = existing.AssignedToEmployeeId;
            var oldFollowUpDate = existing.NextFollowUpDate?.Date;
            _context.Entry(existing).CurrentValues.SetValues(dto);
            existing.Status = dto.Status ?? existing.Status;
            existing.AssignedToEmployeeId = dto.AssignedToEmployeeId;
            existing.EntryType = dto.EntryType ?? "ENQUIRY";
            existing.GSTApplicable = dto.GSTApplicable;

            var newFollowUpDate = dto.NextFollowUpDate?.Date;

            if (oldFollowUpDate != newFollowUpDate ||
                oldEmployeeId != dto.AssignedToEmployeeId)
            {
                existing.FollowUpReminderSent = false;
            }

            if (dto.Notes != null)
            {
                foreach (var noteDto in dto.Notes)
                {
                    bool noteExists = existing.EnquiryNotes.Any(en =>
                        en.Note == noteDto.Note &&
                        en.CreatedByEmployeeId == noteDto.CreatedByEmployeeId);

                    if (!noteExists && !string.IsNullOrEmpty(noteDto.Note))
                    {
                        existing.EnquiryNotes.Add(new Core.Models.CRM.EnquiryNote
                        {
                            Note = noteDto.Note,
                            CreatedAt = noteDto.CreatedAt ?? DateTime.Now,
                            CreatedByEmployeeId = noteDto.CreatedByEmployeeId ?? 0,
                            AuthorName = noteDto.AuthorName ?? "Unknown"
                        });
                    }
                }
            }

            
            _context.Tbl_EnquiryItems.RemoveRange(existing.Items);
            existing.Items = (dto.Items ?? new List<EnquiryItemDto>()).Select(i => new EnquiryItem
            {
                ItemType = i.ItemType ?? "Product",
                ProductId = i.ItemType == "Product" ? i.ProductId : null,
                AccessoryId = i.ItemType == "Accessory" ? i.AccessoryId : null,
                ServiceId = i.ItemType == "Service" ? i.ServiceId : null,
                ServicePartNo = i.ItemType == "Service" ? i.ServicePartNo : null,
                Quantity = i.Quantity ?? 0,
                Rate = i.Rate ?? 0,
                LiveConversionRate = i.LiveConversionRate,
                Discount = i.Discount ?? 0,
                TaxPercentage = i.TaxPercentage ?? 0,
                Total = i.Total ?? 0,
                GstAmount = i.GstAmount ?? 0,
                CgstAmount = i.CgstAmount ?? 0,
                SgstAmount = i.SgstAmount ?? 0,
                IgstAmount = i.IgstAmount ?? 0,
                FinalPrice = i.FinalPrice ?? 0,
                Description = i.Description,
                HsnSacCode = i.HsnSacCode,
                SelectedAccessories = (i.AccessoryIds ?? new List<int>()).Select(a => new EnquiryItemAccessory { AccessoryId = a }).ToList()
            }).ToList();


            if (dto.Items != null)
            {
                foreach (var item in dto.Items)
                {
                    await AdjustInventory(item, "Subtract", existing.EnquiryNo);
                }
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var e = await _context.Tbl_Enquiries
                .Include(en => en.Items).ThenInclude(i => i.SelectedAccessories)
                .FirstOrDefaultAsync(x => x.EnquiryId == id);

            if (e == null) return false;


            foreach (var item in e.Items)
            {
                var itemDto = new EnquiryItemDto
                {
                    ItemType = item.ItemType,
                    ProductId = item.ProductId,
                    AccessoryId = item.AccessoryId,
                    Quantity = item.Quantity,
                    AccessoryIds = item.SelectedAccessories.Select(a => a.AccessoryId).ToList()
                };
                await AdjustInventory(itemDto, "Add", e.EnquiryNo);
            }

            e.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<EnquiryListItemDto>> GetAllAsync()
        {
            return await _context.Tbl_Enquiries
                .Where(x => !x.IsDeleted)
                .OrderByDescending(x => x.EnquiryId)
                .Select(e => new EnquiryListItemDto
                {
                    EnquiryId = e.EnquiryId,
                    EnquiryNo = e.EnquiryNo,
                    OfferDate = e.OfferDate,
                    GrandTotal = e.GrandTotal,
                    EntryType = e.EntryType,
                    Status = e.Status,
                    CurrencyId = e.CurrencyId,
                    CurrencyName = _context.Tbl_Currencies.Where(c => c.Id == e.CurrencyId).Select(c => c.CurrencyName).FirstOrDefault() ?? "INR",
                    CurrencySymbol = _context.Tbl_Currencies.Where(c => c.Id == e.CurrencyId).Select(c => c.CurrencySymbol).FirstOrDefault() ?? "₹",
                    CustomerName = _context.Tbl_Customers
                                    .Where(c => c.Id == e.CustomerId)
                                    .Select(c => c.CustomerName)
                                    .FirstOrDefault() ?? "N/A"
                }).ToListAsync();
        }

        public async Task<EnquiryDto> GetByIdAsync(int id)
        {
            var e = await _context.Tbl_Enquiries
                .Include(en => en.Items)
                    .ThenInclude(i => i.SelectedAccessories)
                .Include(en => en.EnquiryNotes)

                // ✅ Customer + Address + State + Country
                .Include(en => en.Customer)
                    .ThenInclude(c => c.Addresses)
                        .ThenInclude(a => a.State)

                .Include(en => en.Customer)
                    .ThenInclude(c => c.Addresses)
                        .ThenInclude(a => a.Country)

                .FirstOrDefaultAsync(x => x.EnquiryId == id && !x.IsDeleted);

            if (e == null) return null;

            // ✅ Get Correspondence Address (Preferred)
            var address = e.Customer?.Addresses?
                .FirstOrDefault(a => !a.IsDeleted && a.AddressType == "Correspondence");

            // ✅ Format Address
            var formattedAddress = address != null
                ? string.Join(", ", new[]
                {
            address.FlatBlockNo,
            address.PremisesName,
            address.Road,
            address.Area,
            address.Town,
            address.State?.StateName,
            address.Country?.CountryName,
            address.PinNo != null ? $"PIN - {address.PinNo}" : null
                }.Where(x => !string.IsNullOrWhiteSpace(x)))
                : null;

            // Get ServiceId from Header or Service Item
            var serviceId = e.ServiceId;

            if (!serviceId.HasValue)
            {
                serviceId = e.Items
                    .FirstOrDefault(i => i.ItemType == "Service")
                    ?.ServiceId;
            }

            // Get Service Description
            var serviceDescription = "";

            if (serviceId.HasValue)
            {
                serviceDescription = await _context.Tbl_ServiceMaster
                    .Where(s => s.ServiceId == serviceId.Value)
                    .Select(s => s.ServiceDescription)
                    .FirstOrDefaultAsync() ?? "";
            }

            return new EnquiryDto
            {
                EnquiryId = e.EnquiryId,
                ServiceId = e.ServiceId,
                ServiceDescription = serviceDescription,
                EnquiryNo = e.EnquiryNo,
                OfferDate = e.OfferDate,
                ExpiryDate = e.ExpiryDate,
                ProductGroupId = e.ProductGroupId ?? 0,
                CompanyId = e.CompanyId ?? 0,
                VendorId = e.VendorId,
                CompanyGroupId = e.CompanyGroupId ?? 0,
                CustomerId = e.CustomerId ?? 0,

                // ✅ Customer Data
                CustomerName = e.Customer?.CustomerName,
                CustomerAddress = formattedAddress,

                ResponsiblePersonId = e.ResponsiblePersonId ?? 0,
                ResponsiblePersonName = _context.Tbl_CustomerContacts
                      .Where(c => c.Id == e.ResponsiblePersonId && !c.IsDeleted)
                      .Select(c => c.ResPersonName)
                      .FirstOrDefault(),
                AssignedToEmployeeId = e.AssignedToEmployeeId,
                AssignedEmployeeName = _context.Set<Employees>()
                      .Where(emp => emp.ID == e.AssignedToEmployeeId && !emp.IsDeleted)
                      .Select(emp =>
                          (emp.FirstName ?? "") + " " +
                          (emp.MiddleName ?? "") + " " +
                          (emp.LastName ?? "")
                      )
                      .FirstOrDefault(),
                AssignedEmployeeMobile = _context.Set<Employees>()
                      .Where(emp => emp.ID == e.AssignedToEmployeeId && !emp.IsDeleted)
                      .Select(emp => emp.MobileNumber)
                      .FirstOrDefault(),
                Status = e.Status,
                EntryType = e.EntryType,
                CurrencyId = e.CurrencyId ?? 0,
                CurrencyName = _context.Tbl_Currencies
                .Where(c => c.Id == (e.CurrencyId ?? 0) && !c.IsDeleted)
                .Select(c => c.CurrencyName)
                .FirstOrDefault(),

                CurrencySymbol = _context.Tbl_Currencies
                .Where(c => c.Id == (e.CurrencyId ?? 0) && !c.IsDeleted)
                .Select(c => c.CurrencySymbol)
                .FirstOrDefault(),

                CurrencyValue = _context.Tbl_Currencies
                .Where(c => c.Id == (e.CurrencyId ?? 0) && !c.IsDeleted)
                .Select(c => c.CurrencyValue)
                .FirstOrDefault(),
                PlaceOfSupplyId = e.PlaceOfSupplyId ?? 0,
                BankDetailId = e.BankDetailId ?? 0,
                Subtotal = e.Subtotal,
                FreightCharges = e.FreightCharges,
                GrandTotal = e.GrandTotal,
                TermsConditions = e.TermsConditions,
                CustomerNotes = e.CustomerNotes,
                NextFollowUpDate = e.NextFollowUpDate,
                GSTApplicable = e.GSTApplicable,

                Items = e.Items.Select(i => new EnquiryItemDto
                {
                    ItemType = i.ItemType,
                    ProductId = i.ProductId,
                    AccessoryId = i.AccessoryId,
                    ServiceId = i.ServiceId,
                    ServicePartNo = i.ServicePartNo,

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


                    Description = i.Description,
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
                    Quantity = i.Quantity,
                    Rate = i.Rate,
                    LiveConversionRate = i.LiveConversionRate,
                    Discount = i.Discount,
                    TaxPercentage = i.TaxPercentage,
                    Total = i.Total,
                    GstAmount = i.GstAmount,
                    CgstAmount = i.CgstAmount,
                    SgstAmount = i.SgstAmount,
                    IgstAmount = i.IgstAmount,
                    FinalPrice = i.FinalPrice,
                    AccessoryIds = i.SelectedAccessories
                        .Select(a => a.AccessoryId)
                        .ToList()
                }).ToList(),

                Notes = e.EnquiryNotes
                    .Select(n => new EnquiryNoteDto
                    {
                        Note = n.Note,
                        CreatedAt = n.CreatedAt,
                        CreatedByEmployeeId = n.CreatedByEmployeeId,
                        AuthorName = n.AuthorName
                    })
                    .OrderByDescending(n => n.CreatedAt)
                    .ToList()
            };
        }

    }
}