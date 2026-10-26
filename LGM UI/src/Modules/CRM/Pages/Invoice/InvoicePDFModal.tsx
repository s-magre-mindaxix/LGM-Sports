
import React, { useEffect, useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaSpinner } from "react-icons/fa";
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
    
    // --- DATA NORMALIZATION & SANITIZATION ---

    const normalizeAddress = (address: any): string[] => {
      if (!address) return [];
      if (Array.isArray(address)) return address;
      if (typeof address === 'string') {
        const separator = address.includes('\n') ? '\n' : ',';
     return address
  .split(separator)
  .map(s => s.replace(/^,/, "").trim())
  .filter(s => s && s !== "," && s !== ",") // remove empty/junk
  .filter((line, index, self) => self.indexOf(line) === index); 
      }
      return [];
    };

    // Helper to parse the signature string from API: "Date: 2026.04.29 14:53:05 +05:30"
    const parseSignature = (sigString: string) => {
        if (!sigString || typeof sigString !== 'string' || !sigString.startsWith("Date: ")) {
            return {
                date: data.invoiceDate || new Date().toLocaleDateString('en-CA').replace(/-/g, '.'),
                time: new Date().toTimeString().split(' ')[0] + " +05'30'"
            };
        }
        const parts = sigString.substring(6).trim().split(' '); // Remove "Date: "
        const date = parts[0] || 'N/A';
        const time = (parts[1] || '');
        return { date, time };
    };
    const signatureInfo = parseSignature(data.digitalSignatureDate);

    const safeData = {
      companyName: data.companyName || 'N/A',
      companySubText: data.companySubText || 'Dataloggers & Sensors',
      companyAddress: data.companyAddress || 'N/A',
      gstin: data.gstin || data.companyGstin || 'N/A',
      pan: data.pan || data.companyPan || 'N/A',
      range: data.range || 'N/A',
      division: data.division || 'N/A',
      vendorCode: data.vendorCode || 'N/A',
      invoiceNo: data.invoiceNo || 'N/A',
      invoiceDate: data.invoiceDate || data.companyPoDate || 'N/A',
      sacCode: data.sacCode || 'N/A',
      taxableServiceDescription: data.taxableServiceDescription || 'N/A',
      buyerName: data.buyerName || 'N/A',
      buyerAddress: normalizeAddress(data.buyerAddress),
      buyerPo: data.customerPo || data.buyerPo || 'N/A',
      buyerPoDate: data.buyerPoDate || data.companyPoDate || 'N/A',
      buyerState: data.buyerState || 'N/A',
      buyerStateCode: data.buyerStateCode || 'N/A',
      buyerGstin: data.buyerGstin || 'N/A',
      placeOfSupply: data.placeOfSupply || data.buyerState || 'N/A',
      consigneeName: data.consigneeName || 'N/A',
      consigneeAddress: normalizeAddress(data.consigneeAddress),
      consigneeState: data.consigneeState || 'N/A',
      consigneeStateCode: data.consigneeStateCode || 'N/A',
      consigneeGstin: data.consigneeGstin || 'N/A',
      items: data.items || [],
      valueOfGoods: data.valueOfGoods || 0,
      totalCgst: data.totalCgst || 0,
      totalSgst: data.totalSgst || 0,
      totalIgst: data.totalIgst || 0,
      grandTotal: data.grandTotal || 0,
      advanceAmount: data.advanceAmount || 0,
      balanceAmount: data.balanceAmount || 0,
      grandTotalInWords: data.grandTotalInWords || 'Zero Rs. Only',
      cgstInWords: data.cgstInWords || 'Zero Rs. Only',
      sgstInWords: data.sgstInWords || 'Zero Rs. Only',
      igstInWords: data.igstInWords || 'Zero Rs. Only',
      signatoryFullName: data.authorizedSignatoryName || 'N/A',
      signatoryName: (data.authorizedSignatoryName || 'Authorized Signatory').split(' '),
      signDate: signatureInfo.date,
      signTime: signatureInfo.time,
     currencySymbol: data.currencySymbol || "\u20B9",
    };

    const codeLabel = safeData.sacCode?.startsWith("SERV") 
  ? "SAC Code" 
  : "HSN Code";

  const isMaharashtra =
  safeData.placeOfSupply?.trim().toLowerCase() ===
  "maharashtra";

    // --- HELPER FUNCTION FOR CURRENCY ---
   const formatCurrency = (num: number) => {
  return Number(num || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

    doc.setFont("times", "bold");
    doc.setCharSpace(0);

    // ================= HEADER (USING IMAGE) =================
    const topMargin = 10;
    const imgWidth = 180; 
    const x = (pageWidth - imgWidth) / 2;
    const imgProps = doc.getImageProperties(letterheadImg);
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
    doc.addImage(letterheadImg, "JPEG", x, topMargin, imgWidth, imgHeight);

    let y = topMargin + imgHeight + 10;
    
    // ================= TITLE =================
    doc.setFont("times", "bold");
    doc.setFontSize(9);
    doc.text("TAX INVOICE", pageWidth / 2, y, { align: "center" });

    y += 5;
    doc.setFontSize(9);
    doc.setFont("times", "bold");
    doc.text("Original For Recipient", pageWidth / 2, y, { align: "center" });

    // ================= TOP INFORMATION BLOCK (DYNAMIC) =================
    y += 5;
    const topBoxStartY = y;
    const col1X = pageMargin;
    const col2X = pageWidth / 2;
    const contentWidth = pageWidth - pageMargin * 2;
    const colWidth = contentWidth / 2;
    const cellPadding = 1;

    let leftY = topBoxStartY + 5;
   doc.setFontSize(9); 
    doc.setFont("times", "bold");
    doc.text("GSTIN Registration Number :-", col1X + cellPadding, leftY);
    doc.setFont("times", "bold");
    doc.text(safeData.gstin, col1X + cellPadding, leftY += 5);
    doc.setFont("times", "bold");
    doc.text("PAN NO.:-", col1X + cellPadding, leftY += 5);
    doc.setFont("times", "bold");
    doc.text(safeData.pan, col1X + 18, leftY);
    doc.text(`Range:- ${safeData.range}`, col1X + cellPadding, leftY += 5);
    doc.text(`Division:- ${safeData.division}`, col1X + cellPadding, leftY += 5);
    doc.text(`Vendor Code No. :- ${safeData.vendorCode}`, col1X + cellPadding, leftY += 5);

    let rightY = topBoxStartY + 5;
    doc.setFont("times", "bold");
    doc.text(`Invoice No:- ${safeData.invoiceNo}`, col2X + cellPadding, rightY);
    doc.setFont("times", "bold");
    doc.text(`Date:- ${safeData.invoiceDate}`, col2X + cellPadding, rightY += 5);
    doc.setFont("times", "bold");
    doc.text(`${codeLabel}:- ${safeData.sacCode}`, col2X + cellPadding, rightY += 5);
    doc.setFont("times", "bold");
   doc.text(
  "Description of Taxable Service",
  col2X + cellPadding,
  rightY += 5
);

// Wrap description inside right column
const descriptionLines = doc.splitTextToSize(
  safeData.taxableServiceDescription,
  colWidth - 6
);

doc.text(
  descriptionLines,
  col2X + cellPadding,
  rightY += 5
);

// Move cursor according to wrapped text height
rightY += (descriptionLines.length - 1) * 5;

const line1Y = Math.max(leftY, rightY) + 2;
    
    const lineSpacing = 5.2;
    let currentLeftY = line1Y;
    let currentRightY = line1Y;
    
    doc.setFont("times", "bold");
    doc.text("Billing Name & Address:-", col1X + cellPadding, currentLeftY += lineSpacing);
    //doc.setFont("times", "normal");
    doc.setFont("times", "bold"); // 👈 make name bold
    const buyerNameLines = doc.splitTextToSize(safeData.buyerName, colWidth - 4);
    doc.text(buyerNameLines, col1X + cellPadding, currentLeftY += lineSpacing);
    currentLeftY += (buyerNameLines.length -1) * lineSpacing;
    
const buyerAddressText = safeData.buyerAddress
  .filter(line => line.trim() !== safeData.buyerName.trim())
  .join(", ");

const buyerAddressLines = doc.splitTextToSize(
  buyerAddressText,
  colWidth - 4
);

doc.text(
  buyerAddressLines,
  col1X + cellPadding,
  currentLeftY += lineSpacing
);

currentLeftY += (buyerAddressLines.length - 1) * lineSpacing;
    
    doc.setFont("times", "bold");
    doc.text("Delivery Name & Address:-",  col2X + cellPadding, currentRightY += lineSpacing);
    //doc.setFont("times", "normal");
    doc.setFont("times", "bold"); 
const consigneeNameLines = doc.splitTextToSize(safeData.consigneeName, colWidth - 4);
doc.text(consigneeNameLines,  col2X + cellPadding, currentRightY += lineSpacing);
currentRightY += (consigneeNameLines.length - 1) * lineSpacing;

const consigneeAddressText = safeData.consigneeAddress
  .filter(line => line.trim() !== safeData.consigneeName.trim())
  .join(", ");

const consigneeAddressLines = doc.splitTextToSize(
  consigneeAddressText,
  colWidth - 4
);

doc.text(
  consigneeAddressLines,
  col2X + cellPadding,
  currentRightY += lineSpacing
);

currentRightY += (consigneeAddressLines.length - 1) * lineSpacing;

    let baseY = Math.max(currentLeftY, currentRightY);
    doc.setFont("times", "bold");
   doc.setFont("times", "bold");

doc.text("Customer PO:-", col1X + cellPadding, baseY += lineSpacing);
const poLabelWidth = doc.getTextWidth("Customer PO:- ");

doc.setFont("times", "bold");
doc.text(safeData.buyerPo, col1X + cellPadding + poLabelWidth, baseY);

    doc.text(`Customer PO Date:- ${safeData.buyerPoDate}`, col1X + cellPadding, baseY += lineSpacing);

    const alignedFieldsY = baseY + lineSpacing;
   doc.text(`State:- ${safeData.buyerState}`, col1X + cellPadding, alignedFieldsY);
    doc.text(`State Code:- ${safeData.buyerStateCode}`, col1X + cellPadding, alignedFieldsY + lineSpacing);
    doc.setFont("times", "bold");
    doc.text(`GSTN No.:- ${safeData.buyerGstin}`, col1X + cellPadding, alignedFieldsY + lineSpacing * 2);

    doc.setFont("times", "bold");
   doc.text(`State:- ${safeData.consigneeState}`,  col2X + cellPadding, alignedFieldsY);
    doc.text(`State Code:- ${safeData.consigneeStateCode}.`,  col2X + cellPadding, alignedFieldsY + lineSpacing);
    doc.setFont("times", "bold");
    doc.text(`GSTN No.:- ${safeData.consigneeGstin}`,  col2X + cellPadding, alignedFieldsY + lineSpacing * 2);
    
    const line2Y = alignedFieldsY + lineSpacing * 2 + 2;
    doc.setFont("times", "bold");
    doc.text(`Place of Supply:- ${safeData.placeOfSupply}`, col1X + cellPadding, line2Y + lineSpacing);
    doc.text(`Place of Supply:- ${safeData.placeOfSupply}`,  col2X + cellPadding, line2Y + lineSpacing);
    const topBoxEndY = line2Y + lineSpacing + 5;

    doc.rect(pageMargin, topBoxStartY, contentWidth, topBoxEndY - topBoxStartY);
    doc.line(col2X, topBoxStartY, col2X, topBoxEndY);
    doc.line(pageMargin, line1Y, pageWidth - pageMargin, line1Y);
    doc.line(pageMargin, line2Y, pageWidth - pageMargin, line2Y);

    y = topBoxEndY;

    // ================= ITEMS TABLE =================
   autoTable(doc, {
  startY: y,
  head: [["Sr.no", "Description & Specification of Goods", "QTY", "RATE", "AMOUNT"]],
  body: safeData.items.map((item: any) => [
    item.srNo || '',
    item.description || '',
    item.quantity || 0,
    `Rs. ${formatCurrency(item.rate)}`,
    `Rs. ${formatCurrency(item.amount)}`,
  ]),
  theme: "grid",
  margin: { left: pageMargin, right: pageMargin },

  styles: {
    font: "times",              // ✅ Times font
    fontStyle: "bold",
    fontSize: 9,
    textColor: [0, 0, 0],        // ✅ Pure black text
    lineColor: [0, 0, 0],        // ✅ Pure black borders
    lineWidth: 0.3               // 🔥 Slightly thicker for sharp look
    
  },

  headStyles: {
    font: "times",
    fontStyle: "bold",
    fillColor: [255, 255, 255],  
    textColor: [0, 0, 0],       
    lineColor: [0, 0, 0],        
    lineWidth: 0.3             
  },

  bodyStyles: {
    font: "times",
    fontStyle: "bold",
    textColor: [0, 0, 0],        
  },

  columnStyles: {
    0: { cellWidth: 15 },
    1: { halign: "left" },
    2: { cellWidth: 15, halign: "center" },
    3: { cellWidth: 35, halign: "right" },
    4: { cellWidth: 35, halign: "right" },
  }
});
// didDrawCell: function (data) {
//   if (data.section === 'body' && (data.column.index === 3 || data.column.index === 4)) {
//     const text = data.cell.text[0];
//     data.cell.text = [`Rs. ${text}`];
//   }
// }

    // ================= FINAL TOTALS & SIGNATURE BLOCK =================
//     const finalBlockStartY = (doc as any).lastAutoTable.finalY;
//      const leftColX = pageMargin; // <--- ADD THIS LINE
//     const rightColX = pageWidth / 2;
//     const leftColWidth = pageWidth / 2 - pageMargin;
//     const rightColWidth = leftColWidth;
//     const rowPadding = 4;

//     let currentY = finalBlockStartY;

//     const drawRow = (leftText: string[], rightLabel: string, rightValue: number, isYellow = false) => {
//         const rowHeight = Math.max(leftText.length * 5, 5) + (rowPadding * 2);

//         if (isYellow) {
//             doc.setFillColor(255, 255, 0); // Yellow
//             doc.rect(rightColX, currentY, rightColWidth, rowHeight, "F");
//         }

//         doc.setFont("times", "bold");
//         doc.text(leftText, leftColX + rowPadding, currentY + rowPadding + 4);
        
//         if (rightLabel) {
//             doc.text(rightLabel, rightColX + rowPadding, currentY + rowHeight / 2 + 1.5);
//         }
//      if (rightValue !== null) {
//     doc.setFont("times", "bold");

//     const valueText = formatCurrency(rightValue);

//     // Draw value (RIGHT aligned)
//     doc.text(
//         valueText,
//         pageWidth - pageMargin - rowPadding,
//         currentY + rowHeight / 2 + 1.5,
//         { align: "right" }
//     );

//     // Draw currency symbol separately
//    const valueX = pageWidth - pageMargin - rowPadding;

// // Draw value (RIGHT aligned)
// doc.text(
//     valueText,
//     valueX,
//     currentY + rowHeight / 2 + 1.5,
//     { align: "right" }
// );

// // Calculate width
// const valueWidth = doc.getTextWidth(valueText);

// // 🔥 Add proper gap between Rs. and number
// doc.text(
//     "Rs.",
//     valueX - valueWidth - 6, // 👈 IMPORTANT (increase space)
//     currentY + rowHeight / 2 + 1.5
// );
// }

//         currentY += rowHeight;
//         doc.line(pageMargin, currentY, pageWidth - pageMargin, currentY);
//     };

//     drawRow(doc.splitTextToSize(`Invoice Amt:- ${safeData.grandTotalInWords}`, leftColWidth - rowPadding * 2), "Value of Goods", safeData.valueOfGoods);
//     drawRow(doc.splitTextToSize(`CGST Amt :- ${safeData.cgstInWords}`, leftColWidth - rowPadding * 2), "CGST Output @ 9%", safeData.totalCgst);
//     drawRow(doc.splitTextToSize(`SGST Amt :- ${safeData.sgstInWords}`, leftColWidth - rowPadding * 2), "SGST Output @ 9%", safeData.totalSgst);
//     drawRow([], "Bill Amount", safeData.grandTotal, true);

//     const signatureBlockHeight = 40;
//     const signatureStartY = currentY;

//     doc.setFont("times", "bold");
//     doc.text("For GAXCE SENSORS (OPC) PVT LTD.", leftColX + rowPadding, signatureStartY + 7);
//     doc.line(pageMargin, signatureStartY + 14, rightColX, signatureStartY + 14);

//     doc.setFont("times", "bold");
//     doc.text("Subject to Pune Jurisdiction", leftColX + rowPadding, signatureStartY + 19);
//     doc.line(pageMargin, signatureStartY + 26, rightColX, signatureStartY + 26);
//     doc.text("Prepared By", leftColX + rowPadding, signatureStartY + 31);

//     doc.setFont("times", "bold");
//     doc.setFontSize(9); 
//     doc.text("Authorized Signatory", rightColX + rowPadding, signatureStartY + 5);

//     doc.setFont("times", "bold");
//     doc.setFontSize(14);
//     let sigNameY = signatureStartY + 15;
//     (safeData.signatoryName || []).slice(0, 3).forEach((namePart: string) => {
//         doc.text((namePart || '').toUpperCase(), rightColX + rowPadding, sigNameY);
//         sigNameY += 6;
//     });

//     doc.setFont("times", "bold");
//     doc.setFontSize(9); 
//     let sigDetailsY = signatureStartY + 15;
//     doc.text("Digitally signed by", pageWidth - pageMargin - rowPadding, sigDetailsY, { align: "right" });
//     doc.text(safeData.signatoryFullName, pageWidth - pageMargin - rowPadding, sigDetailsY += 5, { align: "right" });
//     doc.text(`Date: ${safeData.signDate}`, pageWidth - pageMargin - rowPadding, sigDetailsY += 5, { align: "right" });
//     doc.text(safeData.signTime, pageWidth - pageMargin - rowPadding, sigDetailsY += 5, { align: "right" });

//     currentY += signatureBlockHeight;
    
//     doc.rect(pageMargin, finalBlockStartY, contentWidth, currentY - finalBlockStartY);
//     doc.line(rightColX, finalBlockStartY, rightColX, currentY);



const startY = (doc as any).lastAutoTable.finalY;

const advanceRow =
  Number(safeData.advanceAmount) > 0
    ? [
        [
          { content: "" },
          {
            content: "Advanced Received",
            styles: {
              fillColor: [255, 255, 0] as [number, number, number],
            },
          },
          {
            content: `Rs. ${formatCurrency(safeData.advanceAmount)}`,
            styles: {
              fillColor: [255, 255, 0] as [number, number, number],
            },
          },
        ],
      ]
    : [];

// ---------- TOTAL SECTION ----------
autoTable(doc, {
  startY: startY,
  theme: "grid",
  margin: { left: pageMargin, right: pageMargin },

  body: [
    [
      {
        content: `Invoice Amt:- ${safeData.grandTotalInWords}`,
        styles: { halign: "left", minCellHeight: 14, fontStyle: "bold", }
      },
      { content: "Value of Goods",styles: { fontStyle: "bold", } },
      
      {
        content: `Rs. ${formatCurrency(safeData.valueOfGoods)}`,
        styles: { halign: "right", fontStyle: "bold", }
      }
    ],
    ...(isMaharashtra
  ? [
      [
        {
          content: `CGST Amt :- ${safeData.cgstInWords}`,
        
        },
        {
          content: "CGST Output @ 9%",
         
        },
        {
          content: `Rs. ${formatCurrency(
            safeData.totalCgst
          )}`,
          
        }
      ],
      [
        {
          content: `SGST Amt :- ${safeData.sgstInWords}`,
        
        },
        {
          content: "SGST Output @ 9%",
          
        },
        {
          content: `Rs. ${formatCurrency(
            safeData.totalSgst
          )}`,
          
        }
      ]
    ]
  : [
      [
        {
          content: `IGST Amt :- ${safeData.igstInWords}`,
        
        },
        {
          content: "IGST Output @ 18%",
          
        },
        {
          content: `Rs. ${formatCurrency(
            safeData.totalIgst
          )}`,
        }
      ]
    ]),
    [
      { content: "" },
      {
        content: "Bill Amount",
        styles: {
          fontStyle: "bold",
          halign: "left",
             ...(Number(safeData.advanceAmount) <= 0
        ? { fillColor: [255, 255, 0] as [number, number, number] }
        : {})
        }
      },
      {
        content: `Rs. ${formatCurrency(safeData.grandTotal)}`,
        styles: {
         
          halign: "right",
          fontStyle: "bold",
            ...(Number(safeData.advanceAmount) <= 0
        ? { fillColor: [255, 255, 0] as [number, number, number] }
        : {})
        }
      }
    ],
    
 ...advanceRow,
],
  

styles: {
    font: "times",
    fontStyle: "bold",
    fontSize: 9,
    textColor: [0,0,0],
    lineColor: [0,0,0],
    lineWidth: 0.3,
    valign: "middle"
},



  columnStyles: {
    0: { cellWidth: pageWidth / 2 - pageMargin },
    1: { cellWidth: (pageWidth / 2 - pageMargin) / 2 },
    2: { cellWidth: (pageWidth / 2 - pageMargin) / 2 , halign: "right"}
  }
});

// ---------- SIGNATURE SECTION ----------
const sigY = (doc as any).lastAutoTable.finalY;

autoTable(doc, {
  startY: sigY,
  theme: "grid",
  margin: { left: pageMargin, right: pageMargin },

  body: [
    [
      {
        content: "For GAXCE SENSORS (OPC) PVT LTD.",
        styles: { halign: "left", fontStyle: "bold", minCellHeight: 10 }
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
  content: "Subject to Pune Jurisdiction\n\n\n\n\nPrepared By",
  styles: {
    halign: "left",
    valign: "top",
    minCellHeight: 35,
    cellPadding: { top: 4, left: 3 }
  }
},
    {
    content: "",
     styles: {
  minCellHeight: 35
}
      }
    ]
  ],

  styles: {
    font: "times",
     fontStyle: "bold",
    fontSize: 9,
    textColor: [0, 0, 0],
    lineColor: [0, 0, 0],
    lineWidth: 0.3,
    valign: "middle"
  },

  columnStyles: {
    0: { cellWidth: (pageWidth - pageMargin * 2) / 2 }, // LEFT HALF
    1: { cellWidth: (pageWidth - pageMargin * 2) / 2 }  // RIGHT HALF
  }
});

    doc.save(`Invoice_${safeData.invoiceNo.replace(/\s|\//g, '_')}.pdf`);
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