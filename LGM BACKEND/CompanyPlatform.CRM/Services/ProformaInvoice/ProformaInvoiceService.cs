using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.DTO.DummyInvoice;
using CompanyPlatform.Core.DTO.ProformaInvoice;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.Core.Models.CRM.DummyInvoice;
using CompanyPlatform.Core.Models.CRM.Invoice;
using CompanyPlatform.Core.Services.ProformaInvoice;
using Microsoft.EntityFrameworkCore;

namespace CompanyPlatform.CRM.Services.ProformaInvoice
{
    public class ProformaInvoiceService : IProformaInvoiceService
    {
        private readonly ApplicationDBContext _context;

        private readonly ProformaInvoiceExcelService _excelService;

        public ProformaInvoiceService(ApplicationDBContext context, ProformaInvoiceExcelService excelService)
        {
            _context = context;
            _excelService = excelService;
        }

        public async Task<List<ProformaInvoiceListDto>> GetAllAsync()
        {
            var today = DateTime.UtcNow.Date;

            var list = await _context.Tbl_ProformaInvoices
                .Where(pi => !pi.IsDeleted)
                .Include(pi => pi.Customer)
                .Include(pi => pi.Currency)
                .OrderByDescending(pi => pi.CreatedOn)
                .Select(pi => new ProformaInvoiceListDto
                {
                    ProformaInvoiceId = pi.ProformaInvoiceId,
                    ProformaInvoiceNo = pi.ProformaInvoiceNo,
                    CustomerName = pi.Customer.CustomerName,

                    //CurrencyCode = pi.Currency != null ? pi.Currency.CurrencyCode : "",
                    CurrencySymbol = pi.Currency != null ? pi.Currency.CurrencySymbol : "",

                    TotalAmount = pi.TotalAmount,
                    CreatedDate = pi.CreatedOn,
                    ExpiryDate = pi.ProformaInvoiceExpiryDate,
                    Status = pi.ProformaInvoiceExpiryDate < today ? "Expired" : "Active"
                })
                .AsNoTracking()
                .ToListAsync();

            return list;
        }

        public async Task<ProformaInvoiceDto> GetByIdAsync(int id)
        {
            var pi = await _context.Tbl_ProformaInvoices
                .Include(x => x.Customer)          // To get Customer Name
                .Include(x => x.CustomerContact)   // To get Responsible Person Name
                .Include(x => x.Currency)
                .Include(x => x.Items)
                    .ThenInclude(i => i.SelectedAccessories) // To get Accessories
                     .Include(x => x.Items)             // <--- 1. Add this Include
               .ThenInclude(i => i.Product)
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.ProformaInvoiceId == id);

            if (pi == null) return null;

            // Map Entity to DTO
            var dto = new ProformaInvoiceDto
            {
                ProformaInvoiceId = pi.ProformaInvoiceId,
                ProformaInvoiceNo = pi.ProformaInvoiceNo,
                ServiceReportId = pi.ServiceReportId,
                ProformaInvoiceDate = pi.ProformaInvoiceDate,
                ProformaInvoiceExpiryDate = pi.ProformaInvoiceExpiryDate,
                OrderAcceptanceId = pi.OrderAcceptanceId,
                ProductGroupId = pi.GroupId,
                CompanyId = pi.CompanyId,
                VendorId = pi.VendorId,
                CompanyGroupId = pi.CompanyGroupId,

                CustomerId = pi.CustomerId,
                CustomerName = pi.Customer?.CustomerName, // Map Name

                ResponsiblePersonId = pi.ResponsiblePersonId,
                ResponsiblePersonName = pi.CustomerContact?.ResPersonName, // Map Name

                CurrencyId = pi.CurrencyId,
                CurrencySymbol = pi.Currency != null ? pi.Currency.CurrencySymbol : null,
                PlaceOfSupplyId = pi.PlaceOfSupplyId,
                BankDetailId = pi.BankDetailId,
                CustomerPO = pi.CustomerPO,
                CustomerPODate = pi.CustomerPODate,
                ConsigneeNameAndAddress = pi.ConsigneeNameAndAddress,
                TermsAndConditions = pi.TermsAndConditions,
                CustomerNotes = pi.CustomerNotes,
                Subtotal = pi.Subtotal,
                Percentage = pi.Percentage,
                PercentageAmount = pi.PercentageAmount,
                BalanceAmount = pi.BalanceAmount,
                FreightOrCarrierInsurance = pi.FreightOrCarrierInsurance,
                TotalGstAmount = pi.TotalGstAmount,
                GrandTotal = pi.GrandTotal,
                PercentageTaxAmount = pi.PercentageTaxAmount,
                TotalAmount = pi.TotalAmount,

                Items = pi.Items.Select(i => new ProformaInvoiceItemDto
                {
                    //ProformaInvoiceItemId = i.ProformaInvoiceItemId,
                    ProductId = i.ProductId ?? 0,
                    AccessoryId = i.AccessoryId ?? 0,
                    ItemType = i.AccessoryId != null ? "Accessory" : "Product",
                    //ProductImage = i.Product != null ? i.Product.ProductImage : null,
                    HsnSacCode = i.HsnSacCode,
                    Description = i.Description,
                    Quantity = i.Quantity,
                    Rate = i.Rate,
                    Discount = i.Discount,
                    TaxPercentage = i.TaxPercentage,
                    Total = i.Total,
                    GstTax = i.GstTax,
                    Price = i.Price,
                    // Extract Accessory IDs from the sub-collection
                    AccessoryIds = i.SelectedAccessories.Select(a => a.AccessoryId).ToList()
                }).ToList()
            };

            return dto;
        }

        // Fetches a list of FINAL offers to be displayed in the dropdown.

        public async Task<List<SelectOptionDto>> GetActiveOffersAsync()
        {
            var inrId = await _context.Tbl_Currencies
                .Where(c => c.CurrencyName == "INR" && !c.IsDeleted)
                .Select(c => c.Id)
                .FirstOrDefaultAsync();

            if (inrId == 0)
                return new List<SelectOptionDto>();

            return await _context.Tbl_OrderAcceptances
                .Where(oa =>
                    !oa.IsDeleted &&
                    oa.Status.Trim().ToUpper() == "FINAL" &&
                    oa.SelectedOffers.Any(o =>
                        o.CurrencyId == inrId &&
                        (o.ServiceId == null || o.ServiceId == 0)
                    )
                )
                .OrderByDescending(oa => oa.OrderAcceptanceId)
                .Select(oa => new SelectOptionDto
                {
                    Value = oa.OrderAcceptanceId,
                    Label = oa.GaxcePurchaseOrderNo + " (" +
                        _context.Tbl_Customers
                            .Where(c => c.Id == oa.CustomerId)
                            .Select(c => c.CustomerName)
                            .FirstOrDefault() + ")"
                })
               .ToListAsync();
        }



        // Fetches data from a specific Offer and maps it to a ProformaInvoiceDto.

        public async Task<ProformaInvoiceViewDto> GetDataFromOfferIdAsync(int orderAcceptanceId)
        {
            var existingPINo = await _context.Tbl_ProformaInvoices
            .Where(x => !x.IsDeleted)
            .OrderByDescending(x => x.ProformaInvoiceId)
            .Select(x => x.ProformaInvoiceNo)
            .FirstOrDefaultAsync();

            var oa = await _context.Tbl_OrderAcceptances
               .Include(o => o.Items)
                   .ThenInclude(i => i.SelectedAccessories)
               .Include(o => o.SelectedOffers)
               .AsNoTracking()
               .FirstOrDefaultAsync(o => o.OrderAcceptanceId == orderAcceptanceId);

            if (oa == null)
            {
                return null; // Or throw a NotFoundException
            }

            var associatedOffer = oa.SelectedOffers
           .OrderByDescending(o => o.Id)
           .FirstOrDefault();

            var effectiveCurrencyId = associatedOffer?.CurrencyId ?? oa.CurrencyId;


            var currencyDetails = await _context.Tbl_Currencies
               .AsNoTracking()
               .Where(c => c.Id == effectiveCurrencyId)
               .Select(c => new { c.CurrencyName, c.CurrencySymbol })
               .FirstOrDefaultAsync();

            var productIds = oa.Items
             .Where(i => i.ProductId.HasValue)
             .Select(i => i.ProductId.Value)
             .Distinct()
             .ToList();

            //var productImages = await _context.Tbl_Products
            //    .Where(p => productIds.Contains(p.ProductId))
                //.Select(p => new { p.ProductId, p.ProductImage })
                //.ToDictionaryAsync(k => k.ProductId, v => v.ProductImage);

            var customerId = oa?.CustomerId ?? oa.CustomerId;

            var customerAddress = await _context.Tbl_CustomerAddress
             .Include(a => a.Customer) 
             .Include(a => a.State)    
             .Include(a => a.Country)  
             .FirstOrDefaultAsync(a => a.CustomerId == oa.CustomerId && !a.IsDeleted);

            string consigneeAddress = "N/A";
            if (customerAddress != null)
            {
                var stateName = customerAddress.State != null ? customerAddress.State.StateName : "";
                var countryName = customerAddress.Country != null ? customerAddress.Country.CountryName : "";

                consigneeAddress = $"{customerAddress.Customer?.CustomerName}\n" +
                                   $"{customerAddress.FlatBlockNo}, {customerAddress.PremisesName}, {customerAddress.Road}\n" +
                                   $"{customerAddress.Area}, {customerAddress.Town}\n" +
                                   $"{stateName}, {countryName} - {customerAddress.PinNo}";
            }

            var responsiblePersonId = associatedOffer?.ResponsiblePersonId ?? oa.ResponsiblePersonId;

            var responsiblePersonName = await _context.Tbl_CustomerContacts
               .Where(e => e.Id == responsiblePersonId)
               .Select(e => e.ResPersonName)
               .FirstOrDefaultAsync();

            // Map Offer data to a new ProformaInvoiceDto
            var proformaInvoiceDto = new ProformaInvoiceViewDto
            {
                ProformaInvoiceNo = existingPINo ?? "",
                OrderAcceptanceId = oa.OrderAcceptanceId,
                ProformaInvoiceDate = DateTime.Now,
                ProformaInvoiceExpiryDate = DateTime.Now,

                // ✅ PRIORITY: Offer → fallback PurchaseOrder
                ProductGroupId = associatedOffer?.ProductGroupId ?? oa.ProductGroupId,
                CompanyId = associatedOffer?.CompanyId ?? oa.CompanyId,
                VendorId = associatedOffer?.VendorId ?? oa.VendorId,
                CompanyGroupId = associatedOffer?.CompanyGroupId ?? oa.CompanyGroupId,
                CustomerId = associatedOffer?.CustomerId ?? oa.CustomerId,
                ResponsiblePersonId = responsiblePersonId,
                ResponsiblePersonName = responsiblePersonName,
                CurrencyId = effectiveCurrencyId,
                CurrencyName = currencyDetails?.CurrencyName ?? "N/A",
                CurrencySymbol = currencyDetails?.CurrencySymbol ?? "",
                PlaceOfSupplyId = associatedOffer?.PlaceOfSupplyId ?? oa.PlaceOfSupplyId,
                BankDetailId = associatedOffer?.BankDetailId ?? oa.BankDetailId,
                CustomerPo = oa.CustomerOrderNo,
                TermsAndConditions = associatedOffer.TermsConditions,
                CustomerNotes = associatedOffer?.CustomerNotes ?? oa.CustomerNotes,
                
                ConsigneeNameAndAddress = consigneeAddress,

                // ✅ Financials
                Subtotal = oa.Subtotal ?? 0,
                FreightOrCarrierInsurance = associatedOffer?.FreightCharges ?? oa.FreightCharges ?? 0,
                GrandTotal = oa.GrandTotal ?? 0,
                TotalGstAmount = oa.Items.Sum(i => i.GstAmount),

                Items = oa.Items.Select(item => new ProformaInvoiceItemDto
                {
                    ItemType = item.ProductId.HasValue && item.ProductId > 0 ? "Product" : "Accessory",
                    ProductId = item.ProductId ?? 0,
                    AccessoryId = item.AccessoryId ?? 0,
                    HsnSacCode = item.HsnSacCode,
                   // ProductImage = (item.ProductId.HasValue && productImages.ContainsKey(item.ProductId.Value))
                   //? productImages[item.ProductId.Value]
                   //: null,
                    Description = item.Description,
                    Quantity = item.Quantity,
                    Rate = item.Rate,
                    Discount = item.Discount,
                    TaxPercentage = item.TaxPercentage,
                    Total = item.Total,
                    GstTax = item.GstAmount,
                    Price = item.FinalPrice,
                    AccessoryIds = item.SelectedAccessories.Select(a => a.AccessoryId).ToList()
                }).ToList()
            };

            return proformaInvoiceDto;
        }

       
        // Generates a unique Proforma Invoice number.
        
        private async Task<string> GenerateProformaInvoiceNoAsync()
        {
            string currentYear = DateTime.Now.Year.ToString();
            string prefix = $"PI-{currentYear}-";

            var lastInvoice = await _context.Tbl_ProformaInvoices
                .Where(pi => pi.ProformaInvoiceNo.StartsWith(prefix))
                .OrderByDescending(pi => pi.ProformaInvoiceNo)
                .FirstOrDefaultAsync();

            int nextSequence = 1;
            if (lastInvoice != null)
            {
                string[] parts = lastInvoice.ProformaInvoiceNo.Split('-');
                if (parts.Length == 3 && int.TryParse(parts[2], out int lastSequence))
                {
                    nextSequence = lastSequence + 1;
                }
            }
            return $"{prefix}{nextSequence:D5}"; // Example: PI-2026-00001
        }

       
        // Saves the provided DTO as a new Proforma Invoice in the database.
       
        public async Task<int> CreateAsync(ProformaInvoiceDto dto)
        {
            var exists = await _context.Tbl_ProformaInvoices
                 .AnyAsync(x =>
                !x.IsDeleted &&
                x.ProformaInvoiceNo.Trim().ToUpper() ==
                dto.ProformaInvoiceNo.Trim().ToUpper());

            if (exists)
            {
                throw new Exception("Proforma Invoice Number already exists.");
            }

            var isValidResponsiblePerson = await _context.Tbl_CustomerContacts
                .AnyAsync(x => x.Id == dto.ResponsiblePersonId && !x.IsDeleted);

            var proformaInvoice = new Core.Models.CRM.ProformaInvoice
            {
                ProformaInvoiceNo = dto.ProformaInvoiceNo,
                ProformaInvoiceDate = dto.ProformaInvoiceDate,
                ProformaInvoiceExpiryDate = dto.ProformaInvoiceExpiryDate,
                OrderAcceptanceId = dto.OrderAcceptanceId,
                ServiceReportId = dto.ServiceReportId,
                GroupId = dto.ProductGroupId,
                CompanyId = dto.CompanyId,
                VendorId = dto.VendorId,
                CompanyGroupId = dto.CompanyGroupId,
                CustomerId = dto.CustomerId,
                //ResponsiblePersonId = dto.ResponsiblePersonId,
                ResponsiblePersonId = isValidResponsiblePerson
                ? dto.ResponsiblePersonId
                : null,
                CurrencyId = dto.CurrencyId,
                PlaceOfSupplyId = dto.PlaceOfSupplyId,
                BankDetailId = dto.BankDetailId,
                CustomerPO = dto.CustomerPO,
                CustomerPODate = dto.CustomerPODate,
                ConsigneeNameAndAddress = dto.ConsigneeNameAndAddress,
                TermsAndConditions = dto.TermsAndConditions,
                CustomerNotes = dto.CustomerNotes,
                Subtotal = dto.Subtotal,
                Percentage = dto.Percentage,
                PercentageAmount = dto.PercentageAmount,
                PercentageTaxAmount = dto.PercentageTaxAmount,
                TotalAmount = dto.TotalAmount,
                BalanceAmount = dto.BalanceAmount,
                FreightOrCarrierInsurance = dto.FreightOrCarrierInsurance,
                TotalGstAmount = dto.TotalGstAmount,
                GrandTotal = dto.GrandTotal,
                Items = dto.Items.Select(itemDto => new ProformaInvoiceItem
                {
                    ProductId = itemDto.ProductId > 0 ? itemDto.ProductId : null,
                    AccessoryId = itemDto.AccessoryId > 0 ? itemDto.AccessoryId : null,
                    HsnSacCode = itemDto.HsnSacCode,
                    Description = itemDto.Description,
                    Quantity = itemDto.Quantity,
                    Rate = itemDto.Rate,
                    Discount = itemDto.Discount ?? 0,
                    TaxPercentage = itemDto.TaxPercentage,
                    Total = itemDto.Total,
                    GstTax = itemDto.GstTax,
                    Price = itemDto.Price,
                    SelectedAccessories = (itemDto.AccessoryIds ?? new List<int>())
                .Select(aid => new ProformaInvoiceItemAccessory
                {
                    AccessoryId = aid
                }).ToList()

                }).ToList()
            };

            _context.Tbl_ProformaInvoices.Add(proformaInvoice);
            await _context.SaveChangesAsync();

            return proformaInvoice.ProformaInvoiceId;
        }

        public async Task<bool> UpdateAsync(int id, ProformaInvoiceDto dto)
        {
            var duplicateExists = await _context.Tbl_ProformaInvoices
            .AnyAsync(x =>
                x.ProformaInvoiceId != id &&
                !x.IsDeleted &&
                x.ProformaInvoiceNo.Trim().ToUpper() ==
                dto.ProformaInvoiceNo.Trim().ToUpper());

            if (duplicateExists)
            {
                throw new Exception("Proforma Invoice Number already exists.");
            }

            var existingPi = await _context.Tbl_ProformaInvoices
                .Include(pi => pi.Items)
                    .ThenInclude(i => i.SelectedAccessories)
                .FirstOrDefaultAsync(pi => pi.ProformaInvoiceId == id);

            if (existingPi == null) return false;

            existingPi.ProformaInvoiceDate = dto.ProformaInvoiceDate;
            existingPi.ProformaInvoiceExpiryDate = dto.ProformaInvoiceExpiryDate;
            existingPi.ProformaInvoiceNo = dto.ProformaInvoiceNo;

            existingPi.Subtotal = dto.Subtotal;
            existingPi.Percentage = dto.Percentage;
            existingPi.PercentageAmount = dto.PercentageAmount;
            existingPi.PercentageTaxAmount = dto.PercentageTaxAmount;
            existingPi.TotalAmount = dto.TotalAmount;
            existingPi.BalanceAmount = dto.BalanceAmount;
            existingPi.FreightOrCarrierInsurance = dto.FreightOrCarrierInsurance;
            existingPi.TotalGstAmount = dto.TotalGstAmount;
            existingPi.GrandTotal = dto.GrandTotal;

            existingPi.CustomerPO = dto.CustomerPO;
            existingPi.CustomerPODate = dto.CustomerPODate;
            existingPi.ConsigneeNameAndAddress = dto.ConsigneeNameAndAddress;
            existingPi.TermsAndConditions = dto.TermsAndConditions;
            existingPi.CustomerNotes = dto.CustomerNotes;

            existingPi.BankDetailId = dto.BankDetailId;
            existingPi.ServiceReportId = dto.ServiceReportId;


            _context.Tbl_ProformaInvoices.Update(existingPi);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var pi = await _context.Tbl_ProformaInvoices.FindAsync(id);

            if (pi == null)
            {
                return false;
            }

            pi.IsDeleted = true;
            _context.Tbl_ProformaInvoices.Update(pi);

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<ProformaInvoicePdfDto?> GetProformaInvoiceForPdfAsync(int proformaInvoiceId)
        {
            var invoice = await _context.Tbl_ProformaInvoices
                .Include(pi => pi.Items)
                    .ThenInclude(item => item.Product)
                .Include(pi => pi.Items)
                    .ThenInclude(item => item.Accessory)
                .Include(pi => pi.Customer)
                    .ThenInclude(c => c.Addresses)
                     .ThenInclude(a => a.State)
                .Include(pi => pi.Company)
                    .ThenInclude(c => c.Addresses)
                .Include(pi => pi.Company)
                    .ThenInclude(c => c.BankDetails)
                .Include(pi => pi.Vendor)
                .Include(i => i.PlaceOfSupply)
                .Include(pi => pi.Currency)
                .FirstOrDefaultAsync(pi => pi.ProformaInvoiceId == proformaInvoiceId);

            if (invoice == null) return null;

            var companyAddress = invoice.Company?.Addresses?.FirstOrDefault();
            var customerPrimaryAddress = invoice.Customer?.Addresses?.FirstOrDefault();
            var companyBankDetail = invoice.Company?.BankDetails?.FirstOrDefault();

            var totalCgst = invoice.TotalGstAmount / 2;
            var totalSgst = invoice.TotalGstAmount / 2;

            string FormatAddress(dynamic addr)
            {
                if (addr == null) return "N/A";
                string state = addr.State?.StateName ?? "";
                string country = addr.Country?.CountryName ?? "";

                return $"{addr.FlatBlockNo}, {addr.PremisesName}, {addr.Road}, {addr.Area}, {addr.Town}, {state}, {country} - {addr.PinNo}".Replace(", ,", ",");
            }

            var companyRange = companyAddress?.Town ?? "N/A";
            var companyDivision = companyAddress?.Town ?? "N/A";

            string finalSacCode = "N/A";
            string codeLabel = "HSN/SAC Code";


            // 🔹 Check whether this Proforma Invoice is generated from Service Invoice
            var serviceReport = await _context.Tbl_ServiceReports
             .Include(sr => sr.Items)
             .FirstOrDefaultAsync(sr => sr.Id == invoice.ServiceReportId);

            string? serviceSacCode = null;
            string? serviceDescription = null;

            if (serviceReport != null)
            {
                var serviceId = serviceReport.Items
                    .Where(x => x.ServiceId.HasValue)
                    .Select(x => x.ServiceId)
                    .FirstOrDefault();

                if (serviceId.HasValue)
                {
                    var serviceMaster = await _context.Tbl_ServiceMaster
                        .Where(x => x.ServiceId == serviceId.Value && !x.IsDeleted)
                        .Select(x => new
                        {
                            x.SACCode,
                            x.ServiceDescription
                        })
                        .FirstOrDefaultAsync();

                    if (serviceMaster != null)
                    {
                        serviceSacCode = serviceMaster.SACCode;
                        serviceDescription = serviceMaster.ServiceDescription;
                    }
                }
            }

            if (!string.IsNullOrWhiteSpace(serviceSacCode))
            {
                // ✅ SERVICE INVOICE
                finalSacCode = serviceSacCode;
                codeLabel = "SAC Code";
            }
            else
            {
                // ✅ ENQUIRY / PRODUCT INVOICE
                finalSacCode = invoice.Items
                    .Where(x => !string.IsNullOrWhiteSpace(x.HsnSacCode))
                    .Select(x => x.HsnSacCode)
                    .FirstOrDefault() ?? "N/A";

                codeLabel = "HSN/SAC Code";
            }

            var customerGstin = invoice.Customer?.GSTIN ?? "N/A";

            var customerStateCode = (!string.IsNullOrEmpty(customerGstin) && customerGstin.Length >= 2)
                ? customerGstin.Substring(0, 2)
                : "N/A";

            var dto = new ProformaInvoicePdfDto
            {
                CompanyName = invoice.Company?.CompanyName ?? "N/A",
                CompanyGstin = invoice.Company?.GSTIN ?? "N/A",
                CompanyPan = invoice.Company?.PAN ?? "N/A",
                Range = companyRange,
                Division = companyDivision,
                VendorCode = invoice.Customer?.VendorCode ?? "N/A",

                ProformaInvoiceNo = invoice.ProformaInvoiceNo,
                ProformaInvoiceDate = invoice.ProformaInvoiceDate.ToString("dd-MM-yyyy"),

                CustomerName = invoice.Customer?.CustomerName ?? "N/A",
                CustomerBillingAddress = FormatAddress(customerPrimaryAddress),
                CustomerPo = invoice.CustomerPO ?? "N/A",
                CustomerPoDate = invoice.CustomerPODate?.ToString("dd-MM-yyyy") ?? "N/A",
                CustomerGstn = invoice.Customer?.GSTIN ?? "N/A",
                CustomerStateCode = customerStateCode,
                CustomerState = customerPrimaryAddress?.State?.StateName ?? "N/A",
                ConsigneeDetails = invoice.ConsigneeNameAndAddress ?? "N/A",

                Subtotal = invoice.Subtotal,
                TotalCgst = totalCgst,
                TotalSgst = totalSgst,
                TotalGstAmount = invoice.TotalGstAmount,
                GrandTotal = invoice.GrandTotal,
                Percentage = invoice.Percentage,
                PercentageAmount = invoice.PercentageAmount,
                PercentageTaxAmount = invoice.PercentageTaxAmount,
                TotalAmount = invoice.TotalAmount,

                GrandTotalInWords = NumberToWords.ConvertAmount(invoice.GrandTotal),
                CgstInWords = NumberToWords.ConvertAmount(totalCgst),
                SgstInWords = NumberToWords.ConvertAmount(totalSgst),

                BankName = companyBankDetail?.BankName ?? "N/A",
                BankAddress = companyBankDetail?.BankAddress ?? "N/A",
                AccountNo = companyBankDetail?.AccountNo ?? "N/A",
                IfscCode = companyBankDetail?.IFSC ?? "N/A",
                SacCode = finalSacCode,
                CodeLabel = codeLabel,
                DescriptionOfTaxableService = serviceDescription ?? "N/A",

                CustomerPlaceOfSupply = invoice.PlaceOfSupply?.StateName ?? "N/A",

                //AuthorizedSignatoryName = "ROHAN HARIDAS PARDESHI",
                //DigitalSignatureDate = $"Date: {DateTime.Now:yyyy.MM.dd HH:mm:ss} +05:30",

                Items = invoice.Items.Select((item, index) => new InvoiceItemPdfDto
                {
                    SrNo = index + 1,

                    ItemType = item.AccessoryId.HasValue && item.AccessoryId > 0
                     ? "Accessory"
                     : item.ProductId.HasValue && item.ProductId > 0
                         ? "Product"
                         : "Unknown",
                    
                                ProductName = item.Product != null
                     ? $"{item.Product.ProductCode} - {item.Product.ProductName ?? "N/A"}"
                     : item.Accessory != null
                         ? $"{item.Accessory.AccessoriesCode} - {item.Accessory.AccessoriesName ?? "N/A"}"
                         : item.Description ?? "N/A",
                    
                                Description = item.Product != null
                     ? item.Product.ProductDescription ?? "N/A"
                     : item.Accessory != null
                     ? item.Accessory.AccessoriesDescription ?? "N/A"
                     : item.Description ?? "N/A",


                    Quantity = item.Quantity,
                            Rate = item.Rate,
                            Amount = item.Price
                        }).ToList()
                    };

            return dto;
        }

        public async Task<DummyInvoiceDto> GetDataForDummyInvoiceAsync(int proformaInvoiceId)
        {
            var pi = await _context.Tbl_ProformaInvoices
                .Include(x => x.Customer)
                .Include(x => x.CustomerContact)
                .Include(x => x.Currency)
                 .Include(x => x.Items)
                    .ThenInclude(i => i.Product)

                .Include(x => x.Items)
                    .ThenInclude(i => i.Accessory)

                .Include(x => x.Items)
                    .ThenInclude(i => i.SelectedAccessories)
                .Include(x => x.Items)
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.ProformaInvoiceId == proformaInvoiceId);

            if (pi == null) return null;

            var dummyDto = new DummyInvoiceDto
            {
                OriginalProformaInvoiceId = pi.ProformaInvoiceId,
                ProformaInvoiceNo = pi.ProformaInvoiceNo,
                ProformaInvoiceDate = DateTime.UtcNow,
                ProformaInvoiceExpiryDate = DateTime.UtcNow.AddDays(30),
                OrderAcceptanceId = pi.OrderAcceptanceId,
                ServiceReportId = pi.ServiceReportId,
                ProductGroupId = pi.GroupId,
                CompanyId = pi.CompanyId,
                VendorId = pi.VendorId,
                CompanyGroupId = pi.CompanyGroupId,
                CustomerId = pi.CustomerId,
                CustomerName = pi.Customer?.CustomerName,
                ResponsiblePersonId = pi.ResponsiblePersonId,
                ResponsiblePersonName = pi.CustomerContact?.ResPersonName,
                CurrencyId = pi.CurrencyId,
                CurrencySymbol = pi.Currency?.CurrencySymbol,
                PlaceOfSupplyId = pi.PlaceOfSupplyId,
                BankDetailId = pi.BankDetailId,
                CustomerPO = pi.CustomerPO,
                CustomerPODate = pi.CustomerPODate,
                ConsigneeNameAndAddress = pi.ConsigneeNameAndAddress,
                TermsAndConditions = pi.TermsAndConditions,
                CustomerNotes = pi.CustomerNotes,
                Subtotal = pi.Subtotal,
                Percentage = pi.Percentage,
                PercentageAmount = pi.PercentageAmount,
                PercentageTaxAmount = pi.PercentageTaxAmount,
                TotalAmount = pi.TotalAmount,
                BalanceAmount = pi.BalanceAmount,
                FreightOrCarrierInsurance = pi.FreightOrCarrierInsurance,
                TotalGstAmount = pi.TotalGstAmount,
                GrandTotal = pi.GrandTotal,
                Items = pi.Items
                .Select(i => new DummyInvoiceItemDto
                {
                    ProductId = i.ProductId,
                    AccessoryId = i.AccessoryId,

                    ItemType =
                    i.AccessoryId != null
                        ? "Accessory"
                        : i.ProductId != null
                            ? "Product"
                            : "Service",

                    ProductName = i.Product != null
                                ? i.Product.ProductName
                                : null,

                    AccessoryName = i.Accessory != null
                                    ? i.Accessory.AccessoriesName
                                    : null,

                    //ProductImage = i.Product != null
                    //            ? i.Product.ProductImage
                    //            : null,

                    HsnSacCode = i.HsnSacCode,
                    Description = i.Description,

                    Quantity = i.Quantity,
                    Rate = i.Rate,
                    Discount = i.Discount,
                    TaxPercentage = i.TaxPercentage,
                    Total = i.Total,
                    GstTax = i.GstTax,
                    Price = i.Price,

                     AccessoryIds = i.SelectedAccessories
                        .Select(a => a.AccessoryId)
                        .ToList()
                }).ToList()
            };
            return dummyDto;
        }

        public async Task<int> CreateDummyInvoiceAsync(DummyInvoiceDto dto)
        {

            var dummyInvoice = new DummyInvoice
            {
                OriginalProformaInvoiceId = dto.OriginalProformaInvoiceId,
                ServiceReportId = dto.ServiceReportId,
                DummyInvoiceNo = dto.ProformaInvoiceNo,
                DummyInvoiceDate = dto.ProformaInvoiceDate,
                OrderAcceptanceId = dto.OrderAcceptanceId,
                GroupId = dto.ProductGroupId,
                CompanyId = dto.CompanyId,
                VendorId = dto.VendorId,
                CompanyGroupId = dto.CompanyGroupId,
                CustomerId = dto.CustomerId,
                ResponsiblePersonId = dto.ResponsiblePersonId,
                CurrencyId = dto.CurrencyId,
                PlaceOfSupplyId = dto.PlaceOfSupplyId,
                BankDetailId = dto.BankDetailId,
                CustomerPO = dto.CustomerPO,
                CustomerPODate = dto.CustomerPODate,
                ConsigneeNameAndAddress = dto.ConsigneeNameAndAddress,
                TermsAndConditions = dto.TermsAndConditions,
                CustomerNotes = dto.CustomerNotes,
                Subtotal = dto.Subtotal,
                Percentage = dto.Percentage,
                PercentageAmount = dto.PercentageAmount,
                PercentageTaxAmount = dto.PercentageTaxAmount,
                TotalAmount = dto.TotalAmount,
                BalanceAmount = dto.BalanceAmount,
                FreightOrCarrierInsurance = dto.FreightOrCarrierInsurance,
                TotalGstAmount = dto.TotalGstAmount,
                GrandTotal = dto.GrandTotal,
                Items = dto.Items.Select(itemDto => new DummyInvoiceItem
                {
                    // For manual items, ProductId will be null/0 from the client
                    ProductId = itemDto.ProductId > 0 ? itemDto.ProductId : null,
                    Description = itemDto.Description,
                    HsnSacCode = itemDto.HsnSacCode,
                    Quantity = itemDto.Quantity,
                    Rate = itemDto.Rate,
                    Discount = itemDto.Discount,
                    TaxPercentage = itemDto.TaxPercentage,
                    Total = itemDto.Total,
                    GstTax = itemDto.GstTax,
                    Price = itemDto.Price
                    // No selected accessories as items are manual
                }).ToList()
            };

            _context.Tbl_DummyInvoices.Add(dummyInvoice);
            await _context.SaveChangesAsync();
            return dummyInvoice.DummyInvoiceId;
        }

        public async Task<List<DummyInvoiceListDto>> GetAllDummyInvoicesAsync()
        {
            var list = await _context.Tbl_DummyInvoices
                .Where(di => !di.IsDeleted)
                .Include(di => di.Customer)
                .Include(di => di.Currency)
                .OrderByDescending(di => di.CreatedOn)
                .Select(di => new DummyInvoiceListDto
                {
                    DummyInvoiceId = di.DummyInvoiceId,
                    OriginalProformaInvoiceId = di.OriginalProformaInvoiceId,
                    DummyInvoiceNo = di.DummyInvoiceNo,
                    CreatedDate = di.DummyInvoiceDate,
                    Date = di.DummyInvoiceDate.ToString("dd/MM/yyyy"),
                    CustomerName = di.Customer.CustomerName, // Get from included Customer entity
                    GrandTotal = di.GrandTotal,
                    TotalAmount = di.TotalAmount,
                    CurrencySymbol = di.Currency != null ? di.Currency.CurrencySymbol : "", // Get from included Currency entity
                    OriginalProformaInvoiceNo = _context.Tbl_ProformaInvoices
                                                    .Where(pi => pi.ProformaInvoiceId == di.OriginalProformaInvoiceId)
                                                    .Select(pi => pi.ProformaInvoiceNo)
                                                    .FirstOrDefault() ?? "N/A"
                })
                .AsNoTracking()
                .ToListAsync();

            return list;
        }

        public async Task<bool> ToggleStatusAsync(int id)
        {
            var invoice = await _context.Tbl_ProformaInvoices.FindAsync(id);
            if (invoice == null) return false;

            var today = DateTime.UtcNow.Date;

            // Logic: If already expired, set expiry to 30 days from now (Reactivate)
            if (invoice.ProformaInvoiceExpiryDate < today)
            {
                invoice.ProformaInvoiceExpiryDate = today.AddDays(30);
            }
            // If active, set expiry to yesterday (Deactivate)
            else
            {
                invoice.ProformaInvoiceExpiryDate = today.AddDays(-1);
            }

            _context.Tbl_ProformaInvoices.Update(invoice);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> HasDummyInvoiceAsync(int proformaInvoiceId)
        {
            return await _context.Tbl_DummyInvoices
                .AnyAsync(x => x.OriginalProformaInvoiceId == proformaInvoiceId && !x.IsDeleted);
        }


        public async Task<ProformaInvoicePdfDto?> GetDummyInvoiceForPdfAsync(int dummyInvoiceId)
        {
            // Fetch the main dummy invoice entity with its core related data
            var invoice = await _context.Tbl_DummyInvoices
                .Include(di => di.Items)
                    .ThenInclude(item => item.Product)
                .Include(di => di.Items)
                    .ThenInclude(item => item.Accessory)
                .Include(di => di.Customer)
                    .ThenInclude(c => c.Addresses)
                    .ThenInclude(a => a.State)
                .Include(di => di.Currency)
                .FirstOrDefaultAsync(di => di.DummyInvoiceId == dummyInvoiceId && !di.IsDeleted);

            if (invoice == null) return null;

            // --- Manually fetch related entities that don't have direct navigation properties ---

            // Fetch Company details
            var company = await _context.Tbl_Companies
                .Include(c => c.Addresses)
                .Include(c => c.BankDetails)
                .FirstOrDefaultAsync(c => c.CompanyId == invoice.CompanyId);

            // Fetch Vendor details (if VendorId exists)
            var vendor = invoice.VendorId.HasValue
                ? await _context.Tbl_Vendors.FirstOrDefaultAsync(v => v.Id == invoice.VendorId.Value)
                : null;

            // Fetch PlaceOfSupply details
            var placeOfSupply = await _context.Tbl_States
                .FirstOrDefaultAsync(s => s.Id == invoice.PlaceOfSupplyId);


            // --- Map to DTO ---

            var companyAddress = company?.Addresses?.FirstOrDefault();
            var customerPrimaryAddress = invoice.Customer?.Addresses?.FirstOrDefault();
            var companyBankDetail = company?.BankDetails?.FirstOrDefault();

            var totalCgst = invoice.TotalGstAmount / 2;
            var totalSgst = invoice.TotalGstAmount / 2;

            string FormatAddress(dynamic addr)
            {
                if (addr == null) return "N/A";
                // Assuming State and Country are loaded or available
                string stateName = addr.GetType().GetProperty("State")?.GetValue(addr)?.GetType().GetProperty("StateName")?.GetValue(addr.GetType().GetProperty("State").GetValue(addr)) as string ?? "";
                string countryName = addr.GetType().GetProperty("Country")?.GetValue(addr)?.GetType().GetProperty("CountryName")?.GetValue(addr.GetType().GetProperty("Country").GetValue(addr)) as string ?? "";

                return $"{addr.FlatBlockNo}, {addr.PremisesName}, {addr.Road}, {addr.Area}, {addr.Town}, {stateName}, {countryName} - {addr.PinNo}".Replace(", ,", ",").Trim();
            }

            var companyRange = companyAddress?.Town ?? "N/A";
            var companyDivision = companyAddress?.Town ?? "N/A";

            string finalSacCode = "N/A";
            string codeLabel = "HSN/SAC Code";


            // 🔹 Check whether this Proforma Invoice is generated from Service Invoice
            var serviceReport = await _context.Tbl_ServiceReports
              .Include(sr => sr.Items)
              .FirstOrDefaultAsync(sr => sr.Id == invoice.ServiceReportId);

            string? serviceSacCode = null;
            string? serviceDescription = null;

            if (serviceReport != null)
            {
                var serviceId = serviceReport.Items
                    .Where(x => x.ServiceId.HasValue)
                    .Select(x => x.ServiceId)
                    .FirstOrDefault();

                if (serviceId.HasValue)
                {
                    var serviceMaster = await _context.Tbl_ServiceMaster
                        .Where(x => x.ServiceId == serviceId.Value && !x.IsDeleted)
                        .Select(x => new
                        {
                            x.SACCode,
                            x.ServiceDescription
                        })
                        .FirstOrDefaultAsync();

                    if (serviceMaster != null)
                    {
                        serviceSacCode = serviceMaster.SACCode;
                        serviceDescription = serviceMaster.ServiceDescription;
                    }
                }
            }

            if (!string.IsNullOrWhiteSpace(serviceSacCode))
            {
                finalSacCode = serviceSacCode;
                codeLabel = "SAC Code";
            }
            else
            {
                finalSacCode = invoice.Items
                    .Where(x => !string.IsNullOrWhiteSpace(x.HsnSacCode))
                    .Select(x => x.HsnSacCode)
                    .FirstOrDefault() ?? "N/A";

                codeLabel = "HSN/SAC Code";
            }

            var customerGstin = invoice.Customer?.GSTIN ?? "N/A";

            var customerStateCode = (!string.IsNullOrEmpty(customerGstin) && customerGstin.Length >= 2)
                ? customerGstin.Substring(0, 2)
                : "N/A";

            // Reusing the ProformaInvoicePdfDto for consistency
            var dto = new ProformaInvoicePdfDto
            {
                CompanyName = company?.CompanyName ?? "N/A",
                CompanyGstin = company?.GSTIN ?? "N/A",
                CompanyPan = company?.PAN ?? "N/A",
                Range = companyRange,
                Division = companyDivision,
                VendorCode = invoice.Customer?.VendorCode ?? "N/A",

                // ** Mapping dummy invoice fields to proforma DTO fields **
                ProformaInvoiceNo = invoice.DummyInvoiceNo,
                ProformaInvoiceDate = invoice.DummyInvoiceDate.ToString("dd-MM-yyyy"),

                CustomerName = invoice.Customer?.CustomerName ?? "N/A",
                CustomerBillingAddress = FormatAddress(customerPrimaryAddress),
                CustomerPo = invoice.CustomerPO ?? "N/A",
                CustomerPoDate = invoice.CustomerPODate?.ToString("dd-MM-yyyy") ?? "N/A",
                CustomerGstn = invoice.Customer?.GSTIN ?? "N/A",
                CustomerStateCode = customerStateCode,
                CustomerState = customerPrimaryAddress?.State?.StateName ?? "N/A",
                ConsigneeDetails = invoice.ConsigneeNameAndAddress ?? "N/A",

                Subtotal = invoice.Subtotal,
                TotalCgst = totalCgst,
                TotalSgst = totalSgst,
                GrandTotal = invoice.GrandTotal,
                Percentage = invoice.Percentage,
                PercentageAmount = invoice.PercentageAmount,
                PercentageTaxAmount = invoice.PercentageTaxAmount,
                TotalAmount = invoice.TotalAmount,

                GrandTotalInWords = NumberToWords.ConvertAmount(invoice.GrandTotal),
                CgstInWords = NumberToWords.ConvertAmount(totalCgst),
                SgstInWords = NumberToWords.ConvertAmount(totalSgst),

                BankName = companyBankDetail?.BankName ?? "N/A",
                BankAddress = companyBankDetail?.BankAddress ?? "N/A",
                AccountNo = companyBankDetail?.AccountNo ?? "N/A",
                IfscCode = companyBankDetail?.IFSC ?? "N/A",
                SacCode = finalSacCode,
                CodeLabel = codeLabel,
                DescriptionOfTaxableService = serviceDescription ?? "N/A",
                CustomerPlaceOfSupply = placeOfSupply?.StateName ?? "N/A",

                //AuthorizedSignatoryName = "ROHAN HARIDAS PARDESHI", // Or from a config/user setting
                //DigitalSignatureDate = $"Date: {DateTime.Now:yyyy.MM.dd HH:mm:ss} +05:30",

                Items = invoice.Items.Select((item, index) => new InvoiceItemPdfDto
                {
                    SrNo = index + 1,
                    ItemType = item.AccessoryId.HasValue && item.AccessoryId > 0
                        ? "Accessory"
                        : item.ProductId.HasValue && item.ProductId > 0
                            ? "Product"
                            : "Unknown",

                    ProductName = item.Product != null
                        ? $"{item.Product.ProductCode} - {item.Product.ProductName ?? "N/A"}"
                        : item.Accessory != null
                            ? $"{item.Accessory.AccessoriesCode} - {item.Accessory.AccessoriesName ?? "N/A"}"
                            : item.Description ?? "N/A",

                    Description = item.Product != null
                        ? item.Product.ProductDescription ?? "N/A"
                        : item.Accessory != null
                            ? item.Accessory.AccessoriesDescription ?? "N/A"
                            : item.Description ?? "N/A",

                    Quantity = item.Quantity,
                    Rate = item.Rate,
                    Amount = item.Price // Assuming item.Price is the total amount (Qty * Rate - Discount)
                }).ToList()
            };

            return dto;
        }


        // Service Proforma Invoice

        public async Task<List<SelectOptionDto>> GetActiveServiceReportsAsync()
        {
            return await _context.Tbl_ServiceReports
                .Include(sr => sr.Customer)
                .Where(sr =>
                    !sr.IsDeleted &&
                           sr.OrderAcceptanceId.HasValue &&
                           sr.OrderAcceptanceId > 0
                )
                .OrderByDescending(sr => sr.Id)
                .Select(sr => new SelectOptionDto
                {
                    Value = sr.Id,
                    Label = sr.ReportNo + " (" +
                    (sr.Customer != null
                        ? sr.Customer.CustomerName
                        : "N/A") + ")"
                })
                .Distinct()
                .ToListAsync();
        }
        public async Task<ProformaInvoiceViewDto> GetDataFromServiceReportAsync(int serviceReportId)
        {

            var sr = await _context.Tbl_ServiceReports
                .Include(x => x.Items)
                .Include(x => x.Customer)
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == serviceReportId && !x.IsDeleted);

            if (sr == null) return null;

            var existingPINo = await _context.Tbl_ProformaInvoices
            .Where(x => !x.IsDeleted)
            .OrderByDescending(x => x.ProformaInvoiceId)
            .Select(x => x.ProformaInvoiceNo)
            .FirstOrDefaultAsync();

            var oa = await _context.Tbl_OrderAcceptances
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.OrderAcceptanceId == sr.OrderAcceptanceId);

            var offer = await _context.Tbl_OrderAcceptanceOffers
                .Where(x => x.OrderAcceptanceId == sr.OrderAcceptanceId)
                .OrderByDescending(x => x.Id)
                .AsNoTracking()
                .FirstOrDefaultAsync();

            var customerAddress = await _context.Tbl_CustomerAddress
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.CustomerId == sr.CustomerId && !a.IsDeleted);

            string consigneeAddress = customerAddress != null
                ? $"{sr.Customer?.CustomerName}, {customerAddress.Town}, {customerAddress.PinNo}"
                : sr.Customer?.CustomerName ?? "";

            var currencyId = offer?.CurrencyId ?? oa?.CurrencyId;
            var currencyDetails = await _context.Tbl_Currencies
                .Where(c => c.Id == currencyId)
                .Select(c => new { c.CurrencyName, c.CurrencySymbol })
                .FirstOrDefaultAsync();

            var responsiblePersonId = offer != null
            ? offer.ResponsiblePersonId
            : oa != null
                ? oa.ResponsiblePersonId
                : null;

            var responsiblePersonName = await _context.Tbl_CustomerContacts
                .Where(x => x.Id == responsiblePersonId)
                .Select(x => x.ResPersonName)
                .FirstOrDefaultAsync();

            var dto = new ProformaInvoiceViewDto
            {
                ProformaInvoiceNo = existingPINo ?? "",
                OrderAcceptanceId = sr.OrderAcceptanceId ?? 0,
                ProformaInvoiceDate = DateTime.Now,
                ProformaInvoiceExpiryDate = DateTime.Now.AddDays(7),

                CustomerId = sr.CustomerId,
                CustomerName = sr.Customer?.CustomerName,

                ResponsiblePersonId = responsiblePersonId,
                ResponsiblePersonName = responsiblePersonName ?? "N/A",

                ConsigneeNameAndAddress = consigneeAddress,

                CompanyId = offer?.CompanyId ?? oa?.CompanyId ?? 0,
                VendorId = offer?.VendorId ?? oa?.VendorId,
                CurrencyId = offer?.CurrencyId ?? oa?.CurrencyId ?? 1,
                CurrencyName = currencyDetails?.CurrencyName ?? "",
                CurrencySymbol = currencyDetails?.CurrencySymbol ?? "",

                ProductGroupId = offer?.ProductGroupId ?? oa?.ProductGroupId ?? 0,
                CompanyGroupId = offer?.CompanyGroupId ?? oa?.CompanyGroupId ?? 0,
                PlaceOfSupplyId = offer?.PlaceOfSupplyId ?? oa?.PlaceOfSupplyId ?? 0,
                BankDetailId = offer?.BankDetailId ?? oa?.BankDetailId ?? 0,

                CustomerPo = oa?.CustomerOrderNo,

                
                TermsAndConditions = offer?.TermsConditions ?? oa?.TermsConditions,
                CustomerNotes = offer?.CustomerNotes ?? sr.FinalComments,

                Subtotal = sr.Items.Sum(i => i.FinalPrice),

                FreightOrCarrierInsurance = offer?.FreightCharges ?? oa?.FreightCharges ?? 0,

                TotalGstAmount = 0, // (You can calculate later if needed)

                GrandTotal = sr.Items.Sum(i => i.FinalPrice)
                             + (offer?.FreightCharges ?? oa?.FreightCharges ?? 0),

                Items = sr.Items.Select(i => new ProformaInvoiceItemDto
                {
                    ItemType = i.ItemType,

                    ProductId = i.ProductId ?? 0,
                    AccessoryId = i.AccessoryId ?? 0,

                    ProductName =
                        i.ItemType == "Service"
                            ? i.Description
                            : null,

                    HsnSacCode = i.HsnSacCode,
                    Description = i.Description,

                    Quantity = i.Quantity,
                    Rate = i.Rate,

                    Discount = i.Discount,
                    TaxPercentage = i.TaxPercentage,

                    Total = i.FinalPrice,
                    GstTax = i.GstTax,
                    Price = i.FinalPrice,

                    AccessoryIds = new List<int>()
                }).ToList()
            };

            return dto;
        }

        public async Task<byte[]> GenerateExcelAsync(int id)
        {
            var invoice =
                await GetProformaInvoiceForPdfAsync(id);

            if (invoice == null)
                throw new Exception("Invoice not found.");

            return _excelService.GenerateProformaInvoiceExcel(invoice);
        }
    }
}
