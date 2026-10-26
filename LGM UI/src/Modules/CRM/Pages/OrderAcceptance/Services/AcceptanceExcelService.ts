import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { getOAById } from "./OrderAcceptanceService";

export const printAcceptanceExcel = async (id: number) => {
  try {
    const data = await getOAById(id);

    const workbook = new ExcelJS.Workbook();
    const sheetName = `OA_${data.customerName || "Order"}`.substring(0, 31);
    const worksheet = workbook.addWorksheet(sheetName, {
      views: [{ showGridLines: true }],
    });

    // --- STYLES ---
    const primaryFill = {
      type: "pattern" as const,
      pattern: "solid" as const,
      fgColor: { argb: "99CCFF" },
    };
    const orangeFill = {
      type: "pattern" as const,
      pattern: "solid" as const,
      fgColor: { argb: "FDE9D9" },
    };
    const greyFill = {
      type: "pattern" as const,
      pattern: "solid" as const,
      fgColor: { argb: "D9D9D9" },
    };
    const sidebarFill = {
      type: "pattern" as const,
      pattern: "solid" as const,
      fgColor: { argb: "A6A6A6" },
    };

    const thinBorder = {
      top: { style: "thin" as const },
      left: { style: "thin" as const },
      bottom: { style: "thin" as const },
      right: { style: "thin" as const },
    };
    const thickBlueBorderSide = {
      style: "thick" as const,
      color: { argb: "0000FF" },
    };
    const center = {
      vertical: "middle" as const,
      horizontal: "center" as const,
      wrapText: true,
    };
    const leftWrap = {
      vertical: "middle" as const,
      horizontal: "left" as const,
      wrapText: true,
    };
    const right = {
      vertical: "middle" as const,
      horizontal: "right" as const,
      wrapText: true,
    };

    const formatDate = (value: any) => {
      if (!value) return "-";
      const d = new Date(value);
      return d.toLocaleDateString("en-GB").replace(/\//g, "-");
    };

    const symbol = data.currencyName === "INR" ? "₹" : "£";

    // --- COLUMN CONFIG ---
    worksheet.columns = [
      { width: 4 },
      { width: 18 },
      { width: 35 },
      { width: 45 },
      { width: 20 },
      { width: 12 },
      { width: 25 },
      { width: 4 },
      { width: 40 },
      { width: 40 },
    ];

    // --- START DYNAMIC COUNTER ---
    let currentRow = 9;

    // --- TITLE ---
    worksheet.mergeCells(`B${currentRow}:G${currentRow}`);
    const titleCell = worksheet.getCell(`B${currentRow}`);
    titleCell.value = "ORDER ACCEPTANCE";
    titleCell.font = {
      name: "Times New Roman",
      size: 18,
      bold: true,
      color: { argb: "0000FF" },
    };
    titleCell.alignment = center;
    currentRow += 2;

    // --- HEADER INFO ---
    worksheet.mergeCells(`B${currentRow}:G${currentRow}`);
    worksheet.getCell(`B${currentRow}`).value =
      `INVOICE NO : ${data.invoiceNo || "-"}`;
    worksheet.getCell(`B${currentRow}`).font = {
      name: "Times New Roman",
      size: 14,
      bold: true,
    };
    currentRow++;

    worksheet.getCell(`B${currentRow}`).value =
      `Date:- ${formatDate(data.orderDate)}`;
    worksheet.getCell(`B${currentRow}`).font = {
      name: "Times New Roman",
      size: 12,
      bold: true,
    };
    currentRow += 2;

    worksheet.getCell(`B${currentRow}`).value =
      `PO NO  : ${data.customerOrderNo || "-"}`;
    worksheet.getCell(`B${currentRow}`).font = {
      name: "Times New Roman",
      size: 12,
      bold: true,
    };
    currentRow++;
    worksheet.getCell(`B${currentRow}`).value =
      `PO DATE: ${formatDate(data.customerOrderDate)}`;
    worksheet.getCell(`B${currentRow}`).font = {
      name: "Times New Roman",
      size: 12,
      bold: true,
    };
    currentRow++;
    const vendorCode =
      data.currencyName === "INR" ? data.vendorCode : data.foreignVendorCode;

    // worksheet.getCell(`B${currentRow}`).value =
    //   `VENDOR CODE : ${vendorCode || "-"}`;
    // worksheet.getCell(`B${currentRow}`).font = {
    //   name: "Times New Roman",
    //   size: 12,
    //   bold: true,
    // };
    // currentRow += 2;

    worksheet.getCell(`B${currentRow}`).value =
      `VENDOR CODE : ${vendorCode || "-"}`;
    worksheet.getCell(`B${currentRow}`).font = {
      name: "Times New Roman",
      size: 12,
      bold: true,
    };
    currentRow++;

    worksheet.getCell(`B${currentRow}`).value =
      `OA NO : ${data.gaxcePurchaseOrderNo || "-"}`;
    worksheet.getCell(`B${currentRow}`).font = {
      name: "Times New Roman",
      size: 12,
      bold: true,
    };
    currentRow += 2;

    // --- ADDRESSES ---
    worksheet.mergeCells(`B${currentRow}:C${currentRow}`);
    worksheet.mergeCells(`E${currentRow}:G${currentRow}`);
    worksheet.getCell(`B${currentRow}`).value = "Invioce Address:-";
    worksheet.getCell(`E${currentRow}`).value = "Ship to Address :-";
    ["B", "E"].forEach((c) => {
      worksheet.getCell(`${c}${currentRow}`).font = {
        name: "Times New Roman",
        size: 12,
        bold: true,
      };
      worksheet.getCell(`${c}${currentRow}`).alignment = leftWrap;
    });
    currentRow++;

    // const addressLines = String(data.address || "-")
    //   .split(/\r?\n/)
    //   .filter((l) => l.trim());

    const invoiceAddress = data.address || "-";

    const shippingAddress = data.address || "-";

    const invoiceLines = String(invoiceAddress)
      .split(/\r?\n/)
      .filter((l) => l.trim());

    const shippingLines = String(shippingAddress)
      .split(/\r?\n/)
      .filter((l) => l.trim());

    const maxLines = Math.max(invoiceLines.length, shippingLines.length);

    for (let i = 0; i < maxLines; i++) {
      worksheet.mergeCells(`B${currentRow}:C${currentRow}`);
      worksheet.getCell(`B${currentRow}`).value =
        invoiceLines[i]?.trim() || "-";

      worksheet.getCell(`B${currentRow}`).font = {
        name: "Times New Roman",
        size: 11,
      };

      worksheet.getCell(`B${currentRow}`).alignment = leftWrap;

      worksheet.mergeCells(`E${currentRow}:G${currentRow}`);
      worksheet.getCell(`E${currentRow}`).value =
        shippingLines[i]?.trim() || "-";

      worksheet.getCell(`E${currentRow}`).font = {
        name: "Times New Roman",
        size: 11,
      };

      worksheet.getCell(`E${currentRow}`).alignment = leftWrap;

      currentRow++;
    }
    currentRow++;

    // --- KIND ATTN ---
    worksheet.mergeCells(`B${currentRow}:G${currentRow}`);
    worksheet.getCell(`B${currentRow}`).value =
      `Kind Attn.: ${data.responsiblePersonName || "-"}`;
    worksheet.getCell(`B${currentRow}`).font = {
      name: "Times New Roman",
      size: 12,
      bold: true,
    };
    worksheet.getCell(`B${currentRow}`).alignment = center;
    currentRow += 2;

    // --- MAIN TABLE HEADER ---
    const tableHeaderRow = currentRow;
    worksheet.getCell(`B${tableHeaderRow}`).value = "SR NO";
    worksheet.mergeCells(`C${tableHeaderRow}:D${tableHeaderRow}`);
    worksheet.getCell(`C${tableHeaderRow}`).value = "Material / DESCRIPTION";
    worksheet.getCell(`E${tableHeaderRow}`).value = "RATE";
    worksheet.getCell(`F${tableHeaderRow}`).value =
      data.currencyName === "INR" ? "QTY" : "UOM";
    worksheet.getCell(`G${tableHeaderRow}`).value =
      data.currencyName === "INR" ? "TOTAL PRICE" : "LIST PRICE";
    ["B", "C", "D", "E", "F", "G"].forEach((col) => {
      const cell = worksheet.getCell(`${col}${tableHeaderRow}`);
      cell.font = { name: "Times New Roman", size: 12, bold: true };
      cell.fill = primaryFill;
      cell.border = thinBorder;
      cell.alignment = center;
    });
    currentRow++;

    // --- TABLE ITEMS ---
    (data.items || []).forEach((item: any, index: number) => {
      worksheet.getCell(`B${currentRow}`).value = index + 1;
      worksheet.mergeCells(`C${currentRow}:D${currentRow}`);
      worksheet.getCell(`C${currentRow}`).value = item.description || "-";
      worksheet.getCell(`C${currentRow}`).font = {
        name: "Times New Roman",
        size: 11,
        bold: true,
        color: { argb: "0000FF" },
      };
      worksheet.getCell(`E${currentRow}`).value = item.rate || 0;
      worksheet.getCell(`E${currentRow}`).numFmt = `"${symbol}"#,##0.00`;
      worksheet.getCell(`F${currentRow}`).value = item.quantity || 1;
      worksheet.getCell(`G${currentRow}`).value = item.total || 0;
      worksheet.getCell(`G${currentRow}`).numFmt = `"${symbol}"#,##0.00`;
      ["B", "C", "D", "E", "F", "G"].forEach((col) => {
        worksheet.getCell(`${col}${currentRow}`).border = thinBorder;
        worksheet.getCell(`${col}${currentRow}`).alignment = center;
      });
      currentRow++;
    });

    // EMPTY TABLE ROW
    ["B", "C", "D", "E", "F", "G"].forEach(
      (col) => (worksheet.getCell(`${col}${currentRow}`).border = thinBorder),
    );
    currentRow++;

    // TOTALS
    worksheet.mergeCells(`B${currentRow}:F${currentRow}`);
    worksheet.getCell(`B${currentRow}`).value =
      `Total net Value: ${data.currencyName || "GBP"}`;
    worksheet.getCell(`B${currentRow}`).font = {
      name: "Times New Roman",
      size: 12,
      bold: true,
    };
    worksheet.getCell(`B${currentRow}`).alignment = right;
    ["B", "C", "D", "E", "F"].forEach(
      (col) => (worksheet.getCell(`${col}${currentRow}`).border = thinBorder),
    );
    worksheet.getCell(`G${currentRow}`).value = data.subtotal || 0;
    worksheet.getCell(`G${currentRow}`).numFmt = `"${symbol}"#,##0.00`;
    worksheet.getCell(`G${currentRow}`).border = thinBorder;

    worksheet.getCell(`G${currentRow}`).alignment = {
  vertical: "middle",
  horizontal: "center",
};
    currentRow += 2;

    // ANNEXURE REF
    worksheet.mergeCells(`B${currentRow}:G${currentRow}`);
    worksheet.getCell(`B${currentRow}`).value =
      "** DETAIL PART NUMBERS AS PER ANNEXURE - I **";
    worksheet.getCell(`B${currentRow}`).font = {
      name: "Times New Roman",
      size: 11,
      bold: true,
      color: { argb: "0000FF" },
    };
    worksheet.getCell(`B${currentRow}`).alignment = center;
    currentRow += 2;

    // HSN
    worksheet.mergeCells(`B${currentRow}:G${currentRow + 1}`);
    const hsnCell = worksheet.getCell(`B${currentRow}`);
    hsnCell.value = `HSN CODE ${data.items?.[0]?.hsnSacCode || "-"}`;
    hsnCell.fill = greyFill;
    hsnCell.font = {
      name: "Times New Roman",
      size: 12,
      bold: true,
      underline: true,
    };
    hsnCell.alignment = center;
    hsnCell.border = thinBorder;
    ["B", "C", "D", "E", "F", "G"].forEach(
      (col) =>
        (worksheet.getCell(`${col}${currentRow + 1}`).border = thinBorder),
    );
    currentRow += 3;

    // TERMS
    worksheet.mergeCells(`B${currentRow}:G${currentRow}`);
    worksheet.getCell(`B${currentRow}`).value = "TERMS & CONDITIONS";
    worksheet.getCell(`B${currentRow}`).fill = primaryFill;
    worksheet.getCell(`B${currentRow}`).font = {
      name: "Times New Roman",
      size: 12,
      bold: true,
    };
    worksheet.getCell(`B${currentRow}`).alignment = center;
    worksheet.getCell(`B${currentRow}`).border = thinBorder;

    const terms = String(data.termsConditions || "")
      .split(/\r?\n/)
      .filter((x) => x.trim());
    terms.forEach((term, idx) => {
      currentRow++;
      worksheet.mergeCells(`B${currentRow}:G${currentRow}`);
      const cell = worksheet.getCell(`B${currentRow}`);
      cell.value = term.startsWith("*") ? term : `* ${term}`;
      cell.font = { name: "Times New Roman", size: 11, bold: true };
      cell.alignment = leftWrap;
      cell.border = {
        left: { style: "thin" },
        right: { style: "thin" },
        ...(idx === terms.length - 1 ? { bottom: { style: "thin" } } : {}),
      };
    });
    currentRow += 2;

    // BANK DETAILS
    worksheet.mergeCells(`B${currentRow}:G${currentRow}`);
    const bankHead = worksheet.getCell(`B${currentRow}`);
    bankHead.value = "BANK DETAILS";
    bankHead.fill = primaryFill;
    bankHead.font = { name: "Times New Roman", size: 12, bold: true };
    bankHead.alignment = center;
    bankHead.border = thinBorder;

    const b = data.bankDetails || {};
    const bankRows = [
      ["BENEFICIARY", `: ${b.accountHolderName || "-"}`],
      ["BANK NAME", `: ${b.bankName || "-"}`],
      ["BANK ADDRESS", `: ${b.bankAddress || "-"}`],
      ["SORT CODE", `: ${b.ifscCode || "-"}`],
      ["ACCOUNT NO.", `: ${b.accountNo || "-"}`],
      ["NAME", `: ${b.accountHolderName || "-"}`],
      ["SWIFT CODE", `: ${b.swiftCode || "-"}`],
      ["IBAN NUMBER", `: ${b.ibanNo || "-"}`],
      ["VAT NO.", `: ${data.vendorVatNo || "-"}`],
    ];
    bankRows.forEach((row, idx) => {
      currentRow++;
      worksheet.mergeCells(`B${currentRow}:G${currentRow}`);
      const cell = worksheet.getCell(`B${currentRow}`);
      if (row[0] === "NAME") {
        cell.value = {
          richText: [
            {
              text: `${row[0]} `,
              font: { name: "Times New Roman", size: 11, bold: true },
            },
            {
              text: row[1],
              font: {
                name: "Times New Roman",
                size: 11,
                bold: true,
                color: { argb: "0000FF" },
              },
            },
          ],
        };
      } else {
        cell.value = `${row[0]} ${row[1]}`;
        cell.font = { name: "Times New Roman", size: 11, bold: true };
      }
      cell.alignment = leftWrap;
      cell.border = {
        left: { style: "thin" },
        right: { style: "thin" },
        ...(idx === bankRows.length - 1 ? { bottom: { style: "thin" } } : {}),
      };
    });
    currentRow += 2;

    // SIG 1
    worksheet.getCell(`B${currentRow}`).value = "For:";
    worksheet.getCell(`B${currentRow}`).font = {
      name: "Arial",
      size: 12,
      bold: true,
    };
    worksheet.getCell(`C${currentRow}`).value = data.vendorName || "-";
    worksheet.getCell(`C${currentRow}`).font = {
      name: "Arial",
      size: 12,
      bold: true,
      color: { argb: "FF0000" },
    };
    currentRow += 3;

    // --- BLUE SEPARATOR LINE (Dynamic Position) ---
    for (let col = 2; col <= 7; col++)
      worksheet.getRow(currentRow).getCell(col).border = {
        bottom: thickBlueBorderSide,
      };
    currentRow += 5;

    // --- ANNEXURE PAGE 2 ---
    worksheet.mergeCells(`B${currentRow}:G${currentRow}`);
    const annxNote = worksheet.getCell(`B${currentRow}`);
    annxNote.value = "** DETAIL PART NUMBERS AS PER ANNEXURE - I **";
    annxNote.font = {
      name: "Times New Roman",
      size: 12,
      bold: true,
      color: { argb: "0000FF" },
    };
    annxNote.alignment = center;
    currentRow += 2;

    const annxHeader = ["SR.NO", "PART NO.", "DESCRIPTION", "", "", "QTY"];
    worksheet.getRow(currentRow).values = ["", ...annxHeader];
    worksheet.mergeCells(`D${currentRow}:F${currentRow}`);
    ["B", "C", "D", "E", "F", "G"].forEach((col) => {
      const cell = worksheet.getCell(`${col}${currentRow}`);
      cell.fill = primaryFill;
      cell.font = { name: "Times New Roman", size: 11, bold: true };
      cell.border = thinBorder;
      cell.alignment = center;
    });
    currentRow++;

    worksheet.mergeCells(`B${currentRow}:G${currentRow}`);
    const annxLabel = worksheet.getCell(`B${currentRow}`);
    annxLabel.value = "ANNEXURE - I";
    annxLabel.fill = orangeFill;
    annxLabel.font = {
      name: "Times New Roman",
      size: 14,
      bold: true,
      color: { argb: "0000FF" },
    };
    annxLabel.alignment = center;
    annxLabel.border = thinBorder;

    (data.items || []).forEach((item, index) => {
      currentRow++;

      // 1. Data Assignment
      worksheet.getCell(`B${currentRow}`).value = index + 1;
      worksheet.getCell(`C${currentRow}`).value = item.partNo || "-";

      worksheet.mergeCells(`D${currentRow}:F${currentRow}`);
      const detailedDesc =
        item.productDescription ||
        item.accessoriesDescription ||
        item.description ||
        "-";
      worksheet.getCell(`D${currentRow}`).value = detailedDesc;

      worksheet.getCell(`G${currentRow}`).value = item.quantity || 1;

      // 2. Styling and Alignment
      ["B", "C", "D", "E", "F", "G"].forEach((col) => {
        const cell = worksheet.getCell(`${col}${currentRow}`);
        cell.font = {
          name: "Times New Roman",
          size: 10,
          bold: true,
          color: { argb: "0000FF" },
        };
        cell.border = thinBorder;

        cell.alignment =
          col === "D"
            ? { vertical: "middle", horizontal: "left", wrapText: true }
            : center;
      });

      const charactersPerLine = 85;
      const linesCount = Math.ceil(detailedDesc.length / charactersPerLine);

      const calculatedHeight = Math.max(40, linesCount * 16);

      worksheet.getRow(currentRow).height = calculatedHeight;
    });

    currentRow += 2;
    // SIG 2
    worksheet.getCell(`B${currentRow}`).value = "For:";
    worksheet.getCell(`B${currentRow}`).font = {
      name: "Arial",
      size: 12,
      bold: true,
    };
    worksheet.getCell(`C${currentRow}`).value = data.vendorName || "-";
    worksheet.getCell(`C${currentRow}`).font = {
      name: "Arial",
      size: 12,
      bold: true,
      color: { argb: "FF0000" },
    };

    // --- FINAL FRAME STYLING ---
    const finalRow = currentRow + 15;
    for (let j = 1; j <= 8; j++)
      worksheet.getRow(1).getCell(j).border = { top: thickBlueBorderSide };
    for (let i = 1; i <= finalRow; i++) {
      worksheet.getCell(`A${i}`).border = { left: thickBlueBorderSide };
      worksheet.getCell(`H${i}`).border = { right: thickBlueBorderSide };
      for (let c = 9; c <= 32; c++)
        worksheet.getRow(i).getCell(c).fill = sidebarFill;
    }
    for (let j = 1; j <= 8; j++)
      worksheet.getRow(finalRow).getCell(j).border = {
        bottom: thickBlueBorderSide,
      };
    for (let i = finalRow + 1; i <= finalRow + 50; i++) {
      for (let c = 1; c <= 32; c++)
        worksheet.getRow(i).getCell(c).fill = sidebarFill;
    }

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `${sheetName}.xlsx`);
  } catch (err) {
    console.error(err);
  }
};
