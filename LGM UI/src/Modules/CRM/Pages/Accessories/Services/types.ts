export interface AccessoryCurrencyPrice {
  id?: number;
  currencyId: number;
  price: number;
  currencyName?: string;
  currencySymbol?: string;
}

export interface Accessories {
  accessoriesId: number;
  accessoriesCode?: string;
  accessoriesName: string;
  vendorId: number;
  vendorName?: string;
  vendorCode?: string;
  accessoriesShortName?: string;
  companyNameOfProduct?: string;
  accessoriesImageFile?: File | null;
  accessoriesImagePath?: string;

  productGroupId?: number;
  categoryId?: number;
  productTypeId?: number;
  variantId?: number;
  versionId?: number;
  currencyId?: number;
  partConditionId?: number;

  accessoriesDescription?: string;
  specification?: string;
  partUnique?: string;
  manufacturingDate?: string;
  expiryDate?: string;
  warrantyPeriod?: string;
  hsnCode?: string;
  uom?: string;

  productSource: "Local" | "Imported";
  bcd: number;
  sws: number;
  igst: number;
  purchasePrice: number;
  salePrice: number;
  taxPreference?: string;
  taxRateId?: number;
  availableQuantity: number;
  outOfStockWarning: number;

  isCalibration: boolean;
  calibrationFrequency?: string;

  currencyPrices: AccessoryCurrencyPrice[];
}

export interface AccessoriesListItem {
  accessoriesId: number;
  accessoriesCode: string;
  partNo?: string;
  accessoriesName: string;
  accessoriesDescription?: string;
  accessoriesImagePath?: string;
  salePrice: number;
  availableQuantity: number;
  accessoriesShortName?: string;
  companyNameOfProduct?: string;
  vendorName?: string;
  vendorCode?: string;
  vendorId?: number;
  currencyPrices: AccessoryCurrencyPrice[];
}

export interface TabProps {
  data: Accessories;
  setData: React.Dispatch<React.SetStateAction<Accessories>>;
  options: any;
  onAddMaster: (type: string) => void;
}


export interface TabProps {
  data: Accessories;
  setData: React.Dispatch<React.SetStateAction<Accessories>>;
  options: any;
  onAddMaster: (type: string) => void;
  errors?: { [key: string]: string[] }; // optional
}