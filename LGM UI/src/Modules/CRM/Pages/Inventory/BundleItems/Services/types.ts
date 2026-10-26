export interface BundleItem {
  bundleItemId: number;
  bundleId: number;
  quantity: number;
  pricingType: string;
  allocatedPrice: number;
  isOptional: boolean;
  isDeleted: boolean;
  accessoriesId: number | null;
}
export type BundleItemListItem = BundleItem;
