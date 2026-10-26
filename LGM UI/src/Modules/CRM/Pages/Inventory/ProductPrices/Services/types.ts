export interface ProductPrice {
  productPriceId: number;
  priceListId: number;
  productId: number;
  priceType: string;
  amount: number;
  minQty: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  isActive: boolean;
  isDeleted: boolean;
}
export type ProductPriceListItem = ProductPrice;
