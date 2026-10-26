export interface ProductBarcode {
  id: number;
  barcode: string;
  barcodeType: string;
  productId: number | null;
  variantId: number | null;
  accessoryId: number | null;
  isPrimary: boolean;
  active: boolean;
  isDeleted: boolean;
}

export interface ProductBarcodeListItem extends ProductBarcode {
  productName?: string | null;
  productCode?: string | null;
  variantName?: string | null;
  variantCode?: string | null;
  accessoryName?: string | null;
  accessoryCode?: string | null;
}

export interface ProductBarcodeLookupOption {
  id: number;
  code: string;
  name: string;
  productId?: number | null;
}
