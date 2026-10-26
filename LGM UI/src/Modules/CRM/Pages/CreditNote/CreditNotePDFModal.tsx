import React, { useEffect, useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaSpinner } from "react-icons/fa";
import letterheadImg from "../../../../assets/NewLetterhead.jpeg";

interface Props {
  data: any; // Maps to CreditNoteDto
  onClose: () => void;
}

const CreditNotePDFModal: React.FC<Props> = ({ data, onClose }) => {
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

    // --- DATA NORMALIZATION ---
    const normalizeAddress = (address: any): string[] => {
      if (!address) return [];

      if (Array.isArray(address)) return address;

      if (typeof address === "string") {
        const separator = address.includes("\n") ? "\n" : ",";

        return address
          .split(separator)
          .map((s) => s.replace(/^,/, "").trim())
          .filter((s) => s)
          .filter((line, index, self) => self.indexOf(line) === index);
      }

      return [];
    };

    const safeData = {
      // Company Info
      companyName: "GAXCE SENSORS (OPC) PRIVATE LIMITED",
      companyAddress: data.companyAddress || "N/A",
      companyGstin: data.companyGstin || "N/A",
      companyPan: data.companyPan || "N/A",
      range: data.range || "N/A",
      division: data.division || "N/A",
      commissionerate: data.commissionerate || "N/A",

      // Credit Note Specifics
      creditNoteNo: data.creditNoteNo || "N/A",
      creditNoteDate: data.creditNoteDate
        ? new Date(data.creditNoteDate).toLocaleDateString("en-GB")
        : "N/A",
      sacCode: data.sacCode || "N/A",
      taxableServiceDescription: data.taxableServiceDescription || "N/A",

      // Original Invoice Info
      invoiceNo: data.invoiceNo || "N/A",
      invoiceDate: data.invoiceDate
        ? new Date(data.invoiceDate).toLocaleDateString("en-GB")
        : "N/A",

      // Buyer Info
      customerName: data.customerName || "N/A",
      customerAddress: normalizeAddress(data.customerAddress),
      buyerGstin: data.buyerGstin || "N/A",
      buyerState: data.buyerState || "N/A",
      buyerStateCode: data.buyerStateCode || "N/A",
      placeOfSupply: data.placeOfSupply || "N/A",

      // Delivery/Consignee Info
      consigneeNameAddress: normalizeAddress(data.consigneeNameAddress),

      // Totals
      items: data.items || [],
      subTotal: data.subTotal || 0,
      totalCgst: data.totalCgst || 0,
      totalSgst: data.totalSgst || 0,
      totalIgst:
        data.items?.reduce(
          (sum: number, item: any) => sum + (item.igstAmount || 0),
          0,
        ) || 0,
      grandTotal: data.grandTotal || 0,
      creditNoteAmount: data.creditNoteAmount || 0,
      creditNoteAmountInWords: data.creditNoteAmountInWords || "",
      grandTotalInWords: data.grandTotalInWords || "Zero Rupees Only",
    };

    const formatCurrency = (num: number) => {
      return Number(num || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    };

    // ================= HEADER IMAGE =================
    const topMargin = 10;
    const imgWidth = 180;
    const x = (pageWidth - imgWidth) / 2;
    const imgProps = doc.getImageProperties(letterheadImg);
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
    doc.addImage(letterheadImg, "JPEG", x, topMargin, imgWidth, imgHeight);

    let y = topMargin + imgHeight + 5;

    // ================= TITLE =================
    doc.setFont("times", "bold");
    doc.setFontSize(10);
    doc.text("CREDIT NOTE", pageWidth / 2, (y += 5), { align: "center" });

    // ================= TOP INFO BLOCK =================
    y += 5;
    const topBoxStartY = y;
    const col1X = pageMargin;
    const col2X = pageWidth / 2;
    const contentWidth = pageWidth - pageMargin * 2;
    // const colWidth = contentWidth / 2;
    const cellPadding = 2;

    doc.setFontSize(8.5);

    // Left Column Info
    let leftY = topBoxStartY + 5;
    doc.text(
      `GSTIN Registration Number :- ${safeData.companyGstin}`,
      col1X + cellPadding,
      leftY,
    );
    doc.text(
      `PAN NO.:- ${safeData.companyPan}`,
      col1X + cellPadding,
      (leftY += 5),
    );
    doc.text(`Range:- ${safeData.range}`, col1X + cellPadding, (leftY += 5));
    doc.text(
      `Division:- ${safeData.division}`,
      col1X + cellPadding,
      (leftY += 5),
    );
    doc.text(
      `Commissionerate:- ${safeData.commissionerate}`,
      col1X + cellPadding,
      (leftY += 5),
    );

    // Right Column Info
    let rightY = topBoxStartY + 5;
    doc.text(
      `Credit Note No:- ${safeData.creditNoteNo}`,
      col2X + cellPadding,
      rightY,
    );
    doc.text(
      `Date:- ${safeData.creditNoteDate}`,
      col2X + cellPadding,
      (rightY += 5),
    );
    doc.text(
      `SAC Code:- ${safeData.sacCode}`,
      col2X + cellPadding,
      (rightY += 5),
    );
    doc.text(
      `Description of Taxable Service:-`,
      col2X + cellPadding,
      (rightY += 5),
    );
    doc.setFont("times", "normal");
    doc.text(
      safeData.taxableServiceDescription,
      col2X + cellPadding,
      (rightY += 4),
    );

    // Separator Line

    const midLineY = Math.max(leftY, rightY) + 2;
    doc.line(pageMargin, midLineY, pageWidth - pageMargin, midLineY);

    // Billing & Delivery Headers
    let addrY = midLineY + 5;
    doc.setFont("times", "bold");
    doc.text("Billing Name & Address:-", col1X + cellPadding, addrY);
    doc.text("Delivery Name & Address:-", col2X + cellPadding, addrY);

    doc.setFont("times", "normal");
    let billingAddrY = addrY + 5;

    doc.setFont("times", "bold");

    // Customer Name
    const customerName = safeData.customerAddress[0] || "";

    const customerNameLines = doc.splitTextToSize(
      customerName,
      contentWidth / 2 - 6,
    );

    doc.text(customerNameLines, col1X + cellPadding, billingAddrY);

    billingAddrY += customerNameLines.length * 4;

    // Remaining Address
    const customerAddressText = safeData.customerAddress.slice(1).join(", ");

    const customerAddressLines = doc.splitTextToSize(
      customerAddressText,
      contentWidth / 2 - 6,
    );

    doc.text(customerAddressLines, col1X + cellPadding, billingAddrY + 2);

    billingAddrY += customerAddressLines.length * 4;

    let deliveryAddrY = addrY + 5;

    doc.setFont("times", "bold");

    // Customer Name
    const consigneeName = safeData.consigneeNameAddress[0] || "";

    const consigneeNameLines = doc.splitTextToSize(
      consigneeName,
      contentWidth / 2 - 6,
    );

    doc.text(consigneeNameLines, col2X + cellPadding, deliveryAddrY);

    deliveryAddrY += consigneeNameLines.length * 4;

    const addressHeight = Math.max(
      billingAddrY - (addrY + 5),
      deliveryAddrY - (addrY + 5),
    );

    // Remaining Address
    const consigneeAddressText = safeData.consigneeNameAddress
      .slice(1)
      .join(", ");

    const consigneeAddressLines = doc.splitTextToSize(
      consigneeAddressText,
      contentWidth / 2 - 6,
    );

    doc.text(consigneeAddressLines, col2X + cellPadding, deliveryAddrY + 2);

    deliveryAddrY += consigneeAddressLines.length * 4;

    // Invoice Reference Section (As per Excel screenshot)
    let refY = addrY + 5 + addressHeight + 4;

    refY += 5;
    doc.setFont("times", "bold");
    doc.text(
      `Customer Invoice No :- ${safeData.invoiceNo}`,
      col1X + cellPadding,
      refY,
    );
    doc.text(
      `Invoice Note Date:- ${safeData.invoiceDate}`,
      col1X + cellPadding,
      (refY += 5),
    );

    doc.text(
      `State Code:- ${safeData.buyerStateCode}`,
      col1X + cellPadding,
      (refY += 5),
    );
    doc.text(
      `GSTN No.:- ${safeData.buyerGstin}`,
      col1X + cellPadding,
      (refY += 5),
    );
    doc.text(
      `Place of Supply:- ${safeData.placeOfSupply}`,
      col1X + cellPadding,
      (refY += 5),
    );

    // Right side mirror for state info
    let refRightY = refY - 10;
    doc.text(
      `State Code:- ${safeData.buyerStateCode}`,
      col2X + cellPadding,
      refRightY,
    );
    doc.text(
      `GSTN No.:- ${safeData.buyerGstin}`,
      col2X + cellPadding,
      (refRightY += 5),
    );
    doc.text(
      `Place of Supply:- ${safeData.placeOfSupply}`,
      col2X + cellPadding,
      (refRightY += 5),
    );

    const topBoxEndY = refY + 5;

    // Draw Box Borders
    doc.rect(pageMargin, topBoxStartY, contentWidth, topBoxEndY - topBoxStartY);
    doc.line(col2X, topBoxStartY, col2X, topBoxEndY);

    // ================= ITEMS TABLE =================
    autoTable(doc, {
      startY: topBoxEndY,
      head: [
        [
          "Sno",
          "Description & Specification of Goods",
          "QTY",
          "RATE",
          "AMOUNT",
        ],
      ],
      body: safeData.items.map((item: any, index: number) => [
        index + 1,
        item.description || "",
        item.quantity || 0,
        formatCurrency(item.rate),
        formatCurrency(item.total),
      ]),
      theme: "grid",
      margin: { left: pageMargin, right: pageMargin },
      styles: {
        font: "times",
        fontSize: 9,
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 12, halign: "center" },
        1: { halign: "left" },
        2: { cellWidth: 15, halign: "center" },
        3: { cellWidth: 30, halign: "right" },
        4: { cellWidth: 35, halign: "right" },
      },
      didDrawCell: (data) => {
        if (
          data.section === "body" &&
          data.row.index === safeData.items.length - 1
        ) {
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.2);

          doc.line(
            data.cell.x,
            data.cell.y + data.cell.height,
            data.cell.x + data.cell.width,
            data.cell.y + data.cell.height,
          );
        }
      },
    });

    // ================= TOTALS SECTION =================
    const finalY = (doc as any).lastAutoTable.finalY - 0.2;

    // Determine which tax to show
    const taxLabel =
      safeData.totalIgst > 0 ? "IGST Output @ 18%" : "CGST/SGST Output";
    const taxValue =
      safeData.totalIgst > 0
        ? safeData.totalIgst
        : safeData.totalCgst + safeData.totalSgst;

    autoTable(doc, {
      startY: finalY - 0.2,
      theme: "grid",
      tableLineColor: [0, 0, 0],
      tableLineWidth: 0.2,
      margin: { left: pageMargin, right: pageMargin },
      body: [
        [
          {
            content: "Credit Note Amt:-",
            styles: {
              halign: "center",
              fontStyle: "bold",
              textColor: [0, 0, 0],
              lineColor: [0, 0, 0],
              cellWidth: contentWidth / 2,
              lineWidth: {
                top: 0,
                right: 0.2,
                bottom: 0,
                left: 0.2,
              },
            },
          },
          {
            content: "Value of Goods",
            styles: { fontStyle: "bold", textColor: [0, 0, 0] },
          },
          {
            content: `Rs. ${formatCurrency(safeData.subTotal)}`,
            styles: {
              halign: "right",
              fontStyle: "bold",
            },
          },
        ],

        [
          {
            content: safeData.creditNoteAmountInWords,
            styles: {
              halign: "center",
              fontStyle: "bold",
              valign: "middle",
              lineWidth: {
                top: 0,
                right: 0.2,
                left: 0.2,
              },
            },
          },
          {
            content: taxLabel,
            styles: { fontStyle: "bold", textColor: [0, 0, 0] },
          },
          {
            content: `Rs. ${formatCurrency(taxValue)}`,
            styles: {
              halign: "right",
              fontStyle: "bold",
            },
          },
        ],

        [
          {
            content: "",
            styles: {
              lineWidth: {
                top: 0, // remove line above
                right: 0.2,
                bottom: 0.2,
                left: 0.2,
              },
            },
          },
          {
            content: "Bill Amount",
            styles: {
              fillColor: [255, 255, 0],
              fontStyle: "bold",
              textColor: [0, 0, 0],
            },
          },
          {
            content: `Rs. ${formatCurrency(safeData.grandTotal)}`,
            styles: {
              fillColor: [255, 255, 0],
              halign: "right",
              fontStyle: "bold",
            },
          },
        ],
      ],
      styles: {
        font: "times",
        fontSize: 9,
        textColor: [0, 0, 0],
        fontStyle: "bold",

        lineColor: [0, 0, 0],
        lineWidth: 0.2,

        fillColor: [255, 255, 255],
      },
      columnStyles: {
        0: {
          cellWidth: 115, // left Credit Note Amt area
          halign: "center",
        },
        1: {
          cellWidth: 40, // Value of Goods
        },
        2: {
          cellWidth: 35, // Amount
        },
      },
    });

    // ================= SIGNATURE SECTION =================
    const sigY = (doc as any).lastAutoTable.finalY;

    autoTable(doc, {
      startY: sigY,
      theme: "grid",
      margin: { left: pageMargin, right: pageMargin },
      body: [
        [
          {
            content: "Subject to Pune Jurisdiction",
            styles: {
              halign: "left",
              fontStyle: "bold",
              minCellHeight: 15,
              valign: "top",
              lineWidth: {
                top: 0.2,
                right: 0.2,
                bottom: 0, // <-- change here
                left: 0.2,
              },
            },
          },
          {
            content: `For ${safeData.companyName.toUpperCase()}`,
            styles: {
              halign: "center",
              fontStyle: "bold",
              lineWidth: {
                top: 0.2,
                right: 0.2,
                bottom: 0, // <-- change here
                left: 0.2,
              },
            },
          },
        ],
        [
          {
            content: "Prepared By",
            styles: {
              halign: "left",
              fontStyle: "bold",
              minCellHeight: 20,
              valign: "bottom",
              lineWidth: {
                top: 0, // removes center horizontal line
                right: 0.2,
                bottom: 0.2,
                left: 0.2,
              },
            },
          },
          {
            content: "Authorized Signatory",
            styles: {
              halign: "center",
              fontStyle: "bold",
              valign: "bottom",
              lineWidth: {
                top: 0, // removes center horizontal line
                right: 0.2,
                bottom: 0.2,
                left: 0.2,
              },
            },
          },
        ],
      ],
      styles: {
        font: "times",
        fontSize: 9,
        textColor: [0, 0, 0],
        fontStyle: "bold",
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
      },
      columnStyles: {
        0: { cellWidth: contentWidth / 2 },
        1: { cellWidth: contentWidth / 2 },
      },
    });

    doc.save(`CreditNote_${safeData.creditNoteNo.replace(/\//g, "_")}.pdf`);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="text-white text-center">
        <FaSpinner className="animate-spin text-4xl mx-auto mb-2" />
        <p>Generating Credit Note PDF...</p>
      </div>
    </div>
  );
};

export default CreditNotePDFModal;
