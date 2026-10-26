export interface CurrencyPrice {
  currencyId: number;
  currencyCode?: string;
  currencyName?: string;
  price: number;
}

export interface BankResponse {
  bankDetailId: number;
  bankName: string;
  accountNo: string;
}

export interface SelectOption {
  value: number | string;
  label: string;
  currencySymbol?: string;
  currencyCode?: string;
  image?: string;
  hsnCode?: string;
  price?: number;
  currencyPrices?: CurrencyPrice[];
  mapAccessories?: string | null;
  stateName?: string;
  partNo?: string;
}

export interface EnquiryNote {
  id?: number;
  enquiryId?: number;
  note: string;
  createdAt: string;
  createdByEmployeeId: number;
  authorName: string;
}

export interface InvoiceItem {
 itemType: "Product" | "Accessory" | "Service"; 
  productId: number | null;
  accessoryId?: number | null;
  description: string;
  hsnSacCode: string;
  quantity: number;
  rate: number;
  discount: number;
  taxPercentage: number;
  total: number;
  gstAmount: number;
  finalPrice: number;
  accessoryIds: number[];
  originalPrice?: number | null;
  originalCurrency?: string | null;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
}

export interface InvoiceViewItem {
  productId: number;
  accessoryId?: number | null;
  itemType: "Product" | "Accessory" | "Service";
  description: string;
  productName: string;
  hsnSacCode: string;
  quantity: number;
  rate: number;
  discount: number;
  taxPercentage: number;
  total: number;
  gstAmount: number;
  price: number;
  finalPrice: number;
  accessoryIds: number[];
  accessoryNames: string[];
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  originalPrice?: number | null;
  originalCurrency?: string | null;
}

export interface InvoiceData {
  group: SelectOption | null;
  company: SelectOption | null;
  vendor: SelectOption | null;
  companyGroup: SelectOption | null;
  customerCompany: SelectOption | null;
  responsiblePersonName: SelectOption | null;
  currency: SelectOption | null;
  placeOfSupply: SelectOption | null;
  currencyId: number;
  invoiceId: number;
  invoiceNo: string;
  invoiceDate: string;
  invoiceDueDate: string;
  customerPo: string;
  companyPoDate: string;
  consigneeNameAddress: string;
  description: string;
  subtotal: number;
  grandTotal: number;
  advanceReceived: boolean;
  advanceAmount: number;
  balanceAmount: number;
  termsConditions: string;
  customerNotes: string;
  items: InvoiceItem[];
  bankDetail: SelectOption | null;
  freightCharges: number;
  orderAcceptanceId?: number | null;
  serviceId?: number | null;
    serviceReportId?: number | null;
}

export interface InvoiceViewData {
  serviceId: null;
  invoiceId: number;
  invoiceNo: string;
  invoiceDate: string;
  invoiceDueDate: string;
  customerPo: string;
  companyPoDate: string;
  consigneeNameAddress: string;
  description: string;
  subTotal: number;
  freightCharges: number;
  grandTotal: number;
  advanceReceived: boolean;
  advanceAmount: number;
  balanceAmount: number;
  termsConditions: string;
  customerNotes: string;
  productGroupId: number;
  productGroupName: string;
  companyId: number;
  companyName: string;
  vendorId: number;
  vendorName: string;
  customerId: number;
  customerName: string;
  companyGroupId: number;
  companyGroupName: string;
  responsiblePersonId: number;
  responsiblePersonName: string;
  currencyId: number;
  currencyName: string;
  currencySymbol: string;
  placeOfSupplyId: number;
  placeOfSupplyName: string;
  bankDetailId: number;
  bankName: string;
  accountNo: string;
  ifsc: string;
  items: InvoiceViewItem[];
}

export interface ProductResponse {
  productId: number;
  ProductDescription?: string;
  productName: string;
  productImagePath?: string;
  hsnCode?: string;
  currencyPrices?: CurrencyPrice[];
  mapAccessories?: string | null;
  productCode?: string;
  partNo?: string;
}

export interface AccessoryResponse {
  accessoriesId: number;
  accessoriesCode: string;
  accessoriesDescription?: string;
  accessoriesName: string;
  accessoriesImagePath?: string;
  salePrice?: number;
  hsnCode?: string;
  currencyPrices?: CurrencyPrice[];
  partNo?: string;
}

export interface InvoiceResponse {
  invoiceId: number;
  invoiceNo: string;
  currencyId: number;
  currencyName: string;
  grandTotal: number;
  invoiceDate: string;
  invoiceDueDate: string;
}

export interface FinalDummyInvoiceItem {
  _id: string; // Client-side unique ID
  itemType: "Product" | "Accessory" | "Service";
  accessoryId?: number | null;
  productId: number | null;
  description: string;
  hsnSacCode: string;
  quantity: number;
  rate: number;
  discount: number;
  taxPercentage: number;
  total: number;
  gstAmount: number;
  price: number;
}

export interface FinalDummyInvoice {
  originalInvoiceId: number;
  originalInvoiceNo: string;
  finalDummyInvoiceDate: string;
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
  customerPo: string;
  companyPoDate: string | null;
  consigneeNameAddress: string;
  subTotal: number;
  freightCharges: number;
  totalGstAmount: number;
  grandTotal: number;
  advanceReceived: boolean;
  advanceAmount: number;
  balanceAmount: number;
  termsConditions: string;
  customerNotes: string;
  items: FinalDummyInvoiceItem[];
}

// Type for the dummy invoice listing
export interface FinalDummyInvoiceListItem {
    finalDummyInvoiceId: number;
      originalInvoiceId: number;
    finalDummyInvoiceNo: string;
    finalDummyInvoiceDate: string;
    customerName: string;
    grandTotal: number;
    currencySymbol: string;
    originalInvoiceNo: string;
}
