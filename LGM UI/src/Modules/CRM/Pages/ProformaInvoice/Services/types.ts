export interface ProformaInvoiceItem {
    productId: number;
    itemType?: string;
    accessoryId?: number;
     productImage?: string; 
    description: string;
     hsnSacCode?: string;
    quantity: number;
    rate: number;
    discount?: number;
    taxPercentage: number; 
    total: number;
    gstTax: number;
    price: number;
    accessoryIds?: number[]; 
}

// Represents the full Proforma Invoice object for creation and editing
export interface ProformaInvoice {
    currencySymbol: any;
    customerName: any;
    proformaInvoiceId: number;
    proformaInvoiceNo: string;
    proformaInvoiceDate: string;
    proformaInvoiceExpiryDate: string;
    
    // Foreign Keys
    orderAcceptanceId: number;
    serviceReportId?: number;
    productGroupId: number;
    companyId: number;
    vendorId?: number;
    companyGroupId: number;
    customerId: number;
    responsiblePersonId: number;
    responsiblePersonName?: string; 
    currencyId: number;
    placeOfSupplyId: number;
    bankDetailId: number;

    // Customer PO Details
    customerPO: string;
    customerPODate: string | null;

    // Consignee Details
    consigneeNameAndAddress: string;

    // Additional Information
    termsAndConditions: string;
    customerNotes: string;

    // Financial Totals
    subtotal: number;
    freightOrCarrierInsurance: number;
    totalGstAmount: number;
    grandTotal: number;

    percentage?: number;
    percentageAmount?: number;
    balanceAmount?: number;
    percentageTaxAmount?: number;
    totalAmount?: number;

    items: ProformaInvoiceItem[];
}

// Represents a simplified Proforma Invoice for the main listing table
export interface ProformaInvoiceListItem {
    dummyInvoiceNo: string;
    dummyInvoiceDate: string;
    Date: string;
    proformaInvoiceId: number;
    proformaInvoiceNo: string;
    proformaInvoiceDate: string;
    grandTotal: number;
    totalAmount?: number;
    customerName: string;
    offerNo: string;
}

export interface ProformaInvoiceListItem {
    proformaInvoiceId: number;
    proformaInvoiceNo: string;
    customerName: string;
    currencyCode: string;
    currencySymbol: string;
    grandTotal: number;
    createdDate: string; // DateTime comes as string from API
    date: string;
    expiryDate: string;
    status: 'Active' | 'Expired';
    dummyInvoiceId?: number;
    originalProformaInvoiceId?: number;
    originalProformaInvoiceNo?: string;
}

export interface ProformaInvoicePdfData {
  companyName: string;
  companyGstin: string;
  companyPan: string;
  companyAddress: string;
  vendorCode: string;
  proformaInvoiceNo: string;
  proformaInvoiceDate: string;
  range: string;
  division: string;
  customerName: string;
  customerBillingAddress: string;
  customerGstn: string;
  customerPo: string;
  customerPoDate: string;
  customerState: string;
  customerPlaceOfSupply: string;
  consigneeDetails: string;
  sacCode: string;
  codeLabel: string;
  items: {
    srNo: number;
    productName: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }[];
  subtotal: number;
  totalCgst: number;
  totalSgst: number;
  grandTotal: number;
  grandTotalInWords: string;
  cgstInWords: string;
  sgstInWords: string;
  currencySymbol: string;
  bankName: string;
  bankAddress: string;
  accountNo: string;
  ifscCode: string;
}

export interface ProformaInvoiceFromApi {
  orderAcceptanceId: number;
  productGroupId: number;
  companyId: number;
  vendorId?: number;
  companyGroupId: number;
  customerId: number;
  responsiblePersonId: number;
  responsiblePersonName?: string;
  currencyId: number;
  currencyName?: string;
  currencySymbol: string;
  placeOfSupplyId: number;
  bankDetailId: number;

  customerPo: string; // ✅ matches API
  customerNotes: string;
  termsAndConditions: string;

  consigneeNameAndAddress: string;

  subtotal: number;
  freightOrCarrierInsurance: number;
  totalGstAmount: number;
  grandTotal: number;

  items: ProformaInvoiceItem[];
}

export interface DummyInvoiceItem {
  _id: string; // Client-side unique ID for list rendering
  productId: number | null; // Can be null for purely manual items
  description: string;
  accessoryId?: number | null;
  itemType?: string;
  productName?: string;
  accessoryName?: string;
  productImage?: string;
  accessoryIds?: number[];
  hsnSacCode: string;
  quantity: number;
  rate: number;
  discount: number;
  taxPercentage: number;
  total: number;
  gstTax: number;
  price: number;
}

export interface DummyInvoice {
  dummyInvoiceId: number;
  originalProformaInvoiceId: number;
  proformaInvoiceNo: string;
  proformaInvoiceDate: string;
  proformaInvoiceExpiryDate: string;
  orderAcceptanceId: number;
  serviceReportId?: number;
  productGroupId: number;
  companyId: number;
  vendorId: number | null;
  companyGroupId: number;
  customerId: number;
  customerName: string;
  responsiblePersonId: number | null;
  responsiblePersonName: string;
  currencyId: number;
  currencySymbol: string;
  placeOfSupplyId: number;
  bankDetailId: number;
  customerPO: string;
  customerPODate: string | null;
  consigneeNameAndAddress: string;
  subtotal: number;
  percentage?: number;
  percentageAmount?: number;
  percentageTaxAmount?: number;
  totalAmount?: number;
  balanceAmount?: number;
  freightOrCarrierInsurance: number;
  totalGstAmount: number;
  grandTotal: number;
  termsAndConditions: string;
  customerNotes: string;
  items: DummyInvoiceItem[];
}