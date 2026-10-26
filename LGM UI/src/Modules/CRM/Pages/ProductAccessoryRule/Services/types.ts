export interface ProductAccessoryRule {
  id: number;
  productId: number;
  accessoriesId: number;
  quantity: number;
  mandatoryOptional: string;
  pricingType: string;
  defaultPrice: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  active: boolean;
  isDeleted: boolean;
}
export type ProductAccessoryRuleListItem = ProductAccessoryRule;
