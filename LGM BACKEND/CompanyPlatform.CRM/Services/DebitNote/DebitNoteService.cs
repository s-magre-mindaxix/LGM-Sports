using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models.CRM.DebitNote;
using CompanyPlatform.Core.Models.CRM.Invoice;
using CompanyPlatform.CRM.DTO.DebitNote;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.DebitNote
{
    public class DebitNoteService : IDebitNoteService
    {
        private readonly ApplicationDBContext _context;

        private readonly DebitNoteExcelService _excelService;

        public DebitNoteService(ApplicationDBContext context, DebitNoteExcelService excelService)
        {
            _context = context;
            _excelService = excelService;
        }

        public async Task<List<InvoiceDropdownDtos>> GetInvoiceDropdownAsync()
        {
            return await _context.Tbl_Invoices
                .Where(x => !x.IsDeleted)
                .Select(x => new InvoiceDropdownDtos
                {
                    InvoiceId = x.InvoiceId,
                    InvoiceNo = x.InvoiceNo
                })
                .ToListAsync();
        }

        public async Task<DebitNoteDto> GetInvoiceForDebitNoteAsync(int invoiceId)
        {
            var invoice = await _context.Tbl_Invoices
                .Include(x => x.Items)
                .FirstOrDefaultAsync(x => x.InvoiceId == invoiceId);

            if (invoice == null)
                return null;

            var customer = await _context.Tbl_Customers
                .FirstOrDefaultAsync(c => c.Id == invoice.CustomerId);

            var company = await _context.Tbl_Companies
                .FirstOrDefaultAsync(c => c.CompanyId == invoice.CompanyId);

            var vendor = await _context.Tbl_Vendors
                .FirstOrDefaultAsync(v => v.Id == invoice.VendorId);

            var bank = await _context.Tbl_CompanyBankDetails
                .FirstOrDefaultAsync(b => b.BankDetailId == invoice.BankDetailId);

            var currency = await _context.Tbl_Currencies
                .FirstOrDefaultAsync(c => c.Id == invoice.CurrencyId);

            var group = await _context.Tbl_ProductGroups
                .FirstOrDefaultAsync(g => g.Id == invoice.ProductGroupId);

            var companyGroup = await _context.Tbl_CompanyGroups
                .FirstOrDefaultAsync(g => g.Id == invoice.CompanyGroupId);

            var place = await _context.Tbl_States
                .FirstOrDefaultAsync(p => p.Id == invoice.PlaceOfSupplyId);

            return new DebitNoteDto
            {
                InvoiceId = invoice.InvoiceId,
                InvoiceNo = invoice.InvoiceNo,
                InvoiceDate = invoice.InvoiceDate,
                InvoiceDueDate = invoice.InvoiceDueDate,

                CustomerPo = invoice.CustomerPo,
                CompanyPoDate = invoice.CompanyPoDate,

                ConsigneeNameAddress = invoice.ConsigneeNameAddress,
                Description = invoice.Description,

                CompanyName = company?.CompanyName ?? "N/A",
                CompanyGroupName = companyGroup?.CompanyGroupName ?? "N/A",
                ProductGroupName = group?.GroupName ?? "N/A",

                CustomerName = customer?.CustomerName ?? "N/A",

                VendorName = vendor?.VendorName ?? "N/A",

                CurrencyName = currency?.CurrencyName ?? "INR",
                CurrencySymbol = currency?.CurrencySymbol ?? "₹",

                BankName = bank?.BankName ?? "N/A",
                AccountNo = bank?.AccountNo ?? "N/A",
                Ifsc = bank?.IFSC ?? "N/A",

                PlaceOfSupplyName = place?.StateName ?? "N/A",

                SubTotal = invoice.SubTotal,
                FreightCharges = invoice.FreightCharges,
                GrandTotal = invoice.GrandTotal,

                AdvanceAmount = invoice.AdvanceAmount,
                BalanceAmount = invoice.BalanceAmount,

                UpdatedBalanceAmount = invoice.GrandTotal,

                Items = invoice.Items.Select(i =>
                    new DebitNoteItemDto
                    {
                        ProductId = i.ProductId,
                        Description = i.Description,
                        HsnSacCode = i.HsnSacCode,
                        Quantity = i.Quantity,
                        Rate = i.Rate,
                        Total = i.Total,
                        GstAmount = i.GstAmount,
                        CgstAmount = i.CgstAmount,
                        SgstAmount = i.SgstAmount,
                        IgstAmount = i.IgstAmount,
                        Price = i.Price,
                        ItemType = i.ItemType
                    }).ToList()
            };
        }

        public async Task<int> CreateAsync(CreateDebitNoteDto dto)
        {
            var invoice = await _context.Tbl_Invoices
                .Include(x => x.Items)
                .FirstOrDefaultAsync(x => x.InvoiceId == dto.InvoiceId);

            if (invoice == null)
                throw new Exception("Invoice Not Found");

            var debitNote = new Core.Models.CRM.DebitNote.DebitNote
            {
                DebitNoteNo = dto.DebitNoteNo,
                DebitNoteDate = DateTime.Now,

                InvoiceId = invoice.InvoiceId,
                InvoiceNo = invoice.InvoiceNo,
                InvoiceDate = invoice.InvoiceDate,
                InvoiceDueDate = invoice.InvoiceDueDate,

                CustomerPo = invoice.CustomerPo,
                CompanyPoDate = invoice.CompanyPoDate,
                ConsigneeNameAddress = invoice.ConsigneeNameAddress,
                Description = invoice.Description,

                SubTotal = invoice.SubTotal,
                FreightCharges = invoice.FreightCharges,
                GrandTotal = invoice.GrandTotal,

                AdvanceAmount = invoice.AdvanceAmount,
                AdvanceReceived = invoice.AdvanceReceived,
                BalanceAmount = invoice.BalanceAmount,

                ProductGroupId = invoice.ProductGroupId,
                CompanyId = invoice.CompanyId,
                VendorId = invoice.VendorId,
                CustomerId = invoice.CustomerId,
                CompanyGroupId = invoice.CompanyGroupId,
                ResponsiblePersonId = invoice.ResponsiblePersonId,

                CurrencyId = invoice.CurrencyId,
                PlaceOfSupplyId = invoice.PlaceOfSupplyId,
                BankDetailId = invoice.BankDetailId,

                ServiceId = invoice.ServiceId,
                ServiceReportId = invoice.ServiceReportId,

                TermsConditions = invoice.TermsConditions,
                CustomerNotes = invoice.CustomerNotes,
                FinalNote = invoice.FinalNote ?? "",

                AdjustAmount = dto.AdjustAmount,

                DebitNoteAmount = dto.AdjustAmount,

                UpdatedBalanceAmount =
                    invoice.GrandTotal + dto.AdjustAmount,

                DebitReason = dto.DebitReason,

                Items = new List<DebitNoteItem>()
            };

            foreach (var item in invoice.Items)
            {
                debitNote.Items.Add(new DebitNoteItem
                {
                    ProductId = item.ProductId,
                    AccessoryId = item.AccessoryId,
                    ItemType = item.ItemType,
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
                });
            }

            _context.Tbl_DebitNotes.Add(debitNote);

            await _context.SaveChangesAsync();

            return debitNote.DebitNoteId;
        }

        public async Task<List<DebitNoteDto>> GetAllAsync()
        {
            return await _context.Tbl_DebitNotes
                .Where(x => !x.IsDeleted)
                .Select(x => new DebitNoteDto
                {
                    DebitNoteId = x.DebitNoteId,
                    DebitNoteNo = x.DebitNoteNo,
                    DebitNoteDate = x.DebitNoteDate,
                    InvoiceNo = x.InvoiceNo,
                    AdjustAmount = x.AdjustAmount,
                    UpdatedBalanceAmount = x.UpdatedBalanceAmount,
                    DebitReason = x.DebitReason
                })
                .ToListAsync();
        }

        public async Task<DebitNoteDto> GetByIdAsync(int debitNoteId)
        {
            var data = await _context.Tbl_DebitNotes
                .Include(x => x.Items)
                .FirstOrDefaultAsync(x =>
                    x.DebitNoteId == debitNoteId);

            if (data == null)
                return null;

            var customer = await _context.Tbl_Customers
             .FirstOrDefaultAsync(c => c.Id == data.CustomerId);

            var company = await _context.Tbl_Companies
                .FirstOrDefaultAsync(c => c.CompanyId == data.CompanyId);

            var vendor = await _context.Tbl_Vendors
                .FirstOrDefaultAsync(v => v.Id == data.VendorId);

            var bank = await _context.Tbl_CompanyBankDetails
                .FirstOrDefaultAsync(b => b.BankDetailId == data.BankDetailId);

            var currency = await _context.Tbl_Currencies
                .FirstOrDefaultAsync(c => c.Id == data.CurrencyId);

            var group = await _context.Tbl_ProductGroups
                .FirstOrDefaultAsync(g => g.Id == data.ProductGroupId);

            var companyGroup = await _context.Tbl_CompanyGroups
                .FirstOrDefaultAsync(g => g.Id == data.CompanyGroupId);

            var place = await _context.Tbl_States
                .FirstOrDefaultAsync(p => p.Id == data.PlaceOfSupplyId);

            return new DebitNoteDto
            {
                DebitNoteId = data.DebitNoteId,
                DebitNoteNo = data.DebitNoteNo,
                DebitNoteDate = data.DebitNoteDate,
                InvoiceId = data.InvoiceId,
                InvoiceNo = data.InvoiceNo,
                InvoiceDate = data.InvoiceDate,
                InvoiceDueDate = data.InvoiceDueDate,
                CustomerPo = data.CustomerPo,
                CompanyPoDate = data.CompanyPoDate,
                ConsigneeNameAddress = data.ConsigneeNameAddress,
                Description = data.Description,
                CompanyName = company?.CompanyName ?? "N/A",
                CompanyGroupName = companyGroup?.CompanyGroupName ?? "N/A",
                ProductGroupName = group?.GroupName ?? "N/A",
                CustomerName = customer?.CustomerName ?? "N/A",
                VendorName = vendor?.VendorName ?? "N/A",
                CurrencyName = currency?.CurrencyName ?? "INR",
                CurrencySymbol = currency?.CurrencySymbol ?? "₹",
                BankName = bank?.BankName ?? "N/A",
                AccountNo = bank?.AccountNo ?? "N/A",
                Ifsc = bank?.IFSC ?? "N/A",
                PlaceOfSupplyName = place?.StateName ?? "N/A",
                SubTotal = data.SubTotal,
                FreightCharges = data.FreightCharges,
                GrandTotal = data.GrandTotal,
                AdvanceAmount = data.AdvanceAmount,
                BalanceAmount = data.BalanceAmount,
                AdjustAmount = data.AdjustAmount,
                UpdatedBalanceAmount = data.UpdatedBalanceAmount,
                DebitReason = data.DebitReason,

                Items = data.Items.Select(i =>
                  new DebitNoteItemDto
                  {
                      DebitNoteItemId = i.DebitNoteItemId,
                      ProductId = i.ProductId,
                      Description = i.Description,
                      HsnSacCode = i.HsnSacCode,
                      Quantity = i.Quantity,
                      Rate = i.Rate,
                      Total = i.Total,
                      GstAmount = i.GstAmount,
                      CgstAmount = i.CgstAmount,
                      SgstAmount = i.SgstAmount,
                      IgstAmount = i.IgstAmount,
                      Price = i.Price,
                      ItemType = i.ItemType
                  }).ToList()
            };
        }

        public async Task<bool> UpdateAsync(
            int debitNoteId,
            CreateDebitNoteDto dto)
        {
            var debitNote = await _context.Tbl_DebitNotes
                .FirstOrDefaultAsync(x =>
                    x.DebitNoteId == debitNoteId);

            if (debitNote == null)
                return false;

            debitNote.DebitNoteNo = dto.DebitNoteNo;

            debitNote.AdjustAmount =
                dto.AdjustAmount;

            debitNote.DebitNoteAmount =
                dto.AdjustAmount;

            debitNote.UpdatedBalanceAmount =
                debitNote.GrandTotal +
                dto.AdjustAmount;

            debitNote.DebitReason =
                dto.DebitReason;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteAsync(int debitNoteId)
        {
            var debitNote = await _context.Tbl_DebitNotes
                .FirstOrDefaultAsync(x =>
                    x.DebitNoteId == debitNoteId);

            if (debitNote == null)
                return false;

            debitNote.IsDeleted = true;

            await _context.SaveChangesAsync();

            return true;
        }

        private async Task<string> GenerateDebitNoteNo()
        {
            var count =
                await _context.Tbl_DebitNotes.CountAsync();

            return $"DN-{(count + 1):D2}";
        }

        public async Task<DebitNotePdfDto?> GetDebitNotePdfAsync(int debitNoteId)
        {
            var debitNote = await _context.Tbl_DebitNotes
                .Include(x => x.Items)
                .FirstOrDefaultAsync(x =>
                    x.DebitNoteId == debitNoteId &&
                    !x.IsDeleted);

            if (debitNote == null)
                return null;

            var customer = await _context.Tbl_Customers
                .Include(x => x.Addresses)
                .FirstOrDefaultAsync(x => x.Id == debitNote.CustomerId);

            var company = await _context.Tbl_Companies
                .Include(x => x.Addresses)
                .FirstOrDefaultAsync(x => x.CompanyId == debitNote.CompanyId);

            var placeOfSupply = await _context.Tbl_States
                .FirstOrDefaultAsync(x => x.Id == debitNote.PlaceOfSupplyId);

            var bank = await _context.Tbl_CompanyBankDetails
                .FirstOrDefaultAsync(x => x.BankDetailId == debitNote.BankDetailId);

            var companyAddress = company?.Addresses?.FirstOrDefault();

            var customerAddress = customer?.Addresses?.FirstOrDefault();

            string FormatAddress(dynamic address, string name)
            {
                if (address == null)
                    return name ?? "N/A";

                return $"{name}\n" +
                       $"{address.FlatBlockNo}, {address.PremisesName}\n" +
                       $"{address.Road}, {address.Area}\n" +
                       $"{address.Town} - {address.PinNo}";
            }

            string FormatCompanyAddress(dynamic address)
            {
                if (address == null)
                    return "N/A";

                return $"S.no.{address.FlatBlock}, {address.Premises}, {address.Road}, {address.Area}, {address.Town} - {address.PinCode}";
            }

            string ExtractStateCodeFromGstin(string gstin)
            {
                if (string.IsNullOrWhiteSpace(gstin) || gstin.Length < 2)
                    return "N/A";

                return gstin.Substring(0, 2);
            }

            string sacCode = debitNote.Items
                .FirstOrDefault()?.HsnSacCode ?? "N/A";

            decimal debitAmount = debitNote.DebitNoteAmount;

            // If Debit Note Amount is zero, show Bill Amount instead
            decimal amountToDisplay =
                debitAmount > 0
                    ? debitAmount
                    : debitNote.GrandTotal;

            return new DebitNotePdfDto
            {
                DebitNoteId = debitNote.DebitNoteId,
                DebitNoteNo = debitNote.DebitNoteNo,
                DebitNoteDate = debitNote.DebitNoteDate,
                InvoiceId = debitNote.InvoiceId,
                InvoiceNo = debitNote.InvoiceNo,
                InvoiceDate = debitNote.InvoiceDate,
                CompanyName = company?.CompanyName ?? "N/A",
                CompanyAddress = FormatCompanyAddress(companyAddress),
                GstNo = company?.GSTIN ?? "N/A",
                PanNo = company?.PAN ?? "N/A",
                Range = companyAddress?.Town ?? "N/A",
                Division = companyAddress?.Town ?? "N/A",
                //Commissionerate = companyAddress?.Town ?? "N/A",
                ReturnDebitTo = customer?.CustomerName ?? "N/A",
                CustomerAddress = FormatAddress(
                    customerAddress,
                    customer?.CustomerName),
                GstnNo = customer?.GSTIN ?? "N/A",
                StateName = placeOfSupply?.StateName ?? "N/A",
                StateCode = ExtractStateCodeFromGstin(
                    customer?.GSTIN),
                SacCode = sacCode,
                TaxableServiceDescription =
                    debitNote.Description ?? "N/A",
                ReturnDebitDate = debitNote.DebitNoteDate,
                ReturnDebitNo = debitNote.DebitNoteNo,
                ConsigneeNameAddress =
                    debitNote.ConsigneeNameAddress,
                BankName = bank?.BankName ?? "N/A",
                AccountNo = bank?.AccountNo ?? "N/A",
                BankAddress = bank?.BankAddress ?? "N?A",
                IfscCode = bank?.IFSC ?? "N/A",
                DebitReason = debitNote.DebitReason,
                DebitNoteAmount = debitAmount,

                DebitNoteAmountInWords =
                    NumberToWords.ConvertAmount(
                        amountToDisplay),
                SubTotal = debitNote.SubTotal,
                FreightCharges = debitNote.FreightCharges,
                GrandTotal = debitNote.GrandTotal,
                AdvanceAmount = debitNote.AdvanceAmount,
                BalanceAmount = debitNote.BalanceAmount,
                UpdatedBalanceAmount =
                    debitNote.UpdatedBalanceAmount,

                Items = debitNote.Items
                    .Select((x, index) =>
                        new DebitNotePdfItemDto
                        {
                            DebitNoteItemId = x.DebitNoteItemId,
                            ProductId = x.ProductId,
                            Description = x.Description,
                            HsnSacCode = x.HsnSacCode,
                            Quantity = x.Quantity,
                            Rate = x.Rate,
                            Amount = x.Total,
                            GstAmount = x.GstAmount,
                            CgstAmount = x.CgstAmount,
                            SgstAmount = x.SgstAmount,
                            IgstAmount = x.IgstAmount,
                            Price = x.Price,
                            ItemType = x.ItemType
                        })
                    .ToList()
            };
        }

        public async Task<byte[]> GetDebitNoteExcelAsync(int debitNoteId)
        {
            var debitNote =await GetDebitNotePdfAsync(debitNoteId);

            if (debitNote == null)
                throw new Exception("Debit Note Not Found");

            return _excelService.GenerateDebitNoteExcel(debitNote);
        }

        public async Task<string> GetLastDebitNoteNoAsync()
        {
            return await _context.Tbl_DebitNotes
              .OrderByDescending(x => x.DebitNoteId)
              .Select(x => x.DebitNoteNo)
              .FirstOrDefaultAsync() ?? "";
        }
    }
}
