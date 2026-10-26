using CompanyPlatform.Core.DTO.ProformaInvoice;
using Microsoft.AspNetCore.Hosting;
using OfficeOpenXml;
using OfficeOpenXml.Style;

namespace CompanyPlatform.Core.Services.ProformaInvoice
{
    public class ProformaInvoiceExcelService
    {
        private readonly IWebHostEnvironment _env;

        public ProformaInvoiceExcelService(IWebHostEnvironment env)
        {
            _env = env;
        }

        public byte[] GenerateProformaInvoiceExcel(
            ProformaInvoicePdfDto invoice)
        {
            string templatePath = Path.Combine(
                _env.WebRootPath,
                "Templates",
                "ProformaInvoice.xlsx");

            if (!File.Exists(templatePath))
                throw new FileNotFoundException(templatePath);

            using var package =
                new ExcelPackage(new FileInfo(templatePath));

            var ws = package.Workbook.Worksheets[0];

        

            ws.Cells["A5"].Value =
                $"GSTIN Registration Number :- {invoice.CompanyGstin}";

            ws.Cells["A7"].Value =
                $"PAN NO.:- {invoice.CompanyPan}";

            ws.Cells["A8"].Value =
                $"Range:- {invoice.Range}";

            ws.Cells["A9"].Value =
                $"Division:- {invoice.Division}";

            ws.Cells["A10"].Value =
                $"Vendor Code No. :- {invoice.VendorCode}";

            ws.Cells["C5"].Value =
                $"Proforma Invoice No:- {invoice.ProformaInvoiceNo}";

            ws.Cells["C6"].Value =
                $"Date:- {invoice.ProformaInvoiceDate}";

            ws.Cells["C7"].Value =
                $"{invoice.CodeLabel}:- {invoice.SacCode}";

            ws.Cells["C8"].Value =
               $"Description of Taxable Service :- {invoice.DescriptionOfTaxableService}";

         

            ws.Cells["A11"].Value =
                $"Billing Name & Address:-\n{invoice.CustomerName}\n{invoice.CustomerBillingAddress}";
            ws.Cells["A11"].Style.WrapText = true;

       

            ws.Cells["C11"].Value =
                $"Delivery Name & Address:-\n{invoice.ConsigneeDetails}";
            ws.Cells["C11"].Style.WrapText = true;


            ws.Cells["A15"].Value =
                $"Customer PO:- {invoice.CustomerPo}";

            ws.Cells["A16"].Value =
                $"Customer PO Date:- {invoice.CustomerPoDate}";

           
            ws.Cells["A17"].Value =
                $"State:- {invoice.CustomerState}";

            ws.Cells["A18"].Value =
                $"State Code:- {invoice.CustomerStateCode}";

            ws.Cells["A19"].Value =
                $"GSTN No.:- {invoice.CustomerGstn}";

            ws.Cells["A20"].Value =
                $"Place of Supply:- {invoice.CustomerPlaceOfSupply}";

          

            ws.Cells["C17"].Value =
                $"State:- {invoice.CustomerState}";

            ws.Cells["C18"].Value =
                $"State Code:- {invoice.CustomerStateCode}";

            ws.Cells["C19"].Value =
                $"GSTN No.:- {invoice.CustomerGstn}";

            ws.Cells["C20"].Value =
                $"Place of Supply:- {invoice.CustomerPlaceOfSupply}";


            int row = 22;

            // Shift footer section down if more than 2 items
            if (invoice.Items.Count > 2)
            {
                ws.InsertRow(
                    24,
                    invoice.Items.Count - 2,
                    24);
            }

            for (int i = 0; i < invoice.Items.Count; i++)
            {
                var item = invoice.Items[i];


                ws.Cells[row, 1].Value = item.SrNo;

                ws.Cells[row, 2].Value =
                    $"{item.ProductName}\n{item.Description}";

                ws.Cells[row, 3].Value = item.Quantity;

                ws.Cells[row, 4].Value = item.Rate;

                ws.Cells[row, 5].Value = item.Amount;

                ws.Cells[row, 2].Style.WrapText = true;

                ws.Cells[row, 4].Style.Numberformat.Format =
                    "\"Rs. \"#,##0.00";

                ws.Cells[row, 5].Style.Numberformat.Format =
                    "\"Rs. \"#,##0.00";

                ws.Cells[row, 3].Style.HorizontalAlignment =
                    ExcelHorizontalAlignment.Center;

                ws.Cells[row, 4].Style.HorizontalAlignment =
                    ExcelHorizontalAlignment.Right;

                ws.Cells[row, 5].Style.HorizontalAlignment =
                    ExcelHorizontalAlignment.Right;

                ws.Row(row).Height = 40;

                ws.Cells[row, 2].Style.VerticalAlignment =
                ExcelVerticalAlignment.Top;

                ws.Cells[row, 1].Style.VerticalAlignment =
                    ExcelVerticalAlignment.Center;

                ws.Cells[row, 3].Style.VerticalAlignment =
                    ExcelVerticalAlignment.Center;

                ws.Cells[row, 4].Style.VerticalAlignment =
                    ExcelVerticalAlignment.Center;

                ws.Cells[row, 5].Style.VerticalAlignment =
                    ExcelVerticalAlignment.Center;

                row++;
            }

            // QTY Center
            ws.Cells[$"C22:C{row - 1}"].Style.HorizontalAlignment =
                ExcelHorizontalAlignment.Center;

            // Rate Right
            ws.Cells[$"D22:D{row - 1}"].Style.HorizontalAlignment =
                ExcelHorizontalAlignment.Right;

            // Amount Right
            ws.Cells[$"E22:E{row - 1}"].Style.HorizontalAlignment =
                ExcelHorizontalAlignment.Right;

            bool isMaharashtra =
            invoice.CustomerPlaceOfSupply?
                .Trim()
                .Equals(
                    "Maharashtra",
                StringComparison.OrdinalIgnoreCase
                ) == true;

            int summaryStartRow =
              24 + Math.Max(invoice.Items.Count - 2, 0);

            if (isMaharashtra)
            {
                ws.InsertRow(summaryStartRow + 3, 1);
            }
            else
            {
                ws.InsertRow(summaryStartRow + 2, 1);
            }

            if (isMaharashtra)
            {
                ws.Cells[$"C{summaryStartRow + 4}:E{summaryStartRow + 4}"].Clear();
            }
            else
            {
                ws.Cells[$"C{summaryStartRow + 3}:E{summaryStartRow + 3}"].Clear();
            }

            ws.Cells[$"C{summaryStartRow}"].Value =
            "Value of Goods";

            if (isMaharashtra)
            {
                ws.Cells[$"C{summaryStartRow + 1}"].Value =
                    "CGST Output @ 9%";

                ws.Cells[$"C{summaryStartRow + 2}"].Value =
                    "SGST Output @ 9%";

                ws.Cells[$"C{summaryStartRow + 3}"].Value =
                    "Total Amount";
            }
            else
            {
                ws.Cells[$"C{summaryStartRow + 1}"].Value =
                    "IGST Output @ 18%";

                ws.Cells[$"C{summaryStartRow + 2}"].Value =
                    "Total Amount";
            }


            int lastSummaryRow =
             isMaharashtra
              ? summaryStartRow + 4
              : summaryStartRow + 3;

            for (int r = summaryStartRow; r <= lastSummaryRow; r++)
            {
                ws.Row(r).Height = 22;
            }



            // Bank Details
            ws.Cells[
               $"A{summaryStartRow}:B{(isMaharashtra ? summaryStartRow + 4 : summaryStartRow + 3)}"
              ].Merge = true;

            ws.Cells[$"A{summaryStartRow}"].Value =
                            $"Bank Details :-\n" +
                $"{invoice.BankName}\n" +
                $"{invoice.BankAddress}\n\n" +
                $"Current A/C NO : {invoice.AccountNo}\n" +
                $"IFSC Code : {invoice.IfscCode}";

            ws.Cells[$"A{summaryStartRow}"].Style.WrapText = true;

            ws.Cells[$"A{summaryStartRow}"].Style.HorizontalAlignment =
                ExcelHorizontalAlignment.Center;

            ws.Cells[$"A{summaryStartRow}"].Style.VerticalAlignment =
                ExcelVerticalAlignment.Center;



            ws.Cells[$"E{summaryStartRow}"].Value =
            invoice.Subtotal;

            if (isMaharashtra)
            {
                decimal cgst = invoice.TotalGstAmount / 2;
                decimal sgst = invoice.TotalGstAmount / 2;

                ws.Cells[$"E{summaryStartRow + 1}"].Value = cgst;
                ws.Cells[$"E{summaryStartRow + 2}"].Value = sgst;
                ws.Cells[$"E{summaryStartRow + 3}"].Value = invoice.TotalAmount;
            }
            else
            {
                ws.Cells[$"E{summaryStartRow + 1}"].Value =
                    invoice.TotalGstAmount;

                ws.Cells[$"E{summaryStartRow + 2}"].Value =
                    invoice.TotalAmount;
            }


            int lastAmountRow =
             isMaharashtra
              ? summaryStartRow + 4
              : summaryStartRow + 3;

            ws.Cells[
            $"C{summaryStartRow}:E{lastAmountRow}"
            ].Style.Fill.PatternType =
                ExcelFillStyle.None;

            ws.Cells[
                $"E{summaryStartRow}:E{lastAmountRow}"
            ].Style.Numberformat.Format =
                "\"Rs. \"#,##0.00";

            ws.Cells[
                $"E{summaryStartRow}:E{lastAmountRow}"
            ].Style.HorizontalAlignment =
                ExcelHorizontalAlignment.Right;

            int totalAmountRow =
            isMaharashtra
              ? summaryStartRow + 3
              : summaryStartRow + 2;

            // Make sure label exists
            ws.Cells[$"C{totalAmountRow}"].Value = "Total Amount";

            //var mergedAddress =
            //ws.MergedCells
            //  .FirstOrDefault(x =>
            //      x.Contains($"E{totalAmountRow}"));

            //System.Diagnostics.Debug.WriteLine(
            //    $"Merged Cell = {mergedAddress}");

            // Make sure amount exists
            ws.Cells[$"E{totalAmountRow}"].Value =
            invoice.TotalAmount;

            ws.Cells[$"E{totalAmountRow}"].Style.Numberformat.Format =
                "\"Rs. \"#,##0.00";

            // Yellow only for Total Amount row
            using (var rng =
                ws.Cells[$"C{totalAmountRow}:E{totalAmountRow}"])
            {
                rng.Style.Fill.PatternType =
                    ExcelFillStyle.Solid;

                rng.Style.Fill.BackgroundColor.SetColor(
                    System.Drawing.Color.Yellow);

                rng.Style.Font.Bold = true;
            }





            int signatureRow =
               isMaharashtra
               ? summaryStartRow + 6
               : summaryStartRow + 5;

            ws.Cells[$"C{signatureRow + 1}"].Value =
                invoice.AuthorizedSignatoryName;

            return package.GetAsByteArray();
        }
    }
}