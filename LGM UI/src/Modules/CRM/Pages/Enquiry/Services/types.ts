export interface EnquiryNote {
  id?: number;
  enquiryId?: number;
  note: string;
  createdAt: string;
  createdByEmployeeId: number;
  authorName: string;
}

export interface EnquiryItem {
  itemType: "Product" | "Accessory" | "Service";
  serviceId?: number | null;
  servicePartNo?: string;
  productId: number | null;
  accessoryId?: number | null;
  description: string;
  hsnSacCode: string;
  productCode: string;
  quantity: number;
  rate: number;
  liveConversionRate?: number | null;
  discount: number;
  taxPercentage: number;
  total: number;
  gstAmount: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  finalPrice: number;
  accessoryIds: number[];
  originalPrice?: number | null;
  originalCurrency?: string | null;
}

export interface Enquiry {
  enquiryId: number;
  serviceId?: number | null;
  enquiryNo?: string;
  offerDate: string;
  expiryDate: string;
  productGroupId: number;
  companyId: number;
  vendorId: number;
  companyGroupId: number;
  customerId: number;
  responsiblePersonId: number;
  responsiblePersonName?: string;
  currencyId: number;
  placeOfSupplyId: number;
  bankDetailId: number;
  nextFollowUpDate: string;
  gstApplicable: boolean;
  currencySymbol?: string | null;
  assignedToEmployeeId: number | null;
  assignedEmployeeName?: string;
  assignedEmployeeMobile?: string;
  status: "DRAFT" | "FINAL";
  entryType: string;

  notes: EnquiryNote[];

  subtotal: number;
  freightCharges: number;
  grandTotal: number;
  termsConditions: string;
  customerNotes: string;
  customerAddress?: string;
  items: EnquiryItem[];
  serviceDescription?: string;
  servicePrice?: number;
}

export interface EnquiryListItem {
  enquiryId: number;
  enquiryNo: string;
  offerDate: string;
  grandTotal: number;
  customerName?: string;
  customerAddress?: string;
  entryType?: string;
  status?: string;
  assignedToName?: string;
}
