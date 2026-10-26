// import React, { useEffect, useRef } from "react";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import letterheadImg from "../../../../assets/NewLetterhead.jpeg";
// import stampSignImg from "../../../../assets/STAMPSIGN.png";
// import { FaSpinner } from "react-icons/fa";
// import type { ProformaInvoicePdfData } from "./Services/types";

// interface PDFModalProps {
//   data: ProformaInvoicePdfData;
//   onClose: () => void;
// }

// const ProformaInvoicePDFModal: React.FC<PDFModalProps> = ({
//   data,
//   onClose,
// }) => {
//   const hasGenerated = useRef(false);

//   useEffect(() => {
//     if (!hasGenerated.current && data) {
//       hasGenerated.current = true;
//       const initPDF = async () => {
//         try {
//           await generatePDF();
//         } catch (error) {
//           console.error("Proforma PDF Error:", error);
//         } finally {
//           onClose();
//         }
//       };
//       initPDF();
//     }
//   }, [data, onClose]);

//   const loadImage = (src: string): Promise<HTMLImageElement | null> => {
//     return new Promise((resolve) => {
//       if (!src) return resolve(null);
//       const img = new Image();
//       img.crossOrigin = "anonymous";
//       img.src = src;
//       img.onload = () => resolve(img);
//       img.onerror = () => resolve(null);
//     });
//   };

//   const generatePDF = async () => {
//     const doc = new jsPDF("p", "mm", "a4");
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const pageHeight = doc.internal.pageSize.getHeight();
//     const margin = 14;
//     const primaryBlue: [number, number, number] = [21, 64, 104];

//     const formatCurrency = (val: number = 0) => {
//       return `Rs. ${val.toLocaleString("en-IN", {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2,
//       })}`;
//     };

//     const [letterheadImage, stampImage] = await Promise.all([
//       loadImage(letterheadImg),
//       loadImage(stampSignImg),
//     ]);

//     // ================= 1. HEADER =================
//     let headerHeight = 35;
//     if (letterheadImage) {
//       const imageWidth = pageWidth - margin * 2;
//       const aspectRatio = letterheadImage.width / letterheadImage.height;
//       const imageHeight = imageWidth / aspectRatio;
//       headerHeight = imageHeight + 8;
//       doc.addImage(letterheadImage, "PNG", margin, 10, imageWidth, imageHeight);
//     }

//     let currentY = headerHeight;

//     // ================= 2. TITLE BAR =================
//     doc.setFillColor(...primaryBlue);
//     doc.rect(margin, currentY, pageWidth - margin * 2, 7, "F");
//     doc.setTextColor(255);
//     doc.setFont("times", "bold");
//     doc.setFontSize(11);
//     doc.text("PROFORMA INVOICE", pageWidth / 2, currentY + 5, {
//       align: "center",
//     });

//     currentY += 10;

//     // ================= 3. TOP INFO GRID =================
//     autoTable(doc, {
//       startY: currentY,
//       body: [
//         [
//           "GSTIN Reg No:",
//           data.companyGstin || "N/A",
//           "Proforma No:",
//           data.proformaInvoiceNo || "-",
//         ],
//         [
//           "PAN NO.:",
//           data.companyPan || "N/A",
//           "Date:",
//           data.proformaInvoiceDate || "-",
//         ],
//         ["Range:", "Pune", "Division:", data.division || "N/A"],
//         [
//           "Taxable Service:",
//           "Service",
//           "Vendor Code:",
//           data.vendorCode || "N/A",
//         ],
//       ],
//       theme: "grid",
//       styles: {
//         font: "times",
//         fontSize: 8.5,
//         cellPadding: 1.5,
//         lineColor: [0, 0, 0],
//       },
//       columnStyles: {
//         0: { fontStyle: "bold", cellWidth: 35 },
//         1: { cellWidth: 58 },
//         2: { fontStyle: "bold", cellWidth: 35 },
//         3: { cellWidth: "auto" },
//       },
//     });

//     currentY = (doc as any).lastAutoTable.finalY + 4;

//     // ================= 4. ADDRESS & PO GRID (REDUCED PADDING) =================
//     autoTable(doc, {
//       startY: currentY,
//       head: [
//         [
//           { content: "Customer Name & Address:-", styles: { halign: "left" } },
//           { content: "Consignee Name & Address:", styles: { halign: "left" } },
//         ],
//       ],
//       body: [
//         [
//           (data.customerName || "N/A") +
//             "\n" +
//             (data.customerBillingAddress || "N/A"),
//           data.consigneeDetails || "N/A",
//         ],
//         [
//           `Customer PO: ${data.customerPo || "N/A"}`,
//           `Customer PO: ${data.customerPo || "N/A"}`,
//         ],
//         [
//           `Customer PO Date: ${data.customerPoDate || "N/A"}`,
//           `Customer PO Date: ${data.customerPoDate || "N/A"}`,
//         ],
//         [
//           `State: ${data.customerState || "N/A"}`,
//           `State: ${data.customerState || "N/A"}`,
//         ],
//         [
//           `GSTN No.: ${data.customerGstn || "N/A"}`,
//           `GSTN No.: ${data.customerGstn || "N/A"}`,
//         ],
//       ],
//       theme: "grid",
//       headStyles: {
//         fillColor: primaryBlue,
//         textColor: 255,
//         fontStyle: "bold",
//         fontSize: 9,
//       },
//       styles: {
//         font: "times",
//         fontSize: 8.5,
//         cellPadding: 1.5,
//         lineColor: [0, 0, 0],
//         valign: "top",
//       },
//     });

//     currentY = (doc as any).lastAutoTable.finalY + 4;

//     // ================= 5. ITEMS TABLE =================
//     // autoTable(doc, {
//     //   startY: currentY,
//     //   head: [
//     //     [
//     //       "Sr No",
//     //       "Description & Specification Of Goods",
//     //       "Qty",
//     //       "Rate",
//     //       "Amount",
//     //     ],
//     //   ],
//     //   body: data.items?.map((it) => [
//     //     it.srNo,
//     //     it.description,
//     //     it.quantity,
//     //     formatCurrency(it.rate),
//     //     formatCurrency(it.amount),
//     //   ]),
//     //   theme: "grid",
//     //   headStyles: {
//     //     fillColor: primaryBlue,
//     //     textColor: 255,
//     //     fontStyle: "bold",
//     //     halign: "center",
//     //     fontSize: 9,
//     //   },
//     //   styles: {
//     //     font: "times",
//     //     fontSize: 8.5,
//     //     cellPadding: 2,
//     //     lineColor: [0, 0, 0],
//     //     textColor: [0, 0, 0],
//     //   },
//     //   columnStyles: {
//     //     0: { halign: "center", cellWidth: 12 },
//     //     1: { cellWidth: "auto" },
//     //     2: { halign: "center", cellWidth: 12 },
//     //     3: { halign: "right", cellWidth: 32 },
//     //     4: { halign: "right", cellWidth: 32 },
//     //   },
//     // });
//     autoTable(doc, {
//       startY: currentY,
//       head: [
//         [
//           "Sr No",
//           "Description & Specification Of Goods",
//           "Qty",
//           "Rate",
//           "Amount",
//         ],
//       ],
//       body: data.items?.map((it) => {
//         // We pass combined text so autoTable calculates the correct row height
//         const combinedText = `${it.productName || ""}\n\n${it.description || ""}`;
//         return [
//           it.srNo,
//           combinedText,
//           it.quantity,
//           formatCurrency(it.rate),
//           formatCurrency(it.amount),
//         ];
//       }),
//       theme: "grid",
//       headStyles: {
//         fillColor: primaryBlue,
//         textColor: 255,
//         fontStyle: "bold",
//         halign: "center",
//         fontSize: 9,
//       },
//       styles: {
//         font: "times",
//         fontSize: 8.5,
//         lineColor: [0, 0, 0],
//         textColor: [0, 0, 0],
//       },
//       columnStyles: {
//         0: { halign: "center", cellWidth: 12 },
//         1: { cellWidth: "auto" },
//         2: { halign: "center", cellWidth: 12 },
//         3: { halign: "right", cellWidth: 32 },
//         4: { halign: "right", cellWidth: 32 },
//       },
//       didDrawCell: (d) => {
//         // Target the Description column (Index 1) in the body
//         if (d.section === "body" && d.column.index === 1) {
//           const item = data.items[d.row.index];
//           if (!item) return;

//           // 1. Clear the cell completely to remove the default text
//           doc.setFillColor(255, 255, 255);
//           doc.rect(
//             d.cell.x + 0.4,
//             d.cell.y + 0.4,
//             d.cell.width - 0.8,
//             d.cell.height - 0.8,
//             "F",
//           );

//           const px = d.cell.x + 2; // Horizontal padding
//           let py = d.cell.y + 4; // Starting vertical padding
//           const mw = d.cell.width - 4; // Max width for wrapping

//           // 2. Draw Product/Accessory Name in BLACK & BOLD
//           doc.setTextColor(0);
//           doc.setFont("times", "bold");
//           const nameLines = doc.splitTextToSize(item.productName || "-", mw);
//           doc.text(nameLines, px, py);

//           // 3. Draw Description in PRIMARY BLUE & NORMAL
//           if (item.description) {
//             // Move cursor down based on name length + small gap
//             py += nameLines.length * 4 + 2;

//             doc.setTextColor(...primaryBlue);
//             doc.setFont("times", "normal");
//             const descLines = doc.splitTextToSize(item.description, mw);
//             doc.text(descLines, px, py);
//           }

//           doc.setTextColor(0); // Reset color for other cells
//         }
//       },
//     });

//     currentY = (doc as any).lastAutoTable.finalY + 4;

//     // ================= 6. TOTALS (BLUE BAR FORMAT) =================
//     const totalsData = [
//       ["Subtotal Price", formatCurrency(data.subtotal)],
//       ["Total CGST", formatCurrency(data.totalCgst)],
//       ["Total SGST", formatCurrency(data.totalSgst)],
//       ["Grand Total", formatCurrency(data.grandTotal)],
//     ];

//     autoTable(doc, {
//       startY: currentY,
//       body: totalsData.map((row) => [
//         {
//           content: row[0],
//           styles: {
//             fillColor: primaryBlue,
//             textColor: 255,
//             fontStyle: "bold",
//             halign: "right",
//             fontSize: row[0] === "Grand Total" ? 11 : 9,
//           },
//         },
//         {
//           content: row[1],
//           styles: {
//             fillColor: primaryBlue,
//             textColor: 255,
//             fontStyle: "bold",
//             halign: "right",
//             fontSize: row[0] === "Grand Total" ? 11 : 9,
//           },
//         },
//       ]),
//       theme: "grid",
//       styles: { font: "times", cellPadding: 1.5, lineColor: [0, 0, 0] },
//       margin: { left: pageWidth - margin - 85 },
//       tableWidth: 85,
//     });

//     // Grand Total In Words
//     currentY = (doc as any).lastAutoTable.finalY + 2;
//     doc.setFont("times", "bolditalic");
//     doc.setFontSize(9);
//     doc.setTextColor(0);
//     doc.text(
//       `Amount in words: ${data.grandTotalInWords || "N/A"}`,
//       margin,
//       currentY + 4,
//     );

//     currentY += 10;

//     // ================= 7. BANK & SIGNATURE BOX =================
//     if (currentY + 40 > pageHeight) {
//       doc.addPage();
//       currentY = 20;
//     }

//     doc.setDrawColor(0);
//     doc.rect(margin, currentY, pageWidth - margin * 2, 35);
//     doc.line(pageWidth - 80, currentY, pageWidth - 80, currentY + 35); // Vertical Divider

//     // Bank Details (Left)
//     doc.setFont("times", "normal");
//     doc.setFontSize(8.5);
//     const bankTxt = `BANK DETAILS:\nBank Name: ${data.bankName}\nAddress: ${data.bankAddress}\nAcc No: ${data.accountNo}\nIFSC: ${data.ifscCode}`;
//     doc.text(bankTxt, margin + 3, currentY + 6);

//     // Signature (Right)
//     doc.setFont("times", "bold");
//     doc.text(
//       "For GAXCE SENSORS (OPC) PVT LTD",
//       pageWidth - margin - 3,
//       currentY + 6,
//       { align: "right" },
//     );

//     if (stampImage) {
//       doc.addImage(stampImage, "PNG", pageWidth - 70, currentY + 8, 45, 22);
//     }
//     doc.setFontSize(8);
//     doc.text("Authorized Signatory", pageWidth - margin - 40, currentY + 32, {
//       align: "center",
//     });

//     doc.save(`Proforma_Invoice_${data.proformaInvoiceNo}.pdf`);
//   };

//   return (
//     <div className="fixed inset-0 z-3000 flex items-center justify-center bg-black/60 backdrop-blur-sm">
//       <div className="bg-white rounded-lg shadow-xl p-6 flex items-center gap-4">
//         <FaSpinner className="animate-spin text-2xl text-[#154068]" />
//         <span className="text-sm font-semibold text-gray-700">
//           Generating PDF Report...
//         </span>
//       </div>
//     </div>
//   );
// };

// export default ProformaInvoicePDFModal;

import React, { useEffect, useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaSpinner } from "react-icons/fa";
// Make sure this path is correct for your project structure
import letterheadImg from "../../../../assets/NewLetterhead.jpeg";

interface Props {
  data: any;
  onClose: () => void;
}

const InvoicePDFModal: React.FC<Props> = ({ data, onClose }) => {
  const hasGenerated = useRef(false);

  useEffect(() => {
    if (!hasGenerated.current && data) {
      hasGenerated.current = true;
      generatePDF();
    }
  }, [data]);

  const generatePDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageMargin = 10;
    const contentWidth = pageWidth - pageMargin * 2;

    // --- DATA NORMALIZATION ---
    const normalizeAddress = (address: any): string[] => {
      if (!address) return [];
      if (Array.isArray(address)) return address;
      if (typeof address === "string") {
        return address
          .split(/[\n,]/)
          .map((s) => s.trim())
          .filter((s) => s);
      }
      return [];
    };

    const parseSignature = (sigString: string) => {
      const fallbackDate = new Date()
        .toLocaleDateString("en-CA")
        .replace(/-/g, ".");
      const fallbackTime = new Date().toTimeString().split(" ")[0] + " +05'30'";
      if (
        !sigString ||
        typeof sigString !== "string" ||
        !sigString.startsWith("Date: ")
      ) {
        return { date: fallbackDate, time: fallbackTime };
      }
      const parts = sigString.substring(6).trim().split(" ");
      return { date: parts[0] || fallbackDate, time: parts[1] || fallbackTime };
    };

    const signatureInfo = parseSignature(data.digitalSignatureDate);

    const safeData = {
      // Company and Invoice Details
      gstin: data.companyGstin || "N/A",
      pan: data.companyPan || "N/A",
      range: data.range,
      division: data.division,
      vendorCode: data.vendorCode || "N/A",
      invoiceNo: data.proformaInvoiceNo || "N/A",
      invoiceDate: data.proformaInvoiceDate || "N/A",
      sacCode: data.sacCode || "N/A",
      codeLabel: data.codeLabel || "SAC Code",
      taxableServiceDescription: data.descriptionOfTaxableService  || "N/A",

      // Buyer Details
      buyerName: data.customerName || "N/A",
      buyerAddress: normalizeAddress(data.customerBillingAddress),
      customerPo: data.customerPo || "N/A",
      customerPoDate: data.customerPoDate || "N/A",
      buyerState: data.customerState || "N/A",
      buyerStateCode: data.customerStateCode || "N/A",
      buyerGstin: data.customerGstn || "N/A",
      placeOfSupply: data.customerPlaceOfSupply,

      // Consignee Details (Derived from consigneeDetails)
      consigneeName: data.customerName || "N/A",

      consigneeAddress: normalizeAddress(data.consigneeDetails),
      consigneeState: data.customerState || "N/A", // Assuming same as buyer if not specified
      consigneeStateCode: data.customerStateCode || "N/A",
      consigneeGstin: data.customerGstn || "N/A", // Assuming same as buyer if not specified

      // Items and Totals
      items: data.items || [],
      valueOfGoods: data.subtotal || 0, // CHANGED
      totalCgst: data.totalCgst || 0,
      totalSgst: data.totalSgst || 0,
      grandTotal: data.grandTotal || 0,
      percentage: data.percentage || 0,
      percentageAmount: data.percentageAmount || 0,
      percentageTaxAmount: data.percentageTaxAmount || 0,
      totalAmount: data.totalAmount || 0,
      grandTotalInWords: data.grandTotalInWords || "Zero Rs. Only",
      bankName: data.bankName || "N/A",
      bankAddress: data.bankAddress || "N/A",
      accountNo: data.accountNo || "N/A",
      ifscCode: data.ifscCode || "N/A",
      cgstInWords: data.cgstInWords || "Zero Rs. Only",
      sgstInWords: data.sgstInWords || "Zero Rs. Only",

      // Signature
      authorizedSignatoryName: data.authorizedSignatoryName || "N/A",
      signatoryNameParts: (data.authorizedSignatoryName || "").split(" "),
      signDate: signatureInfo.date,
      signTime: signatureInfo.time,
    };

    const isMaharashtra =
  (safeData.placeOfSupply || "")
    .toLowerCase()
    .trim() === "maharashtra";

    const formatCurrency = (num: number) =>
      Number(num || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    // ================= 1. HEADER (IMAGE) =================
    const topMargin = 5;
    const imgWidth = 190;
    const x = (pageWidth - imgWidth) / 2;
    const imgProps = doc.getImageProperties(letterheadImg);
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
    doc.addImage(letterheadImg, "JPEG", x, topMargin, imgWidth, imgHeight);

    let y = topMargin + imgHeight + 2;

    // ================= 2. TITLE =================
   doc.setFont("times", "bold");
doc.setFontSize(11);
// doc.text("TAX INVOICE", pageWidth / 2, y, { align: "center" });
y += 4;
doc.setFontSize(10);

// ✅ ADD THIS CONDITION (ONLY CHANGE)
const isDummy =
  (data?.proformaInvoiceNo || "")
    .toUpperCase()
    .includes("DUMMY");

doc.text(
  isDummy ? "DUMMY FOR RECIPIENT" : "PROFORMA INVOICE",
  pageWidth / 2,
  y,
  { align: "center" }
);

    // ================= 3. TOP INFORMATION BLOCK (MANUAL LAYOUT) =================
    y += 4;
    const topBoxStartY = y;
    const col1X = pageMargin;
    const col2X = pageWidth / 2;
    const textPadding = 2;
    const lineSpacing = 4.5;

    doc.setFontSize(9);
    doc.setFont("times", "bold");

    // --- Column 1 (Left) ---
    let leftY = topBoxStartY + lineSpacing;
    doc.text("GSTIN Registration Number :-", col1X + textPadding, leftY);
    leftY += lineSpacing;
    doc.text(safeData.gstin, col1X + textPadding, leftY);
    leftY += lineSpacing;
    doc.text(`PAN NO.:- ${safeData.pan}`, col1X + textPadding, leftY);
    leftY += lineSpacing;
    doc.text(`Range:- ${safeData.range}`, col1X + textPadding, leftY);
    leftY += lineSpacing;
    doc.text(`Division:- ${safeData.division}`, col1X + textPadding, leftY);
    leftY += lineSpacing;
    doc.text(
      `Vendor Code No. :- ${safeData.vendorCode}`,
      col1X + textPadding,
      leftY,
    );

    // --- Column 2 (Right) ---
    let rightY = topBoxStartY + lineSpacing;
    doc.text(`Proforma Invoice No:- ${safeData.invoiceNo}`, col2X + textPadding, rightY);
    rightY += lineSpacing;
    doc.text(`Date:- ${safeData.invoiceDate}`, col2X + textPadding, rightY);
    rightY += lineSpacing;
    doc.text(
  `${safeData.codeLabel}:- ${safeData.sacCode}`,
  col2X + textPadding,
  rightY
);
    rightY += lineSpacing;
    doc.text("Description of Taxable Service", col2X + textPadding, rightY);
rightY += lineSpacing;

// Wrap description properly inside right column
const descriptionLines = doc.splitTextToSize(
  safeData.taxableServiceDescription,
  pageWidth / 2 - 15
);

doc.text(
  descriptionLines,
  col2X + textPadding,
  rightY
);

// Move Y according to wrapped lines
rightY += descriptionLines.length * lineSpacing;
    // --- Horizontal Line 1 ---
 const line1Y = Math.max(leftY, rightY) + 2;
    doc.line(pageMargin, line1Y, pageWidth - pageMargin, line1Y);

    // --- Buyer and Consignee Address Section ---
    let currentLeftY = line1Y + lineSpacing;
    doc.text("Billing Name & Address:-", col1X + textPadding, currentLeftY);
    currentLeftY += lineSpacing;
    doc.text(safeData.buyerName, col1X + textPadding, currentLeftY);
    
   const billingAddressText = safeData.buyerAddress
  .filter(
    (line) =>
      line.trim().toLowerCase() !==
      safeData.buyerName.trim().toLowerCase()
  )
  .join(", ");

currentLeftY += lineSpacing;

const billingLines = doc.splitTextToSize(
  billingAddressText,
  pageWidth / 2 - 15
);

doc.text(
  billingLines,
  col1X + textPadding,
  currentLeftY
);

currentLeftY +=
  (billingLines.length - 1) * lineSpacing;

    let currentRightY = line1Y + lineSpacing;

doc.text(
  "Delivery Name & Address:-",
  col2X + textPadding,
  currentRightY
);

const deliveryAddressText = safeData.consigneeAddress
  .filter((line) => line.trim())
  .join(", ");

currentRightY += lineSpacing;

const deliveryLines = doc.splitTextToSize(
  deliveryAddressText,
  pageWidth / 2 - 15
);

doc.text(
  deliveryLines,
  col2X + textPadding,
  currentRightY
);

currentRightY +=
  (deliveryLines.length - 1) * lineSpacing;

    // --- Buyer PO and State Info ---
    let baseY = Math.max(currentLeftY, currentRightY) + lineSpacing;
    doc.text(
      `Customer PO:- ${safeData.customerPo}`,
      col1X + textPadding,
      baseY,
    );
    baseY += lineSpacing;
    doc.text(
      `Customer PO Date:- ${safeData.customerPoDate}`,
      col1X + textPadding,
      baseY,
    );
    baseY += lineSpacing;
    doc.text(`State:- ${safeData.buyerState}`, col1X + textPadding, baseY);
    baseY += lineSpacing;
    doc.text(
      `State Code:- ${safeData.buyerStateCode}`,
      col1X + textPadding,
      baseY,
    );
    baseY += lineSpacing;
    doc.text(`GSTN No.:- ${safeData.buyerGstin}`, col1X + textPadding, baseY);

    // --- Consignee State Info ---
    let consigneeInfoY =
      Math.max(currentLeftY, currentRightY) + lineSpacing * 3;
    doc.text(
      `State:- ${safeData.consigneeState}`,
      col2X + textPadding,
      consigneeInfoY,
    );
    consigneeInfoY += lineSpacing;
    doc.text(
      `State Code:- ${safeData.consigneeStateCode}.`,
      col2X + textPadding,
      consigneeInfoY,
    );
    consigneeInfoY += lineSpacing;
    doc.text(
      `GSTN No.:- ${safeData.consigneeGstin}`,
      col2X + textPadding,
      consigneeInfoY,
    );

    // --- Horizontal Line 2 and Place of Supply ---
    const line2Y = Math.max(baseY, consigneeInfoY) + 3;
    doc.line(pageMargin, line2Y, pageWidth - pageMargin, line2Y);
    const supplyY = line2Y + lineSpacing;
    doc.text(
      `Place of Supply:- ${safeData.placeOfSupply}`,
      col1X + textPadding,
      supplyY,
    );
    doc.text(
      `Place of Supply:- ${safeData.placeOfSupply}`,
      col2X + textPadding,
      supplyY,
    );

    const topBoxEndY = supplyY + 4;
    doc.setLineWidth(0.3);
    doc.rect(pageMargin, topBoxStartY, contentWidth, topBoxEndY - topBoxStartY);
    doc.line(col2X, topBoxStartY, col2X, topBoxEndY);

    y = topBoxEndY;

    // ================= 4. ITEMS TABLE =================
    autoTable(doc, {
      startY: y,
      head: [
        [
          "Sr.no",
          "Description & Specification of Goods",
          "QTY",
          "RATE",
          "AMOUNT",
        ],
      ],
      body: safeData.items.map((item: any, index: number) => {
        // Combine productName and description for a complete entry
        const fullDescription = `${item.productName || ""}${item.description && item.description !== "N/A" ? `\n${item.description}` : ""}`;
        return [
          item.srNo || index + 1,
          fullDescription,
          item.quantity || 0,
          `Rs. ${formatCurrency(item.rate)}`,
          `Rs. ${formatCurrency(item.amount)}`,
        ];
      }),
      theme: "grid",
      margin: { left: pageMargin, right: pageMargin },
      styles: {
        font: "times",
        fontStyle: "bold",
        fontSize: 9,
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: 15, halign: "center" },
        1: { halign: "left" },
        2: { cellWidth: 15, halign: "center" },
        3: { cellWidth: 35, halign: "right" },
        4: { cellWidth: 35, halign: "right" },
      },
    });

    // ================= 5. TOTALS SECTION =================
    const totalsTableY = (doc as any).lastAutoTable.finalY;
    autoTable(doc, {
      startY: totalsTableY,
      theme: "grid",
      margin: { left: pageMargin, right: pageMargin },
      body: [
       [
          {
           content:
            `Bank Details :-\n\n` +
            `${safeData.bankName}\n` +
            `${safeData.bankAddress}\n\n` +
            `Current A/C NO : ${safeData.accountNo}\n` +
            `IFSC Code : ${safeData.ifscCode}`,
         rowSpan: isMaharashtra ? 7 : 6,
            styles: {
              valign: "middle",
              halign: "center",
              fontStyle: "bold",
              minCellHeight: 75,
              cellPadding: 4
            },
          },

          "Value of Goods",
          `Rs. ${formatCurrency(safeData.valueOfGoods)}`,
        ],

      ...(isMaharashtra
  ? [
      [
        "CGST Output @ 9%",
        `Rs. ${formatCurrency(safeData.totalCgst)}`,
      ],
      [
        "SGST Output @ 9%",
        `Rs. ${formatCurrency(safeData.totalSgst)}`,
      ],
    ]
  : [
      [
        "IGST Output @ 18%",
        `Rs. ${formatCurrency(
          safeData.totalCgst + safeData.totalSgst
        )}`,
      ],
    ]),
        // [
        //   {
        //     content: "Bill Amount",
        //     styles: { fillColor: [255, 255, 0], halign: "left" },
        //   },
        //   {
        //     content: `Rs. ${formatCurrency(safeData.grandTotal)}`,
        //     styles: { fillColor: [255, 255, 0] },
        //   },
        // ],
//       [
//   {
//     content: `Percentage on Value Of Goods (${safeData.percentage || 0}%)`,
//     styles: {
//       fillColor: [255, 255, 0],
//       halign: "left"
//     },
//   },
//   {
//     content: `Rs. ${formatCurrency(safeData.percentageAmount || 0)}`,
//     styles: {
//       fillColor: [255, 255, 0],
//       halign: "right"
//     },
//   },
// ],

// [
//   {
//     content: `18% GST On Percentage`,
//     styles: {
//       fillColor: [255, 255, 0],
//       halign: "left"
//     },
//   },
//   {
//     content: `Rs. ${formatCurrency(safeData.percentageTaxAmount || 0)}`,
//     styles: {
//       fillColor: [255, 255, 0],
//       halign: "right"
//     },
//   },
// ],

[
  {
    content: "Total Amount",
    styles: {
      fillColor: [255, 255, 0],
      halign: "left",
      fontStyle: "bold"
    },
  },
  {
    content: `Rs. ${formatCurrency(safeData.totalAmount || 0)}`,
    styles: {
      fillColor: [255, 255, 0],
      halign: "right",
      fontStyle: "bold"
    },
  }
],
],
      styles: {
        font: "times",
        fontStyle: "bold",
        fontSize: 9,
        valign: "middle",
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
      },
     columnStyles: {
            0: {
              cellWidth: 105,
              halign: "center"
            },
            1: {
              cellWidth: 50,
              halign: "left"
            },
            2: {
              cellWidth: 35,
              halign: "right"
            },
          },
    });

    // ================= 6. SIGNATURE SECTION =================
   const signatureTableY = (doc as any).lastAutoTable.finalY;

 autoTable(doc, {
  startY: signatureTableY,
  theme: "grid",
  margin: { left: pageMargin, right: pageMargin },

  pageBreak: "avoid",      // ✅ ADD
  rowPageBreak: "avoid",   // ✅ ADD

  body: [
    [
      {
        content: "For GAXCE SENSORS (OPC) PVT LTD.",
        styles: { valign: "top", minCellHeight: 10 },
      },
      {
        content: "Authorized Signatory",
        styles: {
          valign: "middle",
          halign: "center",
          fontStyle: "bold",
        },
      },
    ],
    [
     {
        content: "Subject to Pune Jurisdiction",
        styles: {
          valign: "top",
          minCellHeight: 35,
          cellPadding: { top: 3, left: 3 },
        },
      },
      {
        content: " ",
        styles: {
          minCellHeight: 35,
        },
      },
    ],
  ],
      styles: {
        font: "times",
        fontStyle: "bold",
        fontSize: 9,
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
      },
didDrawCell: (data) => {

  // ================= PREPARED BY =================
  if (
    data.section === "body" &&
    data.row.index === 1 &&
    data.column.index === 0
  ) {
    const cell = data.cell;

    doc.setFont("times", "bold");
    doc.setFontSize(9);

    doc.text(
      "Prepared By",
      cell.x + 4,
      cell.y + cell.height - 4
    );
  }

  // ================= AUTHORIZED SIGNATORY =================
  if (
    data.section === "body" &&
    data.row.index === 1 &&
    data.column.index === 1
  ) {
    const cell = data.cell;

    doc.setFont("times", "bold");
    doc.setFontSize(11);

    const signatoryName =
      safeData.authorizedSignatoryName &&
      safeData.authorizedSignatoryName !== "N/A"
        ? safeData.authorizedSignatoryName
        : "";

    const nameLines = signatoryName
      .toUpperCase()
      .split(" ")
      .filter(Boolean);

    const nameStartY = cell.y + 8;

    nameLines.forEach((line: string, i: number) => {
      doc.text(
        line,
        cell.x + 6,
        nameStartY + i * 5
      );
    });
  }
},

});

    // ================= 7. SAVE DOCUMENT =================
    doc.save(`Invoice_${safeData.invoiceNo.replace(/\s|\//g, "_")}.pdf`);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="text-white text-center">
        <FaSpinner className="animate-spin text-4xl mx-auto mb-2" />
        <p>Generating PDF...</p>
      </div>
    </div>
  );
};

export default InvoicePDFModal;
