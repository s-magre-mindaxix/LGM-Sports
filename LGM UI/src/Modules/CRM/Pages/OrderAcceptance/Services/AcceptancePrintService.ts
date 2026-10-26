import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getOAById } from "./OrderAcceptanceService";
import letterheadImg from "../../../../../assets/NewLetterhead.jpeg";
import stampImage from "../../../../../assets/STAMPSIGN.png";

const loadImage = (src: string): Promise<HTMLImageElement | null> => {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
  });
};


export const printAcceptancePDF = async (id: number) => {
  try {
    const data = await getOAById(id);

    const doc = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
      compress: true,
    });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const primary: [number, number, number] = [21, 64, 104];

    const setBold = () => {
      doc.setFont("times", "bold");
      doc.setTextColor(...primary);
    };
    const setNormal = () => {
      doc.setFont("times", "normal");
      doc.setTextColor(0);
    };

    const formatCurrency = (val: number) =>
      new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(val || 0);

    const symbol =
      data.currencyName === "INR" ? "Rs." : data.currencySymbol || "Rs.";
    const currencyCode = data.currencyName || "";
    const isINR = data.currencyName === "INR";

    const totalCGST =
      data.items?.reduce((s: number, i: any) => s + (i.cgstAmount || 0), 0) ||
      0;
    const totalSGST =
      data.items?.reduce((s: number, i: any) => s + (i.sgstAmount || 0), 0) ||
      0;
    const totalIGST =
      data.items?.reduce((s: number, i: any) => s + (i.igstAmount || 0), 0) ||
      0;
    const isIntraState = totalCGST > 0 || totalSGST > 0;

    const checkPageBreak = (y: number, height: number) => {
      if (y + height > pageHeight - 10) {
        doc.addPage();
        return 20;
      }
      return y;
    };

    // ================= HEADER =================
    const letterheadImage = await loadImage(letterheadImg);
    let headerHeight = 35;

    const drawHeader = () => {
      if (letterheadImage) {
        const horizontalMargin = 14;
        const topMargin = 10;
       const imageWidth = pageWidth - 2 * horizontalMargin;
        const aspectRatio = letterheadImage.width / letterheadImage.height;
        const imageHeight = imageWidth / aspectRatio;
        headerHeight = imageHeight + topMargin;
        doc.addImage(
          letterheadImage,
          "PNG",
          horizontalMargin,
          topMargin,
          imageWidth,
          imageHeight,
        );
      }
    };
    drawHeader();

    // ================= TITLE =================
    let y = headerHeight + 5;
    doc.setFontSize(14);
    doc.setTextColor(primary[0], primary[1], primary[2]);
    doc.setFont("times", "bold");
    doc.text("ORDER ACCEPTANCE", pageWidth / 2, y, { align: "center" });

    doc.setDrawColor(primary[0], primary[1], primary[2]);

    y += 10;

    // ================= DETAILS =================
   const drawLine = (label: string, value: string, yPos: number) => {
  setBold();
  doc.setFontSize(10);

  const labelX = 14;
  doc.text(label, labelX, yPos);

  // Draw value just after the label
  const labelWidth = doc.getTextWidth(label);

  setNormal();
  doc.text(String(value || "-"), labelX + labelWidth + 3, yPos);
};

    drawLine(
      "DATE :",
      new Date(data.orderDate).toLocaleDateString("en-GB").replace(/\//g, "-"),
      y,
    );
    drawLine("PO NO :", data.customerOrderNo, y + 5);
    drawLine(
      "PO DATE :",
      data.customerOrderDate
        ? new Date(data.customerOrderDate)
            .toLocaleDateString("en-GB")
            .replace(/\//g, "-")
        : "-",
      y + 10,
    );
    // drawLine("VENDOR CODE :", data.vendorCode, y + 15);
    const vendorCode =
      data.currencyName === "INR" ? data.vendorCode : data.foreignVendorCode;

    drawLine("VENDOR CODE :", vendorCode || "-", y + 15);

    drawLine("OA NO :", data.gaxcePurchaseOrderNo || "-", y + 20);

    // ================= ADDRESS BOX =================
    let boxY = y + 25;
    const invoiceLines = doc.splitTextToSize(data.invoiceAddress || "-", 82);
    const shipLines = doc.splitTextToSize(data.address || "-", 82);
    const maxLines = Math.max(invoiceLines.length, shipLines.length);
    const lineHeight = 4.5;
    const dynamicBoxHeight = maxLines * lineHeight + 9;

    doc.setDrawColor(0);
    doc.rect(14, boxY, pageWidth - 28, dynamicBoxHeight);
    doc.line(pageWidth / 2, boxY, pageWidth / 2, boxY + dynamicBoxHeight);

    setBold();
    doc.setFontSize(10);
    doc.text("INVOICE ADDRESS:-", 16, boxY + 5.5);
    doc.text("SHIP TO ADDRESS :-", pageWidth / 2 + 2, boxY + 5.5);
    setNormal();
    doc.text(invoiceLines, 16, boxY + 10);
    doc.text(shipLines, pageWidth / 2 + 2, boxY + 10);

    boxY += dynamicBoxHeight + 2;

    // ================= KIND ATTN =================
    doc.setDrawColor(0);
    doc.rect(14, boxY, pageWidth - 28, 8);
    setBold();
    doc.text("Kind Attn.:", pageWidth / 2 - 25, boxY + 5.5);
    setNormal();
    const respName =
      data.responsiblePersonName ||
      data.offers?.[0]?.responsiblePersonName ||
      "-";
    doc.text(String(respName).toUpperCase(), pageWidth / 2 + 2, boxY + 5.5);

    // ================= TABLE =================
    boxY += 12;

    autoTable(doc, {
      startY: boxY,
      head: [["SR NO", "Material / DESCRIPTION", "RATE", "QTY", "TOTAL PRICE"]],
      body: [
        ...(data.items || []).map((item: any, i: number) => {        
          const fullText = `${item.description || "-"}`;

          return [
            i + 1,
            fullText,
            `${symbol} ${formatCurrency(item.rate)}`,
            item.quantity,
            `${symbol} ${formatCurrency(item.total)}`,
          ];
        }),
        // Subtotal
        [
          {
            content: "Subtotal",
            colSpan: 4,
            styles: {
              fillColor: [255, 255, 255],
              textColor: primary,
              halign: "right",
              fontStyle: "bold",
            },
          },
          {
            content: `${symbol} ${formatCurrency(data.subtotal)}`,
            styles: {
              fillColor: [255, 255, 255],
              textColor: primary,
              halign: "right",
              fontStyle: "bold",
            },
          },
        ],
        // GST logic
        ...(isINR
          ? isIntraState
            ? [
                ...(totalCGST > 0
                  ? [
                      [
                        {
                          content: "CGST",
                          colSpan: 4,
                          styles: {
                            fillColor: [255, 255, 255],
                            textColor: primary,
                            halign: "right",
                            fontStyle: "bold",
                          },
                        },
                        {
                          content: `${symbol} ${formatCurrency(totalCGST)}`,
                          styles: {
                            fillColor: [255, 255, 255],
                            textColor: primary,
                            halign: "right",
                            fontStyle: "bold",
                          },
                        },
                      ],
                    ]
                  : []),
                ...(totalSGST > 0
                  ? [
                      [
                        {
                          content: "SGST",
                          colSpan: 4,
                          styles: {
                            fillColor: [255, 255, 255],
                            textColor: primary,
                            halign: "right",
                            fontStyle: "bold",
                          },
                        },
                        {
                          content: `${symbol} ${formatCurrency(totalSGST)}`,
                          styles: {
                            fillColor: [255, 255, 255],
                            textColor: primary,
                            halign: "right",
                            fontStyle: "bold",
                          },
                        },
                      ],
                    ]
                  : []),
              ]
            : totalIGST > 0
              ? [
                  [
                    {
                      content: "IGST",
                      colSpan: 4,
                      styles: {
                        fillColor: [255, 255, 255],
                        textColor: primary,
                        halign: "right",
                        fontStyle: "bold",
                      },
                    },
                    {
                      content: `${symbol} ${formatCurrency(totalIGST)}`,
                      styles: {
                        fillColor: [255, 255, 255],
                        textColor: primary,
                        halign: "right",
                        fontStyle: "bold",
                      },
                    },
                  ],
                ]
              : []
          : []),
        // Freight
        ...(!isINR || Number(data.freightCharges || 0) > 0
          ? [
              [
                {
                  content: "Freight Charges",
                  colSpan: 4,
                  styles: {
                    fillColor: [255, 255, 255],
                    textColor: primary,
                    halign: "right",
                    fontStyle: "bold",
                  },
                },
                {
                  content: `${symbol} ${formatCurrency(data.freightCharges || 0)}`,
                  styles: {
                    fillColor: [255, 255, 255],
                    textColor: primary,
                    halign: "right",
                    fontStyle: "bold",
                  },
                },
              ],
            ]
          : []),
        // Grand Total
        [
          {
            content: `Grand Total (${currencyCode})`,
            colSpan: 4,
            styles: {
              fillColor: primary,
              textColor: 255,
              halign: "right",
              fontStyle: "bold",
              fontSize: 12,
            },
          },
          {
            content: `${symbol} ${formatCurrency(data.grandTotal)}`,
            styles: {
              fillColor: primary,
              textColor: 255,
              halign: "right",
              fontStyle: "bold",
              fontSize: 12,
            },
          },
        ],
      ],
      theme: "grid",
      styles: {
        font: "times",
        fontSize: 9,
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
        cellPadding: 2,
        textColor: [0, 0, 0],
      },
      headStyles: {
        fillColor: primary,
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
        fontSize: 11,
      },
      columnStyles: {
        0: { cellWidth: 12, halign: "center" },
        1: { cellWidth: "auto" },
        2: { cellWidth: 38, halign: "right" },
        3: { cellWidth: 12, halign: "center" },
        4: { cellWidth: 38, halign: "right" },
      },
      didDrawCell: (d) => {
        // Only target the body and the Description column (Index 1)
        if (d.section === "body" && d.column.index === 1) {
          const item = data.items[d.row.index];
          if (!item) return;

          const masterDesc =
            item.itemType === "Accessory"
              ? item.accessoriesDescription
              : item.productDescription;

          // 1. Clear the cell background to remove default black text
          doc.setFillColor(255, 255, 255);
          doc.rect(
            d.cell.x + 0.2,
            d.cell.y + 0.2,
            d.cell.width - 0.4,
            d.cell.height - 0.4,
            "F",
          );

          const x = d.cell.x + 2;
          let yText = d.cell.y + 4;
          const maxWidth = d.cell.width - 4;

          // 2. Draw Main Description in BLACK
          doc.setFont("times", "normal");
          doc.setTextColor(0, 0, 0);
          const mainLines = doc.splitTextToSize(
            item.description || "-",
            maxWidth,
          );
          doc.text(mainLines, x, yText);

          // 3. Draw Master Description in PRIMARY COLOR
          if (masterDesc) {
            yText += mainLines.length * 4.5 + 2; // Move cursor down
            doc.setTextColor(primary[0], primary[1], primary[2]);
            const masterLines = doc.splitTextToSize(masterDesc, maxWidth);
            doc.text(masterLines, x, yText);
          }

          // 4. Reset text color for other cells
          doc.setTextColor(0, 0, 0);
        }
      },
      showHead: "firstPage",
      margin: { top: headerHeight + 5 },
    });

    let lastY = (doc as any).lastAutoTable.finalY + 5;

    // ================= HSN CODE BOX =================
    lastY = checkPageBreak(lastY, 10);
    doc.setDrawColor(0);
    doc.rect(14, lastY, pageWidth - 28, 7);
    setBold();
    doc.text("HSN/SAC CODE :", pageWidth / 2 - 24, lastY + 4.5);
    setNormal();
    doc.text(
      data.items?.[0]?.hsnSacCode || "-",
      pageWidth / 2 + 5,
      lastY + 4.5,
    );

    lastY += 13;

    // ================= TERMS & CONDITIONS BOX =================
    const termsLines = doc.splitTextToSize(
      data.termsConditions || "",
      pageWidth - 35,
    );
    const termsBoxHeight = termsLines.length * 5 + 4;
    lastY = checkPageBreak(lastY, termsBoxHeight + 10);

    doc.setFillColor(...primary);
    doc.rect(14, lastY, pageWidth - 28, 7, "F");
    doc.setDrawColor(0);
    doc.rect(14, lastY, pageWidth - 28, 7, "S");

    doc.setTextColor(255);
    doc.setFont("times", "bold");
    doc.text("Terms & Conditions", pageWidth / 2, lastY + 5, {
      align: "center",
    });

    doc.setTextColor(0);
    doc.setFont("times", "normal");
    doc.rect(14, lastY + 7, pageWidth - 28, termsBoxHeight);
    doc.text(termsLines, 18, lastY + 11);

    lastY += termsBoxHeight + 13;

    // ================= BANK DETAILS BOX =================
    const b = data.bankDetails || {};
    const bankLines = [
      `ACCOUNT HOLDER NAME: ${b.accountHolderName || ""}`,
      `BANK NAME: ${b.bankName || ""}`,
      `ACCOUNT NO.: ${b.accountNo || ""}`,
      `IFSC / SWIFT: ${b.swiftCode || b.ifscCode || ""}`,
      `BANK ADDRESS: ${b.bankAddress || ""}`,
    ].filter((line) => !line.endsWith(": "));

    const bankBoxHeight = bankLines.length * 5 + 4;
    lastY = checkPageBreak(lastY, bankBoxHeight + 15);

    doc.setFillColor(...primary);
    doc.rect(14, lastY, pageWidth - 28, 7, "F");
    doc.setDrawColor(0);
    doc.rect(14, lastY, pageWidth - 28, 7, "S");

    doc.setTextColor(255);
    doc.setFont("times", "bold");
    doc.text("Payment Transfer Details", pageWidth / 2, lastY + 5, {
      align: "center",
    });

    doc.setTextColor(0);
    doc.setFont("times", "normal");
    doc.rect(14, lastY + 7, pageWidth - 28, bankBoxHeight);
    doc.text(bankLines, 18, lastY + 12);

    // 3. CORRECT COORDINATE UPDATE:
    lastY = lastY + 7 + bankBoxHeight + 12;

    // ================= FOOTER NOTE & STAMP =================
    const noteText = data.customerNotes || "This is a computer generated copy.";
    const noteLines = doc.splitTextToSize(noteText, pageWidth - 80); // Reduced width to give space for stamp

    lastY = checkPageBreak(lastY, 30);

    setBold();
    doc.setFontSize(10);
    doc.text("* Note :", 14, lastY);
    setNormal();
    doc.text(noteLines, 28, lastY);

    // 3. Draw Stamp Image on the Right
   const stampImgElement = await loadImage(stampImage);

      if (stampImgElement) {
        doc.addImage(
        stampImgElement,
        "PNG",
        pageWidth - 65, // Right position
        lastY - 5, // Vertical alignment with note
        50, // Width
        25, // Height
      );
    }

    // ================= SAVE =================
    doc.save(`${data.customerOrderNo || "Order_Acceptance"}_OA.pdf`);
  } catch (err) {
    console.error("PDF Error:", err);
  }
};
