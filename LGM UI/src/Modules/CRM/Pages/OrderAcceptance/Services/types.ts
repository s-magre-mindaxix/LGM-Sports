export interface OrderAcceptanceOffer {
  offerId: number;

  customerId?: number;
  vendorId?: number;
  companyId?: number;
  productGroupId?: number;
  companyGroupId?: number;
  currencyId?: number;
  placeOfSupplyId?: number;
  bankDetailId?: number;
  responsiblePersonId?: number;
  responsiblePersonName?: string;
  assignedToEmployeeId?: number;

  offerCreateDate?: string | null;
  offerExpiryDate?: string | null;

  orderDate?: string;
  companyCode?: string;
  vendorCode?: string;
  address?: string;

  freightCharges?: number;
  customerNotes?: string;
}

export interface OrderAcceptanceItem {
  orderAcceptanceItemId?: number;
  orderAcceptanceId?: number;

  itemType: "Product" | "Accessory";
  productId: number;
  accessoryId: number;
  partNo?: string;
  description: string;
  accessoriesDescription?: string;
  productDescription?: string;
  hsnSacCode: string;
  quantity: number;
  rate: number;
  discount: number;
  taxPercentage: number;
  total: number;
  gstAmount: number;
  finalPrice: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  accessoryIds: number[];
  offerNo?: string;

  originalPrice?: number | null;
  originalCurrency?: string | null;
}

export interface BankDetail {
  id: number;
  bankName: string;
  bankAddress: string;
  emailAddress?: string;
  accountNo: string;
  ifscCode?: string;
  swiftCode?: string;
  ibanNo?: string;
  accountHolderName: string;
}

export interface OrderAcceptance {
  orderAcceptanceId: number;

  offerIds: number[];
  offers: OrderAcceptanceOffer[];
  customerId?: number;
  customerName: string;
  invoiceAddress: string;
  shippingAddress: string;
  address: string;
  vendorVatNo?: string;
  vendorName: string;
  vendorAddress: string;
  vendorCode: string;
  foreignVendorCode: string;

  bankDetails: BankDetail;

  responsiblePersonName: string;
  invoiceNo?: string;
  gaxcePurchaseOrderNo: string;
  customerOrderNo: string;
  customerOrderDate: string | null;
  orderDate: string;

  currencyId: number;
  currencyName?: string;
  currencySymbol?: string;

  subtotal: number;
  freightCharges: number;
  grandTotal: number;

  termsConditions: string;
  customerNotes: string;
  status: "DRAFT" | "FINAL";

  items: OrderAcceptanceItem[];

  orderAcceptanceNotes?: {
  note: string;
  authorName?: string;
  createdAt?: string;
  createdByEmployeeId?: number;
}[];
}

export interface OAListItem {
  orderAcceptanceId: number;
  gaxcePurchaseOrderNo: string;
  customerOrderNo: string;
  offerNo: string;
  orderDate: string;
  offerExpiryDate: string | null;
  grandTotal: number;
  customerName: string;
  currencyName: string;
  currencySymbol: string;
  status: string;
}

/* ---------- EXTRA TYPES (NEW) ---------- */

export interface SelectOption {
  value: number;
  label: string;
  currencyId?: number;
  currencySymbol?: string;
  currencyName?: string;
  stateName?: string;
}

export interface CurrencyOption extends SelectOption {
  currencySymbol: string;
  currencyName: string;
}

export interface OptionsType {
  customers: SelectOption[];
  vendors: SelectOption[];
  companies: SelectOption[];
  groups: SelectOption[];
  companyGroups: SelectOption[];
  employees: SelectOption[];
  states: SelectOption[];
  banks: SelectOption[];
  products: any[];
  accessories: any[];
  currencies: CurrencyOption[];
}
