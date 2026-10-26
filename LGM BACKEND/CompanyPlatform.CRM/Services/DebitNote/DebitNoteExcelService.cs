using CompanyPlatform.CRM.DTO.DebitNote;
using Microsoft.AspNetCore.Hosting;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System.Linq;

namespace CompanyPlatform.CRM.Services.DebitNote
{
    public class DebitNoteExcelService
    {
        private readonly IWebHostEnvironment _env;

        public DebitNoteExcelService(IWebHostEnvironment env)
        {
            _env = env;
        }

        public byte[] GenerateDebitNoteExcel(DebitNotePdfDto debitNote)
        {
            string templatePath = Path.Combine(
                _env.WebRootPath,
                "Templates",
                "DebitNote.xlsx");

            if (!File.Exists(templatePath))
                throw new FileNotFoundException(
                    templatePath);

            using var package =
                new ExcelPackage(
                    new FileInfo(templatePath));

            var ws =
                package.Workbook.Worksheets[0];

            // LEFT SIDE

            ws.Cells["A13"].Value = debitNote.GstNo;

            ws.Cells["D14"].Value = debitNote.PanNo;

            ws.Cells["D15"].Value = debitNote.Range;

            ws.Cells["D16"].Value = debitNote.Division;

            ws.Cells["D17"].Value = debitNote.Commissionerate;


            // RIGHT SIDE

            ws.Cells["I12"].Value = debitNote.DebitNoteNo;

            ws.Cells["I13"].Value =
                debitNote.DebitNoteDate.ToString("dd-MM-yyyy");

            ws.Cells["I14"].Value =
                debitNote.SacCode;

            ws.Cells["I15"].Value =
                debitNote.TaxableServiceDescription;

            // ==========================
            // CUSTOMER ADDRESS
            // ==========================

            // Clear old values if required


            if (!ws.MergedCells.Contains("A20:E22"))
            {
                ws.Cells["A20:E22"].Merge = true;
            }
            ws.Cells["A20"].Value = debitNote.CustomerAddress;

            ws.Cells["A20:E22"].Style.WrapText = true;
            ws.Cells["A20:E22"].Style.VerticalAlignment =
                ExcelVerticalAlignment.Top;
            ws.Cells["A20:E22"].Style.HorizontalAlignment =
                ExcelHorizontalAlignment.Left;
            ws.Cells["A20:E22"].Style.Font.Size = 11;
            ws.Cells["A20:E22"].Style.Font.Bold = true;


            // ==========================
            // CONSIGNEE ADDRESS
            // ==========================



            if (!ws.MergedCells.Contains("F20:J22"))
            {
                ws.Cells["F20:J22"].Merge = true;
            }
            ws.Cells["F20"].Value = debitNote.ConsigneeNameAddress;

            ws.Cells["F20:J22"].Style.WrapText = true;
            ws.Cells["F20:J22"].Style.VerticalAlignment =
                ExcelVerticalAlignment.Top;
            ws.Cells["F20:J22"].Style.HorizontalAlignment =
                ExcelHorizontalAlignment.Left;
            ws.Cells["F20:J22"].Style.Font.Size = 11;
            ws.Cells["F20:J22"].Style.Font.Bold = true;

          


            ws.Row(16).Height = 18;
            ws.Row(17).Height = 18;
            ws.Row(18).Height = 18;
            ws.Row(19).Height = 25;
            ws.Row(20).Height = 35;
            ws.Row(21).Height = 35;
            ws.Row(22).Height = 35;
            ws.Row(23).Height = 20;
            ws.Row(24).Height = 20;
            ws.Row(25).Height = 20; // Invoice No Row
            ws.Row(26).Height = 20;
            ws.Row(27).Height = 20;

            // Change range to K27 to include Reference Details
            var entireHeaderRange = ws.Cells["A12:J27"];
            entireHeaderRange.Style.Border.Left.Style = ExcelBorderStyle.Thin;
            entireHeaderRange.Style.Border.Right.Style = ExcelBorderStyle.Thin;
            entireHeaderRange.Style.Border.Top.Style = ExcelBorderStyle.Thin;
            entireHeaderRange.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;

            // Middle Separator line continuous through row 27
            ws.Cells["E12:E27"].Style.Border.Right.Style = ExcelBorderStyle.Thin;
            ws.Cells["J12:J27"].Style.Border.Right.Style = ExcelBorderStyle.Thin;

            // Reference details styling
            ws.Cells["D23:D27"].Style.Font.Bold = true;
            ws.Cells["D23:D27"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;

            // ==========================
            // REFERENCE DETAILS
            // ==========================

            ws.Cells["D23"].Value =
       debitNote.ReturnDebitDate?.ToString("dd-MM-yyyy");

            ws.Cells["D24"].Value =
                debitNote.ReturnDebitNo;

            ws.Cells["D25"].Value = debitNote.InvoiceNo ?? "N/A";

            ws.Cells["D26"].Value =
                debitNote.StateCode;

            ws.Cells["D27"].Value =
                debitNote.GstnNo;

            // ==========================
            // ITEMS
            // ==========================

            int row = 29; // FIXED: Start at 29 as per your Excel screenshot
            int srNo = 1;

            foreach (var item in debitNote.Items)
            {
                // 1. Put the Serial Number in Column A (instead of B)
                ws.Cells[$"A{row}"].Value = srNo++;
                ws.Cells[$"A{row}"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                // 2. Put the Description in Column B (which is likely merged in your template B through H)
                ws.Cells[$"B{row}"].Value = item.Description;
                ws.Cells[$"B{row}"].Style.WrapText = true;
                ws.Cells[$"B{row}"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;

                // 3. Keep the numeric values in their respective columns
                ws.Cells[$"I{row}"].Value = item.Quantity;
                ws.Cells[$"J{row}"].Value = item.Rate;
                ws.Cells[$"J{row}"].Value = item.Amount;

                // Apply formatting to the row
                ws.Row(row).Height = 25;
                ws.Cells[$"H{row}:J{row}"].Style.Numberformat.Format = "#,##0.00";

                row++;
            }

            // Use the existing "Debit Note Amt:-" row in the template
            int amountInWordsRow = 31;

            // Merge only if it isn't already merged
            if (!ws.MergedCells.Contains($"A{amountInWordsRow}:H{amountInWordsRow}"))
            {
                ws.Cells[$"A{amountInWordsRow}:H{amountInWordsRow}"].Merge = true;
            }

            ws.Cells[$"A{amountInWordsRow}"].Value =
                $"Debit Note Amt:- {debitNote.DebitNoteAmountInWords}";

            ws.Cells[$"A{amountInWordsRow}:H{amountInWordsRow}"].Style.WrapText = true;
            ws.Cells[$"A{amountInWordsRow}:H{amountInWordsRow}"].Style.HorizontalAlignment =
                ExcelHorizontalAlignment.Left;
            ws.Cells[$"A{amountInWordsRow}:H{amountInWordsRow}"].Style.VerticalAlignment =
                ExcelVerticalAlignment.Center;
            ws.Cells[$"A{amountInWordsRow}:H{amountInWordsRow}"].Style.Font.Bold = true;
            ws.Row(amountInWordsRow).Height = 35;


            ws.Cells["A32"].Value = $"Bank Details :- {debitNote.BankName}\n" +
                                    $"{debitNote.BankAddress}\n" +
                                    $"Current A/C NO : {debitNote.AccountNo}\n" +
                                    $"IFSC Code : {debitNote.IfscCode}";
            ws.Cells["A32"].Style.WrapText = true;

            // ==========================
            // TOTALS (MATCHING PDF LABELS)
            // ==========================

            // 1. Add missing Labels in Column I
            ws.Cells["F31"].Value = "Value of Goods";
            ws.Cells["F32"].Value = "GST Amount";
            ws.Cells["F33"].Value = "Bill Amount";
            ws.Cells["I31:I33"].Style.Font.Bold = true;

            // 2. Put values in Column K (Align with Amount Header)
            ws.Cells["J31"].Value = debitNote.DebitNoteAmount;
            ws.Cells["J32"].Value = debitNote.Items.Sum(x => x.GstAmount);
            ws.Cells["J33"].Value = debitNote.GrandTotal;

            ws.Cells["J31:J33"].Style.Numberformat.Format = "₹ #,##0.00";
            ws.Cells["J31:J33"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Right;

            return package.GetAsByteArray();
        }
    }
}