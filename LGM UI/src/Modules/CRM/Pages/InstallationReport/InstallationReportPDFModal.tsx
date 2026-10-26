import React, { useEffect, useRef } from "react";
import type { InstallationReport } from "./Services/types";
import jsPDF from "jspdf";
import letterheadImg from "../../../../assets/NewLetterhead.jpeg";
import stampImage from "../../../../assets/STAMP.png";
import { FaSpinner } from "react-icons/fa";

interface PDFModalProps {
  report: InstallationReport;
  onClose: () => void;
}

const InstallationReportPDFModal: React.FC<PDFModalProps> = ({
  report,
  onClose,
}) => {
  const hasGenerated = useRef(false);

  useEffect(() => {
    // 1. Check if already generated
    if (!hasGenerated.current) {
      // 2. SET TO TRUE IMMEDIATELY (Before the async call)
      hasGenerated.current = true;

      const initPDF = async () => {
        try {
          await generatePDF();
          onClose();
        } catch (error) {
          console.error("PDF Generation failed", error);
          hasGenerated.current = false; // Reset only if it failed
        }
      };

      initPDF();
    }
  }, [onClose]);

  const sanitizePdfText = (text: string) => {
    return text
      .replace(/\u2011/g, "-") // non-breaking hyphen
      .replace(/\u2013/g, "-") // en dash
      .replace(/\u2014/g, "-") // em dash
      .replace(/\u2212/g, "-") // minus sign
      .replace(/\u00A0/g, " ") // non-breaking space
      .replace(/\u200B/g, ""); // zero-width space
  };

  // ================= IMAGE LOADER =================
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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const generatePDF = async () => {
    const doc = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
      compress: true,
    });
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const primary: [number, number, number] = [21, 64, 104];

    const pageHeight = doc.internal.pageSize.getHeight();

    const addMultiPageText = (
      lines: string[],
      startX: number,
      startY: number,
      lineHeight = 5,
    ) => {
      let currentY = startY;

      lines.forEach((line) => {
        if (currentY > pageHeight - 20) {
          doc.addPage();
          currentY = 20;
        }

        doc.text(line, startX, currentY);
        currentY += lineHeight;
      });

      return currentY;
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

    let y = headerHeight + 5;

    // ================= TITLE =================
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...primary);
    doc.text("INSTALLATION / COMMISSIONING REPORT", pageWidth / 2, y, {
      align: "center",
    });

    doc.setDrawColor(...primary);

    y += 12;

    // ================= TO + DATE =================
    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text("To,", margin, y);

    doc.text(
      `Date: ${formatDate(report.installationDate)}`,
      pageWidth - margin,
      y,
      { align: "right" },
    );

    y += 6;

    // **FIX 1: ROBUST CONDITIONAL ADDRESS DISPLAY**
    let fullAddress = report.customerName || "";

    if (report.customerAddress && report.customerAddress.trim() !== "") {
      fullAddress += "\n" + report.customerAddress;
    }
    doc.setFont("times", "normal");
    const addressLines = doc.splitTextToSize(fullAddress, 95);
    doc.text(addressLines, margin, y);

    y += addressLines.length * 5 + 8;

    // ================= DESCRIPTION =================
    doc.setFont("times", "normal");
    doc.setFontSize(9);
    const desc = sanitizePdfText(
      report.inspectionSummary || "Installation completed successfully.",
    );
    const descLines = doc.splitTextToSize(desc, pageWidth - margin * 2);

    y = addMultiPageText(descLines, margin, y);

    y += 10;

    // ================= PRODUCTS SECTION =================
    const products = sanitizePdfText(report.productInformation || "")
      .split("\n")
      .filter(Boolean);
    if (products.length === 0) products.push("N/A");

    const lineHeight = 5;
    const headerBoxHeight = 8;
    let sectionStartY = y; // Track where the current page's table starts

    const drawProductHeader = (currentY: number) => {
      // Draw Filled Header
      doc.setFillColor(...primary);
      doc.rect(margin, currentY, pageWidth - margin * 2, headerBoxHeight, "F");
      
      // Draw Header Border (to ensure corners meet)
      doc.setDrawColor(...primary);
      doc.rect(margin, currentY, pageWidth - margin * 2, headerBoxHeight, "S");

      doc.setFont("times", "bold");
      doc.setFontSize(10);
      doc.setTextColor(255);
      doc.text(
        "The following items were delivered, verified, and installed:",
        pageWidth / 2,
        currentY + 5.5,
        { align: "center" }
      );
      
      return currentY + headerBoxHeight;
    };

    // Initial Start
    if (y > pageHeight - 35) {
      doc.addPage();
      y = 20;
    }
    
    sectionStartY = y;
    y = drawProductHeader(y);
    let innerY = y + 6;

    doc.setTextColor(0);
    doc.setFont("times", "bold");
    doc.text("Product Name and accessories", margin + 5, innerY);
    innerY += 7;

    doc.setFont("times", "normal");
    products.forEach((p,) => {
      const split = doc.splitTextToSize(p.trim(), pageWidth - 40);

      split.forEach((line: string) => {
        if (innerY > pageHeight - 25) {
          // 1. Draw continuous side borders for the current page before leaving
          doc.setDrawColor(...primary);
          doc.line(margin, sectionStartY, margin, innerY - 2);
          doc.line(pageWidth - margin, sectionStartY, pageWidth - margin, innerY - 2);
          doc.line(margin, innerY - 2, pageWidth - margin, innerY - 2); // Bottom closure

          doc.addPage();
          innerY = 20;
          sectionStartY = innerY;
          innerY = drawProductHeader(innerY);
          
          innerY += 6;
          doc.setTextColor(0);
          doc.setFont("times", "bold");
          doc.text("Product Name and accessories (continued)", margin + 5, innerY);
          innerY += 7;
          doc.setFont("times", "normal");
        }

        doc.setTextColor(0);
        doc.text(line, margin + 8, innerY);
        innerY += lineHeight;
      });
    });

    // Final borders for the last page of the table
    doc.setDrawColor(...primary);
    doc.line(margin, sectionStartY, margin, innerY);
    doc.line(pageWidth - margin, sectionStartY, pageWidth - margin, innerY);
    doc.line(margin, innerY, pageWidth - margin, innerY);
    
    y = innerY + 15;

    // ================= FOOTER PROTECTION =================
    if (y > pageHeight - 70) {
      doc.addPage();
      y = 25;
    }

    // ================= COMPANY (LEFT) & CONTACTS (RIGHT) =================
    doc.setFontSize(11);
    const leftX = margin;
    const rightX = pageWidth - margin;
    const startYForBottom = y;

    // --- LEFT SIDE ---
    let leftY = startYForBottom;
    doc.setFont("times", "bold");
    doc.setTextColor(...primary);
    doc.text("Company Name:", leftX, leftY);

    doc.setFont("times", "normal");
    doc.setTextColor(0);
    leftY += 5;
    const companyLines = doc.splitTextToSize(report.companyName || "N/A", 85);
    doc.text(companyLines, leftX, leftY);

    leftY += (companyLines.length * 5) + 3;
    doc.setFont("times", "bold");
    doc.setTextColor(...primary);
    doc.text("Place:", leftX, leftY);

    doc.setFont("times", "normal");
    doc.setTextColor(0);
    const placeLabelWidth = doc.getTextWidth("Place: ");
    doc.text(report.place || "N/A", leftX + placeLabelWidth + 2, leftY);

    // --- RIGHT SIDE (Contacts) ---
    let rightY = startYForBottom;
    if (report.contacts && report.contacts.length > 0) {
      report.contacts.forEach((c) => {
        doc.setFont("times", "bold");
        doc.setTextColor(0);
        doc.text(c.name || "", rightX, rightY, { align: "right" });
        rightY += 5;
        doc.text(c.designation || "", rightX, rightY, { align: "right" });
        rightY += 10; 
      });
    }

    // 👉 STAMP immediately after contacts
    if (stampImage && report.contacts?.length > 0) {
      const stampImgElement = await loadImage(stampImage);

      if (stampImgElement) {
        const stampWidth = 50;
        const stampHeight = 25;

        const stampX = pageWidth - margin - stampWidth;
        const stampY = rightY + 2;

        doc.addImage(
          stampImgElement,
          "PNG",
          stampX,
          stampY,
          stampWidth,
          stampHeight,
        );

        rightY = stampY + stampHeight + 2;
      }
    }

    // ================= FINAL Y =================
    y = Math.max(leftY, rightY);

    // ================= FOOTER =================
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.setFont("times", "italic");
    doc.text(
      "Note: - This is a software generated report, signature is not required.",
      pageWidth / 2,
      285,
      { align: "center" },
    );

    // ================= SAVE =================
    doc.save(
      `Installation_Report_${report.customerName?.replace(/\s+/g, "_")}.pdf`,
    );
  };

  return (
    <div className="fixed inset-0 z-2000 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl p-6 flex items-center gap-4">
        <FaSpinner className="animate-spin text-2xl text-[#154068]" />
        <span className="text-sm font-semibold text-gray-700">
          Generating PDF, please wait...
        </span>
      </div>
    </div>
  );
};

export default InstallationReportPDFModal;
