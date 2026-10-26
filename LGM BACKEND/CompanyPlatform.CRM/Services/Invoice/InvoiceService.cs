using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.DTO.DummyInvoice;
using CompanyPlatform.Core.DTO.ProformaInvoice;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.Core.Models.CRM.FinalDummyInvoice;
using CompanyPlatform.Core.Models.CRM.Invoice;
using CompanyPlatform.CRM.DTO.Invoice;
using Microsoft.EntityFrameworkCore;

namespace CompanyPlatform.CRM.Services.Invoice
{
    public class InvoiceService : IInvoiceService
    {
        private readonly ApplicationDBContext _context;

        private readonly InvoiceExcelService _excelService;

        public InvoiceService(ApplicationDBContext context, InvoiceExcelService excelService)
        {
            _context = context;
            _excelService = excelService;
        }

        public async Task<IEnumerable<SelectableOrderAcceptanceDTO>> GetActiveOrderAcceptancesForInvoiceAsync()
        {
            var inrId = await _context.Tbl_Currencies
                .Where(c => c.CurrencyName == "INR" && !c.IsDeleted)
                .Select(c => c.Id)
                .FirstOrDefaultAsync();

            // Safety check
            if (inrId == 0)
                return new List<SelectableOrderAcceptanceDTO>();

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
                .Select(oa => new SelectableOrderAcceptanceDTO
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

        public async Task<OrderAcceptanceForInvoiceDTO> GetDataFromOrderAcceptanceAsync(int orderAcceptanceId)
        {
            var oa = await _context.Tbl_OrderAcceptances
                .Include(o => o.Items)
                    .ThenInclude(i => i.SelectedAccessories)
                .Include(o => o.SelectedOffers) // ✅ IMPORTANT
                .AsNoTracking()
                .FirstOrDefaultAsync(o => o.OrderAcceptanceId == orderAcceptanceId);

            var existingPINo = await _context.Tbl_Invoices
           .Where(x => !x.IsDeleted)
           .OrderByDescending(x => x.InvoiceId)
           .Select(x => x.InvoiceNo)
           .FirstOrDefaultAsync();

            if (oa == null) return null;

            // ✅ Take latest / first offer
            var offer = oa.SelectedOffers
                .OrderByDescending(o => o.Id) // latest offer (optional but recommended)
                .FirstOrDefault();

            return new OrderAcceptanceForInvoiceDTO
            {
                OrderAcceptanceId = oa.OrderAcceptanceId,
                InvoiceNo = existingPINo ?? "",
                ProductGroupId = offer?.ProductGroupId ?? oa.ProductGroupId,
                CompanyId = offer?.CompanyId ?? oa.CompanyId,
                VendorId = offer?.VendorId ?? oa.VendorId,
                CustomerId = offer?.CustomerId ?? oa.CustomerId,
                CompanyGroupId = offer?.CompanyGroupId ?? oa.CompanyGroupId,
                ResponsiblePersonId = offer?.ResponsiblePersonId ?? oa.ResponsiblePersonId,
                CurrencyId = offer?.CurrencyId ?? oa.CurrencyId,
                PlaceOfSupplyId = offer?.PlaceOfSupplyId ?? oa.PlaceOfSupplyId,
                BankDetailId = offer?.BankDetailId ?? oa.BankDetailId,
                ServiceId = offer?.ServiceId ?? oa.ServiceId,

                TermsConditions = offer?.TermsConditions ?? oa.TermsConditions,
                CustomerNotes = offer?.CustomerNotes ?? oa.CustomerNotes,
                ConsigneeNameAddress = offer?.Address ?? oa.Address,

                CustomerPo = oa.CustomerOrderNo,
                CompanyPoDate = offer?.OrderDate ?? oa.CustomerOrderDate,

                FreightCharges = offer?.FreightCharges ?? oa.FreightCharges ?? 0,

                Items = oa.Items.Select(item => new OrderAcceptanceItemForInvoiceDTO
                {
                    ItemType = item.ProductId.HasValue && item.ProductId > 0 ? "Product" : "Accessory",
                    ProductId = item.ProductId.HasValue && item.ProductId > 0 ? item.ProductId : null,
                    AccessoryId = item.ProductId.HasValue && item.ProductId > 0 ? null : item.AccessoryId,

                    Description = item.Description,
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
                    FinalPrice = item.Total,

                    // ✅ Accessories mapping
                    AccessoryIds = item.SelectedAccessories
                        .Select(sa => sa.AccessoryId)
                        .ToList()
                }).ToList()
            };
        }

        public async Task<int> SaveInvoiceAsync(SaveInvoiceDTO dto)
        {
            string invoiceNo = !string.IsNullOrWhiteSpace(dto.InvoiceNo)
            ? dto.InvoiceNo
            : await GenerateInvoiceNoAsync(dto.CompanyId);

            var invoiceExists = await _context.Tbl_Invoices
            .AnyAsync(x =>
                !x.IsDeleted &&
                x.InvoiceNo.Trim().ToUpper() == invoiceNo.Trim().ToUpper());

            if (invoiceExists)
            {
                throw new Exception("Invoice Number already exists. Duplicate invoice numbers are not allowed.");
            }

            var invoice = new CompanyPlatform.Core.Models.CRM.Invoice.Invoice
            {
                OrderAcceptanceId = dto.OrderAcceptanceId,
                InvoiceNo = invoiceNo,
                InvoiceDate = dto.InvoiceDate,
                InvoiceDueDate = dto.InvoiceDueDate,
                CustomerPo = dto.CustomerPo,
                CompanyPoDate = dto.CompanyPoDate,
                ConsigneeNameAddress = dto.ConsigneeNameAddress,
                Description = dto.Description,
                SubTotal = dto.SubTotal,
                FreightCharges = dto.FreightCharges,
                GrandTotal = dto.GrandTotal,
                AdvanceReceived = dto.AdvanceReceived,
                AdvanceAmount = dto.AdvanceAmount,
                BalanceAmount = dto.BalanceAmount,
                ProductGroupId = dto.ProductGroupId,
                CompanyId = dto.CompanyId,
                VendorId = dto.VendorId,
                CustomerId = dto.CustomerId,
                CompanyGroupId = dto.CompanyGroupId,
                ResponsiblePersonId = dto.ResponsiblePersonId,
                CurrencyId = dto.CurrencyId,
                PlaceOfSupplyId = dto.PlaceOfSupplyId,
                BankDetailId = dto.BankDetailId,
                ServiceId = dto.ServiceId,
                ServiceReportId = dto.ServiceReportId,
                TermsConditions = dto.TermsConditions,
                CustomerNotes = dto.CustomerNotes
            };

            _context.Tbl_Invoices.Add(invoice);
            await _context.SaveChangesAsync();

            foreach (var item in dto.Items)
            {
                var invoiceItem = new InvoiceItem
                {
                    InvoiceId = invoice.InvoiceId,
                    ItemType = item.ItemType ?? "Product",
                    ProductId = item.ItemType == "Product" ? item.ProductId : null,
                    AccessoryId = item.ItemType == "Accessory" ? item.AccessoryId : null,
                    Description = item.Description,
                    HsnSacCode = item.HsnSacCode,
                    Quantity = item.Quantity,
                    Rate = item.Rate,
                    Discount = item.Discount,
                    Total = item.Total,
                    GstAmount = item.GstAmount,
                    CgstAmount = item.CgstAmount,
                    SgstAmount = item.SgstAmount,
                    IgstAmount = item.IgstAmount,
                    Price = item.Price,
                    TaxPercentage = item.TaxPercentage
                };

                _context.Tbl_InvoiceItems.Add(invoiceItem);
                await _context.SaveChangesAsync();

                foreach (var accId in item.AccessoryIds)
                {
                    _context.Tbl_InvoiceItemAccessories.Add(new InvoiceItemAccessory
                    {
                        InvoiceItemId = invoiceItem.InvoiceItemId,
                        AccessoryId = accId
                    });
                }
            }

            await _context.SaveChangesAsync();

            //await DeductInventory(invoice.InvoiceId);  uncomment this when ERP start

            return invoice.InvoiceId;
        }

        private async Task DeductInventory(int invoiceId)
        {
            var invoice = await _context.Tbl_Invoices
                .Include(x => x.Items)
                    .ThenInclude(x => x.Accessories)
                .FirstOrDefaultAsync(x => x.InvoiceId == invoiceId);

            if (invoice == null)
                return;

            foreach (var item in invoice.Items)
            {
                //-----------------------------------------
                // PRODUCT
                //-----------------------------------------

                if (item.ProductId.HasValue)
                {
                    var product = await _context.Tbl_Products
                        .FirstOrDefaultAsync(x => x.ProductId == item.ProductId);

                    if (product != null)
                    {
                        if (product.AvailableQuantity < item.Quantity)
                            throw new Exception($"Insufficient stock for {product.ProductName}");

                        int previousStock = product.AvailableQuantity;

                        product.AvailableQuantity -= (int)item.Quantity;

                        _context.Tbl_InventoryTransactions.Add(new InventoryTransaction
                        {
                            ItemType = "Product",
                            ItemId = product.ProductId,
                            TransactionType = "Invoice Stock Out",
                            Quantity = (int)item.Quantity,
                            PreviousStock = previousStock,
                            NewStock = product.AvailableQuantity,

                            InvoiceId = invoice.InvoiceId,
                            ReferenceNo = invoice.InvoiceNo,

                            Remarks = "Invoice Generated",
                            Timestamp = DateTime.Now
                        });
                    }
                }

                if (item.AccessoryId.HasValue)
                {
                    var accessory = await _context.Tbl_Accessories
                        .FirstOrDefaultAsync(x => x.AccessoriesId == item.AccessoryId);

                    if (accessory != null)
                    {
                        int previousStock = accessory.AvailableQuantity;

                        accessory.AvailableQuantity -= (int)item.Quantity;

                        _context.Tbl_InventoryTransactions.Add(new InventoryTransaction
                        {
                            ItemType = "Accessory",
                            ItemId = accessory.AccessoriesId,
                            TransactionType = "Invoice Stock Out",
                            Quantity = (int)item.Quantity,
                            PreviousStock = previousStock,
                            NewStock = accessory.AvailableQuantity,
                            InvoiceId = invoice.InvoiceId,
                            ReferenceNo = invoice.InvoiceNo,
                            Remarks = "Invoice Generated",
                            Timestamp = DateTime.Now
                        });
                    }
                }

                //-----------------------------------------
                // ACCESSORIES
                //-----------------------------------------

                foreach (var accessoryItem in item.Accessories)
                {
                    var accessory = await _context.Tbl_Accessories
                        .FirstOrDefaultAsync(x => x.AccessoriesId == accessoryItem.AccessoryId);

                    if (accessory != null)
                    {
                        if (accessory.AvailableQuantity < item.Quantity)
                            throw new Exception($"Insufficient stock for {accessory.AccessoriesName}");

                        int previousStock = accessory.AvailableQuantity;

                        accessory.AvailableQuantity -= (int)item.Quantity;

                        _context.Tbl_InventoryTransactions.Add(new InventoryTransaction
                        {
                            ItemType = "Accessory",
                            ItemId = accessory.AccessoriesId,
                            TransactionType = "Invoice Stock Out",
                            Quantity = (int)item.Quantity,
                            PreviousStock = previousStock,
                            NewStock = accessory.AvailableQuantity,

                            InvoiceId = invoice.InvoiceId,
                            ReferenceNo = invoice.InvoiceNo,

                            Remarks = "Invoice Generated",
                            Timestamp = DateTime.Now
                        });
                    }
                }
            }

            await _context.SaveChangesAsync();
        }

        private async Task<string> GenerateInvoiceNoAsync(int companyId)
        {
            var company = await _context.Tbl_Companies
                .Where(c => c.CompanyId == companyId)
                .Select(c => c.CompanyName)
                .FirstOrDefaultAsync();

            if (string.IsNullOrEmpty(company))
                throw new Exception("Company not found");

            // Generate initials (GS / NT)
            var initials = string.Concat(company
                .Split(' ', StringSplitOptions.RemoveEmptyEntries)
                .Select(x => char.ToUpper(x[0])));

            if (initials.Length > 2)
                initials = initials.Substring(0, 2);

            // Financial year (2627)
            int year = DateTime.Now.Year;
            int nextYear = year + 1;
            string fy = $"{year % 100}{nextYear % 100}";

            string fyPart = $"/{fy}/";

            // Find last invoice for this financial year (ANY COMPANY)
            var lastInvoice = await _context.Tbl_Invoices
                .Where(i => i.InvoiceNo.Contains(fyPart))
                .OrderByDescending(i => i.InvoiceId)
                .FirstOrDefaultAsync();

            int nextSeq = 1;

            if (lastInvoice != null)
            {
                var parts = lastInvoice.InvoiceNo.Split('/');
                if (parts.Length == 3 && int.TryParse(parts[2], out int lastSeq))
                {
                    nextSeq = lastSeq + 1;
                }
            }

            return $"{initials}/{fy}/{nextSeq:D3}";
        }

        public async Task<List<InvoiceDTO>> GetAllInvoicesAsync()
        {
            var invoices = await _context.Tbl_Invoices
                .Where(i => !i.IsDeleted)
                .Include(i => i.Company)
                .Include(i => i.Vendor)
                .Include(i => i.Customer)
                .Include(i => i.Currency)
                .Include(i => i.CompanyGroup)
                .Include(i => i.ResponsiblePerson)
                .Include(i => i.PlaceOfSupply)
                .Include(i => i.ProductGroup)
                .Include(i => i.BankDetail)
                .Include(i => i.Items)
                .ThenInclude(item => item.Product)
                .Include(i => i.Items)
               .ThenInclude(item => item.Accessories)
               .ThenInclude(a => a.Accessory)
                .ToListAsync();

            var result = invoices.Select(invoice => new InvoiceDTO
            {
                InvoiceId = invoice.InvoiceId,
                InvoiceNo = invoice.InvoiceNo,
                InvoiceDate = invoice.InvoiceDate,
                InvoiceDueDate = invoice.InvoiceDueDate,
                CustomerPo = invoice.CustomerPo,
                CompanyPoDate = invoice.CompanyPoDate,
                ConsigneeNameAddress = invoice.ConsigneeNameAddress,
                Description = invoice.Description,
                TermsConditions = invoice.TermsConditions,
                CustomerNotes = invoice.CustomerNotes,
                ProductGroupId = invoice.ProductGroupId,
                ProductGroupName = invoice.ProductGroup.GroupName,
                CompanyId = invoice.CompanyId,
                CompanyName = invoice.Company.CompanyName,
                VendorId = invoice.VendorId,
                VendorName = invoice.Vendor.VendorName,
                CustomerId = invoice.CustomerId,
                CustomerName = invoice.Customer.CustomerName,
                CurrencyId = invoice.CurrencyId,
                CurrencyName = invoice.Currency.CurrencyName,
                CompanyGroupId = invoice.CompanyGroupId,
                CompanyGroupName = invoice.CompanyGroup?.CompanyGroupName,

                ResponsiblePersonId = invoice.ResponsiblePersonId,
                ResponsiblePersonName = invoice.ResponsiblePerson?.ResPersonName,

                PlaceOfSupplyId = invoice.PlaceOfSupplyId,
                PlaceOfSupplyName = invoice.PlaceOfSupply?.StateName,

                BankDetailId = invoice.BankDetailId,
                SubTotal = invoice.SubTotal,
                FreightCharges = invoice.FreightCharges,
                GrandTotal = invoice.GrandTotal,
                AdvanceReceived = invoice.AdvanceReceived,
                AdvanceAmount = invoice.AdvanceAmount,
                BalanceAmount = invoice.BalanceAmount,
                BankName = invoice.BankDetail?.BankName,
                BankAddress = invoice.BankDetail?.BankAddress,
                AccountNo = invoice.BankDetail?.AccountNo,
                IFSC = invoice.BankDetail?.IFSC,
                AccountHolderName = invoice.BankDetail?.AccountHolderName,

                Items = invoice.Items.Select(item => new InvoiceItemDTO
                {
                    ProductId = item.ProductId,
                    AccessoryId = item.AccessoryId,
                    ItemType = item.ItemType,
                    ProductName = item.Product?.ProductName ?? "N/A",
                    Description = item.Description,
                    HsnSacCode = item.HsnSacCode,
                    Quantity = item.Quantity,
                    Rate = item.Rate,
                    Discount = item.Discount,
                    Total = item.Total,
                    GstAmount = item.GstAmount,
                    CgstAmount = item.CgstAmount,
                    SgstAmount = item.SgstAmount,
                    IgstAmount = item.IgstAmount,
                    Price = item.Price,
                    TaxPercentage = item.TaxPercentage,
                    AccessoryIds = item.Accessories
                    .Select(a => a.AccessoryId)
                    .ToList(),
                    AccessoryNames = item.Accessories
                    .Select(a => a.Accessory.AccessoriesDescription)
                    .ToList()
                }).ToList()

            }).ToList();

            return result;
        }

        public async Task<InvoiceDTO> GetInvoiceByIdAsync(int invoiceId)
        {
            var invoice = await _context.Tbl_Invoices
                .Include(i => i.Company)
                .Include(i => i.Vendor)
                .Include(i => i.Customer)
                .Include(i => i.Currency)
                .Include(i => i.CompanyGroup)
                .Include(i => i.ResponsiblePerson)
                .Include(i => i.PlaceOfSupply)
                .Include(i => i.BankDetail)
                .Include(i => i.ProductGroup)
                .Include(i => i.Items)
                .ThenInclude(item => item.Product)
                .Include(i => i.Items)
                .ThenInclude(item => item.Accessories)
                .ThenInclude(a => a.Accessory)
                .FirstOrDefaultAsync(i => i.InvoiceId == invoiceId);

            if (invoice == null)
                return null;

            return new InvoiceDTO
            {
                InvoiceId = invoice.InvoiceId,
                InvoiceNo = invoice.InvoiceNo,
                InvoiceDate = invoice.InvoiceDate,
                InvoiceDueDate = invoice.InvoiceDueDate,
                CustomerPo = invoice.CustomerPo,
                CompanyPoDate = invoice.CompanyPoDate,
                ConsigneeNameAddress = invoice.ConsigneeNameAddress,
                Description = invoice.Description,
                TermsConditions = invoice.TermsConditions,
                CustomerNotes = invoice.CustomerNotes,
                ProductGroupId = invoice.ProductGroupId,
                ProductGroupName = invoice.ProductGroup.GroupName,
                CompanyId = invoice.CompanyId,
                CompanyName = invoice.Company.CompanyName,
                VendorId = invoice.VendorId,
                VendorName = invoice.Vendor.VendorName,
                CustomerId = invoice.CustomerId,
                CustomerName = invoice.Customer.CustomerName,
                CurrencyId = invoice.CurrencyId,
                CurrencyName = invoice.Currency.CurrencyName,
                CurrencySymbol = invoice.Currency.CurrencySymbol,
                CompanyGroupId = invoice.CompanyGroupId,
                CompanyGroupName = invoice.CompanyGroup?.CompanyGroupName,

                ResponsiblePersonId = invoice.ResponsiblePersonId,
                ResponsiblePersonName = invoice.ResponsiblePerson?.ResPersonName,

                PlaceOfSupplyId = invoice.PlaceOfSupplyId,
                PlaceOfSupplyName = invoice.PlaceOfSupply?.StateName,

                BankDetailId = invoice.BankDetailId,
                SubTotal = invoice.SubTotal,
                FreightCharges = invoice.FreightCharges,
                GrandTotal = invoice.GrandTotal,
                AdvanceReceived = invoice.AdvanceReceived,
                AdvanceAmount = invoice.AdvanceAmount,
                BalanceAmount = invoice.BalanceAmount,
                BankName = invoice.BankDetail?.BankName,
                BankAddress = invoice.BankDetail?.BankAddress,
                AccountNo = invoice.BankDetail?.AccountNo,
                IFSC = invoice.BankDetail?.IFSC,
                AccountHolderName = invoice.BankDetail?.AccountHolderName,

                Items = invoice.Items.Select(item => new InvoiceItemDTO
                {
                    ProductId = item.ProductId,
                    AccessoryId = item.AccessoryId,
                    ItemType = item.ItemType,
                    ProductName = item.Product?.ProductName ?? "N/A",
                    Description = item.Description,
                    HsnSacCode = item.HsnSacCode,
                    Quantity = item.Quantity,
                    Rate = item.Rate,
                    Discount = item.Discount,
                    Total = item.Total,
                    GstAmount = item.GstAmount,
                    CgstAmount = item.CgstAmount,
                    SgstAmount = item.SgstAmount,
                    IgstAmount = item.IgstAmount,
                    Price = item.Price,
                    TaxPercentage = item.TaxPercentage,
                    AccessoryIds = item.Accessories
                    .Select(a => a.AccessoryId)
                    .ToList(),
                    AccessoryNames = item.Accessories
                    .Select(a => $"{a.Accessory.AccessoriesCode} - {a.Accessory.AccessoriesDescription}")
                   .ToList()
                }).ToList()
            };
        }

        public async Task<int> UpdateInvoiceAsync(SaveInvoiceDTO dto)
        {
            var invoice = await _context.Tbl_Invoices
                .Include(i => i.Items)
                .ThenInclude(i => i.Accessories)
                .FirstOrDefaultAsync(i => i.InvoiceId == dto.InvoiceId);

            if (invoice == null)
                throw new Exception("Invoice not found");

            var invoiceExists = await _context.Tbl_Invoices
            .AnyAsync(x =>
                x.InvoiceId != dto.InvoiceId &&
                !x.IsDeleted &&
                x.InvoiceNo.Trim().ToUpper() == dto.InvoiceNo.Trim().ToUpper());

            if (invoiceExists)
            {
                throw new Exception("Invoice Number already exists. Duplicate invoice numbers are not allowed.");
            }

            // Update Invoice fields
            invoice.InvoiceNo = dto.InvoiceNo;
            invoice.InvoiceDate = dto.InvoiceDate;
            invoice.InvoiceDueDate = dto.InvoiceDueDate;
            invoice.CustomerPo = dto.CustomerPo;
            invoice.CompanyPoDate = dto.CompanyPoDate;
            invoice.ConsigneeNameAddress = dto.ConsigneeNameAddress;
            invoice.Description = dto.Description;
            invoice.SubTotal = dto.SubTotal;
            invoice.FreightCharges = dto.FreightCharges;
            invoice.GrandTotal = dto.GrandTotal;
            invoice.AdvanceReceived = dto.AdvanceReceived;
            invoice.AdvanceAmount = dto.AdvanceAmount;
            invoice.BalanceAmount = dto.BalanceAmount;
            invoice.ProductGroupId = dto.ProductGroupId;
            invoice.CompanyId = dto.CompanyId;
            invoice.VendorId = dto.VendorId;
            invoice.CustomerId = dto.CustomerId;
            invoice.CompanyGroupId = dto.CompanyGroupId;
            invoice.ResponsiblePersonId = dto.ResponsiblePersonId;
            invoice.CurrencyId = dto.CurrencyId;
            invoice.PlaceOfSupplyId = dto.PlaceOfSupplyId;
            invoice.BankDetailId = dto.BankDetailId;
            invoice.TermsConditions = dto.TermsConditions;
            invoice.CustomerNotes = dto.CustomerNotes;

            // Remove old items and accessories
            var existingItems = await _context.Tbl_InvoiceItems
                .Where(x => x.InvoiceId == invoice.InvoiceId)
                .ToListAsync();

            var existingAccessories = await _context.Tbl_InvoiceItemAccessories
                .Where(x => existingItems.Select(i => i.InvoiceItemId).Contains(x.InvoiceItemId))
                .ToListAsync();

            _context.Tbl_InvoiceItemAccessories.RemoveRange(existingAccessories);
            _context.Tbl_InvoiceItems.RemoveRange(existingItems);

            await _context.SaveChangesAsync();

            // Add new items
            foreach (var item in dto.Items)
            {
                var invoiceItem = new InvoiceItem
                {
                    InvoiceId = invoice.InvoiceId,
                    ItemType = item.ItemType ?? "Product",
                    ProductId = item.ItemType == "Product" ? item.ProductId : null,
                    AccessoryId = item.ItemType == "Accessory" ? item.AccessoryId : null,
                    Description = item.Description,
                    HsnSacCode = item.HsnSacCode,
                    Quantity = item.Quantity,
                    Rate = item.Rate,
                    Discount = item.Discount,
                    Total = item.Total,
                    GstAmount = item.GstAmount,
                    CgstAmount = item.CgstAmount,
                    SgstAmount = item.SgstAmount,
                    IgstAmount = item.IgstAmount,
                    Price = item.Price,
                    TaxPercentage = item.TaxPercentage
                };

                _context.Tbl_InvoiceItems.Add(invoiceItem);
                await _context.SaveChangesAsync();

                if (item.AccessoryIds != null)
                {
                    foreach (var accId in item.AccessoryIds)
                    {
                        _context.Tbl_InvoiceItemAccessories.Add(new InvoiceItemAccessory
                        {
                            InvoiceItemId = invoiceItem.InvoiceItemId,
                            AccessoryId = accId
                        });
                    }
                }
            }

            await _context.SaveChangesAsync();

            return invoice.InvoiceId;
        }

        public async Task<InvoicePdfDto?> GetInvoiceForPdfAsync(int invoiceId)
        {
            var invoice = await _context.Tbl_Invoices
                .Include(i => i.Items)
                .Include(i => i.Customer)
                    .ThenInclude(c => c.Addresses)
                //.ThenInclude(a => a.State)
                .Include(i => i.Company)
                    .ThenInclude(c => c.Addresses)
                //.ThenInclude(a => a.State)
                .Include(i => i.Vendor)
                .Include(i => i.PlaceOfSupply)
                .Include(i => i.Service)
                 .Include(i => i.ServiceReport)
                 .ThenInclude(sr => sr.Items)
                .FirstOrDefaultAsync(i => i.InvoiceId == invoiceId);
               

            if (invoice == null)
                return null;

            var companyAddressInfo = invoice.Company?.Addresses?.FirstOrDefault();
            var customerAddressInfo = invoice.Customer?.Addresses?.FirstOrDefault();
            var consigneeAddressInfo = customerAddressInfo;

            // ================= SAFE FORMAT FUNCTIONS =================
            string FormatAddress(dynamic address, string customerName)
            {
                if (address == null) return customerName ?? "N/A";

                return $"{customerName}\n" +
                       $"{address.FlatBlockNo}, {address.PremisesName}\n" +
                       $"{address.Road}, {address.Area}\n" +
                       $"{address.Town} - {address.PinNo}";
            }

            string FormatCompanyAddress(dynamic address)
            {
                if (address == null) return "N/A";

                // ✅ FIXED HERE (CompanyAddress fields)
                return $"S.no.{address.FlatBlock}, {address.Premises}, {address.Road}, {address.Area}, {address.Town} - {address.PinCode}";
            }


            // ================= CALCULATIONS =================
            decimal totalGst = invoice.Items?.Sum(x => x.GstAmount) ?? 0;

            bool isMaharashtra =
                invoice.PlaceOfSupply?.StateName?
                .Trim()
                .Equals("Maharashtra", StringComparison.OrdinalIgnoreCase) ?? false;

            decimal totalCgst = isMaharashtra ? totalGst / 2 : 0;
            decimal totalSgst = isMaharashtra ? totalGst / 2 : 0;
            decimal totalIgst = isMaharashtra ? 0 : totalGst;

            string ExtractStateCodeFromGstin(string gstin)
            {
                if (string.IsNullOrWhiteSpace(gstin) || gstin.Length < 2)
                    return "N/A";

                return gstin.Substring(0, 2);
            }

            string sacOrHsn = "N/A";
            string taxableServiceDescription = invoice.Description ?? "N/A";

            if (invoice.ServiceReportId != null && invoice.ServiceReport?.Items != null)
            {
                var serviceId = invoice.ServiceReport.Items
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
                        sacOrHsn = serviceMaster.SACCode ?? "N/A";
                        taxableServiceDescription =
                           !string.IsNullOrWhiteSpace(invoice.Description)
                               ? invoice.Description
                           : serviceMaster.ServiceDescription ?? "N/A";
                    }
                }
            }
            else if (invoice.ServiceId != null)
            {
                var serviceMaster = await _context.Tbl_ServiceMaster
                    .Where(x => x.ServiceId == invoice.ServiceId && !x.IsDeleted)
                    .Select(x => new
                    {
                        x.SACCode,
                        x.ServiceDescription
                    })
                    .FirstOrDefaultAsync();

                if (serviceMaster != null)
                {
                    sacOrHsn = serviceMaster.SACCode ?? "N/A";
                    taxableServiceDescription =
                     !string.IsNullOrWhiteSpace(invoice.Description)
                         ? invoice.Description
                         : serviceMaster.ServiceDescription ?? "N/A";
                }
            }
            else if (invoice.Items != null && invoice.Items.Any())
            {
                sacOrHsn = invoice.Items
                    .FirstOrDefault()?.HsnSacCode ?? "N/A";
            }


            var dto = new InvoicePdfDto
            {
                // COMPANY
                CompanyName = invoice.Company?.CompanyName?.ToUpper() ?? "N/A",
                CompanyAddress = FormatCompanyAddress(companyAddressInfo),
                CompanyGstin = invoice.Company?.GSTIN ?? "N/A",
                CompanyPan = invoice.Company?.PAN ?? "N/A",
                Range = companyAddressInfo?.Town ?? "N/A",
                Division = companyAddressInfo?.Town ?? "N/A",
                VendorCode = invoice.Customer?.VendorCode ?? "N/A",

                // INVOICE
                InvoiceNo = invoice.InvoiceNo,
                InvoiceDate = invoice.InvoiceDate.ToString("dd-MM-yyyy"),
                SacCode = sacOrHsn,
                TaxableServiceDescription = taxableServiceDescription,

                // BUYER
                BuyerName = invoice.Customer?.CustomerName ?? "N/A",
                BuyerAddress = FormatAddress(customerAddressInfo, invoice.Customer?.CustomerName),
                BuyerGstin = invoice.Customer?.GSTIN ?? "N/A",
                BuyerState = invoice.PlaceOfSupply?.StateName ?? "N/A",
                BuyerStateCode = ExtractStateCodeFromGstin(invoice.Customer?.GSTIN),
                CustomerPo = invoice.CustomerPo ?? "N/A",
                CompanyPoDate = invoice.CompanyPoDate.ToString("dd-MM-yyyy"),
                PlaceOfSupply = invoice.PlaceOfSupply?.StateName ?? "N/A",

                // CONSIGNEE
                ConsigneeName = invoice.Customer?.CustomerName ?? "N/A",
                ConsigneeAddress = FormatAddress(consigneeAddressInfo, invoice.Customer?.CustomerName),
                ConsigneeGstin = invoice.Customer?.GSTIN ?? "N/A",
                ConsigneeState = invoice.PlaceOfSupply?.StateName ?? "N/A",
                ConsigneeStateCode = ExtractStateCodeFromGstin(invoice.Customer?.GSTIN)
,

                // ITEMS
                Items = invoice.Items.Select((item, index) => new CompanyPlatform.CRM.DTO.Invoice.InvoiceItemPdfDto
                {
                    SrNo = index + 1,
                    Description = item.Description,
                    Quantity = item.Quantity,
                    Rate = item.Rate,
                    Amount = item.Total
                }).ToList(),

                // TOTALS
                ValueOfGoods = invoice.SubTotal,
                TotalCgst = totalCgst,
                TotalSgst = totalSgst,
                TotalIgst = totalIgst,
                GrandTotal = invoice.GrandTotal,

                AdvanceAmount = invoice.AdvanceAmount,
                BalanceAmount = invoice.BalanceAmount,

                // WORDS
                GrandTotalInWords = NumberToWords.ConvertAmount(invoice.GrandTotal),
                CgstInWords = NumberToWords.ConvertAmount(totalCgst),
                SgstInWords = NumberToWords.ConvertAmount(totalSgst),
                IgstInWords = NumberToWords.ConvertAmount(totalIgst),

                // FOOTER
                //AuthorizedSignatoryName = "ROHAN HARIDAS PARDESHI",
                //DigitalSignatureDate = $"Date: {DateTime.Now:yyyy.MM.dd HH:mm:ss} +05:30"
            };

            return dto;
        }

        public async Task<bool> DeleteInvoiceAsync(int invoiceId)
        {
            var invoice = await _context.Tbl_Invoices
                .FirstOrDefaultAsync(i => i.InvoiceId == invoiceId);

            if (invoice == null)
                return false;

            invoice.IsDeleted = true;

            _context.Tbl_Invoices.Update(invoice);

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<FinalDummyInvoiceDto> GetDataForFinalDummyInvoiceAsync(int invoiceId)
        {
            var inv = await _context.Tbl_Invoices
                .Include(x => x.Customer)
                .Include(x => x.ResponsiblePerson)
                .Include(x => x.Currency)
                .Include(x => x.Items)
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.InvoiceId == invoiceId);

            if (inv == null) return null;

            var dummyDto = new FinalDummyInvoiceDto
            {
                OriginalInvoiceId = inv.InvoiceId,
                OriginalInvoiceNo = inv.InvoiceNo,
                FinalDummyInvoiceDate = DateTime.UtcNow,
                ProductGroupId = inv.ProductGroupId,
                CompanyId = inv.CompanyId,
                VendorId = inv.VendorId,
                CompanyGroupId = inv.CompanyGroupId,
                CustomerId = inv.CustomerId,
                CustomerName = inv.Customer?.CustomerName,
                ResponsiblePersonId = inv.ResponsiblePersonId,
                ResponsiblePersonName = inv.ResponsiblePerson?.ResPersonName,
                CurrencyId = inv.CurrencyId,
                CurrencySymbol = inv.Currency?.CurrencySymbol,
                PlaceOfSupplyId = inv.PlaceOfSupplyId,
                BankDetailId = inv.BankDetailId,
                CustomerPo = inv.CustomerPo,
                CompanyPoDate = inv.CompanyPoDate,
                ConsigneeNameAddress = inv.ConsigneeNameAddress,
                TermsConditions = inv.TermsConditions,
                CustomerNotes = inv.CustomerNotes,
                SubTotal = inv.SubTotal,
                FreightCharges = inv.FreightCharges,
                TotalGstAmount = inv.Items.Sum(i => i.GstAmount), // Calculate from items
                AdvanceReceived = inv.AdvanceReceived,
                AdvanceAmount = inv.AdvanceAmount,
                BalanceAmount = inv.BalanceAmount,
                Items = inv.Items
                .Select(i => new FinalDummyInvoiceItemDto
                {
                    ProductId = i.ProductId,
                    AccessoryId = i.AccessoryId,
                    ItemType = i.ItemType,
                    Description = i.Description,
                    HsnSacCode = i.HsnSacCode,

                    Quantity = i.Quantity,
                    Rate = i.Rate,
                    Discount = i.Discount,

                    TaxPercentage = i.TaxPercentage,
                    Total = i.Total,
                    GstAmount = i.GstAmount,
                    Price = i.Price
                }).ToList()
            };
            return dummyDto;
        }

        public async Task<int> CreateFinalDummyInvoiceAsync(FinalDummyInvoiceDto dto)
        {
            var dummyInvoice = new FinalDummyInvoice
            {
                OriginalInvoiceId = dto.OriginalInvoiceId,
                FinalDummyInvoiceNo = dto.OriginalInvoiceNo,
                FinalDummyInvoiceDate = dto.FinalDummyInvoiceDate,
                ProductGroupId = dto.ProductGroupId,
                CompanyId = dto.CompanyId,
                VendorId = dto.VendorId,
                CompanyGroupId = dto.CompanyGroupId,
                CustomerId = dto.CustomerId,
                ResponsiblePersonId = dto.ResponsiblePersonId,
                CurrencyId = dto.CurrencyId,
                PlaceOfSupplyId = dto.PlaceOfSupplyId,
                BankDetailId = dto.BankDetailId,
                CustomerPo = dto.CustomerPo,
                CompanyPoDate = dto.CompanyPoDate,
                ConsigneeNameAddress = dto.ConsigneeNameAddress,
                TermsConditions = dto.TermsConditions,
                CustomerNotes = dto.CustomerNotes,
                SubTotal = dto.SubTotal,
                FreightCharges = dto.FreightCharges,
                TotalGstAmount = dto.TotalGstAmount,
                GrandTotal = dto.GrandTotal,
                AdvanceReceived = dto.AdvanceReceived,
                AdvanceAmount = dto.AdvanceAmount,
                BalanceAmount = dto.BalanceAmount,
                Items = dto.Items.Select(itemDto => new FinalDummyInvoiceItem
                {
                    ProductId = itemDto.ProductId,
                    AccessoryId = itemDto.AccessoryId,
                    ItemType = itemDto.ItemType,
                    Description = itemDto.Description,
                    HsnSacCode = itemDto.HsnSacCode,
                    Quantity = itemDto.Quantity,
                    Rate = itemDto.Rate,
                    Discount = itemDto.Discount,
                    TaxPercentage = itemDto.TaxPercentage,
                    Total = itemDto.Total,
                    GstAmount = itemDto.GstAmount,
                    Price = itemDto.Price
                }).ToList()
            };

            _context.Tbl_FinalDummyInvoices.Add(dummyInvoice);
            await _context.SaveChangesAsync();
            return dummyInvoice.FinalDummyInvoiceId;
        }

        public async Task<List<FinalDummyInvoiceListDto>> GetAllFinalDummyInvoicesAsync()
        {
            var list = await _context.Tbl_FinalDummyInvoices
                .Where(di => !di.IsDeleted)
                .Include(di => di.Customer)
                .Include(di => di.Currency)
                .OrderByDescending(di => di.CreatedOn)
                .Select(di => new FinalDummyInvoiceListDto
                {
                    FinalDummyInvoiceId = di.FinalDummyInvoiceId,
                    OriginalInvoiceId = di.OriginalInvoiceId,
                    FinalDummyInvoiceNo = di.FinalDummyInvoiceNo,
                    FinalDummyInvoiceDate = di.FinalDummyInvoiceDate,
                    CustomerName = di.Customer.CustomerName,
                    GrandTotal = di.GrandTotal,
                    AdvanceAmount = di.AdvanceAmount,
                    BalanceAmount = di.BalanceAmount,
                    CurrencySymbol = di.Currency != null ? di.Currency.CurrencyName : "",
                    OriginalInvoiceNo = _context.Tbl_Invoices
                                              .Where(pi => pi.InvoiceId == di.OriginalInvoiceId)
                                              .Select(pi => pi.InvoiceNo)
                                              .FirstOrDefault() ?? "N/A"
                })
                .AsNoTracking()
                .ToListAsync();

            return list;
        }

        public async Task<bool> CheckFinalDummyExistsAsync(int invoiceId)
        {
            return await _context.Tbl_FinalDummyInvoices
                                 .AnyAsync(di => di.OriginalInvoiceId == invoiceId && !di.IsDeleted);
        }

        public async Task<InvoicePdfDto?> GetDummyInvoiceForPdfAsync(int dummyInvoiceId)
        {
            var dummyInvoice = await _context.Tbl_FinalDummyInvoices
                .Include(i => i.Items)
                .Include(i => i.Customer)
                    .ThenInclude(c => c.Addresses)
                .Include(i => i.Company)
                    .ThenInclude(c => c.Addresses)
                .Include(i => i.Vendor)
                .Include(i => i.PlaceOfSupply)
                .FirstOrDefaultAsync(i => i.FinalDummyInvoiceId == dummyInvoiceId);

            if (dummyInvoice == null)
                return null;

            var originalInvoice = await _context.Tbl_Invoices
            .Include(i => i.ServiceReport)
                .ThenInclude(sr => sr.Items)
            .FirstOrDefaultAsync(i => i.InvoiceId == dummyInvoice.OriginalInvoiceId);

            var companyAddressInfo = dummyInvoice.Company?.Addresses?.FirstOrDefault();
            var customerAddressInfo = dummyInvoice.Customer?.Addresses?.FirstOrDefault();

            // ================= SAFE FORMAT FUNCTIONS (can be reused) =================
            string FormatAddress(dynamic address, string customerName)
            {
                if (address == null) return customerName ?? "N/A";
                return $"{customerName}\n" +
                       $"{address.FlatBlockNo}, {address.PremisesName}\n" +
                       $"{address.Road}, {address.Area}\n" +
                       $"{address.Town} - {address.PinNo}";
            }

            string FormatCompanyAddress(dynamic address)
            {
                if (address == null) return "N/A";
                return $"S.no.{address.FlatBlock}, {address.Premises}, {address.Road}, {address.Area}, {address.Town} - {address.PinCode}";
            }

            string ExtractStateCodeFromGstin(string gstin)
            {
                if (string.IsNullOrWhiteSpace(gstin) || gstin.Length < 2)
                    return "N/A";
                return gstin.Substring(0, 2);
            }

            decimal totalCgst = dummyInvoice.TotalGstAmount / 2;
            decimal totalSgst = dummyInvoice.TotalGstAmount / 2;
            decimal totalIgst = dummyInvoice.TotalGstAmount;

            // Use the first item's HSN code as the main one for the header
            string sacOrHsn = "N/A";
            string taxableServiceDescription =
                 originalInvoice?.Description ?? "N/A";

            if (originalInvoice?.ServiceReport != null)
            {
                var serviceId = originalInvoice.ServiceReport.Items
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
                        sacOrHsn = serviceMaster.SACCode ?? "N/A";
                        // Use original Invoice Description instead of Service Master Description
                        taxableServiceDescription =
                            !string.IsNullOrWhiteSpace(originalInvoice?.Description)
                                ? originalInvoice.Description
                                : serviceMaster.ServiceDescription ?? "N/A";
                    }
                }
            }
            else
            {
                sacOrHsn = dummyInvoice.Items?
                    .FirstOrDefault()?.HsnSacCode ?? "N/A";

                taxableServiceDescription =
                        originalInvoice?.Description ?? "N/A";
            }

            var dto = new InvoicePdfDto
            {
                // COMPANY
                CompanyName = dummyInvoice.Company?.CompanyName?.ToUpper() ?? "N/A",
                CompanyAddress = FormatCompanyAddress(companyAddressInfo),
                CompanyGstin = dummyInvoice.Company?.GSTIN ?? "N/A",
                CompanyPan = dummyInvoice.Company?.PAN ?? "N/A",
                Range = companyAddressInfo?.Town ?? "N/A",
                Division = companyAddressInfo?.Town ?? "N/A",
                VendorCode = dummyInvoice.Customer?.VendorCode ?? "N/A",

                // INVOICE
                InvoiceNo = dummyInvoice.FinalDummyInvoiceNo,
                InvoiceDate = dummyInvoice.FinalDummyInvoiceDate.ToString("dd-MM-yyyy"),
                SacCode = sacOrHsn,
                TaxableServiceDescription = taxableServiceDescription, // Use first item desc as fallback

                // BUYER
                BuyerName = dummyInvoice.Customer?.CustomerName ?? "N/A",
                BuyerAddress = FormatAddress(customerAddressInfo, dummyInvoice.Customer?.CustomerName),
                BuyerGstin = dummyInvoice.Customer?.GSTIN ?? "N/A",
                BuyerState = dummyInvoice.PlaceOfSupply?.StateName ?? "N/A",
                BuyerStateCode = ExtractStateCodeFromGstin(dummyInvoice.Customer?.GSTIN),
                CustomerPo = dummyInvoice.CustomerPo ?? "N/A",
                CompanyPoDate = dummyInvoice.CompanyPoDate?.ToString("dd-MM-yyyy") ?? "N/A",
                PlaceOfSupply = dummyInvoice.PlaceOfSupply?.StateName ?? "N/A",

                // CONSIGNEE
                ConsigneeName = dummyInvoice.Customer?.CustomerName ?? "N/A",
                ConsigneeAddress = dummyInvoice.ConsigneeNameAddress, // Use the stored consignee address
                ConsigneeGstin = dummyInvoice.Customer?.GSTIN ?? "N/A",
                ConsigneeState = dummyInvoice.PlaceOfSupply?.StateName ?? "N/A",
                ConsigneeStateCode = ExtractStateCodeFromGstin(dummyInvoice.Customer?.GSTIN),

                // ITEMS
                Items = dummyInvoice.Items.Select((item, index) => new CompanyPlatform.CRM.DTO.Invoice.InvoiceItemPdfDto
                {
                    SrNo = index + 1,
                    Description = item.Description,
                    Quantity = item.Quantity,
                    Rate = item.Rate,
                    Amount = item.Total
                }).ToList(),

                // TOTALS
                ValueOfGoods = dummyInvoice.SubTotal,
                TotalCgst = totalCgst,
                TotalSgst = totalSgst,
                TotalIgst = totalIgst,
                GrandTotal = dummyInvoice.GrandTotal,
                AdvanceAmount = dummyInvoice.AdvanceAmount,
                BalanceAmount = dummyInvoice.BalanceAmount,

                // WORDS
                GrandTotalInWords = NumberToWords.ConvertAmount(dummyInvoice.GrandTotal),
                CgstInWords = NumberToWords.ConvertAmount(totalCgst),
                SgstInWords = NumberToWords.ConvertAmount(totalSgst),
                IgstInWords = NumberToWords.ConvertAmount(totalIgst),

                // FOOTER
                //AuthorizedSignatoryName = "ROHAN HARIDAS PARDESHI",
                //DigitalSignatureDate = $"Date: {DateTime.Now:yyyy.MM.dd HH:mm:ss} +05:30"
            };

            return dto;
        }

        //service report invocie

        public async Task<IEnumerable<SelectableSerialNumberDTO>> GetServiceReportSerialNumbersAsync()
        {
            return await _context.Tbl_ServiceReports
                 .Include(sr => sr.Customer)
                .Where(sr => !sr.IsDeleted &&
                     sr.OrderAcceptanceId.HasValue &&
                     sr.OrderAcceptanceId > 0)
                .OrderByDescending(sr => sr.Id)
                .Select(sr => new SelectableSerialNumberDTO
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
        public async Task<ServiceReportInvoiceDTO> GetDataFromServiceReportAsync(int serviceReportId)
        {
            var sr = await _context.Tbl_ServiceReports
             .Include(x => x.Items)
             .Include(x => x.OrderAcceptance)
                 .ThenInclude(x => x.Items)
                     .ThenInclude(i => i.SelectedAccessories)
             .Include(x => x.OrderAcceptance)
                 .ThenInclude(x => x.SelectedOffers)
             .FirstOrDefaultAsync(x => x.Id == serviceReportId);

            if (sr == null)
                return null;

            var oa = sr.OrderAcceptance;
            var offer = oa?.SelectedOffers?.OrderByDescending(x => x.Id)?.FirstOrDefault();

            var lastInvoiceNo = await _context.Tbl_Invoices
            .OrderByDescending(x => x.InvoiceId) // or x.Id if your PK is Id
            .Select(x => x.InvoiceNo)
            .FirstOrDefaultAsync();

            bool isIntraState = false;
            var companyId = offer?.CompanyId ?? oa?.CompanyId;
            var placeOfSupplyId = offer?.PlaceOfSupplyId ?? oa?.PlaceOfSupplyId;

            return new ServiceReportInvoiceDTO
            {
                InvoiceNo = lastInvoiceNo,
                ProductGroupId = offer?.ProductGroupId ?? oa?.ProductGroupId,
                CompanyId = companyId,
                VendorId = offer?.VendorId ?? oa?.VendorId,
                CustomerId = offer?.CustomerId ?? oa?.CustomerId,
                CompanyGroupId = offer?.CompanyGroupId ?? oa?.CompanyGroupId,
                ResponsiblePersonId = offer?.ResponsiblePersonId ?? oa?.ResponsiblePersonId,
                CurrencyId = offer?.CurrencyId ?? oa?.CurrencyId,
                PlaceOfSupplyId = placeOfSupplyId,
                BankDetailId = offer?.BankDetailId ?? oa?.BankDetailId,
                ServiceId = null,
                ServiceReportId = sr.Id,
                TermsConditions = offer?.TermsConditions ?? oa?.TermsConditions,
                CustomerNotes = offer?.CustomerNotes ?? oa?.CustomerNotes,
                ConsigneeNameAddress = offer?.Address ?? oa?.Address,
                CustomerPo = oa?.CustomerOrderNo,
                CompanyPoDate = offer?.OrderDate ?? oa?.CustomerOrderDate,
                FreightCharges = offer?.FreightCharges ?? oa?.FreightCharges ?? 0,
                Items = oa.Items.Select(item => new OrderAcceptanceItemForInvoiceDTO
                {
                    ItemType = item.ProductId.HasValue && item.ProductId > 0
                      ? "Service"
                      : "Service",

                    ServiceId = item.ServiceId.HasValue && item.ServiceId > 0
                      ? null
                      : item.ServiceId,

                    Description = item.Description,
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

                    AccessoryIds = item.SelectedAccessories
                      .Select(a => a.AccessoryId)
                      .ToList()
                }).ToList()
            };
        }

        public async Task<IEnumerable<SelectableProformaInvoiceDTO>> GetActiveProformaInvoicesAsync()
        {
            return await _context.Tbl_ProformaInvoices
                .Where(x => !x.IsDeleted)
                .OrderByDescending(x => x.ProformaInvoiceId)
                .Select(x => new SelectableProformaInvoiceDTO
                {
                    Value = x.ProformaInvoiceId,
                    Label = x.ProformaInvoiceNo + " (" +
                            _context.Tbl_Customers
                                .Where(c => c.Id == x.CustomerId)
                                .Select(c => c.CustomerName)
                                .FirstOrDefault() + ")"
                })
                .ToListAsync();
        }

        public async Task<OrderAcceptanceForInvoiceDTO> GetDataFromProformaInvoiceAsync(int proformaInvoiceId)
        {
            var pi = await _context.Tbl_ProformaInvoices
                .Include(x => x.Items)
                    .ThenInclude(i => i.SelectedAccessories)
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.ProformaInvoiceId == proformaInvoiceId);

            if (pi == null)
                return null;

            var lastInvoiceNo = await _context.Tbl_Invoices
            .OrderByDescending(x => x.InvoiceId) // Use Id if your PK is Id
            .Select(x => x.InvoiceNo)
            .FirstOrDefaultAsync();

            return new OrderAcceptanceForInvoiceDTO
            {
                InvoiceNo = lastInvoiceNo,
                ProductGroupId = pi.GroupId,
                CompanyId = pi.CompanyId,
                VendorId = pi.VendorId ?? 0,
                CustomerId = pi.CustomerId,
                CompanyGroupId = pi.CompanyGroupId,
                ResponsiblePersonId = pi.ResponsiblePersonId,
                CurrencyId = pi.CurrencyId,
                PlaceOfSupplyId = pi.PlaceOfSupplyId,
                BankDetailId = pi.BankDetailId,

                TermsConditions = pi.TermsAndConditions,
                CustomerNotes = pi.CustomerNotes,
                ConsigneeNameAddress = pi.ConsigneeNameAndAddress,

                CustomerPo = pi.CustomerPO,
                CompanyPoDate = pi.CustomerPODate,

                FreightCharges = pi.FreightOrCarrierInsurance,

                Items = pi.Items.Select(item => new OrderAcceptanceItemForInvoiceDTO
                {
                    ItemType =
                    !string.IsNullOrWhiteSpace(item.HsnSacCode)
                        ? (item.ProductId.HasValue && item.ProductId > 0
                            ? "Product"
                            : "Accessory")
                        : "Service",

                    ProductId = item.ProductId,
                    AccessoryId = item.AccessoryId,
                    ServiceId = item.ProductId == null &&
                        item.AccessoryId == null
                        ? 1
                        : null,

                    Description = item.Description,
                    HsnSacCode = !string.IsNullOrWhiteSpace(item.HsnSacCode)
                                ? item.HsnSacCode
                                : item.Description,

                    Quantity = item.Quantity,
                    Rate = item.Rate,
                    Discount = item.Discount,

                    TaxPercentage = item.TaxPercentage,

                    Total = item.Total,
                    GstAmount = item.GstTax,

                    CgstAmount = pi.PlaceOfSupplyId == 0
                        ? 0
                        : item.GstTax / 2,

                    SgstAmount = pi.PlaceOfSupplyId == 0
                        ? 0
                        : item.GstTax / 2,

                    IgstAmount = 0,

                    FinalPrice = item.Price,

                    AccessoryIds = item.SelectedAccessories
                        .Select(a => a.AccessoryId)
                        .ToList()
                }).ToList()
            };
        }

        public async Task<byte[]> ExportInvoiceExcelAsync(int invoiceId)
        {
            var invoice = await GetInvoiceForPdfAsync(invoiceId);

            if (invoice == null)
                throw new Exception("Invoice not found");

            return _excelService.GenerateInvoiceExcel(invoice);
        }

    }
}
