using CompanyPlatform.Core.Data;
using CompanyPlatform.CRM.DTO.Reports;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.Reports
{
    public class ReportService : IReportService
    {
        private readonly ApplicationDBContext _context;

        public ReportService(ApplicationDBContext context)
        {
            _context = context;
        }

       
        //offer report
        public async Task<List<OfferReportResultDto>> GetOfferReportAsync(OfferReportDto filter)
        {
            var query =
                from o in _context.Tbl_Offers
                join pg in _context.Tbl_ProductGroups on o.ProductGroupId equals pg.Id into pgJoin
                from pg in pgJoin.DefaultIfEmpty()

                join c in _context.Tbl_Companies on o.CompanyId equals c.CompanyId into cJoin
                from c in cJoin.DefaultIfEmpty()

                join v in _context.Tbl_Vendors on o.VendorId equals v.Id into vJoin
                from v in vJoin.DefaultIfEmpty()

                join cg in _context.Tbl_CompanyGroups on o.CompanyGroupId equals cg.Id into cgJoin
                from cg in cgJoin.DefaultIfEmpty()

                join cust in _context.Tbl_Customers on o.CustomerId equals cust.Id into custJoin
                from cust in custJoin.DefaultIfEmpty()

                    //join cc in _context.Tbl_CustomerContacts on cust.Id equals cc.CustomerId into ccJoin
                    //from cc in ccJoin.Where(x => !x.IsDeleted).DefaultIfEmpty()
                join cc in _context.Tbl_CustomerContacts on o.ResponsiblePersonId equals cc.Id into ccJoin
                from cc in ccJoin.DefaultIfEmpty()

                join st in _context.Tbl_States on o.PlaceOfSupplyId equals st.Id into stJoin
                from st in stJoin.DefaultIfEmpty()

                join cur in _context.Tbl_Currencies on o.CurrencyId equals cur.Id into curJoin
                from cur in curJoin.DefaultIfEmpty()

                where !o.IsDeleted
                select new
                {
                    Offer = o,
                    ProductGroup = pg,
                    Company = c,
                    Vendor = v,
                    CompanyGroup = cg,
                    Customer = cust,
                    Contact = cc,
                    State = st,
                    Currency = cur
                };

            if (filter.GroupId.HasValue)
                query = query.Where(x => x.Offer.ProductGroupId == filter.GroupId);

            if (filter.CompanyId.HasValue)
                query = query.Where(x => x.Offer.CompanyId == filter.CompanyId);

            if (filter.VendorId.HasValue)
                query = query.Where(x => x.Offer.VendorId == filter.VendorId);

            if (filter.CurrencyId.HasValue)
                query = query.Where(x => x.Offer.CurrencyId == filter.CurrencyId);

            if (filter.PlaceOfSupplyId.HasValue)
                query = query.Where(x => x.Offer.PlaceOfSupplyId == filter.PlaceOfSupplyId);

            if (filter.CompanyGroupId.HasValue)
                query = query.Where(x => x.Offer.CompanyGroupId == filter.CompanyGroupId);

            if (filter.CustomerId.HasValue)
                query = query.Where(x => x.Offer.CustomerId == filter.CustomerId);

            if (!string.IsNullOrEmpty(filter.Status))
                query = query.Where(x => x.Offer.Status == filter.Status);

            if (filter.StartDate.HasValue)
                query = query.Where(x => x.Offer.OfferDate >= filter.StartDate);

            if (filter.EndDate.HasValue)
                query = query.Where(x => x.Offer.OfferDate <= filter.EndDate);

            return await query
                .OrderByDescending(x => x.Offer.OfferId)
                .Select(x => new OfferReportResultDto
                {
                    OfferId = x.Offer.OfferId,
                    OfferNo = x.Offer.OfferNo,
                    Status = x.Offer.Status,
                    FinalNote = x.Offer.FinalNote,
                    Group = x.ProductGroup.GroupName,
                    Company = x.Company.CompanyName,
                    Vendor = x.Vendor.VendorName,

                    CustomerCompanyGroup = x.CompanyGroup.CompanyGroupName,
                    CustomerCompany = x.Customer.CustomerName,
                    CustomerPerson = x.Contact.ResPersonName,
                    CustomerEmail = x.Contact.EmailAddress,
                    CustomerNumber = x.Contact.MobileNo,

                    PlaceOfSupply = x.State.StateName,
                    Currency = x.Currency.CurrencyName,

                    TotalAmount = x.Offer.GrandTotal,

                    CreatedDate = x.Offer.OfferDate,
                    ExpiryDate = x.Offer.ExpiryDate
                })
                .ToListAsync();
        }
        public async Task<bool> UpdateOfferFinalNoteAsync(UpdateOfferFinalNoteDto dto)
        {
            var offer = await _context.Tbl_Offers
                .FirstOrDefaultAsync(x =>
                    x.OfferId == dto.OfferId &&
                    !x.IsDeleted);

            if (offer == null)
                return false;

            offer.FinalNote = dto.FinalNote;

            await _context.SaveChangesAsync();

            return true;
        }

        //order acceptance report
        public async Task<List<OrderAcceptanceReportResultDto>> GetOrderAcceptanceReportAsync(OrderAcceptanceReportDto filter)
        {
            var query =
                from oao in _context.Tbl_OrderAcceptanceOffers

                join oa in _context.Tbl_OrderAcceptances
                    on oao.OrderAcceptanceId equals oa.OrderAcceptanceId

                join pg in _context.Tbl_ProductGroups
                    on oao.ProductGroupId equals pg.Id into pgJoin
                from pg in pgJoin.DefaultIfEmpty()

                join c in _context.Tbl_Companies
                    on oao.CompanyId equals c.CompanyId into cJoin
                from c in cJoin.DefaultIfEmpty()

                join v in _context.Tbl_Vendors
                    on oao.VendorId equals v.Id into vJoin
                from v in vJoin.DefaultIfEmpty()

                join cg in _context.Tbl_CompanyGroups
                    on oao.CompanyGroupId equals cg.Id into cgJoin
                from cg in cgJoin.DefaultIfEmpty()

                join cust in _context.Tbl_Customers
                    on oao.CustomerId equals cust.Id into custJoin
                from cust in custJoin.DefaultIfEmpty()

                    //join cc in _context.Tbl_CustomerContacts
                    //    on cust.Id equals cc.CustomerId into ccJoin
                    //from cc in ccJoin.DefaultIfEmpty()
                join cc in _context.Tbl_CustomerContacts
                on oao.ResponsiblePersonId equals cc.Id into ccJoin
                from cc in ccJoin.DefaultIfEmpty()

                join st in _context.Tbl_States
                    on oao.PlaceOfSupplyId equals st.Id into stJoin
                from st in stJoin.DefaultIfEmpty()

                join cur in _context.Tbl_Currencies
                    on oao.CurrencyId equals cur.Id into curJoin
                from cur in curJoin.DefaultIfEmpty()

                where !oa.IsDeleted

                select new
                {
                    OA = oa,
                    OAO = oao,
                    ProductGroup = pg,
                    Company = c,
                    Vendor = v,
                    CompanyGroup = cg,
                    Customer = cust,
                    Contact = cc,
                    State = st,
                    Currency = cur
                };

            if (filter.GroupId.HasValue)
                query = query.Where(x => x.OAO.ProductGroupId == filter.GroupId);

            if (filter.CompanyId.HasValue)
                query = query.Where(x => x.OAO.CompanyId == filter.CompanyId);

            if (filter.VendorId.HasValue)
                query = query.Where(x => x.OAO.VendorId == filter.VendorId);

            if (filter.CurrencyId.HasValue)
                query = query.Where(x => x.OAO.CurrencyId == filter.CurrencyId);

            if (filter.PlaceOfSupplyId.HasValue)
                query = query.Where(x => x.OAO.PlaceOfSupplyId == filter.PlaceOfSupplyId);

            if (filter.CompanyGroupId.HasValue)
                query = query.Where(x => x.OAO.CompanyGroupId == filter.CompanyGroupId);

            if (filter.CustomerId.HasValue)
                query = query.Where(x => x.OAO.CustomerId == filter.CustomerId);

            if (filter.StartDate.HasValue)
                query = query.Where(x => x.OAO.OfferCreateDate >= filter.StartDate);

            if (filter.EndDate.HasValue)
                query = query.Where(x => x.OAO.OfferCreateDate <= filter.EndDate);

            return await query
                .OrderByDescending(x => x.OA.OrderAcceptanceId)
                .Select(x => new OrderAcceptanceReportResultDto
                {
                    OrderAcceptanceId = x.OA.OrderAcceptanceId,
                    OfferNo = x.OA.GaxcePurchaseOrderNo,
                    FinalNote = x.OA.FinalNote,

                    Group = x.ProductGroup != null ? x.ProductGroup.GroupName : "",
                    Company = x.Company != null ? x.Company.CompanyName : "",
                    Vendor = x.Vendor != null ? x.Vendor.VendorName : "",

                    CustomerCompanyGroup = x.CompanyGroup != null ? x.CompanyGroup.CompanyGroupName : "",
                    CustomerCompany = x.Customer != null ? x.Customer.CustomerName : "",

                    CustomerPerson = x.Contact != null ? x.Contact.ResPersonName : "",
                    CustomerEmail = x.Contact != null ? x.Contact.EmailAddress : "",
                    CustomerNumber = x.Contact != null ? x.Contact.MobileNo : "",

                    PlaceOfSupply = x.State != null ? x.State.StateName : "",
                    Currency = x.Currency != null ? x.Currency.CurrencyName : "",

                    TotalAmount = x.OA.GrandTotal ?? 0,

                    CreatedDate = x.OAO.OfferCreateDate ?? DateTime.MinValue,
                    ExpiryDate = x.OAO.OfferExpiryDate ?? DateTime.MinValue
                })
                .ToListAsync();
        }

        public async Task<bool> UpdateOrderAcceptanceFinalNoteAsync(UpdateOrderAcceptanceFinalNoteDto dto)
        {
            var orderAcceptance = await _context.Tbl_OrderAcceptances
                .FirstOrDefaultAsync(x =>
                    x.OrderAcceptanceId == dto.OrderAcceptanceId &&
                    !x.IsDeleted);

            if (orderAcceptance == null)
                return false;

            orderAcceptance.FinalNote = dto.FinalNote;

            await _context.SaveChangesAsync();

            return true;
        }

        //purchase order report
        public async Task<List<PurchaseOrderReportResultDto>> GetPurchaseOrderReportAsync(PurchaseOrderReportDto filter)
        {
            var query =
                from poo in _context.Tbl_PurchaseOrderOffers

                join po in _context.Tbl_PurchaseOrders
                    on poo.PurchaseOrderId equals po.PurchaseOrderId

                join pg in _context.Tbl_ProductGroups
                    on poo.ProductGroupId equals pg.Id into pgJoin
                from pg in pgJoin.DefaultIfEmpty()

                join c in _context.Tbl_Companies
                    on poo.CompanyId equals c.CompanyId into cJoin
                from c in cJoin.DefaultIfEmpty()

                join v in _context.Tbl_Vendors
                    on poo.VendorId equals v.Id into vJoin
                from v in vJoin.DefaultIfEmpty()

                join st in _context.Tbl_States
                    on poo.PlaceOfSupplyId equals st.Id into stJoin
                from st in stJoin.DefaultIfEmpty()

                join cur in _context.Tbl_Currencies
                    on poo.CurrencyId equals cur.Id into curJoin
                from cur in curJoin.DefaultIfEmpty()

                where !po.IsDeleted

                select new
                {
                    PO = po,
                    POO = poo,
                    ProductGroup = pg,
                    Company = c,
                    Vendor = v,
                    State = st,
                    Currency = cur
                };

            if (filter.GroupId.HasValue)
                query = query.Where(x => x.POO.ProductGroupId == filter.GroupId);

            if (filter.CompanyId.HasValue)
                query = query.Where(x => x.POO.CompanyId == filter.CompanyId);

            if (filter.VendorId.HasValue)
                query = query.Where(x => x.POO.VendorId == filter.VendorId);

            if (filter.CurrencyId.HasValue)
                query = query.Where(x => x.POO.CurrencyId == filter.CurrencyId);

            if (filter.PlaceOfSupplyId.HasValue)
                query = query.Where(x => x.POO.PlaceOfSupplyId == filter.PlaceOfSupplyId);

            if (filter.StartDate.HasValue)
                query = query.Where(x => x.POO.OfferCreateDate >= filter.StartDate);

            if (filter.EndDate.HasValue)
                query = query.Where(x => x.POO.OfferCreateDate <= filter.EndDate);

            return await query
                .OrderByDescending(x => x.PO.PurchaseOrderId)
                .Select(x => new PurchaseOrderReportResultDto
                {
                    PurchaseOrderId = x.PO.PurchaseOrderId,

                    OfferNo = x.PO.PurchaseOrderNo,
                    Status = x.PO.Status,
                    FinalNote = x.PO.FinalNote,

                    Group = x.ProductGroup != null ? x.ProductGroup.GroupName : "",
                    Company = x.Company != null ? x.Company.CompanyName : "",
                    Vendor = x.Vendor != null ? x.Vendor.VendorName : "",

                    PlaceOfSupply = x.State != null ? x.State.StateName : "",
                    Currency = x.Currency != null ? x.Currency.CurrencyName : "",

                    TotalAmount = x.PO.GrandTotal ?? 0,

                    CreatedDate = x.POO.OfferCreateDate ?? DateTime.MinValue,
                    ExpiryDate = x.POO.OfferExpiryDate ?? DateTime.MinValue
                })
                .ToListAsync();
        }
        public async Task<bool> UpdatePOFinalNoteAsync(UpdatePOFinalNoteDto dto)
        {
            var invoice = await _context.Tbl_PurchaseOrders
                .FirstOrDefaultAsync(x =>
                    x.PurchaseOrderId == dto.PurchaseOrderId &&
                    !x.IsDeleted);

            if (invoice == null)
                return false;

            invoice.FinalNote = dto.FinalNote;

            await _context.SaveChangesAsync();

            return true;
        }

        //proforma invoice report
        public async Task<List<ProformaInvoiceReportResultDto>> GetProformaInvoiceReportAsync(ProformaInvoiceReportDto filter)
        {
            var query =
                from pi in _context.Tbl_ProformaInvoices

                join pg in _context.Tbl_ProductGroups
                    on pi.GroupId equals pg.Id into pgJoin
                from pg in pgJoin.DefaultIfEmpty()

                join c in _context.Tbl_Companies
                    on pi.CompanyId equals c.CompanyId into cJoin
                from c in cJoin.DefaultIfEmpty()

                join v in _context.Tbl_Vendors
                    on pi.VendorId equals v.Id into vJoin
                from v in vJoin.DefaultIfEmpty()

                join cg in _context.Tbl_CompanyGroups
                    on pi.CompanyGroupId equals cg.Id into cgJoin
                from cg in cgJoin.DefaultIfEmpty()

                join cust in _context.Tbl_Customers
                    on pi.CustomerId equals cust.Id into custJoin
                from cust in custJoin.DefaultIfEmpty()

                join cc in _context.Tbl_CustomerContacts
                    on pi.ResponsiblePersonId equals cc.Id into ccJoin
                from cc in ccJoin.DefaultIfEmpty()

                join st in _context.Tbl_States
                    on pi.PlaceOfSupplyId equals st.Id into stJoin
                from st in stJoin.DefaultIfEmpty()

                join cur in _context.Tbl_Currencies
                    on pi.CurrencyId equals cur.Id into curJoin
                from cur in curJoin.DefaultIfEmpty()

                join po in _context.Tbl_OrderAcceptances
                    on pi.OrderAcceptanceId equals po.OrderAcceptanceId into oJoin
                from po in oJoin.DefaultIfEmpty()

                where !pi.IsDeleted

                select new
                {
                    Proforma = pi,
                    ProductGroup = pg,
                    Company = c,
                    Vendor = v,
                    CompanyGroup = cg,
                    Customer = cust,
                    Contact = cc,
                    State = st,
                    Currency = cur,
                    GaxcePurchaseOrderNo = po
                };

            if (filter.GroupId.HasValue)
                query = query.Where(x => x.Proforma.GroupId == filter.GroupId);

            if (filter.CompanyId.HasValue)
                query = query.Where(x => x.Proforma.CompanyId == filter.CompanyId);

            if (filter.VendorId.HasValue)
                query = query.Where(x => x.Proforma.VendorId == filter.VendorId);

            if (filter.CurrencyId.HasValue)
                query = query.Where(x => x.Proforma.CurrencyId == filter.CurrencyId);

            if (filter.PlaceOfSupplyId.HasValue)
                query = query.Where(x => x.Proforma.PlaceOfSupplyId == filter.PlaceOfSupplyId);

            if (filter.CompanyGroupId.HasValue)
                query = query.Where(x => x.Proforma.CompanyGroupId == filter.CompanyGroupId);

            if (filter.CustomerId.HasValue)
                query = query.Where(x => x.Proforma.CustomerId == filter.CustomerId);

            if (filter.StartDate.HasValue)
                query = query.Where(x => x.Proforma.ProformaInvoiceDate >= filter.StartDate);

            if (filter.EndDate.HasValue)
                query = query.Where(x => x.Proforma.ProformaInvoiceDate <= filter.EndDate);

            return await query
                .OrderByDescending(x => x.Proforma.ProformaInvoiceId)
                .Select(x => new ProformaInvoiceReportResultDto
                {
                    ProformaInvoiceId = x.Proforma.ProformaInvoiceId,

                    GaxcePurchaseOrderNo = x.GaxcePurchaseOrderNo != null ? x.GaxcePurchaseOrderNo.GaxcePurchaseOrderNo : "",
                    FinalNote = x.Proforma.FinalNote,

                    Group = x.ProductGroup != null ? x.ProductGroup.GroupName : "",
                    Company = x.Company != null ? x.Company.CompanyName : "",
                    Vendor = x.Vendor != null ? x.Vendor.VendorName : "",

                    CustomerCompanyGroup = x.CompanyGroup != null ? x.CompanyGroup.CompanyGroupName : "",
                    CustomerCompany = x.Customer != null ? x.Customer.CustomerName : "",

                    CustomerPerson = x.Contact != null ? x.Contact.ResPersonName : "",
                    CustomerEmail = x.Contact != null ? x.Contact.EmailAddress : "",
                    CustomerNumber = x.Contact != null ? x.Contact.MobileNo : "",

                    PlaceOfSupply = x.State != null ? x.State.StateName : "",
                    Currency = x.Currency != null ? x.Currency.CurrencyName : "",

                    TotalAmount = x.Proforma.GrandTotal,

                    CreatedDate = x.Proforma.ProformaInvoiceDate,
                    ExpiryDate = x.Proforma.ProformaInvoiceExpiryDate
                })
                .ToListAsync();
        }

        public async Task<bool> UpdateProformaInvoiceFinalNoteAsync(UpdateProformaInvoiceFinalNoteDto dto)
        {
            var invoice = await _context.Tbl_ProformaInvoices
                .FirstOrDefaultAsync(x =>
                    x.ProformaInvoiceId == dto.ProformaInvoiceId &&
                    !x.IsDeleted);

            if (invoice == null)
                return false;

            invoice.FinalNote = dto.FinalNote;

            await _context.SaveChangesAsync();

            return true;
        }

        //invoice report
        public async Task<List<InvoiceReportResultDto>> GetInvoiceReportAsync(InvoiceReportDto filter)
        {
            var query =
                from inv in _context.Tbl_Invoices

                join pg in _context.Tbl_ProductGroups
                    on inv.ProductGroupId equals pg.Id into pgJoin
                from pg in pgJoin.DefaultIfEmpty()

                join c in _context.Tbl_Companies
                    on inv.CompanyId equals c.CompanyId into cJoin
                from c in cJoin.DefaultIfEmpty()

                join v in _context.Tbl_Vendors
                    on inv.VendorId equals v.Id into vJoin
                from v in vJoin.DefaultIfEmpty()

                join cg in _context.Tbl_CompanyGroups
                    on inv.CompanyGroupId equals cg.Id into cgJoin
                from cg in cgJoin.DefaultIfEmpty()

                join cust in _context.Tbl_Customers
                    on inv.CustomerId equals cust.Id into custJoin
                from cust in custJoin.DefaultIfEmpty()

                join cc in _context.Tbl_CustomerContacts
                    on inv.ResponsiblePersonId equals cc.Id into ccJoin
                from cc in ccJoin.DefaultIfEmpty()

                join st in _context.Tbl_States
                    on inv.PlaceOfSupplyId equals st.Id into stJoin
                from st in stJoin.DefaultIfEmpty()

                join cur in _context.Tbl_Currencies
                    on inv.CurrencyId equals cur.Id into curJoin
                from cur in curJoin.DefaultIfEmpty()

                where !inv.IsDeleted

                select new
                {
                    Invoice = inv,
                    ProductGroup = pg,
                    Company = c,
                    Vendor = v,
                    CompanyGroup = cg,
                    Customer = cust,
                    Contact = cc,
                    State = st,
                    Currency = cur
                };

            if (filter.GroupId.HasValue)
                query = query.Where(x => x.Invoice.ProductGroupId == filter.GroupId);

            if (filter.CompanyId.HasValue)
                query = query.Where(x => x.Invoice.CompanyId == filter.CompanyId);

            if (filter.VendorId.HasValue)
                query = query.Where(x => x.Invoice.VendorId == filter.VendorId);

            if (filter.CurrencyId.HasValue)
                query = query.Where(x => x.Invoice.CurrencyId == filter.CurrencyId);

            if (filter.PlaceOfSupplyId.HasValue)
                query = query.Where(x => x.Invoice.PlaceOfSupplyId == filter.PlaceOfSupplyId);

            if (filter.CompanyGroupId.HasValue)
                query = query.Where(x => x.Invoice.CompanyGroupId == filter.CompanyGroupId);

            if (filter.CustomerId.HasValue)
                query = query.Where(x => x.Invoice.CustomerId == filter.CustomerId);

            if (filter.StartDate.HasValue)
                query = query.Where(x => x.Invoice.InvoiceDate >= filter.StartDate);

            if (filter.EndDate.HasValue)
                query = query.Where(x => x.Invoice.InvoiceDate <= filter.EndDate);

            return await query
                .OrderByDescending(x => x.Invoice.InvoiceId)
                .Select(x => new InvoiceReportResultDto
                {
                    InvoiceId = x.Invoice.InvoiceId,
                    InvoiceNo = x.Invoice.InvoiceNo,
                    FinalNote = x.Invoice.FinalNote,

                    Group = x.ProductGroup != null ? x.ProductGroup.GroupName : "",
                    Company = x.Company != null ? x.Company.CompanyName : "",
                    Vendor = x.Vendor != null ? x.Vendor.VendorName : "",

                    CustomerCompanyGroup = x.CompanyGroup != null ? x.CompanyGroup.CompanyGroupName : "",
                    CustomerCompany = x.Customer != null ? x.Customer.CustomerName : "",

                    CustomerPerson = x.Contact != null ? x.Contact.ResPersonName : "",
                    CustomerEmail = x.Contact != null ? x.Contact.EmailAddress : "",
                    CustomerNumber = x.Contact != null ? x.Contact.MobileNo : "",

                    PlaceOfSupply = x.State != null ? x.State.StateName : "",
                    Currency = x.Currency != null ? x.Currency.CurrencyName : "",

                    TotalAmount = x.Invoice.GrandTotal,

                    CreatedDate = x.Invoice.InvoiceDate,
                    DueDate = x.Invoice.InvoiceDueDate
                })
                .ToListAsync();
        }

        public async Task<bool> UpdateInvoiceFinalNoteAsync(UpdateInvoiceFinalNoteDto dto)
        {
            var invoice = await _context.Tbl_Invoices
                .FirstOrDefaultAsync(x =>
                    x.InvoiceId == dto.InvoiceId &&
                    !x.IsDeleted);

            if (invoice == null)
                return false;

            invoice.FinalNote = dto.FinalNote;

            await _context.SaveChangesAsync();

            return true;
        }

    }
}
