export interface Product {
  productId: number;
  vendorId: number;
  vendorName?: string;
  vendorCode?: string;
  productCode?: string;
  productSKU: string;
  productName: string;
  productShortName?: string;
  companyNameOfProduct?: string;
  productImageFile?: File | null;
  productImagePath?: string;

  productGroupId?: number;
  categoryId?: number;
  brandId?: number;
  productTypeId?: number;
  variantId?: number;
  versionId?: number;
  currencyId?: number;
  partConditionId?: number;
  unitId?: number;
  taxId?: number;
  partNo?: string;

  productDescription?: string;
  specification?: string;
  // partUnique?: string;
  manufacturingDate?: string;
  expiryDate?: string;
  warrantyPeriod?: string;

  hsnCode?: string;
  uom?: string;
  hasAccessories?: string;
  mapAccessories?: string;

  purchasePrice: number;
  salePrice: number;
  mrp: number;
  taxPreference?: string;
  taxRateId?: number;
  availableQuantity: number;
  outOfStockWarning: number;
  minStock: number;
  reorderLevel: number;
  trackStock: boolean;
  trackSerial: boolean;
  trackBatch: boolean;
  isActive: boolean;
  isCalibration: boolean;
  calibrationFrequency?: string;
  productSource: "Local" | "Imported";
  bcd: number;
  sws: number;
  igst: number;

  currencyPrices: ProductCurrencyPrice[];
}

export interface ProductCurrencyPrice {
  id?: number;
  currencyId: number;
  price: number;
  currencySymbol?: string;
  currencyName?: string;
}
export interface ProductListItem {
  productId: number;
  vendorName: string;
  vendorCode: string;
  productCode: string;
  productSKU?: string;
  partNo?: string;
  ProductDescription?: string;
  productName: string;
  productImagePath?: string;
  salePrice: number;
  availableQuantity: number;
  productShortName?: string;
  companyNameOfProduct?: string;
  productSource?: string;
  currencyPrices: ProductCurrencyPrice[];
}

export interface TabProps {
  data: Product;
  setData: React.Dispatch<React.SetStateAction<Product>>;
  options: any;
  onAddMaster: (type: string) => void;
}
export interface AccessoryLog {
  logId: number;
  accessoryId: number;
  actionType: "Addition" | "Subtraction";
  quantity: number;
  reason: string;
  timestamp: string;
}

// types.ts (add errors to TabProps)
export interface TabProps {
  data: Product;
  setData: React.Dispatch<React.SetStateAction<Product>>;
  options: any;
  onAddMaster: (type: string) => void;
  errors?: { [key: string]: string[] }; // NEW
}
