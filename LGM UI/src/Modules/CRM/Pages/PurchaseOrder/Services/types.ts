export interface PurchaseOrderItem {
  purchaseOrderItemId: number;
  productId: number;
  accessoryId: number; 
  itemType: 'Product' | 'Accessory'; 
  PartNo: string;
  description: string;
  hsnSacCode: string;
  quantity: number;
  rate: number;
  discount: number;
  taxPercentage: number;
  total: number;
  gstAmount: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  finalPrice: number;
  accessoryIds: number[]; 
  sourceOA?: string;
  masterCurrencyId?: number;
  originalPrice?: number | null;
   productSource?: string;
  originalCurrency?: string | null;
}
export interface PurchaseOrderOffer {
    offerId: number;
    gaxcePurchaseOrderNo: string;
    customerId: number;
    vendorId: number;
    companyId: number;
    productGroupId: number;
    companyGroupId: number;
    currencyId: number;
    placeOfSupplyId: number;
    bankDetailId: number;
    responsiblePersonId: number;
    assignedToEmployeeId: number;
    offerCreateDate: string;
    offerExpiryDate?: string;
    companyCode: string;
    vendorCode: string;
    address: string;
    freightCharges: number;
    customerNotes: string;
}

// The main flat Purchase Order object used in the Wizard's state
export interface PurchaseOrder {
  purchaseOrderId: number;
  purchaseOrderNo: string;
  gaxcePurchaseOrderNo: string;
  customerOrderNo: string;
  customerOrderDate: string | null;
  invoiceNo: string;
  invoiceDate: string | null;
  purchaseOrderDate: string;
  nextFollowUpDate: string | null;
  offerCreateDate: string | null;
  offerExpiryDate: string | null;
  companyCode: string;
  vendorCode: string;
  address: string;
  customerId: number;
  vendorId: number;
  companyId: number;
  productGroupId: number;
  companyGroupId: number;
  currencyId: number;
  currencySymbol: string;
  placeOfSupplyId: number;
  bankDetailId: number;
  responsiblePersonId: number;
  assignedToEmployeeId: number;
  subtotal: number;
  freightCharges: number;
  grandTotal: number;
  termsConditions: string;
  customerNotes: string;
  status: "DRAFT" | "FINAL";
  items: PurchaseOrderItem[];
  orderAcceptanceIds: number[]; 
  offers?: PurchaseOrderOffer[]; 
}

export interface POListItem {
  purchaseOrderId: number;
  purchaseOrderNo: string;
  gaxcePurchaseOrderNo: string;
  customerOrderNo: string;
  grandTotal: number;
  customerName: string;
  status: string;
}

export interface PurchaseOrderPdfData {
  companyName: string;
  companyContactPerson: string;
  companyAddress: string;
  vendorName: string;
  vendorCode?: string;
  vendorContactPerson: string;
  vendorAddress: string;
  currencySymbol: string;
  freightCharges: number;
  purchaseOrderNo: string;
  purchaseOrderDate: string;
  items: {
    itemType: "Product" | "Accessory";
    partNo: string;
    description: string;
    accessoriesDescription?: string;
    productDescription?: string;
    rate: number;
    quantity: number;
    total: number;
  }[];
  grandTotal: number;
  termsConditions: string;
  customerNotes?: string;
}
