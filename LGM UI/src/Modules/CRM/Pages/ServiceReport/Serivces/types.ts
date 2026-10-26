export interface ServiceReport {
  id: number;
   reportNo?: string;
  date: string; // ISO string format
  orderAcceptanceId?: number;
  customerId: number;
  customerName: string;
  productId?: number | null;
  accessoryId?: number | null;
  productName?: string;
  accessoryName?: string;
   itemType: "Product" | "Accessory" | "Service"; 
  serialNumber: string;
  inspectionSummary: string;
  softwareCheck: string;
  portTesting: string;
  firmwareCheck: string;
  physicalInspection: string;
  icReplacement: string;
  finalComments: string;
  uploadedFiles: string; // Semicolon-separated string of file paths
  customerReported: string;

  // This property is for UI handling only and won't be sent as JSON
  reportFiles?: File[];
  items: ServiceReportItem[];
}

export interface SelectOption {
  value: number;
  label: string;
  currencyId?: number;
}

export interface ServiceReportItem {
  itemType: "Product" | "Accessory" | "Service";
  serviceId?: number | null;
  servicePartNo?: string | null;
  productId?: number | null;
  accessoryId?: number | null;
  description: string;
  quantity: number;
  rate?: number;
  hsnSacCode?: string;
  total?: number;
  finalPrice?: number;
  discount?: number;
  taxPercentage?: number;
  gstTax?: number;
}
