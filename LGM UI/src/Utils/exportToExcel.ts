// src/utils/exportToExcel.ts
import * as XLSX from "xlsx";

export interface ExcelExportData {
  [key: string]: string | number | boolean | Date | null;
}

export const exportToExcel = (
  data: ExcelExportData[],
  fileName: string,
  sheetName: string
): void => {
  try {
    const workbook = XLSX.utils.book_new();

    const worksheet = XLSX.utils.json_to_sheet(data);

    const columnWidths = Object.keys(data[0] || {}).map((key) => ({
      wch: Math.max(key.length, 15),
    }));
    worksheet["!cols"] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    alert("An error occurred while exporting the data.");
  }
};
