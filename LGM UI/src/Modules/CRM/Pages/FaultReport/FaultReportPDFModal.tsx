import React, { useEffect, useRef } from "react";
import type { FaultReport } from "./Services/types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import letterheadImg from "../../../../assets/NewLetterhead.jpeg";
import stampSignImg from "../../../../assets/STAMPSIGN.png";
import { FaSpinner } from "react-icons/fa";
import { API_ENDPOINTS } from "../../../../API/apiConfig";

const FILE_BASE_URL = API_ENDPOINTS.BaseUrl.replace("/api", "");

interface PDFModalProps {
  report: FaultReport;
  onClose: () => void;
}

const FaultReportPDFModal: React.FC<PDFModalProps> = ({ report, onClose }) => {
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

  const compressImage = async (
    img: HTMLImageElement,
    maxWidth: number = 1200,
    quality: number = 0.5,
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
    const marginSize = 15;
    const primaryBlue: [number, number, number] = [21, 64, 104];

    const [letterheadImage, stampImage] = await Promise.all([
      loadImage(letterheadImg),
      loadImage(stampSignImg),
    ]);

    let headerHeight = 35;
    if (letterheadImage) {
      const imageWidth = pageWidth - 28;
      const aspectRatio = letterheadImage.width / letterheadImage.height;
      const imageHeight = imageWidth / aspectRatio;
      headerHeight = imageHeight + 10;
      doc.addImage(letterheadImage, "PNG", 14, 10, imageWidth, imageHeight);
    }

    let currentY = headerHeight + 5;

    doc.setFont("times", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...primaryBlue);
    doc.text("FAULT REPORT", pageWidth / 2, currentY, { align: "center" });
    doc.setDrawColor(...primaryBlue);

    currentY += 10;

    const tableTheme: any = {
      theme: "grid",
      showHead: "firstPage",
      margin: { top: headerHeight + 5 },
      styles: {
        font: "times",
        fontSize: 7.5,
        cellPadding: 1.8,
        lineColor: [0, 0, 0],
        textColor: [0, 0, 0],
      },
      headStyles: {
        fillColor: primaryBlue,
        textColor: 255,
        halign: "center", // <--- THIS CENTERS THE TEXT
        fontStyle: "bold",
        fontSize: 10,
      },
    };

    // --- 3. HARDWARE INFORMATION ---
    autoTable(doc, {
      ...tableTheme,
      startY: currentY,
      head: [[{ content: "Hardware Information", colSpan: 2 }]],
      body: [
        ["Device", report.device || "N/A"],
        ["Customer name", report.customerName || "N/A"],
        ["Serial number", report.serialNumber || "N/A"],
        ["Firmware", report.firmware || "N/A"],
        ["Power source", report.powerSource || "N/A"],
        ["Cables connected", report.cabelsConnected || "N/A"],
        ["Modules connected", report.modulesConnected || "N/A"],
        ["Modules firmware", report.modulesFirmware || "N/A"],
        ["Voltage on antenna connector", report.voltage || "N/A"],
        ["LED Indications", report.led || "N/A"],
      ],
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 80 } },
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;

    // --- 4. SOFTWARE INFORMATION ---
    autoTable(doc, {
      ...tableTheme,
      startY: currentY,
      // Use colSpan to make the header one single centered cell
      head: [[{ content: "Software Information", colSpan: 2 }]],
      body: [
        ["Configuration software", report.configuration || "N/A"],
        ["Software for live data", report.software || "N/A"],
        ["Software version", report.softwareVersion || "N/A"],
        ["Special Software if any", (report as any).specialSoftware || "N/A"],
      ],
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 80 } },
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;

    // --- 5. FAULT REPORTED ---
    autoTable(doc, {
      ...tableTheme,
      startY: currentY,
      head: [["Fault reported by the customer"]], // Already 1 column, will center
      body: [[(report as any).faultReported || report.notes || "N/A"]],
      columnStyles: { 0: { cellWidth: "auto" } },
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;

    // --- 6. FAULT DIAGNOSIS ---
    autoTable(doc, {
      ...tableTheme,
      startY: currentY,
      // Use colSpan to make the header one single centered cell
      head: [[{ content: "Fault diagnosis already completed", colSpan: 2 }]],
      body: [
        ["Coldstarted?", report.coldStarted ? "YES" : "NO"],
        ["Default reset?", report.defaultReset ? "YES" : "NO"],
        [
          "Settings checked and screen shots copied for reference",
          report.settingChecked ? "YES" : "NO",
        ],
        ["Firmware updated or changed?", report.firmwareUpdated ? "YES" : "NO"],
        ["Internal Battery voltage", report.internalBattery || "N/A"],
        ["GPS battery voltage", report.gpsBattery || "N/A"],
      ],
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 80 } },
    });

    currentY = (doc as any).lastAutoTable.finalY + 1;

    // --- 7. COMMENTS ---
    autoTable(doc, {
      ...tableTheme,
      startY: currentY,
      head: [["Comments / Observations"]], // Already 1 column, will center
      body: [[report.comments || "N/A"]],
      columnStyles: { 0: { cellWidth: "auto" } },
      rowPageBreak: "avoid",
    });

    currentY = (doc as any).lastAutoTable.finalY + 3;

    // 🔥 Calculate total space needed (comments already rendered + footer)
    const footerHeight = 28;
    const requiredSpace = footerHeight + 2;

    // ✅ If not enough space → move BOTH to next page
    if (currentY + requiredSpace > pageHeight) {
      doc.addPage();
      currentY = 20;
    }

    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    doc.rect(marginSize, currentY, pageWidth - marginSize * 2, 28);
    doc.line(pageWidth / 2, currentY, pageWidth / 2, currentY + 28);

    doc.setFontSize(10);
    doc.setFont("times", "bold");
    doc.setTextColor(...primaryBlue);
    doc.text("For GAXCE SENSORS(OPC) PVT LTD.", marginSize + 5, currentY + 7);
    doc.setFont("times", "normal");
    doc.setTextColor(0);
    doc.setFontSize(8);
    doc.text("Subject to Pune Jurisdiction", marginSize + 5, currentY + 12);
    doc.setFont("times", "bold");
    doc.setFontSize(10);
    doc.text("Prepared By", marginSize + 5, currentY + 24);

    doc.text("Authorized Signatory", pageWidth - marginSize - 5, currentY + 7, {
      align: "right",
    });
    if (stampImage) {
      doc.addImage(
        stampImage,
        "PNG",
        pageWidth - marginSize - 55,
        currentY + 8,
        45,
        22,
      );
    }

    if ((report as any).uploadedFiles) {
      const fileList = (report as any).uploadedFiles.split(";").filter(Boolean);

      if (fileList.length > 0) {
        doc.addPage(); // ✅ ALWAYS NEW PAGE (fix overlap issue)

        const hGap = 10;
        const vGap = 10;
        const topMargin = 25;
        const imagePadding = 1.5;

        const imgContainerWidth = (pageWidth - marginSize * 2 - hGap) / 2;
        const imgContainerHeight = imgContainerWidth * 0.75;

        const positions = [
          { x: marginSize, y: topMargin },
          { x: marginSize + imgContainerWidth + hGap, y: topMargin },
          { x: marginSize, y: topMargin + imgContainerHeight + vGap },
          {
            x: marginSize + imgContainerWidth + hGap,
            y: topMargin + imgContainerHeight + vGap,
          },
        ];

        // Header
        doc.setFont("times", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...primaryBlue);
        doc.text("Inspection Images:", marginSize, 18);

        let index = 0;

        for (const file of fileList) {
          if (index === 4) {
            doc.addPage();
            index = 0;

            doc.setFont("times", "bold");
            doc.setFontSize(14);
            doc.setTextColor(...primaryBlue);
            doc.text("Inspection Images:", marginSize, 18);
          }

          try {
            const fullUrl = `${FILE_BASE_URL}/${file.startsWith("/") ? file.substring(1) : file}`;
            const imgData = await loadImage(fullUrl);

            if (imgData) {
              const pos = positions[index];

              // Border
              doc.setDrawColor(0);
              doc.setLineWidth(0.3);
              doc.rect(pos.x, pos.y, imgContainerWidth, imgContainerHeight);

              // Image
              const compressedInspectionImage = await compressImage(
                imgData,
                1200,
                0.45,
              );

              doc.addImage(
                compressedInspectionImage || imgData,
                "JPEG",
                pos.x + imagePadding,
                pos.y + imagePadding,
                imgContainerWidth - imagePadding * 2,
                imgContainerHeight - imagePadding * 2,
                undefined,
                "FAST",
              );

              index++;
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

    doc.save(`Fault_Report_${report.serialNumber || "Export"}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-3000 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center gap-6">
        <FaSpinner className="animate-spin text-5xl text-[#154068]" />
        <p className="text-xl font-bold text-[#154068]">
          Generating Fault Report PDF...
        </p>
      </div>
    </div>
  );
};

export default FaultReportPDFModal;
