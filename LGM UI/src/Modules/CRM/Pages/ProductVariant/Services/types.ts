export interface ProductVariant {
  id: number;
  productId: number;
  variantName: string;
  variantCode: string;
  attributes?: string | null;
  active: boolean;
  isDeleted?: boolean;
}

export interface ProductVariantListItem extends ProductVariant {
  productName?: string;
}

export interface ProductOption {
  id: number;
  productName: string;
  productCode?: string;
}
