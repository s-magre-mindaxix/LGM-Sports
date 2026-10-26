import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getOfferById } from "../../Offer/Services/OfferService";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import letterheadImg from "../../../../../assets/NewLetterhead.jpeg";
import stampSignImg from "../../../../../assets/STAMPSIGN.png";

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
  maxWidth: number = 500,
): Promise<string | null> => {
  try {
    const canvas = document.createElement("canvas");

    const scale = Math.min(maxWidth / img.width, 1);

    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/jpeg", 0.45);
  } catch (err) {
    console.log("Compression Error:", err);
    return null;
  }
};

// ================= HELPER FUNCTION =================
const cleanText = (text: any) => {
  if (!text) return "";
  return String(text).replace(/[^\x00-\x7F]/g, "");
};

// ================= MAIN FUNCTION =================
export const printOfferPDF = async (id: number, options: any) => {
  try {
    const raw = await getOfferById(id);

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

          if (item.itemType === "Service") {
            itemDataSource = null;
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

          let compressedImage: string | null = null;

          if (itemDataSource?.image || itemDataSource?.imageUrl) {
            const imgPath = itemDataSource.image || itemDataSource.imageUrl;
            const fullUrl = `${FILE_BASE_URL}${imgPath}`;

            imageElement = await loadImage(fullUrl);

            if (imageElement) {
              compressedImage = await compressImage(imageElement, 500);
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

    const selectedCompany = options?.companies?.find(
      (c: any) => Number(c.value) === Number(raw.companyId),
    );

    const selectedState = options?.states?.find(
      (s: any) => Number(s.value) === Number(raw.placeOfSupplyId),
    );

    const billingState = (selectedCompany?.stateName || "")
      .toLowerCase()
      .trim();
    const supplyState = (selectedState?.label || "").toLowerCase().trim();

    const isIntraState =
      billingState && supplyState && billingState === supplyState;

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

    let displaySymbol;
    const apiSymbol = raw.currencySymbol;
    const currencyName = raw.currencyName || "";

    if (apiSymbol) {
      const symbolStr = String(apiSymbol).trim();
      if (
        symbolStr.toUpperCase() === "INR" ||
        symbolStr === "₹" ||
        symbolStr.charCodeAt(0) === 8377 ||
        symbolStr.includes("₹")
      ) {
        displaySymbol = "Rs.";
      } else {
        displaySymbol = apiSymbol;
      }
    } else {
      displaySymbol = "Rs.";
    }

    const isINR =
      displaySymbol === "Rs." ||
      currencyName.toUpperCase() === "INR" ||
      displaySymbol === "₹";
    const isGBP =
      displaySymbol === "GBP" ||
      displaySymbol === "£" ||
      currencyName === "GBP";
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

    // ================= CUSTOMER =================
    let y = headerHeight + 2;

    // OFFER title
    doc.setFontSize(14);
    doc.setTextColor(primary[0], primary[1], primary[2]);
    doc.setFont("times", "bold");
    doc.text("OFFER", pageWidth / 2, y, { align: "center" });
    doc.setDrawColor(primary[0], primary[1], primary[2]);
    // doc.line(pageWidth / 2 - 14, y + 1, pageWidth / 2 + 14, y + 1);

    y += 8;

    doc.setTextColor(primary[0], primary[1], primary[2]);

    // ---------- COMMON ----------
    const rowGap = 5;

    // ---------- LEFT SIDE ----------
    const leftX = 16;
    const leftY = y + 2;
    const leftWidth = 92;

    doc.setFontSize(10);

    let leftLineY = leftY;

    doc.setFont("times", "bold");
    doc.text(cleanText(data.responsiblePersonName || "-"), leftX, leftLineY);

    doc.setFont("times", "normal");
    leftLineY += rowGap;
    doc.text(cleanText(data.customerName || "-"), leftX, leftLineY);

    leftLineY += rowGap;
    const customerAddressLines = doc.splitTextToSize(
      cleanText(data.customerAddress || "-"),
      leftWidth,
    );

    doc.text(customerAddressLines, leftX, leftLineY);

    // move Y after address
    leftLineY += customerAddressLines.length * rowGap;

    // show Vendor Code

    doc.setFont("times", "normal");
    doc.text("Vendor Code: ", leftX, leftLineY);

    const vendorCodeLabelWidth =
      (doc.getStringUnitWidth("Vendor Code: ") * doc.getFontSize()) /
      doc.internal.scaleFactor;

    doc.setFont("times", "normal");
    doc.text(
      cleanText(data.vendorCode || "-"),
      leftX + vendorCodeLabelWidth,
      leftLineY,
    );

    // ---------- RIGHT SIDE ----------
    const rightX = 133;

    const drawLabelValue = (
      label: string,
      value: string,
      yPos: number,
      valueFont: "normal" | "bold" = "normal",
    ) => {
      doc.setFont("times", "normal");
      doc.text(label, rightX, yPos);

      const labelWidth =
        (doc.getStringUnitWidth(label) * doc.getFontSize()) /
        doc.internal.scaleFactor;

      doc.setFont("times", valueFont);
      doc.text(cleanText(value || "-"), rightX + labelWidth + 1, yPos);
    };

    drawLabelValue("Offer No:", data.offerNo || "-", leftY, "bold");

    const displayDate =
  data.latestRevisionDate &&
  data.latestRevisionDate !== "0001-01-01T00:00:00"
    ? data.latestRevisionDate
    : data.offerDate;

drawLabelValue(
  "Offer Date:",
  displayDate
    ? displayDate.substring(0, 10).split("-").reverse().join("-")
    : "-",
  leftY + rowGap,
)

    drawLabelValue("Reference:", data.reference || "-", leftY + rowGap * 2);

    drawLabelValue("Contact No:", data.contactNo || "-", leftY + rowGap * 3);

    const leftBlockBottomY = leftLineY + rowGap;

    const rightBlockBottomY = leftY + rowGap * 3;

    const tableStartY = Math.max(leftBlockBottomY, rightBlockBottomY) + 8;

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
    const showDiscountColumn = data.items.some(
      (item: any) => Number(item.discount || 0) > 0,
    );

    const tableHead = showDiscountColumn
      ? ["Sr No", "Description", "Rate", "Qty", "Dis (%)", "Total", "Image"]
      : ["Sr No", "Description", "Rate", "Qty", "Total", "Image"];

    const tableBody: any[] = [];
    const bodyRowMeta: {
      type: "item" | "accessory" | "summary";
      item?: any;
    }[] = [];

    data.items.forEach((item: any, i: number) => {
      const typeIdentifier = (item.itemType || "PRODUCT").toUpperCase();

      const masterDescription =
        item.itemType === "Accessory"
          ? item.accessoriesDescription
          : item.productDescription;

      let descString = `${typeIdentifier}\nPART NO: ${item.partNo || "-"}\nHSN/SAC: ${
        item.hsnSacCode || "-"
      }`;

      if (item.description) {
        descString += `\n\n${item.description}`;
      }

      if (masterDescription) {
        descString += `\n\n${masterDescription}`;
      }

      const itemRow = [
        i + 1,
        cleanText(descString),
        new Intl.NumberFormat("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(item.rate || 0),
        item.quantity,
      ];

      if (showDiscountColumn) {
        itemRow.push(`${Number(item.discount || 0)}%`);
      }

      itemRow.push(
        new Intl.NumberFormat("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(item.total || 0),
        "",
      );

      tableBody.push(itemRow);
      bodyRowMeta.push({ type: "item", item });

      // accessory rows below main row
      if (item.accessories?.length) {
        item.accessories.forEach((acc: string, idx: number) => {
          tableBody.push([
            {
              content: `${toRoman(idx + 1)} ${cleanText(acc)}`,
              // colSpan: 7,
              colSpan: showDiscountColumn ? 7 : 6,
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

    const totalCGST = data.items.reduce(
      (sum, item) => sum + (item.cgstAmount || 0),
      0,
    );
    const totalSGST = data.items.reduce(
      (sum, item) => sum + (item.sgstAmount || 0),
      0,
    );
    const totalIGST = data.items.reduce(
      (sum, item) => sum + (item.igstAmount || 0),
      0,
    );

    // const labelColSpan = 5;
    const labelColSpan = showDiscountColumn ? 5 : 4;

    // 1. Subtotal Row
    tableBody.push([
      {
        content: "Subtotal Price",
        colSpan: labelColSpan,
        styles: { halign: "right", fontStyle: "bold", textColor: primary },
      },
      {
        content: formatCurrency(data.subtotal),
        colSpan: 2, // Spans Total and Image columns
        styles: { halign: "right", textColor: primary, fontStyle: "bold" },
      },
    ]);

    if (isINR) {
      if (isIntraState) {
        tableBody.push(
          [
            {
              content: "CGST (9%)",
              colSpan: labelColSpan,
              styles: {
                halign: "right",
                fontStyle: "bold",
                textColor: primary,
              },
            },
            {
              content: formatCurrency(totalCGST),
              colSpan: 2,
              styles: {
                halign: "right",
                textColor: primary,
                fontStyle: "bold",
              },
            },
          ],
          [
            {
              content: "SGST (9%)",
              colSpan: labelColSpan,
              styles: {
                halign: "right",
                fontStyle: "bold",
                textColor: primary,
              },
            },
            {
              content: formatCurrency(totalSGST),
              colSpan: 2,
              styles: {
                halign: "right",
                textColor: primary,
                fontStyle: "bold",
              },
            },
          ],
        );
      } else if (totalIGST > 0) {
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

    const freightCharges = Number(data.freightCharges || 0);

    if (freightCharges > 0) {
      tableBody.push([
        {
          content: "Freight, Carriage, Insurance",
          colSpan: labelColSpan,
          styles: {
            halign: "right",
            fontStyle: "bold",
            textColor: primary,
          },
        },
        {
          content: formatCurrency(freightCharges),
          colSpan: 2,
          styles: {
            halign: "right",
            textColor: primary,
            fontStyle: "bold",
          },
        },
      ]);
    }

    // 4. Final Price Row (Full width blue bar)
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

    // const imageColumnIndex = 6;
    const imageColumnIndex = showDiscountColumn ? 6 : 5;

    autoTable(doc, {
      // startY: 70,
      startY: tableStartY,
      head: [tableHead],
      body: tableBody,
      theme: "grid",
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

      columnStyles: showDiscountColumn
        ? {
            2: { halign: "right", textColor: primary, fontStyle: "bold" }, // Rate
            3: { halign: "center", textColor: primary, fontStyle: "bold" }, // Qty
            4: { halign: "center", textColor: primary, fontStyle: "bold" }, // Dis
            5: { halign: "right", textColor: primary, fontStyle: "bold" }, // Total
            [imageColumnIndex]: { cellWidth: 18 },
          }
        : {
            2: { halign: "right", textColor: primary, fontStyle: "bold" }, // Rate
            3: { halign: "center", textColor: primary, fontStyle: "bold" }, // Qty
            4: { halign: "right", textColor: primary, fontStyle: "bold" }, // Total
            [imageColumnIndex]: { cellWidth: 18 },
          },
      rowPageBreak: "avoid",
      showHead: "firstPage",
      didDrawCell: (d) => {
        if (d.section !== "body") return;
        const meta = bodyRowMeta[d.row.index];

        if (!meta || meta.type !== "item" || !meta.item) {
          return;
        }

        const item = meta.item;

        if (d.column.index === 1) {
          doc.setFillColor(255, 255, 255);
          doc.rect(d.cell.x, d.cell.y, d.cell.width, d.cell.height, "F");

          const pad = 2;
          const x = d.cell.x + pad;
          const lh = 3.5;
          let yText = d.cell.y + pad + 1.5;
          const uw = d.cell.width - 2 * pad;

          const typeId = (item?.itemType || "PRODUCT").toUpperCase();
          doc.setFont("times", "bold");
          doc.setTextColor(0, 0, 0);
          doc.text(cleanText(typeId), x, yText);
          yText += lh;

          doc.setFont("times", "normal");

          if (item.itemType === "Service") {
            doc.text(
              cleanText(
                `SERVICE PART NO: ${item.partNo || item.servicePartNo || "-"}`,
              ),
              x,
              yText,
            );
            yText += lh * 1;
            doc.text(
              cleanText(`SAC CODE: ${item.hsnSacCode || "-"}`),
              x,
              yText,
            );
            yText += lh * 1.5;
          } else {
            doc.text(
              cleanText(`PART NO: ${item.productCode || "-"}`),
              x,
              yText,
            );
            yText += lh;

            doc.text(cleanText(`HSN/SAC: ${item.hsnSacCode || "-"}`), x, yText);
            yText += lh * 1.5;
          }

          const masterDescription =
            item.itemType === "Accessory"
              ? item.accessoriesDescription
              : item.productDescription;

          doc.setTextColor(20, 85, 145);

          if (item.description) {
            const dLines = doc.splitTextToSize(cleanText(item.description), uw);
            doc.text(dLines, x, yText);
            yText += dLines.length * lh;
          }

          if (masterDescription) {
            yText += lh * 0.5;
            const masterLines = doc.splitTextToSize(
              cleanText(masterDescription),
              uw,
            );
            doc.text(masterLines, x, yText);
            yText += masterLines.length * lh;
          }

          doc.setDrawColor(primary[0], primary[1], primary[2]);
          doc.setLineWidth(0.3);
          doc.rect(d.cell.x, d.cell.y, d.cell.width, d.cell.height);
          doc.setTextColor(0, 0, 0);
        }

        if (d.column.index === imageColumnIndex && item?.imageElement) {
          const pad = 2;
          const maxW = d.cell.width - 2 * pad;
          const maxH = d.cell.height - 2 * pad;
          const ar = item.imageElement.width / item.imageElement.height;

          let nW = maxW;
          let nH = nW / ar;

          if (nH > maxH) {
            nH = maxH;
            nW = nH * ar;
          }

          const imgX = d.cell.x + (d.cell.width - nW) / 2;
          const imgY = d.cell.y + (d.cell.height - nH) / 2;
          doc.addImage(
            item.compressedImage || item.imageElement,
            "JPEG",
            imgX,
            imgY,
            nW,
            nH,
          );
        }
      },
    });

    // ================= TERMS & CONDITIONS =================
    let yPos = (doc as any).lastAutoTable.finalY + 12;

    const terms = doc.splitTextToSize(
      data.termsConditions || "",
      pageWidth - 30,
    );
    const termsHeight = terms.length * 4 + 12;
    yPos = checkPageBreak(yPos, termsHeight + 10);

    // Header Style
    doc.setFont("times", "bold");
    doc.setFillColor(primary[0], primary[1], primary[2]);
    doc.rect(14, yPos, pageWidth - 28, 8, "F");
    doc.setTextColor(255);
    doc.text("Terms & Conditions", pageWidth / 2, yPos + 5, {
      align: "center",
    });

    // Content Box
    doc.setTextColor(0);
    doc.setFont("times", "normal");
    doc.rect(14, yPos + 8, pageWidth - 28, termsHeight);
    doc.text(terms, 16, yPos + 14);
    yPos += termsHeight + 15;

    // ================= ORDER DETAILS =================
    yPos = checkPageBreak(yPos, 45);
    doc.setFont("times", "bold");
    doc.setTextColor(0);
    doc.text("* ORDER DETAILS", 14, yPos);
    yPos += 3;

    doc.setFillColor(primary[0], primary[1], primary[2]);
    doc.rect(14, yPos, pageWidth - 28, 8, "F");
    doc.setTextColor(255);
    doc.text("Name On Purchase Order", pageWidth / 2, yPos + 5, {
      align: "center",
    });

    const orderBoxHeight = 32;
    doc.rect(14, yPos + 8, pageWidth - 28, orderBoxHeight);

    let orderLineY = yPos + 14;
    const paddingLeft = 18;

    doc.setFont("times", "normal");
    doc.setTextColor(0);
    doc.text(
      "Purchase order should be placed in the name of",
      paddingLeft,
      orderLineY,
    );
    orderLineY += 6;

    // --- DYNAMIC CONTENT BASED ON GBP ---
    const entityName = isGBP ? data.vendorName || "-" : data.companyName || "-";
    const entityGST = data.companyGST || "-";
    const entityPAN = data.companyPAN || "-";
    const entityAddress = isGBP
      ? data.vendorAddress || "-"
      : data.companyFullAddress || "-";
    const contactPerson = data.vendorContactPerson || "-";

    doc.setFont("times", "bold");
    doc.setTextColor(primary[0], primary[1], primary[2]);
    doc.text(cleanText(entityName).toUpperCase(), paddingLeft, orderLineY);
    orderLineY += 6;

    if (isGBP) {
      doc.setFont("times", "bold");
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text(`${cleanText(contactPerson)}`, paddingLeft, orderLineY);
      orderLineY += 6;
    } else {
      doc.setFont("times", "bold");
      doc.setTextColor(0);
      doc.text("GST NO: ", paddingLeft, orderLineY);
      const gstLabelWidth = doc.getTextWidth("GST NO: ");

      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text(entityGST, paddingLeft + gstLabelWidth, orderLineY);

      const gstValWidth = doc.getTextWidth(entityGST);
      doc.setTextColor(0);
      doc.text(
        " / PAN No: ",
        paddingLeft + gstLabelWidth + gstValWidth,
        orderLineY,
      );
      const panLabelWidth = doc.getTextWidth(" / PAN No: ");

      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text(
        entityPAN,
        paddingLeft + gstLabelWidth + gstValWidth + panLabelWidth,
        orderLineY,
      );
      orderLineY += 6;
    }

    doc.setFont("times", "normal");
    doc.setTextColor(0);
    const addressLines = doc.splitTextToSize(
      cleanText(entityAddress),
      pageWidth - 40,
    );
    doc.text(addressLines, paddingLeft, orderLineY);
    yPos += orderBoxHeight + 15;

    // ================= BANK INFO =================
    const b = data.bankDetails || {};

    const bankItems = isGBP
      ? [
          {
            label: "ACCOUNT HOLDER NAME : ",
            value: b.accountHolderName || "-",
          },
          { label: "BANK NAME : ", value: b.bankName || "-" },
          { label: "BANK ADDRESS : ", value: b.bankAddress || "-" },
          { label: "ACCOUNT NO. : ", value: b.accountNo || "-" },
          { label: "SWIFT CODE : ", value: b.swiftCode || "-" },
          { label: "IBAN NUMBER : ", value: b.ibanNo || "-" },
          { label: "VAT NO : ", value: data.vendorVatNo || "-" },
        ]
      : [
          {
            label: "ACCOUNT HOLDER NAME : ",
            value: b.accountHolderName || "-",
          },
          { label: "BANK NAME : ", value: b.bankName || "-" },
          { label: "BANK ADDRESS : ", value: b.bankAddress || "-" },
          { label: "ACCOUNT NO. : ", value: b.accountNo || "-" },
          { label: "IFSC CODE : ", value: b.ifscCode || "-" },
        ];

    const bankBoxHeight = bankItems.length * 5 + 10;
    yPos = checkPageBreak(yPos, bankBoxHeight + 20);

    doc.setFont("times", "bold");
    doc.setTextColor(0);
    doc.text("* BANK INFO", 14, yPos);
    yPos += 3;

    doc.setFillColor(primary[0], primary[1], primary[2]);
    doc.rect(14, yPos, pageWidth - 28, 8, "F");
    doc.setTextColor(255);
    doc.text("Payment Transfer Details", pageWidth / 2, yPos + 5, {
      align: "center",
    });

    doc.rect(14, yPos + 8, pageWidth - 28, bankBoxHeight);

    let bankLineY = yPos + 14;
    bankItems.forEach((item, index) => {
      doc.setFont("times", "bold");
      doc.setTextColor(0);
      doc.text(item.label, 18, bankLineY);

      const labelW = doc.getTextWidth(item.label);

      if (index === 0) {
        doc.setFont("times", "bold");
        doc.setTextColor(primary[0], primary[1], primary[2]);
      } else {
        doc.setFont("times", "normal");
        doc.setTextColor(0);
      }

      doc.text(String(item.value), 18 + labelW, bankLineY);

      bankLineY += 5;
    });

    yPos += bankBoxHeight + 15;

    // ================= FOOTER =================
    const footerMinHeight = 50;
    yPos = checkPageBreak(yPos, footerMinHeight);

    doc.setFont("times", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(`* VALIDITY : ${validityDays} Days from the date of Offer`, 14, yPos);

    const sigAreaY = yPos;
    const sigAreaX = pageWidth - 75;

    doc.setFont("times", "bold");
    doc.text("Authorised Signatory", sigAreaX + 10, sigAreaY);

    const stampImage = await loadImage(stampSignImg);
    if (stampImage) {
      doc.addImage(stampImage, "PNG", sigAreaX, sigAreaY + 2, 50, 25);
    }

    yPos += 8;

    doc.setFont("times", "normal");
    doc.text("* Note :", 14, yPos);

    const noteX = 28;
    const notesStr = data.customerNotes || "";

    if (notesStr) {
      const noteLines = doc.splitTextToSize(notesStr, sigAreaX - noteX - 5);

      doc.text(noteLines, noteX, yPos);

      yPos += noteLines.length * 5 + 8;
    } else {
      yPos += 8;
    }

    doc.save(`${data.offerNo || "Offer"}_Offer.pdf`);
  } catch (err) {
    console.error("PDF ERROR:", err);
  }
};
