import React, { useEffect, useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaSpinner } from "react-icons/fa";
import letterheadImg from "../../../../assets/NewLetterhead.jpeg";

interface Props {
  data: any;
  onClose: () => void;
}

const DebitNotePDFModal: React.FC<Props> = ({ data, onClose }) => {
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

    const formatCurrency = (num: number) => {
      return Number(num || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    };

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

    // Header Image
    const topMargin = 10;
    const imgWidth = 180;
    const x = (pageWidth - imgWidth) / 2;
    const imgProps = doc.getImageProperties(letterheadImg);
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
    doc.addImage(letterheadImg, "JPEG", x, topMargin, imgWidth, imgHeight);

    let y = topMargin + imgHeight + 5;

    // Title
    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.text("DEBIT NOTE", pageWidth / 2, (y += 5), { align: "center" });

    // Top Boxes
    y += 5;
    const boxStartY = y;
    const contentWidth = pageWidth - pageMargin * 2;
    const midPoint = pageWidth / 2;

    doc.setFontSize(8.5);
    // Left Box Header
    doc.text(
      `GSTIN Registration Number :- ${data.gstNo || ""}`,
      pageMargin + 2,
      (y += 4),
    );
    doc.text(`PAN NO.:- ${data.panNo || ""}`, pageMargin + 2, (y += 5));
    doc.text(`Range:- ${data.range || ""}`, pageMargin + 2, (y += 5));
    doc.text(`Division:- ${data.division || ""}`, pageMargin + 2, (y += 5));
    doc.text(
      `Commissionerate:- ${data.commissionerate || ""}`,
      pageMargin + 2,
      (y += 5),
    );

    // Right Box Header
    let ry = boxStartY;
    doc.text(
      `Debit Note No:- ${data.debitNoteNo || ""}`,
      midPoint + 2,
      (ry += 4),
    );
    doc.text(
      `Date:- ${data.debitNoteDate ? new Date(data.debitNoteDate).toLocaleDateString("en-GB") : ""}`,
      midPoint + 2,
      (ry += 5),
    );
    doc.text(`SAC Code:- ${data.sacCode || ""}`, midPoint + 2, (ry += 5));
    doc.text(`Description of Taxable Service:-`, midPoint + 2, (ry += 5));
    doc.setFont("times", "normal");
    doc.text(data.taxableServiceDescription || "N/A", midPoint + 2, (ry += 4));

    const headerSeparatorY = Math.max(y, ry) + 2;
    doc.line(
      pageMargin,
      headerSeparatorY,
      pageWidth - pageMargin,
      headerSeparatorY,
    );

    // Return/Debit To & Consignee Section
    let addrY = headerSeparatorY + 5;
    doc.setFont("times", "bold");
    doc.text("Return/Debit To:", pageMargin + 2, addrY);
    doc.text("Consignee Name & Address:-", midPoint + 2, addrY);

    doc.setFont("times", "bold");

    // ================= LEFT ADDRESS =================

    const customerAddress = normalizeAddress(data.customerAddress);

    let cY = addrY + 5;

    const customerName = customerAddress[0] || "";

    const customerNameLines = doc.splitTextToSize(
      customerName,
      contentWidth / 2 - 6,
    );

    doc.text(customerNameLines, pageMargin + 2, cY);

    cY += customerNameLines.length * 4;

    const customerAddressText = customerAddress.slice(1).join(", ");

    const customerAddressLines = doc.splitTextToSize(
      customerAddressText,
      contentWidth / 2 - 6,
    );

    doc.text(customerAddressLines, pageMargin + 2, cY + 2);

    cY += customerAddressLines.length * 4;

    // ================= RIGHT ADDRESS =================

    const consigneeAddress = normalizeAddress(data.consigneeNameAddress);

    let conY = addrY + 5;

    const consigneeName = consigneeAddress[0] || "";

    const consigneeNameLines = doc.splitTextToSize(
      consigneeName,
      contentWidth / 2 - 6,
    );

    doc.text(consigneeNameLines, midPoint + 2, conY);

    conY += consigneeNameLines.length * 4;

    const consigneeAddressText = consigneeAddress.slice(1).join(", ");

    const consigneeAddressLines = doc.splitTextToSize(
      consigneeAddressText,
      contentWidth / 2 - 6,
    );

    doc.text(consigneeAddressLines, midPoint + 2, conY + 2);

    conY += consigneeAddressLines.length * 4;

    // Reference Info
    const addressHeight = Math.max(cY - (addrY + 5), conY - (addrY + 5));

    let refY = addrY + 5 + addressHeight + 4;
    doc.setFont("times", "bold");
    doc.text(
      `Return/Debit Date: ${data.debitNoteDate ? new Date(data.debitNoteDate).toLocaleDateString("en-GB") : ""}`,
      pageMargin + 2,
      (refY += 5),
    );
    doc.text(
      `Return/Debit No.: ${data.debitNoteNo}`,
      pageMargin + 2,
      (refY += 5),
    );
    doc.text(`Invoice No.: ${data.invoiceNo}`, pageMargin + 2, (refY += 5));
    doc.text(`State Code: ${data.stateCode}`, pageMargin + 2, (refY += 5));
    doc.text(`GSTN No.: ${data.gstnNo}`, pageMargin + 2, (refY += 5));

    // Mirror State Code/GSTN on right
    let refRY = refY - 10;
    doc.text(`State Code: ${data.stateCode}`, midPoint + 2, (refRY += 5));
    doc.text(`GSTN No.: ${data.gstnNo}`, midPoint + 2, (refRY += 5));

    const boxEndY = refY + 2;
    doc.rect(pageMargin, boxStartY, contentWidth, boxEndY - boxStartY);
    doc.line(midPoint, boxStartY, midPoint, boxEndY);

    // Items Table
    autoTable(doc, {
      startY: boxEndY,
      head: [
        [
          "Sno",
          "Description & Specification of Goods",
          "QTY",
          "RATE",
          "AMOUNT",
        ],
      ],
      body: data.items.map((item: any, index: number) => [
        index + 1,
        item.description || "",
        item.quantity || 0,
        formatCurrency(item.rate),
        formatCurrency(item.amount),
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
        1: { halign: "left" }, // Description takes remaining space
        2: { cellWidth: 15, halign: "center" },
        3: { cellWidth: 30, halign: "right" },
        4: { cellWidth: 35, halign: "right" },
      },
      didDrawCell: (cellData) => {
        if (
          cellData.section === "body" &&
          cellData.row.index === data.items.length - 1
        ) {
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.2);

          doc.line(
            cellData.cell.x,
            cellData.cell.y + cellData.cell.height,
            cellData.cell.x + cellData.cell.width,
            cellData.cell.y + cellData.cell.height,
          );
        }
      },
    });

    const finalY = (doc as any).lastAutoTable.finalY - 0.2;

    autoTable(doc, {
      startY: finalY,
      theme: "grid",
      tableLineColor: [0, 0, 0],
      tableLineWidth: 0.2,
      margin: { left: pageMargin, right: pageMargin },
      body: [
        [
          {
            content: `Debit Note Amt:- ${data.debitNoteAmountInWords || ""}`,
            styles: {
              halign: "center",
              fontStyle: "bold",
              cellWidth: 115,
              lineWidth: { top: 0, right: 0.2, bottom: 0.2, left: 0.2 },
            },
          },
          { content: "Value of Goods", styles: { fontStyle: "bold" } },
          {
            content: `Rs. ${formatCurrency(data.subTotal)}`,
            styles: { halign: "right", fontStyle: "bold" },
          },
        ],
        [
          {
            // Removed static address and replaced with data.bankAddress
            // Added bold fontStyle to the cell
            content: `Bank Details :- ${data.bankName || ""}\n${data.bankAddress || ""}\nCurrent A/C NO : ${data.accountNo || ""}\nIFSC Code: ${data.ifscCode || ""}`,
            rowSpan: 2,
            styles: {
              fontSize: 8,
              valign: "top",
              halign: "center",
              fontStyle: "bold", // Makes bank details bold
              lineWidth: { top: 0.2, right: 0.2, bottom: 0.2, left: 0.2 },
            },
          },
          { content: "GST Amount", styles: { fontStyle: "bold" } },
          {
            content: `Rs. ${formatCurrency(data.grandTotal - data.subTotal)}`,
            styles: { halign: "right", fontStyle: "bold" },
          },
        ],
        [
          {
            content: "Bill Amount",
            styles: { fillColor: [255, 255, 0], fontStyle: "bold" },
          },
          {
            content: `Rs. ${formatCurrency(data.grandTotal)}`,
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
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
      },
      columnStyles: {
        0: { cellWidth: 115 },
        1: { cellWidth: 40 },
        2: { cellWidth: 35 },
      },
    });

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
              minCellHeight: 12,
              valign: "top",
              lineWidth: { top: 0.2, right: 0.2, bottom: 0, left: 0.2 },
            },
          },
          {
            content: `For GAXCE SENSORS (OPC) PVT LTD.`,
            styles: {
              halign: "center",
              fontStyle: "bold",
              lineWidth: { top: 0.2, right: 0.2, bottom: 0, left: 0.2 },
            },
          },
        ],
        [
          {
            content: "Prepared By",
            styles: {
              halign: "left",
              fontStyle: "bold",
              minCellHeight: 15,
              valign: "bottom",
              lineWidth: { top: 0, right: 0.2, bottom: 0.2, left: 0.2 },
            },
          },
          {
            content: "Authorized Signatory",
            styles: {
              halign: "center",
              fontStyle: "bold",
              valign: "bottom",
              lineWidth: { top: 0, right: 0.2, bottom: 0.2, left: 0.2 },
            },
          },
        ],
      ],
      styles: {
        font: "times",
        fontSize: 9,
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
      },
      columnStyles: {
        0: { cellWidth: (pageWidth - pageMargin * 2) / 2 },
        1: { cellWidth: (pageWidth - pageMargin * 2) / 2 },
      },
    });

    doc.save(`DebitNote_${data.debitNoteNo}.pdf`);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="text-white text-center">
        <FaSpinner className="animate-spin text-4xl mx-auto mb-2" />
        <p>Generating Debit Note PDF...</p>
      </div>
    </div>
  );
};

export default DebitNotePDFModal;
