using CompanyPlatform.CRM.DTO.Invoice;
using Microsoft.AspNetCore.Hosting;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System.Drawing;

public class InvoiceExcelService
{
    private readonly IWebHostEnvironment _env;

    public InvoiceExcelService(IWebHostEnvironment env)
    {
        _env = env;
    }

    public byte[] GenerateInvoiceExcel(InvoicePdfDto invoice)
    {
        string templatePath = Path.Combine(
            _env.WebRootPath,
            "Templates",
            "Invoice.xlsx");

        if (!File.Exists(templatePath))
            throw new FileNotFoundException(templatePath);

        using var package = new ExcelPackage(new FileInfo(templatePath));

        var ws = package.Workbook.Worksheets[0];

        // ==================================================
        // HEADER SECTION
        // ==================================================

        // LEFT SIDE
        ws.Cells["A6"].Value =
         $"GSTIN Registration Number :- {invoice.CompanyGstin}";

        ws.Cells["A8"].Value =
            $"PAN NO :- {invoice.CompanyPan}";

        ws.Cells["A9"].Value =
            $"Range :- {invoice.Range}";

        ws.Cells["A10"].Value =
            $"Division :- {invoice.Division}";

        ws.Cells["A11"].Value =
            $"Vendor Code No. :- {invoice.VendorCode}";

        // RIGHT SIDE
        ws.Cells["C6"].Value = $"Invoice No:- {invoice.InvoiceNo}";
        ws.Cells["C7"].Value = $"Date:- {invoice.InvoiceDate:dd-MM-yyyy}";
        ws.Cells["C8"].Value = $"HSN/SAC Code:- {invoice.SacCode}";
        ws.Cells["C9"].Value = $"Description of Taxable Service:- {invoice.TaxableServiceDescription}";

        ws.Cells["D9"].Style.WrapText = true;

        // Buyer Address
        ws.Cells["A14"].Value = invoice.BuyerAddress;

        // Consignee Address
        ws.Cells["C14"].Value = invoice.ConsigneeAddress;
        ws.Cells["C14"].Style.WrapText = true;

        // Customer PO
        ws.Cells["A17"].Value = $"Customer PO:- {invoice.CustomerPo}";
        ws.Cells["A18"].Value = $"Customer PO Date:- {invoice.CompanyPoDate:dd-MM-yyyy}";

        // Buyer
        ws.Cells["A19"].Value = $"State:- {invoice.BuyerState}";
        ws.Cells["A20"].Value = $"State Code:- {invoice.BuyerStateCode}";
        ws.Cells["A21"].Value = $"GSTN No.:- {invoice.BuyerGstin}";
        ws.Cells["A22"].Value = $"Place of Supply:- {invoice.PlaceOfSupply}";

        // Consignee
        ws.Cells["C19"].Value = $"State:- {invoice.ConsigneeState}";
        ws.Cells["C20"].Value = $"State Code:- {invoice.ConsigneeStateCode}";
        ws.Cells["C21"].Value = $"GSTN No.:- {invoice.ConsigneeGstin}";
        ws.Cells["C22"].Value = $"Place of Supply:- {invoice.PlaceOfSupply}";

        // ==================================================
        // ITEM TABLE
        // ==================================================

        int row = 24;

        foreach (var item in invoice.Items)
        {
            ws.Cells[row, 1].Value = item.SrNo;
            ws.Cells[row, 2].Value = item.Description;
            ws.Cells[row, 3].Value = item.Quantity;
            ws.Cells[row, 4].Value = item.Rate;
            ws.Cells[row, 5].Value = item.Amount;

            ws.Cells[row, 2].Style.WrapText = true;

            row++;
        }

        // ==================================================
        // TOTALS
        // ==================================================

        ws.Cells["B26"].Value = invoice.GrandTotalInWords;
        ws.Cells["B26"].Style.WrapText = true;

        ws.Cells["E26"].Value = invoice.ValueOfGoods;

        //ws.Cells["B27"].Value = invoice.TotalCgst;

        //ws.Cells["B28"].Value = invoice.TotalSgst;



        //ws.Cells["E27"].Value = invoice.TotalCgst;

        //ws.Cells["E28"].Value = invoice.TotalSgst;

        //ws.Cells["E29"].Value = invoice.GrandTotal;

        bool isMaharashtra =
      invoice.PlaceOfSupply?.Trim()
      .Equals("Maharashtra", StringComparison.OrdinalIgnoreCase) ?? false;

        if (isMaharashtra)
        {
            // Make sure SGST row is visible
            ws.Row(28).Hidden = false;
           

            // Labels
            ws.Cells["A28"].Value = "CGST Amt :-";
            ws.Cells["C27"].Value = "CGST Output @ 9%";

            ws.Cells["A29"].Value = "SGST Amt :-";
            ws.Cells["C28"].Value = "SGST Output @ 9%";

            // Values
            ws.Cells["B27"].Value = invoice.CgstInWords;
            ws.Cells["B27"].Style.WrapText = true;

            ws.Cells["E27"].Value = invoice.TotalCgst;

            ws.Cells["B28"].Value = invoice.SgstInWords;
            ws.Cells["B28"].Style.WrapText = true;

            ws.Cells["E28"].Value = invoice.TotalSgst;

            ws.Cells["E29"].Value = invoice.GrandTotal;
        }
        else
        {
            // IGST Row
            ws.Cells["A28"].Value = "IGST Amt :-";
            ws.Cells["C27"].Value = "IGST Output @ 18%";

            ws.Cells["B27"].Value = invoice.IgstInWords;
            ws.Cells["B27"].Style.WrapText = true;

            ws.Cells["E27"].Value = invoice.TotalIgst;

            // Clear SGST row contents
            ws.Cells["A29"].Value = "";
            ws.Cells["B28"].Value = "";
            ws.Cells["C28"].Value = "";
            ws.Cells["E28"].Value = "";

            // Hide only SGST row
            ws.Row(28).Hidden = true;

            ws.Cells["E29"].Value = invoice.GrandTotal;
        }

        // Advanced Received
        // Advanced Received
        if (invoice.AdvanceAmount > 0)
        {
            ws.Row(30).Hidden = false;

            ws.Cells["E30"].Value = invoice.AdvanceAmount;

            ws.Cells["E30"].Style.Numberformat.Format = "₹ #,##0.00";
            ws.Cells["E30"].Style.HorizontalAlignment =
                ExcelHorizontalAlignment.Right;
        }
        else
        {
            // Hide Advanced Received row completely
            ws.Row(30).Hidden = true;
        }

        // ==================================================
        // NUMBER FORMAT
        // ==================================================

        ws.Cells["E26:E29"].Style.Numberformat.Format =
        "₹ #,##0.00";

        if (invoice.AdvanceAmount > 0)
        {
            ws.Cells["E30"].Style.Numberformat.Format =
                "₹ #,##0.00";
        }

        return package.GetAsByteArray();
    }
}