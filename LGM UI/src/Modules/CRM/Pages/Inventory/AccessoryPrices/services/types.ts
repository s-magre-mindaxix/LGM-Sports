export interface AccessoryPrice {
  accessoryPriceId: number;
  priceListId: number;
  accessoryId: number;
  accessoriesId: number;
  priceType: string;
  amount: number;
  minQty: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  isActive: boolean;
  isDeleted?: boolean;
  priceList?: unknown;
  accessory?: unknown;
}

export type AccessoryPriceListItem = AccessoryPrice;
