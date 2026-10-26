// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import { API_ENDPOINTS } from "../../../../../API/apiConfig";
// import letterheadImg from "../../../../../assets/NewLetterhead.jpeg";
// import stampSignImg from "../../../../../assets/STAMPSIGN.png";

// const FILE_BASE_URL = API_ENDPOINTS.BaseUrl.replace("/api", "");

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

// const cleanText = (text: any) => {
//   if (!text) return "";
//   return String(text).replace(/[^\x00-\x7F]/g, "");
// };

// const pick = (obj: any, camel: string, pascal: string, fallback: any = "") => {
//   return obj?.[camel] ?? obj?.[pascal] ?? fallback;
// };

// const normalizeVersionOffer = (raw: any) => {
//   const bank = pick(raw, "bankDetails", "BankDetails", {});

//   return {
//     ...raw,

//     offerId: pick(raw, "offerId", "OfferId", 0),
//     enquiryId: pick(raw, "enquiryId", "EnquiryId", null),
//     serviceId: pick(raw, "serviceId", "ServiceId", null),

//     offerNo: pick(raw, "offerNo", "OfferNo", "-"),
//     enquiryNo: pick(raw, "enquiryNo", "EnquiryNo", "-"),
//     offerDate: pick(raw, "offerDate", "OfferDate", null),
//     expiryDate: pick(raw, "expiryDate", "ExpiryDate", null),

//     customerId: pick(raw, "customerId", "CustomerId", 0),
//     customerName: pick(raw, "customerName", "CustomerName", "-"),
//     customerAddress: pick(raw, "customerAddress", "CustomerAddress", "-"),

//     responsiblePersonName: pick(
//       raw,
//       "responsiblePersonName",
//       "ResponsiblePersonName",
//       "-",
//     ),
//     assignedEmployeeName: pick(
//       raw,
//       "assignedEmployeeName",
//       "AssignedEmployeeName",
//       "-",
//     ),
//     assignedEmployeeMobile: pick(
//       raw,
//       "assignedEmployeeMobile",
//       "AssignedEmployeeMobile",
//       "-",
//     ),

//     companyId: pick(raw, "companyId", "CompanyId", 0),
//     companyName: pick(raw, "companyName", "CompanyName", "-"),
//     companyGST: pick(raw, "companyGST", "CompanyGST", "-"),
//     companyPAN: pick(raw, "companyPAN", "CompanyPAN", "-"),
//     companyFullAddress: pick(
//       raw,
//       "companyFullAddress",
//       "CompanyFullAddress",
//       "-",
//     ),

//     vendorId: pick(raw, "vendorId", "VendorId", 0),
//     vendorCode: pick(raw, "vendorCode", "VendorCode", "-"),
//     vendorName: pick(raw, "vendorName", "VendorName", "-"),
//     vendorVatNo: pick(raw, "vendorVatNo", "VendorVatNo", "-"),
//     vendorContactPerson: pick(
//       raw,
//       "vendorContactPerson",
//       "VendorContactPerson",
//       "-",
//     ),
//     vendorAddress: pick(raw, "vendorAddress", "VendorAddress", "-"),

//     currencyId: pick(raw, "currencyId", "CurrencyId", 0),
//     currencyName: pick(raw, "currencyName", "CurrencyName", "INR"),
//     currencySymbol: pick(raw, "currencySymbol", "CurrencySymbol", "Rs."),
//     placeOfSupplyId: pick(raw, "placeOfSupplyId", "PlaceOfSupplyId", 0),

//     subtotal: Number(pick(raw, "subtotal", "Subtotal", 0)),
//     freightCharges: Number(pick(raw, "freightCharges", "FreightCharges", 0)),
//     grandTotal: Number(pick(raw, "grandTotal", "GrandTotal", 0)),

//     termsConditions: pick(raw, "termsConditions", "TermsConditions", ""),
//     customerNotes: pick(raw, "customerNotes", "CustomerNotes", ""),
//     status: pick(raw, "status", "Status", "DRAFT"),

//     bankDetails: {
//       bankName: pick(bank, "bankName", "BankName", "-"),
//       bankAddress: pick(bank, "bankAddress", "BankAddress", "-"),
//       accountNo: pick(bank, "accountNo", "AccountNo", "-"),
//       ifscCode: pick(bank, "ifscCode", "IFSCCode", "-"),
//       accountHolderName: pick(
//         bank,
//         "accountHolderName",
//         "AccountHolderName",
//         "-",
//       ),
//       swiftCode: pick(bank, "swiftCode", "SwiftCode", "-"),
//       ibanNo: pick(bank, "ibanNo", "IBANNo", "-"),
//     },

//     items: (pick(raw, "items", "Items", []) || []).map((x: any) => ({
//       itemType: pick(x, "itemType", "ItemType", "Product"),
//       accessoryId: Number(pick(x, "accessoryId", "AccessoryId", 0)),
//       productId: Number(pick(x, "productId", "ProductId", 0)),
//       serviceId: Number(pick(x, "serviceId", "ServiceId", 0)),
//       servicePartNo: pick(x, "servicePartNo", "ServicePartNo", ""),
//       description: pick(x, "description", "Description", ""),
//       productDescription: pick(
//         x,
//         "productDescription",
//         "ProductDescription",
//         "",
//       ),
//       accessoriesDescription: pick(
//         x,
//         "accessoriesDescription",
//         "AccessoriesDescription",
//         "",
//       ),
//       hsnSacCode: pick(x, "hsnSacCode", "HsnSacCode", ""),
//       quantity: Number(pick(x, "quantity", "Quantity", 0)),
//       rate: Number(pick(x, "rate", "Rate", 0)),
//       discount: Number(pick(x, "discount", "Discount", 0)),
//       taxPercentage: Number(pick(x, "taxPercentage", "TaxPercentage", 0)),
//       total: Number(pick(x, "total", "Total", 0)),
//       gstAmount: Number(pick(x, "gstAmount", "GstAmount", 0)),
//       cgstAmount: Number(pick(x, "cgstAmount", "CgstAmount", 0)),
//       sgstAmount: Number(pick(x, "sgstAmount", "SgstAmount", 0)),
//       igstAmount: Number(pick(x, "igstAmount", "IgstAmount", 0)),
//       finalPrice: Number(pick(x, "finalPrice", "FinalPrice", 0)),
//       accessoryIds: pick(x, "accessoryIds", "AccessoryIds", []),
//     })),
//   };
// };

// export const printOfferVersionPDF = async (versionData: any, options: any) => {
//   try {
//     const raw = normalizeVersionOffer(versionData);

//     const data = {
//       ...raw,
//       customerName:
//         raw.customerName ||
//         options?.customers?.find(
//           (c: any) => Number(c.value) === Number(raw.customerId),
//         )?.label ||
//         "-",
//       responsiblePersonName: raw.responsiblePersonName || "-",
//       reference: raw.assignedEmployeeName || "-",
//       contactNo: raw.assignedEmployeeMobile || "-",
//       items: await Promise.all(
//         (raw.items || []).map(async (item: any) => {
//           let imageElement: HTMLImageElement | null = null;
//           let partNo = "";
//           let itemDataSource: any = null;

//           // if (item.itemType === "Accessory") {
//           //   itemDataSource = options?.accessories?.find(
//           //     (a: any) => Number(a.value) === Number(item.accessoryId),
//           //   );
//           // } else {
//           //   itemDataSource = options?.products?.find(
//           //     (p: any) => Number(p.value) === Number(item.productId),
//           //   );
//           // }

//           // partNo = itemDataSource?.partNo || itemDataSource?.label || "-";

//           const isService =
//             String(item.itemType || "").toLowerCase() === "service";

//           if (isService) {
//             partNo =
//               item.servicePartNo || item.description?.split(" - ")[0] || "-";
//           } else if (item.itemType === "Accessory") {
//             itemDataSource = options?.accessories?.find(
//               (a: any) => Number(a.value) === Number(item.accessoryId),
//             );
//             partNo = itemDataSource?.partNo || itemDataSource?.label || "-";
//           } else {
//             itemDataSource = options?.products?.find(
//               (p: any) => Number(p.value) === Number(item.productId),
//             );
//             partNo = itemDataSource?.partNo || itemDataSource?.label || "-";
//           }

//           if (itemDataSource?.image || itemDataSource?.imageUrl) {
//             const imgPath = itemDataSource.image || itemDataSource.imageUrl;
//             imageElement = await loadImage(`${FILE_BASE_URL}${imgPath}`);
//           }

//           return {
//             ...item,
//             partNo,
//             accessories: item.accessoryIds
//               ?.map((id: number) => {
//                 const acc = options?.accessories?.find(
//                   (a: any) => Number(a.value) === Number(id),
//                 );
//                 return acc?.label;
//               })
//               .filter(Boolean),
//             imageElement,
//           };
//         }),
//       ),
//     };

//     const selectedCompany = options?.companies?.find(
//       (c: any) => Number(c.value) === Number(data.companyId),
//     );

//     const selectedState = options?.states?.find(
//       (s: any) => Number(s.value) === Number(data.placeOfSupplyId),
//     );

//     const billingState = (selectedCompany?.stateName || "")
//       .toLowerCase()
//       .trim();
//     const supplyState = (selectedState?.label || "").toLowerCase().trim();
//     const isIntraState =
//       billingState && supplyState && billingState === supplyState;

//     const doc = new jsPDF("p", "mm", "a4");
//     const pageWidth = doc.internal.pageSize.width;
//     const pageHeight = doc.internal.pageSize.height;
//     const primary: [number, number, number] = [21, 64, 104];

//     const checkPageBreak = (y: number, height: number) => {
//       if (y + height > pageHeight - 10) {
//         doc.addPage();
//         return 20;
//       }
//       return y;
//     };

//     const currencyName = data.currencyName || "";
//     const apiSymbol = data.currencySymbol;

//     let displaySymbol = "Rs.";
//     if (apiSymbol) {
//       const symbolStr = String(apiSymbol).trim();
//       displaySymbol =
//         symbolStr.toUpperCase() === "INR" ||
//         symbolStr === "₹" ||
//         symbolStr.includes("₹")
//           ? "Rs."
//           : symbolStr;
//     }

//     const isINR =
//       displaySymbol === "Rs." ||
//       currencyName.toUpperCase() === "INR" ||
//       displaySymbol === "₹";

//     const isGBP =
//       displaySymbol === "GBP" ||
//       displaySymbol === "£" ||
//       currencyName.toUpperCase() === "GBP";

//     const formatCurrency = (val: number) => {
//       const formattedValue = new Intl.NumberFormat("en-IN", {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2,
//       }).format(Number(val || 0));

//       return `${displaySymbol} ${formattedValue}`;
//     };

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

//     let y = headerHeight + 2;

//     doc.setFontSize(14);
//     doc.setTextColor(...primary);
//     doc.setFont("times", "bold");
//     doc.text("OFFER", pageWidth / 2, y, { align: "center" });
//     y += 8;

//     const rowGap = 5;
//     const leftX = 16;
//     const leftY = y + 2;
//     const leftWidth = 92;

//     doc.setFontSize(10);

//     let leftLineY = leftY;

//     doc.setFont("times", "bold");
//     doc.text(cleanText(data.responsiblePersonName || "-"), leftX, leftLineY);

//     doc.setFont("times", "normal");
//     leftLineY += rowGap;
//     doc.text(cleanText(data.customerName || "-"), leftX, leftLineY);

//     leftLineY += rowGap;
//     const customerAddressLines = doc.splitTextToSize(
//       cleanText(data.customerAddress || "-"),
//       leftWidth,
//     );

//     doc.text(customerAddressLines, leftX, leftLineY);
//     leftLineY += customerAddressLines.length * rowGap;

//       doc.text("Vendor Code: ", leftX, leftLineY);

//       const vendorCodeLabelWidth =
//         (doc.getStringUnitWidth("Vendor Code: ") * doc.getFontSize()) /
//         doc.internal.scaleFactor;

//       doc.text(
//         cleanText(data.vendorCode || "-"),
//         leftX + vendorCodeLabelWidth,
//         leftLineY,
//       );
    

//     const rightX = 133;

//     const drawLabelValue = (
//       label: string,
//       value: string,
//       yPos: number,
//       valueFont: "normal" | "bold" = "normal",
//     ) => {
//       doc.setFont("times", "normal");
//       doc.text(label, rightX, yPos);

//       const labelWidth =
//         (doc.getStringUnitWidth(label) * doc.getFontSize()) /
//         doc.internal.scaleFactor;

//       doc.setFont("times", valueFont);
//       doc.text(cleanText(value || "-"), rightX + labelWidth + 1, yPos);
//     };

//     drawLabelValue("Offer No:", data.offerNo || "-", leftY, "bold");
//     drawLabelValue(
//       "Offer Date:",
//       data.offerDate
//         ? new Date(data.offerDate)
//             .toLocaleDateString("en-GB")
//             .replace(/\//g, "-")
//         : "-",
//       leftY + rowGap,
//     );
//     drawLabelValue("Reference:", data.reference || "-", leftY + rowGap * 2);
//     drawLabelValue("Contact No:", data.contactNo || "-", leftY + rowGap * 3);

//     const tableStartY =
//       Math.max(leftLineY + rowGap , leftY , rowGap * 3) + 8;

//     const toRoman = (num: number): string => {
//       const romanMap: [number, string][] = [
//         [1000, "M"],
//         [900, "CM"],
//         [500, "D"],
//         [400, "CD"],
//         [100, "C"],
//         [90, "XC"],
//         [50, "L"],
//         [40, "XL"],
//         [10, "X"],
//         [9, "IX"],
//         [5, "V"],
//         [4, "IV"],
//         [1, "I"],
//       ];

//       let result = "";
//       for (const [value, symbol] of romanMap) {
//         while (num >= value) {
//           result += symbol;
//           num -= value;
//         }
//       }

//       return `(${result})`;
//     };

//     const showDiscountColumn = data.items.some(
//       (item: any) => Number(item.discount || 0) > 0,
//     );

//     const tableHead = showDiscountColumn
//       ? ["Sr No", "Description", "Rate", "Qty", "Dis (%)", "Total", "Image"]
//       : ["Sr No", "Description", "Rate", "Qty", "Total", "Image"];

//     const tableBody: any[] = [];
//     const bodyRowMeta: {
//       type: "item" | "accessory" | "summary";
//       item?: any;
//     }[] = [];

//     data.items.forEach((item: any, i: number) => {
//       const typeIdentifier = (item.itemType || "PRODUCT").toUpperCase();

//       const masterDescription =
//         item.itemType === "Accessory"
//           ? item.accessoriesDescription
//           : item.productDescription;

//       let descString = `${typeIdentifier}\nPART NO: ${
//         item.partNo || "-"
//       }\nHSN/SAC: ${item.hsnSacCode || "-"}`;

//       if (item.description) descString += `\n\n${item.description}`;
//       if (masterDescription) descString += `\n\n${masterDescription}`;

//       const itemRow: any[] = [
//         i + 1,
//         cleanText(descString),
//         new Intl.NumberFormat("en-IN", {
//           minimumFractionDigits: 2,
//           maximumFractionDigits: 2,
//         }).format(Number(item.rate || 0)),
//         item.quantity,
//       ];

//       if (showDiscountColumn) {
//         itemRow.push(`${Number(item.discount || 0)}%`);
//       }

//       itemRow.push(
//         new Intl.NumberFormat("en-IN", {
//           minimumFractionDigits: 2,
//           maximumFractionDigits: 2,
//         }).format(Number(item.total || 0)),
//         "",
//       );

//       tableBody.push(itemRow);
//       bodyRowMeta.push({ type: "item", item });

//       if (item.accessories?.length) {
//         item.accessories.forEach((acc: string, idx: number) => {
//           tableBody.push([
//             {
//               content: `${toRoman(idx + 1)} ${cleanText(acc)}`,
//               colSpan: showDiscountColumn ? 7 : 6,
//               styles: {
//                 fontSize: 6.5,
//                 textColor: [0, 0, 0],
//                 halign: "left",
//                 valign: "middle",
//                 cellPadding: { top: 2, right: 3, bottom: 2, left: 4 },
//               },
//             },
//           ]);

//           bodyRowMeta.push({ type: "accessory", item });
//         });
//       }
//     });

//     const totalCGST = data.items.reduce(
//       (sum: number, item: any) => sum + Number(item.cgstAmount || 0),
//       0,
//     );
//     const totalSGST = data.items.reduce(
//       (sum: number, item: any) => sum + Number(item.sgstAmount || 0),
//       0,
//     );
//     const totalIGST = data.items.reduce(
//       (sum: number, item: any) => sum + Number(item.igstAmount || 0),
//       0,
//     );

//     const labelColSpan = showDiscountColumn ? 5 : 4;

//     tableBody.push([
//       {
//         content: "Subtotal Price",
//         colSpan: labelColSpan,
//         styles: { halign: "right", fontStyle: "bold", textColor: primary },
//       },
//       {
//         content: formatCurrency(data.subtotal),
//         colSpan: 2,
//         styles: { halign: "right", textColor: primary, fontStyle: "bold" },
//       },
//     ]);

//     if (isINR) {
//       if (isIntraState) {
//         tableBody.push(
//           [
//             {
//               content: "CGST (9%)",
//               colSpan: labelColSpan,
//               styles: {
//                 halign: "right",
//                 fontStyle: "bold",
//                 textColor: primary,
//               },
//             },
//             {
//               content: formatCurrency(totalCGST),
//               colSpan: 2,
//               styles: {
//                 halign: "right",
//                 textColor: primary,
//                 fontStyle: "bold",
//               },
//             },
//           ],
//           [
//             {
//               content: "SGST (9%)",
//               colSpan: labelColSpan,
//               styles: {
//                 halign: "right",
//                 fontStyle: "bold",
//                 textColor: primary,
//               },
//             },
//             {
//               content: formatCurrency(totalSGST),
//               colSpan: 2,
//               styles: {
//                 halign: "right",
//                 textColor: primary,
//                 fontStyle: "bold",
//               },
//             },
//           ],
//         );
//       } else if (totalIGST > 0) {
//         tableBody.push([
//           {
//             content: "IGST (18%)",
//             colSpan: labelColSpan,
//             styles: { halign: "right", fontStyle: "bold", textColor: primary },
//           },
//           {
//             content: formatCurrency(totalIGST),
//             colSpan: 2,
//             styles: { halign: "right", textColor: primary, fontStyle: "bold" },
//           },
//         ]);
//       }
//     }

//     const freightCharges = Number(data.freightCharges || 0);
//     if (!isINR || freightCharges > 0) {
//       tableBody.push([
//         {
//           content: "Freight, Carriage, Insurance",
//           colSpan: labelColSpan,
//           styles: { halign: "right", fontStyle: "bold", textColor: primary },
//         },
//         {
//           content: formatCurrency(freightCharges),
//           colSpan: 2,
//           styles: { halign: "right", textColor: primary, fontStyle: "bold" },
//         },
//       ]);
//     }

//     tableBody.push([
//       {
//         content: "Final Price",
//         colSpan: labelColSpan,
//         styles: {
//           fillColor: primary,
//           textColor: 255,
//           fontStyle: "bold",
//           halign: "right",
//           fontSize: 10,
//         },
//       },
//       {
//         content: formatCurrency(data.grandTotal),
//         colSpan: 2,
//         styles: {
//           fillColor: primary,
//           textColor: 255,
//           fontStyle: "bold",
//           halign: "right",
//           fontSize: 10,
//         },
//       },
//     ]);

//     const imageColumnIndex = showDiscountColumn ? 6 : 5;

//     autoTable(doc, {
//       startY: tableStartY,
//       head: [tableHead],
//       body: tableBody,
//       theme: "grid",
//       styles: {
//         fontSize: 8,
//         lineWidth: 0.3,
//         lineColor: primary,
//         valign: "middle",
//       },
//       headStyles: {
//         fillColor: primary,
//         textColor: 255,
//         halign: "left",
//         fontStyle: "bold",
//         fontSize: 9,
//       },
//       columnStyles: showDiscountColumn
//         ? {
//             2: { halign: "right", textColor: primary, fontStyle: "bold" },
//             3: { halign: "center", textColor: primary, fontStyle: "bold" },
//             4: { halign: "center", textColor: primary, fontStyle: "bold" },
//             5: { halign: "right", textColor: primary, fontStyle: "bold" },
//             [imageColumnIndex]: { cellWidth: 18 },
//           }
//         : {
//             2: { halign: "right", textColor: primary, fontStyle: "bold" },
//             3: { halign: "center", textColor: primary, fontStyle: "bold" },
//             4: { halign: "right", textColor: primary, fontStyle: "bold" },
//             [imageColumnIndex]: { cellWidth: 18 },
//           },
//       rowPageBreak: "avoid",
//       showHead: "firstPage",
//       didDrawCell: (d) => {
//         if (d.section !== "body") return;

//         const meta = bodyRowMeta[d.row.index];
//         if (!meta || meta.type !== "item" || !meta.item) return;

//         const item = meta.item;

//         if (d.column.index === 1) {
//           doc.setFillColor(255, 255, 255);
//           doc.rect(d.cell.x, d.cell.y, d.cell.width, d.cell.height, "F");

//           const pad = 2;
//           const x = d.cell.x + pad;
//           const lh = 3.5;
//           let yText = d.cell.y + pad + 1.5;
//           const uw = d.cell.width - 2 * pad;

//           doc.setFont("times", "bold");
//           doc.setTextColor(0, 0, 0);
//           doc.text(
//             cleanText((item.itemType || "PRODUCT").toUpperCase()),
//             x,
//             yText,
//           );
//           yText += lh;

//           doc.setFont("times", "normal");
//           doc.text(cleanText(`PART NO: ${item.partNo || "-"}`), x, yText);
//           yText += lh;

//           // doc.text(cleanText(`HSN/SAC: ${item.hsnSacCode || "-"}`), x, yText);
//           // yText += lh * 1.5;
//           const isService =
//             String(item.itemType || "").toLowerCase() === "service";

//           if (!isService) {
//             doc.text(cleanText(`HSN/SAC: ${item.hsnSacCode || "-"}`), x, yText);
//             yText += lh * 1.5;
//           } else {
//             yText += lh * 0.8;
//           }

//           const masterDescription =
//             item.itemType === "Accessory"
//               ? item.accessoriesDescription
//               : item.productDescription;

//           doc.setTextColor(20, 85, 145);

//           if (item.description) {
//             const dLines = doc.splitTextToSize(cleanText(item.description), uw);
//             doc.text(dLines, x, yText);
//             yText += dLines.length * lh;
//           }

//           if (masterDescription) {
//             yText += lh * 0.5;
//             const masterLines = doc.splitTextToSize(
//               cleanText(masterDescription),
//               uw,
//             );
//             doc.text(masterLines, x, yText);
//           }

//           doc.setDrawColor(...primary);
//           doc.setLineWidth(0.3);
//           doc.rect(d.cell.x, d.cell.y, d.cell.width, d.cell.height);
//           doc.setTextColor(0, 0, 0);
//         }

//         if (d.column.index === imageColumnIndex && item?.imageElement) {
//           const pad = 2;
//           const maxW = d.cell.width - 2 * pad;
//           const maxH = d.cell.height - 2 * pad;
//           const ar = item.imageElement.width / item.imageElement.height;

//           let nW = maxW;
//           let nH = nW / ar;

//           if (nH > maxH) {
//             nH = maxH;
//             nW = nH * ar;
//           }

//           const imgX = d.cell.x + (d.cell.width - nW) / 2;
//           const imgY = d.cell.y + (d.cell.height - nH) / 2;
//           doc.addImage(item.imageElement, "JPEG", imgX, imgY, nW, nH);
//         }
//       },
//     });

//     let yPos = (doc as any).lastAutoTable.finalY + 12;

//     const terms = doc.splitTextToSize(
//       data.termsConditions || "",
//       pageWidth - 30,
//     );
//     const termsHeight = terms.length * 4 + 12;
//     yPos = checkPageBreak(yPos, termsHeight + 10);

//     doc.setFont("times", "bold");
//     doc.setFillColor(...primary);
//     doc.rect(14, yPos, pageWidth - 28, 8, "F");
//     doc.setTextColor(255);
//     doc.text("Terms & Conditions", pageWidth / 2, yPos + 5, {
//       align: "center",
//     });

//     doc.setTextColor(0);
//     doc.setFont("times", "normal");
//     doc.rect(14, yPos + 8, pageWidth - 28, termsHeight);
//     doc.text(terms, 16, yPos + 14);
//     yPos += termsHeight + 15;

//     yPos = checkPageBreak(yPos, 45);
//     doc.setFont("times", "bold");
//     doc.setTextColor(0);
//     doc.text("* ORDER DETAILS", 14, yPos);
//     yPos += 3;

//     doc.setFillColor(...primary);
//     doc.rect(14, yPos, pageWidth - 28, 8, "F");
//     doc.setTextColor(255);
//     doc.text("Name On Purchase Order", pageWidth / 2, yPos + 5, {
//       align: "center",
//     });

//     const orderBoxHeight = 32;
//     doc.rect(14, yPos + 8, pageWidth - 28, orderBoxHeight);

//     let orderLineY = yPos + 14;
//     const paddingLeft = 18;

//     doc.setFont("times", "normal");
//     doc.setTextColor(0);
//     doc.text(
//       "Purchase order should be placed in the name of",
//       paddingLeft,
//       orderLineY,
//     );
//     orderLineY += 6;

//     const entityName = isGBP ? data.vendorName || "-" : data.companyName || "-";
//     const entityGST = data.companyGST || "-";
//     const entityPAN = data.companyPAN || "-";
//     const entityAddress = isGBP
//       ? data.vendorAddress || "-"
//       : data.companyFullAddress || "-";
//     const contactPerson = data.vendorContactPerson || "-";

//     doc.setFont("times", "bold");
//     doc.setTextColor(...primary);
//     doc.text(cleanText(entityName).toUpperCase(), paddingLeft, orderLineY);
//     orderLineY += 6;

//     if (isGBP) {
//       doc.text(cleanText(contactPerson), paddingLeft, orderLineY);
//       orderLineY += 6;
//     } else {
//       doc.setTextColor(0);
//       doc.text("GST NO: ", paddingLeft, orderLineY);
//       const gstLabelWidth = doc.getTextWidth("GST NO: ");

//       doc.setTextColor(...primary);
//       doc.text(entityGST, paddingLeft + gstLabelWidth, orderLineY);

//       const gstValWidth = doc.getTextWidth(entityGST);
//       doc.setTextColor(0);
//       doc.text(
//         " / PAN No: ",
//         paddingLeft + gstLabelWidth + gstValWidth,
//         orderLineY,
//       );

//       const panLabelWidth = doc.getTextWidth(" / PAN No: ");
//       doc.setTextColor(...primary);
//       doc.text(
//         entityPAN,
//         paddingLeft + gstLabelWidth + gstValWidth + panLabelWidth,
//         orderLineY,
//       );
//       orderLineY += 6;
//     }

//     doc.setFont("times", "normal");
//     doc.setTextColor(0);
//     const addressLines = doc.splitTextToSize(
//       cleanText(entityAddress),
//       pageWidth - 40,
//     );
//     doc.text(addressLines, paddingLeft, orderLineY);
//     yPos += orderBoxHeight + 15;

//     const b = data.bankDetails || {};

//     const bankItems = isGBP
//       ? [
//           {
//             label: "ACCOUNT HOLDER NAME : ",
//             value: b.accountHolderName || "-",
//           },
//           { label: "BANK NAME : ", value: b.bankName || "-" },
//           { label: "BANK ADDRESS : ", value: b.bankAddress || "-" },
//           { label: "ACCOUNT NO. : ", value: b.accountNo || "-" },
//           { label: "SWIFT CODE : ", value: b.swiftCode || "-" },
//           { label: "IBAN NUMBER : ", value: b.ibanNo || "-" },
//           { label: "VAT NO : ", value: data.vendorVatNo || "-" },
//         ]
//       : [
//           {
//             label: "ACCOUNT HOLDER NAME : ",
//             value: b.accountHolderName || "-",
//           },
//           { label: "BANK NAME : ", value: b.bankName || "-" },
//           { label: "BANK ADDRESS : ", value: b.bankAddress || "-" },
//           { label: "ACCOUNT NO. : ", value: b.accountNo || "-" },
//           { label: "IFSC CODE : ", value: b.ifscCode || "-" },
//         ];

//     const bankBoxHeight = bankItems.length * 5 + 10;
//     yPos = checkPageBreak(yPos, bankBoxHeight + 20);

//     doc.setFont("times", "bold");
//     doc.setTextColor(0);
//     doc.text("* BANK INFO", 14, yPos);
//     yPos += 3;

//     doc.setFillColor(...primary);
//     doc.rect(14, yPos, pageWidth - 28, 8, "F");
//     doc.setTextColor(255);
//     doc.text("Payment Transfer Details", pageWidth / 2, yPos + 5, {
//       align: "center",
//     });

//     doc.rect(14, yPos + 8, pageWidth - 28, bankBoxHeight);

//     let bankLineY = yPos + 14;

//     bankItems.forEach((item, index) => {
//       doc.setFont("times", "bold");
//       doc.setTextColor(0);
//       doc.text(item.label, 18, bankLineY);

//       const labelW = doc.getTextWidth(item.label);

//       if (index === 0) {
//         doc.setFont("times", "bold");
//         doc.setTextColor(...primary);
//       } else {
//         doc.setFont("times", "normal");
//         doc.setTextColor(0);
//       }

//       doc.text(String(item.value), 18 + labelW, bankLineY);
//       bankLineY += 5;
//     });

//     yPos += bankBoxHeight + 15;

//     yPos = checkPageBreak(yPos, 50);

//     doc.setFont("times", "normal");
//     doc.setFontSize(10);
//     doc.setTextColor(0);
//     doc.text("* Validity : 30 Days from the date of Offer", 14, yPos);

//     const sigAreaY = yPos;
//     const sigAreaX = pageWidth - 75;

//     doc.setFont("times", "bold");
//     doc.text("Authorised Signatory", sigAreaX + 10, sigAreaY);

//     const stampImage = await loadImage(stampSignImg);
//     if (stampImage) {
//       doc.addImage(stampImage, "PNG", sigAreaX, sigAreaY + 2, 50, 25);
//     }

//     yPos += 8;

//     doc.setFont("times", "normal");
//     doc.text("* Note :", 14, yPos);

//     const noteX = 28;
//     const notesStr = data.customerNotes || "";

//     if (notesStr) {
//       const noteLines = doc.splitTextToSize(notesStr, sigAreaX - noteX - 5);
//       doc.text(noteLines, noteX, yPos);
//     }

//     doc.save(`${data.offerNo || "Offer"}_Version_Offer.pdf`);
//   } catch (err) {
//     console.error("VERSION PDF ERROR:", err);
//   }
// };


import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import letterheadImg from "../../../../../assets/NewLetterhead.jpeg";
import stampSignImg from "../../../../../assets/STAMPSIGN.png";

const FILE_BASE_URL = API_ENDPOINTS.BaseUrl.replace("/api", "");

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
  //  quality: number = 0.45,
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

    // Convert heavy image into compressed JPEG
    return canvas.toDataURL("image/png");
  } catch (err) {
    console.log("Compression Error:", err);
    return null;
  }
};

const cleanText = (text: any) => {
  if (!text) return "";
  return String(text).replace(/[^\x00-\x7F]/g, "");
};

const pick = (obj: any, camel: string, pascal: string, fallback: any = "") => {
  return obj?.[camel] ?? obj?.[pascal] ?? fallback;
};

const normalizeVersionOffer = (raw: any) => {
  const bank = pick(raw, "bankDetails", "BankDetails", {});

  return {
    ...raw,

    offerId: pick(raw, "offerId", "OfferId", 0),
    enquiryId: pick(raw, "enquiryId", "EnquiryId", null),
    serviceId: pick(raw, "serviceId", "ServiceId", null),

    offerNo: pick(raw, "offerNo", "OfferNo", "-"),
    enquiryNo: pick(raw, "enquiryNo", "EnquiryNo", "-"),
    offerDate: pick(raw, "offerDate", "OfferDate", null),
    expiryDate: pick(raw, "expiryDate", "ExpiryDate", null),
    savedAt: pick(raw, "savedAt", "SavedAt", null),

    customerId: pick(raw, "customerId", "CustomerId", 0),
    customerName: pick(raw, "customerName", "CustomerName", "-"),
    customerAddress: pick(raw, "customerAddress", "CustomerAddress", "-"),

    responsiblePersonName: pick(
      raw,
      "responsiblePersonName",
      "ResponsiblePersonName",
      "-",
    ),
    assignedEmployeeName: pick(
      raw,
      "assignedEmployeeName",
      "AssignedEmployeeName",
      "-",
    ),
    assignedEmployeeMobile: pick(
      raw,
      "assignedEmployeeMobile",
      "AssignedEmployeeMobile",
      "-",
    ),

    companyId: pick(raw, "companyId", "CompanyId", 0),
    companyName: pick(raw, "companyName", "CompanyName", "-"),
    companyGST: pick(raw, "companyGST", "CompanyGST", "-"),
    companyPAN: pick(raw, "companyPAN", "CompanyPAN", "-"),
    companyFullAddress: pick(
      raw,
      "companyFullAddress",
      "CompanyFullAddress",
      "-",
    ),

    vendorId: pick(raw, "vendorId", "VendorId", 0),
    vendorCode: pick(raw, "vendorCode", "VendorCode", "-"),
    vendorName: pick(raw, "vendorName", "VendorName", "-"),
    vendorVatNo: pick(raw, "vendorVatNo", "VendorVatNo", "-"),
    vendorContactPerson: pick(
      raw,
      "vendorContactPerson",
      "VendorContactPerson",
      "-",
    ),
    vendorAddress: pick(raw, "vendorAddress", "VendorAddress", "-"),

    currencyId: pick(raw, "currencyId", "CurrencyId", 0),
    currencyName: pick(raw, "currencyName", "CurrencyName", "INR"),
    currencySymbol: pick(raw, "currencySymbol", "CurrencySymbol", "Rs."),
    placeOfSupplyId: pick(raw, "placeOfSupplyId", "PlaceOfSupplyId", 0),

    subtotal: Number(pick(raw, "subtotal", "Subtotal", 0)),
    freightCharges: Number(pick(raw, "freightCharges", "FreightCharges", 0)),
    grandTotal: Number(pick(raw, "grandTotal", "GrandTotal", 0)),

    termsConditions: pick(raw, "termsConditions", "TermsConditions", ""),
    customerNotes: pick(raw, "customerNotes", "CustomerNotes", ""),
    status: pick(raw, "status", "Status", "DRAFT"),

    bankDetails: {
      bankName: pick(bank, "bankName", "BankName", "-"),
      bankAddress: pick(bank, "bankAddress", "BankAddress", "-"),
      accountNo: pick(bank, "accountNo", "AccountNo", "-"),
      ifscCode: pick(bank, "ifscCode", "IFSCCode", "-"),
      accountHolderName: pick(
        bank,
        "accountHolderName",
        "AccountHolderName",
        "-",
      ),
      swiftCode: pick(bank, "swiftCode", "SwiftCode", "-"),
      ibanNo: pick(bank, "ibanNo", "IBANNo", "-"),
    },

    items: (pick(raw, "items", "Items", []) || []).map((x: any) => ({
      itemType: pick(x, "itemType", "ItemType", "Product"),
      accessoryId: Number(pick(x, "accessoryId", "AccessoryId", 0)),
      productId: Number(pick(x, "productId", "ProductId", 0)),
      serviceId: Number(pick(x, "serviceId", "ServiceId", 0)),
      servicePartNo: pick(x, "servicePartNo", "ServicePartNo", ""),
      description: pick(x, "description", "Description", ""),
      productDescription: pick(
        x,
        "productDescription",
        "ProductDescription",
        "",
      ),
      accessoriesDescription: pick(
        x,
        "accessoriesDescription",
        "AccessoriesDescription",
        "",
      ),
      hsnSacCode: pick(x, "hsnSacCode", "HsnSacCode", ""),
      quantity: Number(pick(x, "quantity", "Quantity", 0)),
      rate: Number(pick(x, "rate", "Rate", 0)),
      discount: Number(pick(x, "discount", "Discount", 0)),
      taxPercentage: Number(pick(x, "taxPercentage", "TaxPercentage", 0)),
      total: Number(pick(x, "total", "Total", 0)),
      gstAmount: Number(pick(x, "gstAmount", "GstAmount", 0)),
      cgstAmount: Number(pick(x, "cgstAmount", "CgstAmount", 0)),
      sgstAmount: Number(pick(x, "sgstAmount", "SgstAmount", 0)),
      igstAmount: Number(pick(x, "igstAmount", "IgstAmount", 0)),
      finalPrice: Number(pick(x, "finalPrice", "FinalPrice", 0)),
      accessoryIds: pick(x, "accessoryIds", "AccessoryIds", []),
    })),
  };
};

export const printOfferVersionPDF = async (versionData: any, options: any) => {
  try {
    const raw = normalizeVersionOffer(versionData);

    const data = {
      ...raw,
      customerName:
        raw.customerName ||
        options?.customers?.find(
          (c: any) => Number(c.value) === Number(raw.customerId),
        )?.label ||
        "-",
      responsiblePersonName: raw.responsiblePersonName || "-",
      reference: raw.assignedEmployeeName || "-",
      contactNo: raw.assignedEmployeeMobile || "-",
      items: await Promise.all(
        (raw.items || []).map(async (item: any) => {
          let imageElement: HTMLImageElement | null = null;
          let partNo = "";
          let itemDataSource: any = null;

          // if (item.itemType === "Accessory") {
          //   itemDataSource = options?.accessories?.find(
          //     (a: any) => Number(a.value) === Number(item.accessoryId),
          //   );
          // } else {
          //   itemDataSource = options?.products?.find(
          //     (p: any) => Number(p.value) === Number(item.productId),
          //   );
          // }

          // partNo = itemDataSource?.partNo || itemDataSource?.label || "-";

          const isService =
            String(item.itemType || "").toLowerCase() === "service";

          if (isService) {
            partNo =
              item.servicePartNo || item.description?.split(" - ")[0] || "-";
          } else if (item.itemType === "Accessory") {
            itemDataSource = options?.accessories?.find(
              (a: any) => Number(a.value) === Number(item.accessoryId),
            );
            partNo = itemDataSource?.partNo || itemDataSource?.label || "-";
          } else {
            itemDataSource = options?.products?.find(
              (p: any) => Number(p.value) === Number(item.productId),
            );
            partNo = itemDataSource?.partNo || itemDataSource?.label || "-";
          }

          // if (itemDataSource?.image || itemDataSource?.imageUrl) {
          //   const imgPath = itemDataSource.image || itemDataSource.imageUrl;
          //   imageElement = await loadImage(`${FILE_BASE_URL}${imgPath}`);
          // }

          let compressedImage: string | null = null;

          if (itemDataSource?.image || itemDataSource?.imageUrl) {
            const imgPath = itemDataSource.image || itemDataSource.imageUrl;

            imageElement = await loadImage(`${FILE_BASE_URL}${imgPath}`);

            if (imageElement) {
              compressedImage = await compressImage(
                imageElement,
                // 0.45,
                500,
              );
            }
          }

        return {
            ...item,
            partNo,
            accessories: item.accessoryIds
              ?.map((id: number) => {
                const acc = options?.accessories?.find(
                  (a: any) => Number(a.value) === Number(id),
                );
                return acc?.label;
              })
              .filter(Boolean),
            imageElement,
            compressedImage,
          };
        }),
      ),
    };

    const selectedCompany = options?.companies?.find(
      (c: any) => Number(c.value) === Number(data.companyId),
    );

    const selectedState = options?.states?.find(
      (s: any) => Number(s.value) === Number(data.placeOfSupplyId),
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

    const currencyName = data.currencyName || "";
    const apiSymbol = data.currencySymbol;

    let displaySymbol = "Rs.";
    if (apiSymbol) {
      const symbolStr = String(apiSymbol).trim();
      displaySymbol =
        symbolStr.toUpperCase() === "INR" ||
        symbolStr === "₹" ||
        symbolStr.includes("₹")
          ? "Rs."
          : symbolStr;
    }

    const isINR =
      displaySymbol === "Rs." ||
      currencyName.toUpperCase() === "INR" ||
      displaySymbol === "₹";

    const isGBP =
      displaySymbol === "GBP" ||
      displaySymbol === "£" ||
      currencyName.toUpperCase() === "GBP";

    const formatCurrency = (val: number) => {
      const formattedValue = new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number(val || 0));

      return `${displaySymbol} ${formattedValue}`;
    };

    const letterheadImage = await loadImage(letterheadImg);
    const compressedLetterhead = letterheadImage
    ? await compressImage(letterheadImage, 1200)
    : null;
    let headerHeight = 35;

    if (letterheadImage) {
      const horizontalMargin = 14;
      const topMargin = 10;
      const imageWidth = pageWidth - 2 * horizontalMargin;
      const aspectRatio = letterheadImage.width / letterheadImage.height;
      const imageHeight = imageWidth / aspectRatio;

      headerHeight = imageHeight + topMargin;
      doc.addImage(
        compressedLetterhead || letterheadImage,
        "PNG",
        horizontalMargin,
        topMargin,
        imageWidth,
        imageHeight,
      );
    }

    let y = headerHeight + 2;

    doc.setFontSize(14);
    doc.setTextColor(...primary);
    doc.setFont("times", "bold");
    doc.text("OFFER", pageWidth / 2, y, { align: "center" });
    y += 8;

    const rowGap = 5;
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
    leftLineY += customerAddressLines.length * rowGap;

      doc.text("Vendor Code: ", leftX, leftLineY);

      const vendorCodeLabelWidth =
        (doc.getStringUnitWidth("Vendor Code: ") * doc.getFontSize()) /
        doc.internal.scaleFactor;

      doc.text(
        cleanText(data.vendorCode || "-"),
        leftX + vendorCodeLabelWidth,
        leftLineY,
      );
    

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
    drawLabelValue(
      "Offer Date:",
      data.savedAt
        ? new Date(data.savedAt)
            .toLocaleDateString("en-GB")
            .replace(/\//g, "-")
        : data.offerDate
      ? new Date(data.offerDate)
          .toLocaleDateString("en-GB")
          .replace(/\//g, "-")
      : "-",
      leftY + rowGap,
    );
    drawLabelValue("Reference:", data.reference || "-", leftY + rowGap * 2);
    drawLabelValue("Contact No:", data.contactNo || "-", leftY + rowGap * 3);

    const tableStartY =
      Math.max(leftLineY + rowGap , leftY , rowGap * 3) + 8;

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

      let descString = `${typeIdentifier}\nPART NO: ${
        item.partNo || "-"
      }\nHSN/SAC: ${item.hsnSacCode || "-"}`;

      if (item.description) descString += `\n\n${item.description}`;
      if (masterDescription) descString += `\n\n${masterDescription}`;

      const itemRow: any[] = [
        i + 1,
        cleanText(descString),
        new Intl.NumberFormat("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(Number(item.rate || 0)),
        item.quantity,
      ];

      if (showDiscountColumn) {
        itemRow.push(`${Number(item.discount || 0)}%`);
      }

      itemRow.push(
        new Intl.NumberFormat("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(Number(item.total || 0)),
        "",
      );

      tableBody.push(itemRow);
      bodyRowMeta.push({ type: "item", item });

      if (item.accessories?.length) {
        item.accessories.forEach((acc: string, idx: number) => {
          tableBody.push([
            {
              content: `${toRoman(idx + 1)} ${cleanText(acc)}`,
              colSpan: showDiscountColumn ? 7 : 6,
              styles: {
                fontSize: 6.5,
                textColor: [0, 0, 0],
                halign: "left",
                valign: "middle",
                cellPadding: { top: 2, right: 3, bottom: 2, left: 4 },
              },
            },
          ]);

          bodyRowMeta.push({ type: "accessory", item });
        });
      }
    });

    const totalCGST = data.items.reduce(
      (sum: number, item: any) => sum + Number(item.cgstAmount || 0),
      0,
    );
    const totalSGST = data.items.reduce(
      (sum: number, item: any) => sum + Number(item.sgstAmount || 0),
      0,
    );
    const totalIGST = data.items.reduce(
      (sum: number, item: any) => sum + Number(item.igstAmount || 0),
      0,
    );

    const labelColSpan = showDiscountColumn ? 5 : 4;

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
    if (!isINR || freightCharges > 0) {
      tableBody.push([
        {
          content: "Freight, Carriage, Insurance",
          colSpan: labelColSpan,
          styles: { halign: "right", fontStyle: "bold", textColor: primary },
        },
        {
          content: formatCurrency(freightCharges),
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

    const imageColumnIndex = showDiscountColumn ? 6 : 5;

    autoTable(doc, {
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
            2: { halign: "right", textColor: primary, fontStyle: "bold" },
            3: { halign: "center", textColor: primary, fontStyle: "bold" },
            4: { halign: "center", textColor: primary, fontStyle: "bold" },
            5: { halign: "right", textColor: primary, fontStyle: "bold" },
            [imageColumnIndex]: { cellWidth: 18 },
          }
        : {
            2: { halign: "right", textColor: primary, fontStyle: "bold" },
            3: { halign: "center", textColor: primary, fontStyle: "bold" },
            4: { halign: "right", textColor: primary, fontStyle: "bold" },
            [imageColumnIndex]: { cellWidth: 18 },
          },
      rowPageBreak: "avoid",
      showHead: "firstPage",
      didDrawCell: (d) => {
        if (d.section !== "body") return;

        const meta = bodyRowMeta[d.row.index];
        if (!meta || meta.type !== "item" || !meta.item) return;

        const item = meta.item;

        if (d.column.index === 1) {
          doc.setFillColor(255, 255, 255);
          doc.rect(d.cell.x, d.cell.y, d.cell.width, d.cell.height, "F");

          const pad = 2;
          const x = d.cell.x + pad;
          const lh = 3.5;
          let yText = d.cell.y + pad + 1.5;
          const uw = d.cell.width - 2 * pad;

          doc.setFont("times", "bold");
          doc.setTextColor(0, 0, 0);
          doc.text(
            cleanText((item.itemType || "PRODUCT").toUpperCase()),
            x,
            yText,
          );
          yText += lh;

          doc.setFont("times", "normal");
          doc.text(cleanText(`PART NO: ${item.partNo || "-"}`), x, yText);
          yText += lh;

          // doc.text(cleanText(`HSN/SAC: ${item.hsnSacCode || "-"}`), x, yText);
          // yText += lh * 1.5;
          const isService =
            String(item.itemType || "").toLowerCase() === "service";

          if (!isService) {
            doc.text(cleanText(`HSN/SAC: ${item.hsnSacCode || "-"}`), x, yText);
            yText += lh * 1.5;
          } else {
            yText += lh * 0.8;
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
          }

          doc.setDrawColor(...primary);
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
            "PNG",
            imgX,
            imgY,
            nW,
            nH,
          );
        }
      },
    });

    let yPos = (doc as any).lastAutoTable.finalY + 12;

    const terms = doc.splitTextToSize(
      data.termsConditions || "",
      pageWidth - 30,
    );
    const termsHeight = terms.length * 4 + 12;
    yPos = checkPageBreak(yPos, termsHeight + 10);

    doc.setFont("times", "bold");
    doc.setFillColor(...primary);
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

    yPos = checkPageBreak(yPos, 45);
    doc.setFont("times", "bold");
    doc.setTextColor(0);
    doc.text("* ORDER DETAILS", 14, yPos);
    yPos += 3;

    doc.setFillColor(...primary);
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

    const entityName = isGBP ? data.vendorName || "-" : data.companyName || "-";
    const entityGST = data.companyGST || "-";
    const entityPAN = data.companyPAN || "-";
    const entityAddress = isGBP
      ? data.vendorAddress || "-"
      : data.companyFullAddress || "-";
    const contactPerson = data.vendorContactPerson || "-";

    doc.setFont("times", "bold");
    doc.setTextColor(...primary);
    doc.text(cleanText(entityName).toUpperCase(), paddingLeft, orderLineY);
    orderLineY += 6;

    if (isGBP) {
      doc.text(cleanText(contactPerson), paddingLeft, orderLineY);
      orderLineY += 6;
    } else {
      doc.setTextColor(0);
      doc.text("GST NO: ", paddingLeft, orderLineY);
      const gstLabelWidth = doc.getTextWidth("GST NO: ");

      doc.setTextColor(...primary);
      doc.text(entityGST, paddingLeft + gstLabelWidth, orderLineY);

      const gstValWidth = doc.getTextWidth(entityGST);
      doc.setTextColor(0);
      doc.text(
        " / PAN No: ",
        paddingLeft + gstLabelWidth + gstValWidth,
        orderLineY,
      );

      const panLabelWidth = doc.getTextWidth(" / PAN No: ");
      doc.setTextColor(...primary);
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

    doc.setFillColor(...primary);
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
        doc.setTextColor(...primary);
      } else {
        doc.setFont("times", "normal");
        doc.setTextColor(0);
      }

      doc.text(String(item.value), 18 + labelW, bankLineY);
      bankLineY += 5;
    });

    yPos += bankBoxHeight + 15;

    yPos = checkPageBreak(yPos, 50);

    doc.setFont("times", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text("* Validity : 30 Days from the date of Offer", 14, yPos);

    const sigAreaY = yPos;
    const sigAreaX = pageWidth - 75;

    doc.setFont("times", "bold");
    doc.text("Authorised Signatory", sigAreaX + 10, sigAreaY);

    const stampImage = await loadImage(stampSignImg);
    const compressedStamp = stampImage
      ? await compressImage(stampImage, 400)
      : null;
    if (stampImage) {
         doc.addImage(
      compressedStamp || stampImage,
      "PNG",
      sigAreaX,
      sigAreaY + 2,
      50,
      25,
    );
    }

    yPos += 8;

    doc.setFont("times", "normal");
    doc.text("* Note :", 14, yPos);

    const noteX = 28;
    const notesStr = data.customerNotes || "";

    if (notesStr) {
      const noteLines = doc.splitTextToSize(notesStr, sigAreaX - noteX - 5);
      doc.text(noteLines, noteX, yPos);
    }

    doc.save(`${data.offerNo || "Offer"}_Version_Offer.pdf`);
  } catch (err) {
    console.error("VERSION PDF ERROR:", err);
  }
};
