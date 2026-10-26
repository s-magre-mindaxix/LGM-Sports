using CompanyPlatform.CRM.DTO.CreditNote;
using Microsoft.AspNetCore.Hosting;
using OfficeOpenXml;
using OfficeOpenXml.Style;

namespace CompanyPlatform.CRM.Services.CreditNote
{
    public class CreditNoteExcelService
    {
        private readonly IWebHostEnvironment _env;

        public CreditNoteExcelService(IWebHostEnvironment env)
        {
            _env = env;
        }

        public byte[] GenerateCreditNoteExcel(CreditNoteDto creditNote)
        {
            string templatePath = Path.Combine(
                _env.WebRootPath,
                "Templates",
                "CreditNote.xlsx");

            if (!File.Exists(templatePath))
                throw new FileNotFoundException(templatePath);

            using var package = new ExcelPackage(new FileInfo(templatePath));

            var ws = package.Workbook.Worksheets[0];

            // ===============================
            // HEADER
            // ===============================

            ws.Cells["B10"].Value =
              creditNote.CompanyGstin;

            ws.Cells["B11"].Value =
                $"PAN NO. :- {creditNote.CompanyPan}";

            ws.Cells["B12"].Value =
                $"Range :- {creditNote.Range}";

            ws.Cells["B13"].Value =
                $"Division :- {creditNote.Division}";

            ws.Cells["B14"].Value =
                $"Commissionerate :- {creditNote.Commissionerate}";

            ws.Cells["F9"].Value =
                $"Credit Note No :- {creditNote.CreditNoteNo}";

            ws.Cells["F10"].Value =
                $"Date :- {creditNote.CreditNoteDate:dd-MM-yyyy}";

            ws.Cells["F11"].Value =
                $"SAC Code :- {creditNote.SacCode}";

            //ws.Cells["F12"].Value =
            //    $"Description of Taxable Service :- {creditNote.TaxableServiceDescription}";

            // Merge description area
            ws.Cells["F12:K14"].Merge = true;

            ws.Cells["F12"].Value =
                $"Description of Taxable Service :- {creditNote.TaxableServiceDescription}";

            ws.Cells["F12:K14"].Style.WrapText = true;

            ws.Cells["F12:K14"].Style.VerticalAlignment =
                ExcelVerticalAlignment.Top;

            ws.Cells["F12:K14"].Style.HorizontalAlignment =
                ExcelHorizontalAlignment.Left;

            ws.Row(12).CustomHeight = true;
            ws.Row(12).Height = 28;

            ws.Row(13).CustomHeight = true;
            ws.Row(13).Height = 22;

            ws.Row(14).CustomHeight = true;
            ws.Row(14).Height = 22;

            // ===============================
            // ADDRESS
            // ===============================

            // Billing Address Area
            ws.Cells["B16:E19"].Merge = true;
            ws.Cells["B16:E19"].Value = creditNote.CustomerAddress;

            // Delivery Address Area
            ws.Cells["F16:K19"].Merge = true;
            ws.Cells["F16:K19"].Value = creditNote.ConsigneeNameAddress;

            ws.Cells["B16:E19"].Style.WrapText = true;
            ws.Cells["F16:K19"].Style.WrapText = true;

            ws.Cells["B16:E19"].Style.VerticalAlignment =
                ExcelVerticalAlignment.Top;

            ws.Cells["F16:K19"].Style.VerticalAlignment =
                ExcelVerticalAlignment.Top;

            ws.Row(16).Height = 45;
            ws.Row(17).Height = 45;
            ws.Row(18).Height = 45;
            ws.Row(19).Height = 45;

            ws.Cells["B20"].Value =
                $"Customer Invoice No :- {creditNote.InvoiceNo}";

            ws.Cells["B21"].Value =
                $"Invoice Date :- {creditNote.InvoiceDate:dd-MM-yyyy}";

            ws.Cells["B22"].Value =
                $"State Code :- {creditNote.BuyerStateCode}";

            ws.Cells["B23"].Value =
                $"GSTN No. :- {creditNote.BuyerGstin}";

            ws.Cells["B24"].Value =
                $"Place Of Supply :- {creditNote.PlaceOfSupply}";

            // ===============================
            // ITEMS
            // ===============================

            int row = 26;
            int srNo = 1;

            foreach (var item in creditNote.Items)
            {
                ws.Cells[row, 2].Value = srNo++;
                ws.Cells[row, 3].Value = item.Description;
                ws.Cells[row, 9].Value = item.Quantity;
                ws.Cells[row, 10].Value = item.Rate;
                ws.Cells[row, 11].Value = item.Total;

                row++;
            }

            // ===============================
            // TOTALS
            // ===============================

            // Remove existing merge
            if (!string.IsNullOrEmpty(ws.Cells["B28"].Merge ? ws.MergedCells[28, 2] : null))
            {
                ws.Cells["B28:G30"].Merge = false;
            }

            // Label
            ws.Cells["B28:G29"].Merge = true;
            ws.Cells["B28"].Value = "Credit Note Amt:-";

            ws.Cells["B28:G29"].Style.HorizontalAlignment =
                ExcelHorizontalAlignment.Center;

            ws.Cells["B28:G29"].Style.VerticalAlignment =
                ExcelVerticalAlignment.Center;

            ws.Cells["B28:G29"].Style.Font.Bold = true;

            // Amount directly below label
            ws.Cells["B30:G30"].Merge = true;

            ws.Cells["B30"].Value =
                creditNote.CreditNoteAmountInWords;

            ws.Cells["B30:G30"].Style.WrapText = true;

            ws.Cells["B30:G30"].Style.HorizontalAlignment =
                ExcelHorizontalAlignment.Center;

            ws.Cells["B30:G30"].Style.VerticalAlignment =
                ExcelVerticalAlignment.Center;

            ws.Cells["B30:G30"].Style.Font.Bold = true;

            ws.Row(30).CustomHeight = true;
            ws.Row(30).Height = 35;

            ws.Cells["K28"].Value =
                creditNote.SubTotal;

            ws.Cells["K29"].Value =
                creditNote.Items.Sum(x => x.GstAmount);

            ws.Cells["K30"].Value =
                creditNote.GrandTotal;

            ws.Cells["K28:K30"].Style.Numberformat.Format =
                "₹ #,##0.00";

            ws.Cells["K28:K30"].Style.HorizontalAlignment =
                ExcelHorizontalAlignment.Right;

            return package.GetAsByteArray();
        }
    }
}