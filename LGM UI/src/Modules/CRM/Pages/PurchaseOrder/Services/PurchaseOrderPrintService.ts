// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import { getPOPdfData } from "./PurchaseOrderService";
// import stampImage from "../../../../../assets/STAMPSIGN.png";
// import letterheadImg from "../../../../../assets/NewLetterhead.jpeg";
// import { toast } from "sonner";

// const loadImage = (src: string): Promise<HTMLImageElement | null> => {
//   return new Promise((resolve) => {
//     if (!src) return resolve(null);
//     const img = new Image();
//     img.crossOrigin = "anonymous";
//     img.src = src;
//     img.onload = () => resolve(img);
//     img.onerror = () => resolve(null);
//   });
// };

// export const printPurchaseOrderPDF = async (id: number) => {
//   try {
//     const data = await getPOPdfData(id);

//     const doc = new jsPDF("p", "mm", "a4");
//     const pageWidth = doc.internal.pageSize.width;
//     const pageHeight = doc.internal.pageSize.height;
//     const margin = 14;
//     const primary: [number, number, number] = [21, 64, 104];

//     const setBold = () => {
//       doc.setFont("times", "bold");
//       doc.setTextColor(...primary);
//     };
//     const setNormal = () => {
//       doc.setFont("times", "normal");
//       doc.setTextColor(0);
//     };

//     const currencySymbol = data.currencySymbol || "₹";
//     const symbol = currencySymbol === "₹" ? "Rs." : currencySymbol;

//     const formatCurrency = (val: number) =>
//       new Intl.NumberFormat("en-IN", {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2,
//       }).format(val || 0);

//     const checkPageBreak = (y: number, height: number) => {
//       if (y + height > pageHeight - 10) {
//         doc.addPage();
//         return 20;
//       }
//       return y;
//     };

//     // ================= HEADER (LETTERHEAD) =================
//     const letterheadImage = await loadImage(letterheadImg);
//     let headerHeight = 35;

//     if (letterheadImage) {
//       const horizontalMargin = 14;
//       const topMargin = 10;
//       const imageWidth = pageWidth - 2 * horizontalMargin;
//       const aspectRatio = letterheadImage.width / letterheadImage.height;
//       const imageHeight = imageWidth / aspectRatio;
//       headerHeight = imageHeight + topMargin;
//       doc.addImage(
//         letterheadImage,
//         "PNG",
//         horizontalMargin,
//         topMargin,
//         imageWidth,
//         imageHeight,
//       );
//     }

//     // ================= TITLE (Restored Text) =================
//     let y = headerHeight + 5;
//     doc.setFont("times", "bold");
//     doc.setFontSize(11);
//     doc.setTextColor(...primary);
//     doc.text(
//       "PURCHASE ORDER / CONTRACT / SCHEDULING AGREEMENT / WORK ORDER",
//       pageWidth / 2,
//       y,
//       { align: "center" },
//     );
//     doc.setDrawColor(...primary);
//     // doc.line(pageWidth / 2 - 65, y + 1.5, pageWidth / 2 + 65, y + 1.5);

//     y += 8;

//     // ================= INFO BOX (RESTORED TO OLD PO LOGIC) =================
//     const boxHeight = 34;
//     doc.setDrawColor(0); // Black border
//     doc.setLineWidth(0.3);
//     doc.rect(margin, y, pageWidth - margin * 2, boxHeight);
//     doc.line(pageWidth / 2, y, pageWidth / 2, y + boxHeight);

//     const leftX = margin + 5;
//     const rowY = y + 6;
//     const valueOffset = 18;
//     doc.setFontSize(9);

//     // LEFT SIDE (Order details + Vendor)
//     doc.setFont("times", "bold");
//     doc.setTextColor(0); // Black for labels
//     doc.text("Order No:", leftX, rowY);
//     doc.text("Date:", leftX, rowY + 6);

//     // Order Values (Black Bold)
//     doc.text(data.purchaseOrderNo || "-", leftX + valueOffset, rowY);
//     doc.text(
//       data.purchaseOrderDate
//         ? new Date(data.purchaseOrderDate).toLocaleDateString("en-GB", {
//             day: "2-digit",
//             month: "long",
//             year: "numeric",
//           })
//         : "-",
//       leftX + valueOffset,
//       rowY + 6,
//     );

//     // Label "To:" (Black Bold)
//    doc.text("To:", leftX, rowY + 12);

// // vendorName + VendorCode
// doc.setFont("times", "bold");
// doc.setTextColor(primary[0], primary[1], primary[2]);

// const vendorDisplayText =
//   `${data.vendorName || "-"}` +
//   `${data.vendorCode ? ` (${data.vendorCode})` : ""}`;

// doc.text(vendorDisplayText, leftX + 10, rowY + 12);

//     let vendorY = rowY + 17;

//     // vendorContactPerson (PRIMARY COLOR & BOLD)
//     if (data.vendorContactPerson) {
//       doc.setFont("times", "bold");
//       doc.setTextColor(primary[0], primary[1], primary[2]);
//       doc.text(data.vendorContactPerson, leftX, vendorY);
//       vendorY += 5;
//     }

//     // vendorAddr (BACK TO BLACK & NORMAL)
//     doc.setFont("times", "normal");
//     doc.setTextColor(0);
//     const vendorAddr = doc.splitTextToSize(
//       data.vendorAddress || "-",
//       pageWidth / 2 - 20,
//     );
//     doc.text(vendorAddr, leftX, vendorY);

//     // RIGHT SIDE (Company Details)
//     const rightX = pageWidth / 2 + 5;

//     // companyContactPerson (PRIMARY COLOR & BOLD)
//     doc.setFont("times", "bold");
//     doc.setTextColor(primary[0], primary[1], primary[2]);
//     doc.text(data.companyContactPerson || "-", rightX, rowY);

//     // companyName (PRIMARY COLOR & BOLD)
//     doc.text(data.companyName || "-", rightX, rowY + 6);

//     // companyAddr (BACK TO BLACK & NORMAL)
//     doc.setFont("times", "normal");
//     doc.setTextColor(0);
//     const companyAddr = doc.splitTextToSize(
//       data.companyAddress || "-",
//       pageWidth / 2 - 18,
//     );
//     doc.text(companyAddr, rightX, rowY + 12);

//     y += boxHeight + 6;

//     // ================= TABLE (PURCHASE ORDER STYLE) =================
//     const boxY = y + 4;

//     const subtotal =
//       data.items?.reduce((s: number, i: any) => s + (i.total || 0), 0) || 0;

//     autoTable(doc, {
//       startY: boxY,
//       head: [
//         ["SR NO", "PART NO.", "DESCRIPTION", "RATE", "QTY", "TOTAL PRICE"],
//       ],
//       body: [
//         ...(data.items || []).map((item: any, i: number) => {
//           // Determine which master description to use
//           const masterDesc =
//             item.itemType === "Accessory"
//               ? item.accessoriesDescription
//               : item.productDescription;

//           // Combine text for autoTable to calculate height correctly
//           const combinedText = masterDesc
//             ? `${item.description || "-"}\n\n${masterDesc}`
//             : item.description || "-";

//           return [
//             i + 1,
//             item.partNo || "-",
//             combinedText, // This text will be hidden and redrawn in didDrawCell
//             `${symbol} ${formatCurrency(item.rate)}`,
//             item.quantity,
//             `${symbol} ${formatCurrency(item.total)}`,
//           ];
//         }),
//         // Subtotal (Blue Row)
//         [
//           {
//             content: "Subtotal",
//             colSpan: 5,
//             styles: {
//               fillColor: [255, 255, 255],
//               textColor: primary,
//               halign: "right",
//               fontStyle: "bold",
//             },
//           },
//           {
//             content: `${symbol} ${formatCurrency(subtotal)}`,
//             styles: {
//               fillColor: [255, 255, 255],
//               textColor: primary,
//               halign: "right",
//               fontStyle: "bold",
//             },
//           },
//         ],
//         [
//           {
//             content: "Freight Charges",
//             colSpan: 5,
//             styles: {
//               fillColor: [255, 255, 255],
//               textColor: primary,
//               halign: "right",
//               fontStyle: "bold",
//             },
//           },
//           {
//             content: `${symbol} ${formatCurrency(data.freightCharges || 0)}`,
//             styles: {
//               fillColor: [255, 255, 255],
//               textColor: primary,
//               halign: "right",
//               fontStyle: "bold",
//             },
//           },
//         ],
//         [
//           {
//             content: "TOTAL PRICE",
//             colSpan: 5,
//             styles: {
//               fillColor: primary,
//               textColor: 255,
//               halign: "right",
//               fontStyle: "bold",
//               fontSize: 12,
//             },
//           },
//           {
//             content: `${symbol} ${formatCurrency(data.grandTotal)}`,
//             styles: {
//               fillColor: primary,
//               textColor: 255,
//               halign: "right",
//               fontStyle: "bold",
//               fontSize: 12,
//             },
//           },
//         ],
//       ],
//       theme: "grid",
//       styles: {
//         font: "times",
//         fontSize: 10,
//         lineColor: [0, 0, 0],
//         lineWidth: 0.2,
//         cellPadding: 2,
//       },
//       headStyles: {
//         fillColor: primary,
//         textColor: 255,
//         fontStyle: "bold",
//         halign: "center",
//         fontSize: 11,
//       },
//       columnStyles: {
//         0: { cellWidth: 12, halign: "center" },
//         1: { cellWidth: 30 },
//         2: { cellWidth: "auto" }, // DESCRIPTION Column
//         3: { cellWidth: 35, halign: "right" },
//         4: { cellWidth: 15, halign: "center" },
//         5: { cellWidth: 38, halign: "right" },
//       },

//       // ================= CUSTOM COLOR DRAWING LOGIC =================
//       didDrawCell: (d) => {
//         // Target Description column (Index 2)
//         if (d.section === "body" && d.column.index === 2) {
//           const item = data.items[d.row.index];
//           if (!item) return;

//           const masterDesc =
//             item.itemType === "Accessory"
//               ? item.accessoriesDescription
//               : item.productDescription;

//           // Clear cell background to remove default text
//           doc.setFillColor(255, 255, 255);
//           doc.rect(
//             d.cell.x + 0.2,
//             d.cell.y + 0.2,
//             d.cell.width - 0.4,
//             d.cell.height - 0.4,
//             "F",
//           );

//           const x = d.cell.x + 2;
//           let yText = d.cell.y + 4;
//           const maxWidth = d.cell.width - 4;

//           // 1. Draw Description in BLACK
//           doc.setFont("times", "normal");
//           doc.setTextColor(0, 0, 0);
//           const descLines = doc.splitTextToSize(
//             item.description || "-",
//             maxWidth,
//           );
//           doc.text(descLines, x, yText);

//           // 2. Draw Master Description in PRIMARY COLOR
//           if (masterDesc) {
//             yText += descLines.length * 4.5 + 2; // Calculate offset
//             doc.setTextColor(primary[0], primary[1], primary[2]);
//             const masterLines = doc.splitTextToSize(masterDesc, maxWidth);
//             doc.text(masterLines, x, yText);
//           }

//           // Reset color for subsequent cells
//           doc.setTextColor(0, 0, 0);
//         }
//       },
//       // ==============================================================

//       showHead: "firstPage",
//     });

//     let lastY = (doc as any).lastAutoTable.finalY + 8;

//     // ================= TERMS & CONDITIONS =================
//     const termsLines = doc.splitTextToSize(
//       data.termsConditions || "No terms available",
//       pageWidth - 35,
//     );
//     const termsBoxHeight = termsLines.length * 5 + 4;
//     lastY = checkPageBreak(lastY, termsBoxHeight + 10);

//     doc.setFillColor(...primary);
//     doc.rect(margin, lastY, pageWidth - margin * 2, 7, "F");
//     doc.setDrawColor(0);
//     doc.rect(margin, lastY, pageWidth - margin * 2, 7, "S");
//     doc.setTextColor(255);
//     doc.setFont("times", "bold");
//     doc.text("TERMS & CONDITIONS", pageWidth / 2, lastY + 5, {
//       align: "center",
//     });

//     doc.setTextColor(0);
//     doc.setFont("times", "normal");
//     doc.rect(margin, lastY + 7, pageWidth - margin * 2, termsBoxHeight);
//     doc.text(termsLines, margin + 4, lastY + 11);

//     lastY += termsBoxHeight + 12;

//     // ================= FOOTER NOTE & STAMP =================
//     if (data.customerNotes) {
//       const noteLines = doc.splitTextToSize(data.customerNotes, pageWidth - 80); // Reduced width for stamp space
//       lastY = checkPageBreak(lastY, 30);
//       setBold();
//       doc.setFontSize(10);
//       doc.text("* Note :", 14, lastY);
//       setNormal();
//       doc.text(noteLines, 28, lastY);

//       // 3. Added Stamp Image on the Right
//       if (stampImage) {
//         doc.addImage(stampImage, "PNG", pageWidth - 65, lastY - 5, 50, 25);
//       }
//     }

//     doc.save(`PO_${data.purchaseOrderNo}.pdf`);
//   } catch (err) {
//     console.error(err);
//     toast.error("PDF generation failed");
//   }
// };


import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getPOPdfData } from "./PurchaseOrderService";
import stampImage from "../../../../../assets/STAMPSIGN.png";
import letterheadImg from "../../../../../assets/NewLetterhead.jpeg";
import { toast } from "sonner";

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

export const printPurchaseOrderPDF = async (id: number) => {
  try {
    const data = await getPOPdfData(id);

   const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a4",
    compress: true,
  });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 14;
    const primary: [number, number, number] = [21, 64, 104];

    const setBold = () => {
      doc.setFont("times", "bold");
      doc.setTextColor(...primary);
    };
    const setNormal = () => {
      doc.setFont("times", "normal");
      doc.setTextColor(0);
    };

    const currencySymbol = data.currencySymbol || "₹";
    const symbol = currencySymbol === "₹" ? "Rs." : currencySymbol;

    const formatCurrency = (val: number) =>
      new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(val || 0);

    const checkPageBreak = (y: number, height: number) => {
      if (y + height > pageHeight - 10) {
        doc.addPage();
        return 20;
      }
      return y;
    };

    // ================= HEADER (LETTERHEAD) =================
    const letterheadImage = await loadImage(letterheadImg);
    let headerHeight = 35;

    if (letterheadImage) {
      const horizontalMargin = 14;
      const topMargin = 10;
      const imageWidth = pageWidth - 2 * horizontalMargin - 2;
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

    // ================= TITLE (Restored Text) =================
    let y = headerHeight + 5;
    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...primary);
    doc.text(
      "PURCHASE ORDER / CONTRACT / SCHEDULING AGREEMENT / WORK ORDER",
      pageWidth / 2,
      y,
      { align: "center" },
    );
    doc.setDrawColor(...primary);
    // doc.line(pageWidth / 2 - 65, y + 1.5, pageWidth / 2 + 65, y + 1.5);

    y += 8;

    // ================= INFO BOX (RESTORED TO OLD PO LOGIC) =================
    const boxHeight = 34;
    doc.setDrawColor(0); // Black border
    doc.setLineWidth(0.3);
    doc.rect(margin, y, pageWidth - margin * 2, boxHeight);
    doc.line(pageWidth / 2, y, pageWidth / 2, y + boxHeight);

    const leftX = margin + 5;
    const rowY = y + 6;
    const orderValueX = leftX + 16;
const commonValueX = leftX + 9;
    doc.setFontSize(9);

    // LEFT SIDE (Order details + Vendor)
    doc.setFont("times", "bold");
    doc.setTextColor(0); // Black for labels
    doc.text("Order No:", leftX, rowY);
    doc.text("Date:", leftX, rowY + 6);

    // Order Values (Black Bold)
doc.text(data.purchaseOrderNo || "-", orderValueX, rowY);
 doc.text(
  data.purchaseOrderDate
    ? new Date(data.purchaseOrderDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-",
  commonValueX,
  rowY + 6,
);

    // Label "To:" (Black Bold)
   doc.text("To:", leftX, rowY + 12);

// vendorName + VendorCode
doc.setFont("times", "bold");
doc.setTextColor(primary[0], primary[1], primary[2]);

const vendorDisplayText =
  `${data.vendorName || "-"}` +
  `${data.vendorCode ? ` (${data.vendorCode})` : ""}`;

doc.text(vendorDisplayText, leftX + 6, rowY + 12);
    let vendorY = rowY + 17;

    // vendorContactPerson (PRIMARY COLOR & BOLD)
    if (data.vendorContactPerson) {
      doc.setFont("times", "bold");
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text(data.vendorContactPerson, leftX, vendorY);
      vendorY += 5;
    }

    // vendorAddr (BACK TO BLACK & NORMAL)
    doc.setFont("times", "normal");
    doc.setTextColor(0);
    const vendorAddr = doc.splitTextToSize(
      data.vendorAddress || "-",
      pageWidth / 2 - 20,
    );
    doc.text(vendorAddr, leftX, vendorY);

    // RIGHT SIDE (Company Details)
    const rightX = pageWidth / 2 + 5;

    // companyContactPerson (PRIMARY COLOR & BOLD)
    doc.setFont("times", "bold");
    doc.setTextColor(primary[0], primary[1], primary[2]);
    doc.text(data.companyContactPerson || "-", rightX, rowY);

    // companyName (PRIMARY COLOR & BOLD)
    doc.text(data.companyName || "-", rightX, rowY + 6);

    // companyAddr (BACK TO BLACK & NORMAL)
    doc.setFont("times", "normal");
    doc.setTextColor(0);
    const companyAddr = doc.splitTextToSize(
      data.companyAddress || "-",
      pageWidth / 2 - 18,
    );
    doc.text(companyAddr, rightX, rowY + 12);

    y += boxHeight + 6;

    // ================= TABLE (PURCHASE ORDER STYLE) =================
    const boxY = y + 4;

    const subtotal =
      data.items?.reduce((s: number, i: any) => s + (i.total || 0), 0) || 0;

    autoTable(doc, {
      startY: boxY,
      head: [
        ["SR NO", "PART NO.", "DESCRIPTION", "RATE", "QTY", "TOTAL PRICE"],
      ],
      body: [
        ...(data.items || []).map((item: any, i: number) => {
          // Determine which master description to use
          const masterDesc =
            item.itemType === "Accessory"
              ? item.accessoriesDescription
              : item.productDescription;

          // Combine text for autoTable to calculate height correctly
         const combinedText = masterDesc
          ? `${item.description || "-"}\n${masterDesc}\n`
          : `${item.description || "-"}\n`;

          return [
            i + 1,
            item.partNo || "-",
            combinedText, // This text will be hidden and redrawn in didDrawCell
            `${symbol} ${formatCurrency(item.rate)}`,
            item.quantity,
            `${symbol} ${formatCurrency(item.total)}`,
          ];
        }),
        // Subtotal (Blue Row)
        [
          {
            content: "Subtotal",
            colSpan: 5,
            styles: {
              fillColor: [255, 255, 255],
              textColor: primary,
              halign: "right",
              fontStyle: "bold",
            },
          },
          {
            content: `${symbol} ${formatCurrency(subtotal)}`,
            styles: {
              fillColor: [255, 255, 255],
              textColor: primary,
              halign: "right",
              fontStyle: "bold",
            },
          },
        ],
        [
          {
            content: "Freight Charges",
            colSpan: 5,
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
        [
          {
            content: "TOTAL PRICE",
            colSpan: 5,
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
      pageBreak: "auto",
      rowPageBreak: "avoid",
  styles: {
  font: "times",
  fontSize: 9,
  lineColor: [0, 0, 0],
  lineWidth: 0.1,
  cellPadding: {
    top: 3,
    bottom: 3,
    left: 2,
    right: 2,
  },
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
        1: { cellWidth: 30 },
       2: {
  cellWidth: "auto",
  minCellHeight: 22,
}, // DESCRIPTION Column
        3: { cellWidth: 35, halign: "right" },
        4: { cellWidth: 15, halign: "center" },
        5: { cellWidth: 38, halign: "right" },
      },



      // ================= CUSTOM COLOR DRAWING LOGIC =================
      didDrawCell: (d) => {
        // Target Description column (Index 2)
        if (d.section === "body" && d.column.index === 2) {
          const item = data.items[d.row.index];
          if (!item) return;

          const masterDesc =
            item.itemType === "Accessory"
              ? item.accessoriesDescription
              : item.productDescription;

          // Clear cell background to remove default text
         doc.setFillColor(255, 255, 255);
          doc.rect(
            d.cell.x + 0.2,
            d.cell.y + 0.2,
            d.cell.width - 0.4,
            d.cell.height - 0.4,
            "F"
          );

          // Draw border again
          doc.setDrawColor(0);
          doc.rect(
            d.cell.x,
            d.cell.y,
            d.cell.width,
            d.cell.height,
            "S"
          );

        const x = d.cell.x + 2;
        let yText = d.cell.y + 4;
        const maxWidth = d.cell.width - 4;

          // 1. Draw Description in BLACK
          doc.setFont("times", "normal");
          doc.setTextColor(0, 0, 0);
          const descLines = doc.splitTextToSize(
            item.description || "-",
            maxWidth,
          );
         doc.text(descLines, x, yText, {
          baseline: "top",
        });

          // 2. Draw Master Description in PRIMARY COLOR
          if (masterDesc) {
            yText += descLines.length * 4.8 + 2; // Calculate offset
            doc.setTextColor(primary[0], primary[1], primary[2]);
            const masterLines = doc.splitTextToSize(masterDesc, maxWidth);
            doc.text(masterLines, x, yText, {
            baseline: "top",
          });
          }

          // Reset color for subsequent cells
          doc.setTextColor(0, 0, 0);
        }
      },
      // ==============================================================

      showHead: "firstPage",
    });

    let lastY = (doc as any).lastAutoTable.finalY + 8;

    // ================= TERMS & CONDITIONS =================
    const termsLines = doc.splitTextToSize(
      data.termsConditions || "No terms available",
      pageWidth - 35,
    );
    const termsBoxHeight = termsLines.length * 5 + 4;
    lastY = checkPageBreak(lastY, termsBoxHeight + 10);

    doc.setFillColor(...primary);
    doc.rect(margin, lastY, pageWidth - margin * 2, 7, "F");
    doc.setDrawColor(0);
    doc.rect(margin, lastY, pageWidth - margin * 2, 7, "S");
    doc.setTextColor(255);
    doc.setFont("times", "bold");
    doc.text("TERMS & CONDITIONS", pageWidth / 2, lastY + 5, {
      align: "center",
    });

    doc.setTextColor(0);
    doc.setFont("times", "normal");
    doc.rect(margin, lastY + 7, pageWidth - margin * 2, termsBoxHeight);
    doc.text(termsLines, margin + 4, lastY + 11);

    lastY += termsBoxHeight + 12;

    // ================= FOOTER NOTE & STAMP =================
    if (data.customerNotes) {
      const noteLines = doc.splitTextToSize(data.customerNotes, pageWidth - 80); // Reduced width for stamp space
      lastY = checkPageBreak(lastY, 30);
      setBold();
      doc.setFontSize(10);
      doc.text("* Note :", 14, lastY);
      setNormal();
      doc.text(noteLines, 28, lastY);

      // 3. Added Stamp Image on the Right
     const stampImgElement = await loadImage(stampImage);

      if (stampImgElement) {
        doc.addImage(
          stampImgElement,
          "PNG",
          pageWidth - 65,
          lastY - 5,
          50,
          25,
        );
      }
    }

    doc.save(`PO_${data.purchaseOrderNo}.pdf`);
  } catch (err) {
    console.error(err);
    toast.error("PDF generation failed");
  }
};
