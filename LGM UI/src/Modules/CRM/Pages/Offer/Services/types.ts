export interface EnquiryNote {
  id?: number;
  enquiryId?: number;
  note: string;
  createdAt: string;
  createdByEmployeeId: number;
  authorName: string;
}

export interface OfferItem {
  itemType: "Product" | "Accessory" | "Service";
  productId: number | null;
  accessoryId?: number | null;
  serviceId?: number | null;
  servicePartNo?: string | null;
  description: string;
  productCode: string;
  hsnSacCode: string;
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
  isGst?: boolean;
  originalPrice?: number | null;
  originalCurrency?: string | null;
}

export interface OfferVersion {
  versionNo?: number;
  versionNumber?: number;
  savedAt: string;
  savedByEmployeeId: number;
  authorName?: string;
  statusAtMoment?: "DRAFT" | "FINAL";
  snapshotDataJson?: string;
  savedByName?: string;
  snapshotJson?: string;
}

export interface Offer {
  offerId: number;
  enquiryId: number | null;
  offerNo: string;
  enquiryNo: string;
  latestRevisionDate?: string | null;
  serviceId?: number | null;
  serviceDescription?: string | null;
  offerDate: string;
  expiryDate: string;

  source: "ENQUIRY" | "VERBAL" | "SERVICE";
  status: "DRAFT" | "FINAL";

  nextFollowUpDate: string | null;

  productGroupId: number;
  companyId: number;
  vendorId?: number;
  companyGroupId: number;
  customerId: number;
  responsiblePersonName?: string;
  responsiblePersonId: number;
  assignedToEmployeeId: number;
  assignedEmployeeName?: string;
  assignedEmployeeMobile?: string;
  currencyId: number;
  currencyName?: string | null;
  currencySymbol?: string | null;

  placeOfSupplyId: number;
  bankDetailId: number;

  subtotal: number;
  freightCharges: number;
  grandTotal: number;
  gstApplicable: boolean;
  termsConditions: string;
  customerNotes: string;

  customerName?: string;
  customerAddress?: string;

  vendorName?: string;
  vendorCode?: string;
  vendorVatNo?: string;
  vendorGSTIN?: string;
  vendorPAN?: string;
  vendorContactPerson?: string;
  vendorAddress?: string;
  companyName?: string;
  companyGST?: string;
  companyPAN?: string;
  companyFullAddress?: string;

  bankDetails?: {
    bankName?: string;
    bankAddress?: string;
    accountNo?: string;
    accountHolderName?: string;
    ifscCode?: string;
    swiftCode?: string;
    ibanNo?: string;
    emailAddress?: string;
  };

  notes: EnquiryNote[];
  versionHistory: OfferVersion[];
  items: OfferItem[];
}

export interface OfferListItem {
  offerId: number;
  offerNo: string;
  offerDate: string;
  grandTotal: number;
  customerName: string;
  status: "DRAFT" | "FINAL";
  source: "ENQUIRY" | "VERBAL";
}
