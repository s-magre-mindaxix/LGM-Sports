import React, { useEffect, useRef } from "react";
import type { ServiceReport } from "./Serivces/types";
import jsPDF from "jspdf";
import letterheadImg from "../../../../assets/NewLetterhead.jpeg";
import stampSignImg from "../../../../assets/STAMPSIGN.png";
import { FaSpinner } from "react-icons/fa";
import { API_ENDPOINTS } from "../../../../API/apiConfig";

const FILE_BASE_URL = API_ENDPOINTS.BaseUrl.replace("/api", "");

interface PDFModalProps {
  report: ServiceReport;
  onClose: () => void;
}

const ServiceReportPDFModal: React.FC<PDFModalProps> = ({
  report,
  onClose,
}) => {
  const hasGenerated = useRef(false);

  useEffect(() => {
    if (!hasGenerated.current) {
      hasGenerated.current = true;

      const initPDF = async () => {
        try {
          await generatePDF();
        } catch (error) {
          console.error("PDF generation error:", error);
        } finally {
          onClose();
        }
      };
      initPDF();
    }
  }, [onClose]);

  // ================= IMAGE LOADER =================
  const loadImage = (src: string): Promise<HTMLImageElement | null> => {
    return new Promise((resolve) => {
      if (!src) return resolve(null);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = () => {
        console.warn("Failed to load image:", src);
        resolve(null);
      };
    });
  };

  const compressImage = async (
    img: HTMLImageElement,
    maxWidth: number = 1000,
    quality: number = 0.55,
  ): Promise<string | null> => {
    try {
      const canvas = document.createElement("canvas");

      const scale = Math.min(maxWidth / img.width, 1);

      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext("2d");

      if (!ctx) return null;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      return canvas.toDataURL("image/jpeg", quality);
    } catch (err) {
      console.error("Compression Error:", err);
      return null;
    }
  };

  const generatePDF = async () => {
    const doc = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const primaryBlue: [number, number, number] = [21, 64, 104];

    // ================= HELPER: PAGE BREAK =================
    const checkPageBreak = (y: number, addedHeight: number) => {
      if (y + addedHeight > pageHeight - 20) {
        doc.addPage();
        return 20;
      }
      return y;
    };

    const formatDate = (dateStr: string) => {
      if (!dateStr) return "N/A";
      const d = new Date(dateStr);
      return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
    };

    // Load Images
    const [letterheadImage, stampImage] = await Promise.all([
      loadImage(letterheadImg),
      loadImage(stampSignImg),
    ]);

    // --- 1. HEADER SECTION (LETTERHEAD) ---
    let headerHeight = 35;
    if (letterheadImage) {
      const imageWidth = pageWidth - 28;
      const aspectRatio = letterheadImage.width / letterheadImage.height;
      const imageHeight = imageWidth / aspectRatio;
      headerHeight = imageHeight + 10;
      doc.addImage(letterheadImage, "PNG", 14, 10, imageWidth, imageHeight);
    }

    // --- 2. REPORT TITLE ---
    let currentY = headerHeight + 5;
    doc.setFont("times", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...primaryBlue);
    doc.text("SERVICE REPORT", pageWidth / 2, currentY, { align: "center" });
    doc.setDrawColor(...primaryBlue);

    // --- 3. METADATA ---
    currentY += 12;
    doc.setFontSize(10);
    doc.setFont("times", "bold");
    doc.setTextColor(0);
    doc.text(
      `Service Work Order No.: GS-SR-${report.id.toString().padStart(3, "0")}`,
      margin,
      currentY,
    );
    doc.setTextColor(...primaryBlue);
    doc.text(`Date: ${formatDate(report.date)}`, pageWidth - margin, currentY, {
      align: "right",
    });

    // --- 4. CERTIFICATION TEXT ---
    currentY += 15;
    doc.setFont("times", "normal");
    doc.setTextColor(0);
    doc.setFontSize(11);

    const certText = `This is to certify that M/s GAXCE SENSORS, Pune, inspected the ${report.productName || ""} equipment (Serial No. ${report.serialNumber || "N/A"}) belonging to M/s ${report.customerName} at our Pune office ${report.customerReported || ""}`;

    const textWrapWidth = pageWidth - margin * 2 - 2;
    const splitCertText = doc.splitTextToSize(certText, textWrapWidth);

    doc.text(splitCertText, margin, currentY, {
      align: "left",
      lineHeightFactor: 1.4,
    });
    currentY += splitCertText.length * 6 + 10;

    // --- 5. SERVICE ITEMS TABLE ---
    const items = report.items ?? [];
    if (items.length > 0) {
      const rowHeight = 8;
      const tableWidth = pageWidth - margin * 2;

      const col1 = 15; // Sr No
      const col2 = tableWidth - col1;

     let tableHeight = rowHeight; // header

report.items!.forEach((item) => {
  const lines = doc.splitTextToSize(
    item.description || "",
    col2 - 6
  );

  tableHeight += Math.max(
    rowHeight,
    lines.length * 6 + 2
  );
});

      currentY = checkPageBreak(currentY, tableHeight + 10);

      // Title
      doc.setFont("times", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...primaryBlue);
      doc.text("Service Details", margin, currentY);

      currentY += 5;

      // Header
      doc.setFillColor(...primaryBlue);
      doc.rect(margin, currentY, tableWidth, rowHeight, "F");

      doc.setTextColor(255);
      doc.setFont("times", "normal");

      doc.text("#", margin + 5, currentY + 5.5);
      doc.text("Description", margin + col1 + 2, currentY + 5.5);

      currentY += rowHeight;

      // Rows
     // Rows
doc.setTextColor(0);

report.items!.forEach((item, index) => {

  // Wrap description according to column width
  const descriptionLines = doc.splitTextToSize(
    item.description || "",
    col2 - 6 // leave padding
  );

  // Dynamic row height
  const dynamicRowHeight = Math.max(
    rowHeight,
    descriptionLines.length * 6 + 2
  );

  // Page break if required
  currentY = checkPageBreak(currentY, dynamicRowHeight);

  // Draw cells
  doc.rect(margin, currentY, col1, dynamicRowHeight);
  doc.rect(margin + col1, currentY, col2, dynamicRowHeight);

  // Sr No (vertically centered)
  doc.text(
    String(index + 1),
    margin + 5,
    currentY + dynamicRowHeight / 2 + 1
  );

  // Description (wrapped)
  doc.text(
    descriptionLines,
    margin + col1 + 2,
    currentY + 5
  );

  currentY += dynamicRowHeight;
});

currentY += 10;
    }

    // --- 5. CHECKLIST BOX ---
    const checklist = [
      { label: "Software Check", value: report.softwareCheck },
      { label: "Port Testing", value: report.portTesting },
      { label: "Firmware Check", value: report.firmwareCheck },
      { label: "Physical Inspection", value: report.physicalInspection },
      { label: "IC Replacement", value: report.icReplacement },
      { label: "Inspection Summary", value: report.inspectionSummary },
      { label: "Final Comments", value: report.finalComments },
    ].filter((i) => i.value);

    // Dynamic height calculation
let itemsHeight = 0;

checklist.forEach((item) => {
  const labelText = `${item.label}: `;
  const labelWidth = doc.getTextWidth(labelText);

  const availableWidth =
    pageWidth - margin * 2 - 20 - labelWidth;

  const wrappedText = doc.splitTextToSize(
    String(item.value),
    availableWidth,
  );

  itemsHeight += Math.max(8, wrappedText.length * 6);
});

const totalBoxHeight = 15 + itemsHeight;

    // FIX: Calling the defined helper
    currentY = checkPageBreak(currentY, totalBoxHeight);

    doc.setDrawColor(...primaryBlue);
    doc.roundedRect(
      margin,
      currentY,
      pageWidth - margin * 2,
      totalBoxHeight,
      2,
      2,
      "S",
    );

    doc.setFillColor(...primaryBlue);
    doc.rect(margin, currentY, pageWidth - margin * 2, 8, "F");
    doc.setTextColor(255);
    doc.setFont("times", "bold");
    doc.text("Service Inspection Checklist", pageWidth / 2, currentY + 5.5, {
      align: "center",
    });

    doc.setTextColor(0);

  let innerY = currentY + 14;

checklist.forEach((item) => {
  doc.setFont("times", "bold");
  doc.setTextColor(...primaryBlue);

  const labelText = `${item.label}:`;

  doc.text(labelText, margin + 8, innerY);

  const labelWidth = doc.getTextWidth(`${item.label}: `);

  const availableWidth =
    pageWidth - margin * 2 - 20 - labelWidth;

  const wrappedValue = doc.splitTextToSize(
    String(item.value),
    availableWidth,
  );

  doc.setFont("times", "normal");
  doc.setTextColor(0);

  doc.text(
    wrappedValue,
    margin + 8 + labelWidth,
    innerY,
  );

  innerY += Math.max(8, wrappedValue.length * 6);
});

    currentY += totalBoxHeight + 15;

  doc.setFont("times", "bold");
doc.setFontSize(11);

doc.text(
  "For GAXCE SENSORS(OPC) PVT LTD.",
  margin,
  currentY
);

currentY += 7;

doc.setFont("times", "normal");

doc.text(
  "Subject to Pune Jurisdiction",
  margin,
  currentY
);

    // Stamp + Sign
    if (stampImage) {
      const stampX = margin;
      const stampY = currentY + 15;
      doc.addImage(stampImage, "PNG", stampX, stampY, 50, 25);

      // Prepared By below stamp
      doc.setFont("times", "bold");
      doc.text("Prepared By", stampX + 25, stampY + 32, { align: "center" });
    }

    if (report.uploadedFiles) {
      const fileList = report.uploadedFiles.split(";").filter(Boolean);

      if (fileList.length > 0) {
        const hGap = 10;
        const vGap = 8;
        const imagePadding = 1.5;

        const imgWidth = (pageWidth - margin * 2 - hGap) / 2;
        const availableHeight = pageHeight - 40;
        const rows = 3;

        const imgHeight = (availableHeight - (rows - 1) * vGap) / rows;

        let imageCounter = 0;

        const startY = 30;

        const addHeader = () => {
          doc.setFont("times", "bold");
          doc.setFontSize(14);
          doc.setTextColor(...primaryBlue);
          doc.text("Inspection Images:", margin, startY - 8);
        };

        doc.addPage();
        addHeader();

        for (let i = 0; i < fileList.length; i++) {
          if (imageCounter === 6) {
            doc.addPage();
            addHeader();
            imageCounter = 0;
          }

          const col = imageCounter % 2;
          const row = Math.floor(imageCounter / 2);

          const x = col === 0 ? margin : margin + imgWidth + hGap;

          const y = startY + row * (imgHeight + vGap);

          try {
            const file = fileList[i];
            const fullUrl = `${FILE_BASE_URL}/${file.startsWith("/") ? file.substring(1) : file}`;
            const img = await loadImage(fullUrl);

            if (img) {
              doc.rect(x, y, imgWidth, imgHeight);

              const compressedInspectionImage = await compressImage(
                img,
                1200,
                0.5,
              );

              doc.addImage(
                compressedInspectionImage || img,
                "JPEG",
                x + imagePadding,
                y + imagePadding,
                imgWidth - imagePadding * 2,
                imgHeight - imagePadding * 2,
              );

              imageCounter++;
            }
          } catch (err) {
            console.error("Image error:", err);
          }
        }
      }
    }

    // Go to last page
    const totalPages = doc.getNumberOfPages();
    doc.setPage(totalPages);

    // Bottom message
    doc.setFont("times", "italic");
    doc.setFontSize(9);
    doc.setTextColor(100);

    doc.text(
      "This is a computer generated copy",
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" },
    );

    doc.save(`Service_Report_${report.customerName.replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-3000 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center gap-6">
        <FaSpinner className="animate-spin text-5xl text-[#154068]" />
        <p className="text-xl font-bold text-[#154068]">
          Generating Service Report PDF...
        </p>
      </div>
    </div>
  );
};

export default ServiceReportPDFModal;
