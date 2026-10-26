import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getEnquiryById } from "./EnquiryService";
import letterheadImg from "../../../../../assets/NewLetterhead.jpeg";
import stampSignImg from "../../../../../assets/STAMPSIGN.png";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";

const FILE_BASE_URL = API_ENDPOINTS.BaseUrl.replace("/api", "");

// ================= IMAGE LOADER =================
const loadImage = (src: string): Promise<HTMLImageElement | null> => {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.log("Image failed:", src);
      resolve(null);
    };
  });
};

const compressImage = async (
  img: HTMLImageElement,
  quality: number = 0.5,
  maxWidth: number = 600,
): Promise<string | null> => {
  try {
    const canvas = document.createElement("canvas");

    const scale = Math.min(maxWidth / img.width, 1);

    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Convert to compressed JPEG
    return canvas.toDataURL("image/jpeg", quality);
  } catch (err) {
    console.log("Compression failed", err);
    return null;
  }
};

// ================= HELPER FUNCTION =================
const cleanText = (text: any) => {
  if (!text) return "";
  return String(text).replace(/[^\x00-\x7F]/g, "");
};

// ================= MAIN FUNCTION =================
export const printEnquiryPDF = async (id: number, options: any) => {
  try {
    const raw = await getEnquiryById(id);

    // ================= DATA MAPPING =================
    const data = {
      ...raw,
      customerName:
        options?.customers?.find((c: any) => c.value === raw.customerId)
          ?.label || "",
      responsiblePersonName: raw.responsiblePersonName || "",
      reference: raw.assignedEmployeeName ? raw.assignedEmployeeName : "",
      contactNo: raw.assignedEmployeeMobile ? raw.assignedEmployeeMobile : "",
      items: await Promise.all(
        raw.items.map(async (item: any) => {
          let imageElement: HTMLImageElement | null = null;
          let partNo = "";
          let itemDataSource: any = null;

          // if (item.itemType === "Accessory") {
          //   itemDataSource = options?.accessories?.find(
          //     (a: any) => a.value === item.accessoryId,
          //   );
          // } else {
          //   itemDataSource = options?.products?.find(
          //     (p: any) => p.value === item.productId,
          //   );
          // }
          const isService = item.itemType === "Service";

          if (isService) {
            partNo = item.servicePartNo || "";
          } else if (item.itemType === "Accessory") {
            itemDataSource = options?.accessories?.find(
              (a: any) => a.value === item.accessoryId,
            );
            partNo = itemDataSource?.partNo || itemDataSource?.label || "";
          } else {
            itemDataSource = options?.products?.find(
              (p: any) => p.value === item.productId,
            );
            partNo = itemDataSource?.partNo || itemDataSource?.label || "";
          }

          partNo = itemDataSource?.partNo || itemDataSource?.label || "";

          let compressedImage: string | null = null;

          if (itemDataSource?.image || itemDataSource?.imageUrl) {
            const imgPath = itemDataSource.image || itemDataSource.imageUrl;
            const fullUrl = `${FILE_BASE_URL}${imgPath}`;

            imageElement = await loadImage(fullUrl);

            if (imageElement) {
              compressedImage = await compressImage(imageElement, 0.45, 500);
            }
          }
          return {
            ...item,
            partNo,
            accessories: item.accessoryIds
              ?.map((id: number) => {
                const acc = options?.accessories?.find(
                  (a: any) => a.value === id,
                );
                // return acc?.label;

                if (acc?.label) {
                  // Remove only ending part no in brackets
                  return acc.label.replace(/\s*\([^)]*\)\s*$/, "").trim();
                }

                return "";
              })
              .filter(Boolean),
            imageElement,
            compressedImage,
          };
        }),
      ),
    };

    const doc = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
      compress: true,
    });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const primary: [number, number, number] = [21, 64, 104];

    const checkPageBreak = (y: number, height: number) => {
      if (y + height > pageHeight - 10) {
        doc.addPage();
        return 20;
      }
      return y;
    };

    // --- Currency Logic ---
    const currencyObj = options?.currencies?.find(
      (c: any) => c.value === data.currencyId,
    );
    let displaySymbol = "Rs.";
    if (currencyObj) {
      const symbolStr = String(currencyObj.currencySymbol || "").trim();
      const codeStr = String(currencyObj.currencyCode || "").trim();
      if (codeStr === "INR" || symbolStr === "₹" || symbolStr.includes("₹")) {
        displaySymbol = "Rs.";
      } else {
        displaySymbol = symbolStr || "Rs.";
      }
    }
    const isINR = displaySymbol === "Rs.";

    const formatCurrency = (val: number) => {
      const formattedValue = new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(val || 0);
      return `${displaySymbol} ${formattedValue}`;
    };

    const letterheadImage = await loadImage(letterheadImg);
    let headerHeight = 35;

    // ================= HEADER =================
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

    // ================= INFO SECTION =================
    let y = headerHeight + 2;

    doc.setFontSize(14);
    doc.setTextColor(primary[0], primary[1], primary[2]);
    doc.setFont("times", "bold");
    doc.text("ENQUIRY", pageWidth / 2, y, { align: "center" });
    doc.setDrawColor(primary[0], primary[1], primary[2]);

    y += 8;

    const startY = y + 2;

    // ---------- LEFT SIDE ----------
    const leftX = 16;
    const leftWidth = 92;

    doc.setFontSize(10);
    doc.setFont("times", "normal");
    doc.setTextColor(primary[0], primary[1], primary[2]);

    // Customer Name (FIRST LINE)
    doc.setFont("times", "bold");
    doc.text(cleanText(data.responsiblePersonName || "-"), leftX, startY);

    // Remaining address below
    doc.setFont("times", "normal");
    const customerLines = [
      cleanText(data.customerName || "-"),
      ...doc.splitTextToSize(cleanText(data.customerAddress || "-"), leftWidth),
    ];

    doc.text(customerLines, leftX, startY + 5);

    // ---------- RIGHT SIDE ----------
    const rightX = 133;
    const rowGap = 5;

    const drawLabelValue = (
      label: string,
      value: string,
      yPos: number,
      font: "normal" | "bold" = "normal",
    ) => {
      doc.setFont("times", "normal");
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text(label, rightX, yPos);

      const labelW =
        (doc.getStringUnitWidth(label) * doc.getFontSize()) /
        doc.internal.scaleFactor;

      doc.setFont("times", font);
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text(cleanText(value || "-"), rightX + labelW + 1, yPos);
    };

    drawLabelValue("Enquiry No:", data.enquiryNo || "-", startY, "bold");
    drawLabelValue(
      "Enquiry Date:",
      data.offerDate
        ? new Date(data.offerDate)
            .toLocaleDateString("en-GB")
            .replace(/\//g, "-")
        : "-",
      startY + rowGap,
    );
    drawLabelValue("Reference:", data.reference || "-", startY + rowGap * 2);
    drawLabelValue("Contact No:", data.contactNo || "-", startY + rowGap * 3);

    const enquiryDate = new Date(data.offerDate);
    const expiryDate = new Date(data.expiryDate);

    const validityDays = Math.max(
      0,
      Math.ceil(
        (expiryDate.getTime() - enquiryDate.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );

    // ================= TABLE =================
    const toRoman = (num: number): string => {
      const romanMap: [number, string][] = [
        [1000, "M"],
        [900, "CM"],
        [500, "D"],
        [400, "CD"],
        [100, "C"],
        [90, "XC"],
        [50, "L"],
        [40, "XL"],
        [10, "X"],
        [9, "IX"],
        [5, "V"],
        [4, "IV"],
        [1, "I"],
      ];

      let result = "";

      for (const [value, symbol] of romanMap) {
        while (num >= value) {
          result += symbol;
          num -= value;
        }
      }

      return `(${result})`;
    };

    const hasDiscount = data.items?.some(
      (item: any) => Number(item.discount) > 0,
    );

    const tableHead = hasDiscount
      ? ["Sr No", "Description", "Rate", "Qty", "Dis (%)", "Total", "Image"]
      : ["Sr No", "Description", "Rate", "Qty", "Total", "Image"];
    const tableBody: any[] = [];
    const bodyRowMeta: any[] = [];

    data.items.forEach((item: any, i: number) => {
      // const typeIdentifier = (item.itemType || "PRODUCT").toUpperCase();
      // const masterDescription =
      //   item.itemType === "Accessory"
      //     ? item.accessoriesDescription
      //     : item.productDescription;

      // // 1. Calculate Full height string including Master Description
      // const fullDescHeightString = `${typeIdentifier}\nPART NO: ${item.partNo || "-"}\nHSN/SAC: ${item.hsnSacCode || "-"}\n\n${item.description || ""}\n\n${masterDescription || ""}`;

      const isService = item.itemType === "Service";
      const typeIdentifier = isService
        ? "SERVICE"
        : (item.itemType || "PRODUCT").toUpperCase();

      const masterDescription = isService
        ? ""
        : item.itemType === "Accessory"
          ? item.accessoriesDescription
          : item.productDescription;

      // const fullDescHeightString = isService
      //   ? `${typeIdentifier}\nSERVICE PART NO: ${item.partNo || item.servicePartNo || "-"}\n\n${item.description || ""}`
      //   : `${typeIdentifier}\nPART NO: ${item.partNo || "-"}\nHSN/SAC: ${item.hsnSacCode || "-"}\n\n${item.description || ""}\n\n${masterDescription || ""}`;

      const fullDescHeightString = isService
        ? `${typeIdentifier}
          SERVICE PART NO: ${item.partNo || item.servicePartNo || "-"}
          SAC CODE: ${item.hsnSacCode || "-"}
          
          ${item.description || ""}`
        : `${typeIdentifier}
          PART NO: ${item.partNo || "-"}
          HSN/SAC: ${item.hsnSacCode || "-"}
          
          ${item.description || ""}
          
          ${masterDescription || ""}`;

      const row = [
        i + 1,
        fullDescHeightString,
        new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2 }).format(
          item.rate || 0,
        ),
        item.quantity,
      ];

      if (hasDiscount) {
        row.push(`${item.discount || 0}%`);
      }

      row.push(
        new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2 }).format(
          item.total || 0,
        ),
        "",
      );

      tableBody.push(row);
      bodyRowMeta.push({ type: "item", item, masterDescription });

      // Accessory sub-rows
      if (item.accessories?.length) {
        item.accessories.forEach((acc: string, idx: number) => {
          tableBody.push([
            {
              content: `${toRoman(idx + 1)} ${cleanText(acc)}`,
              colSpan: 7,
              styles: {
                fontSize: 6.5,
                textColor: [0, 0, 0],
                halign: "left",
                valign: "middle",
                cellPadding: { top: 0.6, right: 3, bottom: 0.6, left: 4 },
                minCellHeight: 5,
              },
            },
          ]);
          bodyRowMeta.push({ type: "accessory", item });
        });
      }
    });

    // Totals logic
    const labelColSpan = hasDiscount ? 5 : 4;
    tableBody.push([
      {
        content: "Subtotal Price",
        colSpan: labelColSpan,
        styles: { halign: "right", fontStyle: "bold", textColor: primary },
      },
      {
        content: formatCurrency(data.subtotal),
        colSpan: 2,
        styles: { halign: "right", textColor: primary, fontStyle: "bold" },
      },
    ]);

    if (isINR) {
      const totalCGST = data.items.reduce(
        (s: number, i: any) => s + (i.cgstAmount || 0),
        0,
      );

      const totalSGST = data.items.reduce(
        (s: number, i: any) => s + (i.sgstAmount || 0),
        0,
      );

      const totalIGST = data.items.reduce(
        (s: number, i: any) => s + (i.igstAmount || 0),
        0,
      );

      if (totalCGST > 0) {
        tableBody.push([
          {
            content: "CGST (9%)",
            colSpan: labelColSpan,
            styles: { halign: "right", fontStyle: "bold", textColor: primary },
          },
          {
            content: formatCurrency(totalCGST),
            colSpan: 2,
            styles: { halign: "right", textColor: primary, fontStyle: "bold" },
          },
        ]);
      }

      if (totalSGST > 0) {
        tableBody.push([
          {
            content: "SGST (9%)",
            colSpan: labelColSpan,
            styles: { halign: "right", fontStyle: "bold", textColor: primary },
          },
          {
            content: formatCurrency(totalSGST),
            colSpan: 2,
            styles: { halign: "right", textColor: primary, fontStyle: "bold" },
          },
        ]);
      }

      if (totalIGST > 0) {
        tableBody.push([
          {
            content: "IGST (18%)",
            colSpan: labelColSpan,
            styles: { halign: "right", fontStyle: "bold", textColor: primary },
          },
          {
            content: formatCurrency(totalIGST),
            colSpan: 2,
            styles: { halign: "right", textColor: primary, fontStyle: "bold" },
          },
        ]);
      }
    }

    if ((data.freightCharges || 0) > 0) {
      tableBody.push([
        {
          content: "Freight, Carriage, Insurance",
          colSpan: labelColSpan,
          styles: { halign: "right", fontStyle: "bold", textColor: primary },
        },
        {
          content: formatCurrency(data.freightCharges),
          colSpan: 2,
          styles: { halign: "right", textColor: primary, fontStyle: "bold" },
        },
      ]);
    }

    tableBody.push([
      {
        content: "Final Price",
        colSpan: labelColSpan,
        styles: {
          fillColor: primary,
          textColor: 255,
          fontStyle: "bold",
          halign: "right",
          fontSize: 10,
        },
      },
      {
        content: formatCurrency(data.grandTotal),
        colSpan: 2,
        styles: {
          fillColor: primary,
          textColor: 255,
          fontStyle: "bold",
          halign: "right",
          fontSize: 10,
        },
      },
    ]);

    const imageColumnIndex = hasDiscount ? 6 : 5;

    autoTable(doc, {
      startY: 75,
      head: [tableHead],
      body: tableBody,
      theme: "grid",
      showHead: "firstPage",
      styles: {
        fontSize: 8,
        lineWidth: 0.3,
        lineColor: primary,
        valign: "middle",
      },
      headStyles: {
        fillColor: primary,
        textColor: 255,
        halign: "left",
        fontStyle: "bold",
        fontSize: 9,
      },

      columnStyles: {
        2: { halign: "right", textColor: primary, fontStyle: "bold" },
        3: { halign: "center", textColor: primary, fontStyle: "bold" },
        ...(hasDiscount && {
          4: { halign: "center", textColor: primary, fontStyle: "bold" },
        }),
        [hasDiscount ? 5 : 4]: {
          halign: "right",
          textColor: primary,
          fontStyle: "bold",
        },
        [imageColumnIndex]: { cellWidth: 18 },
      },
      rowPageBreak: "avoid",
      didDrawCell: (d) => {
        if (d.section !== "body") return;
        const meta = bodyRowMeta[d.row.index];
        if (!meta || meta.type !== "item") return;

        const item = meta.item;

        if (d.column.index === 1) {
          doc.setFillColor(255, 255, 255);
          doc.rect(
            d.cell.x + 0.5,
            d.cell.y + 0.5,
            d.cell.width - 1,
            d.cell.height - 1,
            "F",
          );

          const pad = 2;
          const x = d.cell.x + pad;
          const lh = 3.8;
          let yText = d.cell.y + pad + 2;
          const uw = d.cell.width - 2 * pad;

          // Type Identifier (Bold)
          doc.setFont("times", "bold");
          doc.setTextColor(0, 0, 0);
          doc.text((item?.itemType || "PRODUCT").toUpperCase(), x, yText);
          yText += lh;

          doc.setFont("times", "normal");

          if (item.itemType === "Service") {
            doc.text(
              `SERVICE PART NO: ${item.partNo || item.servicePartNo || "-"}`,
              x,
              yText,
            );
            yText += lh;

            doc.text(`SAC CODE: ${item.hsnSacCode || "-"}`, x, yText);
            yText += lh * 1.5;
          } else {
            doc.text(`PART NO: ${item.productCode || "-"}`, x, yText);
            yText += lh;
            doc.text(`HSN/SAC: ${item.hsnSacCode || "-"}`, x, yText);
            yText += lh * 1.5;
          }

          // User Description (Blue)
          doc.setTextColor(20, 85, 145);
          if (item.description) {
            const dLines = doc.splitTextToSize(cleanText(item.description), uw);
            doc.text(dLines, x, yText);
            yText += dLines.length * lh;
          }

          // Master Description (Blue - EXACT MATCH to OFFER)
          if (meta.masterDescription) {
            yText += lh * 0.5;
            const mLines = doc.splitTextToSize(
              cleanText(meta.masterDescription),
              uw,
            );
            doc.text(mLines, x, yText);
          }

          doc.setDrawColor(primary[0], primary[1], primary[2]);
          doc.rect(d.cell.x, d.cell.y, d.cell.width, d.cell.height);
          doc.setTextColor(0, 0, 0);
        }

        // Image
        if (d.column.index === imageColumnIndex && item?.compressedImage) {
          const pad = 2;
          const maxW = d.cell.width - 2 * pad;
          const maxH = d.cell.height - 2 * pad;
          const ar = item.imageElement.width / item.imageElement.height;
          let nW = maxW,
            nH = nW / ar;
          if (nH > maxH) {
            nH = maxH;
            nW = nH * ar;
          }
          const imgX = d.cell.x + (d.cell.width - nW) / 2;
          const imgY = d.cell.y + (d.cell.height - nH) / 2;
          doc.addImage(item.compressedImage, "JPEG", imgX, imgY, nW, nH);
        }
      },
    });

    // ================= TERMS & FOOTER =================
    let yPos = (doc as any).lastAutoTable.finalY + 12;
    const terms = doc.splitTextToSize(
      data.termsConditions || "",
      pageWidth - 30,
    );
    const termsHeight = terms.length * 4 + 12;
    yPos = checkPageBreak(yPos, termsHeight + 10);

    doc.setFont("times", "bold");
    doc.setFillColor(primary[0], primary[1], primary[2]);
    doc.rect(14, yPos, pageWidth - 28, 8, "F");
    doc.setTextColor(255);
    doc.text("Terms & Conditions", pageWidth / 2, yPos + 5, {
      align: "center",
    });
    doc.setTextColor(0);
    doc.setFont("times", "normal");
    doc.rect(14, yPos + 8, pageWidth - 28, termsHeight);
    doc.text(terms, 16, yPos + 14);

    yPos += termsHeight + 15;
    yPos = checkPageBreak(yPos, 40);
    doc.setFontSize(10);
    doc.text(
      `* VALIDITY : ${validityDays} Days from the date of Enquiry`,
      14,
      yPos,
    );

    doc.setFont("times", "bold");
    doc.text("Authorised Signatory", pageWidth - 65, yPos);
    const stampImage = await loadImage(stampSignImg);
    if (stampImage)
      doc.addImage(stampImage, "PNG", pageWidth - 75, yPos + 2, 50, 25);

    doc.save(`${data.enquiryNo || "Enquiry"}_Enquiry.pdf`);
  } catch (err) {
    console.error("PDF ERROR:", err);
  }
};
