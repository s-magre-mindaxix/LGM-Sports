export interface PriceList {
  priceListId: number;
  code: string;
  name: string;
  customerChannelType: string;
  id: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  isActive: boolean;
  isDeleted: boolean;
}
export type PriceListListItem = PriceList;
