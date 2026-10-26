using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models.CRM.CreditNote;
using CompanyPlatform.Core.Models.CRM.Invoice;
using CompanyPlatform.CRM.DTO.CreditNote;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace CompanyPlatform.CRM.Services.CreditNote
{
    public class CreditNoteService : ICreditNoteService
    {
        private readonly ApplicationDBContext _context;

        private readonly CreditNoteExcelService _creditNoteExcelService;


        public CreditNoteService(ApplicationDBContext context, CreditNoteExcelService creditNoteExcelService)
        {
            _context = context;
            _creditNoteExcelService = creditNoteExcelService;
        }

        public async Task<List<InvoiceDropdownDto>> GetInvoiceDropdownAsync()
        {
            return await _context.Tbl_Invoices
                .Where(x => !x.IsDeleted)
                .Select(x => new InvoiceDropdownDto
                {
                    InvoiceId = x.InvoiceId,
                    InvoiceNo = x.InvoiceNo
                })
                .ToListAsync();
        }

        public async Task<CreditNoteDto> GetInvoiceForCreditNoteAsync(int invoiceId)
        {
            var invoice = await _context.Tbl_Invoices
                .Include(x => x.Items)
                .FirstOrDefaultAsync(x => x.InvoiceId == invoiceId);

            if (invoice == null)
                return null;

            return new CreditNoteDto
            {
                InvoiceId = invoice.InvoiceId,
                InvoiceNo = invoice.InvoiceNo,
                GrandTotal = invoice.GrandTotal,

                Items = invoice.Items.Select(i => new CreditNoteItemDto
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
                    IgstAmount = i.IgstAmount
                }).ToList()
            };
        }

        public async Task<int> CreateAsync(CreateCreditNoteDto dto)
        {
            var invoice = await _context.Tbl_Invoices
                .Include(x => x.Items)
                    .ThenInclude(x => x.Accessories)
                .FirstOrDefaultAsync(x => x.InvoiceId == dto.InvoiceId);

            if (invoice == null)
                throw new Exception("Invoice Not Found");

            var creditNote = new Core.Models.CRM.CreditNote.CreditNote
            {
                CreditNoteNo = dto.CreditNoteNo,
                CreditNoteDate = DateTime.Now,
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
                CreditNoteAmount = dto.CreditNoteAmount,
                RemainingBalanceAmount = invoice.GrandTotal - dto.CreditNoteAmount,
                CreditReason = dto.CreditReason,

                Items = new List<CreditNoteItem>()
            };

            foreach (var item in invoice.Items)
            {
                var creditItem = new CreditNoteItem
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
                    TaxPercentage = item.TaxPercentage,

                    Accessories = new List<CreditNoteItemAccessory>()
                };

                foreach (var accessory in item.Accessories)
                {
                    creditItem.Accessories.Add(
                        new CreditNoteItemAccessory
                        {
                            AccessoryId = accessory.AccessoryId
                        });
                }

                creditNote.Items.Add(creditItem);
            }

            _context.Tbl_CreditNotes.Add(creditNote);

            await _context.SaveChangesAsync();

            return creditNote.CreditNoteId;
        }


        public async Task<bool> UpdateAsync(int creditNoteId,CreateCreditNoteDto dto)
        {
            var creditNote = await _context.Tbl_CreditNotes
                .FirstOrDefaultAsync(x => x.CreditNoteId == creditNoteId);

            if (creditNote == null)
                return false;

            creditNote.CreditNoteAmount = dto.CreditNoteAmount;

            creditNote.RemainingBalanceAmount = creditNote.GrandTotal - dto.CreditNoteAmount;

            creditNote.CreditReason = dto.CreditReason;

            creditNote.CreditNoteDate = DateTime.Now;

            creditNote.CreditNoteNo = dto.CreditNoteNo;

            await _context.SaveChangesAsync();

            return true;
        }
        public async Task<List<CreditNoteListDto>> GetAllAsync()
        {
            return await _context.Tbl_CreditNotes
                .Where(x => !x.IsDeleted)
                .Select(x => new CreditNoteListDto
                {
                    CreditNoteId = x.CreditNoteId,
                    CreditNoteNo = x.CreditNoteNo,
                    CreditNoteDate = x.CreditNoteDate,
                    InvoiceNo = x.InvoiceNo,
                    CreditNoteAmount = x.CreditNoteAmount,
                    RemainingBalanceAmount = x.RemainingBalanceAmount,
                    CreditReason = x.CreditReason
                })
                .ToListAsync();
        }

        public async Task<CreditNoteDto> GetByIdAsync(int creditNoteId)
        {
            var data = await _context.Tbl_CreditNotes
                .Include(x => x.Items)
                .FirstOrDefaultAsync(x => x.CreditNoteId == creditNoteId);

            if (data == null) return null;

            // Fetch related names from Master Tables
            var customer = await _context.Tbl_Customers.FirstOrDefaultAsync(c => c.Id == data.CustomerId);
            var company = await _context.Tbl_Companies.FirstOrDefaultAsync(c => c.CompanyId == data.CompanyId);
            var vendor = await _context.Tbl_Vendors.FirstOrDefaultAsync(v => v.Id == data.VendorId);
            var bank = await _context.Tbl_CompanyBankDetails.FirstOrDefaultAsync(b => b.BankDetailId == data.BankDetailId);
            var currency = await _context.Tbl_Currencies.FirstOrDefaultAsync(cu => cu.Id == data.CurrencyId);
           // var pos = await _context.Tbl_CustomerAddress.FirstOrDefaultAsync(p => p. == data.PlaceOfSupplyId);

            return new CreditNoteDto
            {
                CreditNoteId = data.CreditNoteId,
                CreditNoteNo = data.CreditNoteNo,
                CreditNoteDate = data.CreditNoteDate,
                InvoiceId = data.InvoiceId,
                InvoiceNo = data.InvoiceNo,
                CreditNoteAmount = data.CreditNoteAmount,
                CreditReason = data.CreditReason,

                // Mapped names
                CustomerName = customer?.CustomerName ?? "N/A",
                CompanyName = company?.CompanyName ?? "N/A",
                VendorName = vendor?.VendorName ?? "N/A",
                BankName = bank?.BankName ?? "N/A",
                AccountNo = bank?.AccountNo ?? "N/A",
                Ifsc = bank?.IFSC ?? "N/A",
                CurrencyName = currency?.CurrencyName ?? "INR",
                CurrencySymbol = currency?.CurrencySymbol ?? "₹",
               // PlaceOfSupplyName = pos?.StateName ?? "N/A",

                ConsigneeNameAddress = data.ConsigneeNameAddress,
                TermsConditions = data.TermsConditions,
                SubTotal = data.SubTotal,
                FreightCharges = data.FreightCharges,
                GrandTotal = data.GrandTotal,
                RemainingBalanceAmount = data.RemainingBalanceAmount,
                AdvanceAmount = data.AdvanceAmount,
                BalanceAmount = data.BalanceAmount,

                Items = data.Items.Select(i => new CreditNoteItemDto
                {
                    CreditNoteItemId = i.CreditNoteItemId,
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
                    //TaxPercentage = i.TaxPercentage,
                    Price = i.Price,
                    ItemType = i.ItemType
                }).ToList()
            };
        }

        public async Task<bool> DeleteAsync(int creditNoteId)
        {
            var creditNote = await _context.Tbl_CreditNotes
                .FirstOrDefaultAsync(x => x.CreditNoteId == creditNoteId);

            if (creditNote == null)
                return false;

            creditNote.IsDeleted = true;

            await _context.SaveChangesAsync();

            return true;
        }

        private async Task<string> GenerateCreditNoteNo()
        {
            var count = await _context.Tbl_CreditNotes.CountAsync();

            return $"CN-{(count + 1).ToString("D2")}";
        }

        public async Task<byte[]> DownloadExcelAsync(int creditNoteId)
        {
            var creditNote = await GetCreditNotePdfAsync(creditNoteId);

            if (creditNote == null)
                throw new Exception("Credit Note Not Found");

            return _creditNoteExcelService
                .GenerateCreditNoteExcel(creditNote);
        }

        public async Task<CreditNoteDto?> GetCreditNotePdfAsync(int creditNoteId)
        {
            var creditNote = await _context.Tbl_CreditNotes
                .Include(x => x.Items)
                .FirstOrDefaultAsync(x => x.CreditNoteId == creditNoteId);

            if (creditNote == null)
                return null;

            var customer = await _context.Tbl_Customers
                .Include(x => x.Addresses)
                .FirstOrDefaultAsync(x => x.Id == creditNote.CustomerId);

            var company = await _context.Tbl_Companies
                .Include(x => x.Addresses)
                .FirstOrDefaultAsync(x => x.CompanyId == creditNote.CompanyId);

            var placeOfSupply = await _context.Tbl_States
                .FirstOrDefaultAsync(x => x.Id == creditNote.PlaceOfSupplyId);

            var companyAddress = company?.Addresses?.FirstOrDefault();

            var customerAddress = customer?.Addresses?.FirstOrDefault();

            string FormatAddress(dynamic address, string customerName)
            {
                if (address == null)
                    return customerName ?? "N/A";

                return $"{customerName}\n" +
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

            decimal totalGst = creditNote.Items.Sum(x => x.GstAmount);

            decimal totalCgst = totalGst / 2;

            decimal totalSgst = totalGst / 2;

            string sacCode = creditNote.Items
                .FirstOrDefault()?.HsnSacCode ?? "N/A";

            return new CreditNoteDto
            {
                CreditNoteId = creditNote.CreditNoteId,
                CreditNoteNo = creditNote.CreditNoteNo,
                CreditNoteDate = creditNote.CreditNoteDate,

                InvoiceId = creditNote.InvoiceId,
                InvoiceNo = creditNote.InvoiceNo,
                InvoiceDate = creditNote.InvoiceDate,

                CompanyName = company?.CompanyName ?? "N/A",
                CompanyAddress = FormatCompanyAddress(companyAddress),
                CompanyGstin = company?.GSTIN ?? "N/A",
                CompanyPan = company?.PAN ?? "N/A",

                Range = companyAddress?.Town ?? "N/A",
                Division = companyAddress?.Town ?? "N/A",
                // Commissionerate = companyAddress?.Town ?? "N/A",

                CustomerName = customer?.CustomerName ?? "N/A",

                CustomerAddress = FormatAddress(
                                customerAddress,
                                customer?.CustomerName),

                BuyerGstin = customer?.GSTIN ?? "N/A",

                BuyerState = placeOfSupply?.StateName ?? "N/A",

                BuyerStateCode = ExtractStateCodeFromGstin(customer?.GSTIN),

                PlaceOfSupply = placeOfSupply?.StateName ?? "N/A",


                CustomerPo = creditNote.CustomerPo,

                CompanyPoDate = creditNote.CompanyPoDate,

                SacCode = sacCode,

                TaxableServiceDescription = creditNote.Description ?? "N/A",
                CreditNoteAmount = creditNote.CreditNoteAmount,
                CreditNoteAmountInWords =
                 NumberToWords.ConvertAmount(creditNote.CreditNoteAmount),
                CreditReason = creditNote.CreditReason,
                ConsigneeNameAddress = FormatAddress(
                                    customerAddress,
                                    customer?.CustomerName),
                SubTotal = creditNote.SubTotal,
                FreightCharges = creditNote.FreightCharges,
                GrandTotal = creditNote.GrandTotal,
                TotalCgst = totalCgst,
                TotalSgst = totalSgst,
                AdvanceAmount = creditNote.AdvanceAmount,
                BalanceAmount = creditNote.BalanceAmount,
                RemainingBalanceAmount = creditNote.RemainingBalanceAmount,
                GrandTotalInWords = NumberToWords.ConvertAmount(creditNote.GrandTotal),
                Items = creditNote.Items
                    .Select((x, index) =>
                        new CreditNoteItemDto
                        {
                            CreditNoteItemId = x.CreditNoteItemId,
                            ProductId =x.ProductId,
                            Description =x.Description,
                            HsnSacCode =x.HsnSacCode,
                            Quantity =x.Quantity,
                            Rate =x.Rate,
                            Total =x.Total,
                            GstAmount =x.GstAmount,
                            CgstAmount =x.CgstAmount,
                            SgstAmount =x.SgstAmount,
                            IgstAmount = x.IgstAmount,
                            Price = x.Price,
                            ItemType = x.ItemType
                        })
                    .ToList()
            };
        }

        public async Task<string> GetLastCreditNoteNoAsync()
        {
            return await _context.Tbl_CreditNotes
                .OrderByDescending(x => x.CreditNoteId)
                .Select(x => x.CreditNoteNo)
                .FirstOrDefaultAsync() ?? "";
        }
    }
}
