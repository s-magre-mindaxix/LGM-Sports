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
export type ProductBarcodeListItem = ProductBarcode;
