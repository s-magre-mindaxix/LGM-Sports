export interface BundleItem {
  bundleItemId: number;
  bundleId: number;
  productId: number | null;
  variantId: number | null;
  accessoriesId: number | null;
  quantity: number;
  pricingType: string;
  allocatedPrice: number;
  isOptional: boolean;
  isDeleted: boolean;
}

export interface BundleItemListItem extends BundleItem {
  bundleName?: string | null;
  bundleCode?: string | null;
  productName?: string | null;
  productCode?: string | null;
  variantName?: string | null;
  variantCode?: string | null;
  accessoryName?: string | null;
  accessoryCode?: string | null;
}

export interface BundleItemLookupOption {
  id: number;
  code: string;
  name: string;
  productId?: number | null;
}
