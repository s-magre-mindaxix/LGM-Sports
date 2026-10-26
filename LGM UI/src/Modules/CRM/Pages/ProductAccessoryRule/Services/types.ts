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

export interface ProductAccessoryRuleListItem extends ProductAccessoryRule {
  productName?: string | null;
  productCode?: string | null;
  accessoryName?: string | null;
  accessoryCode?: string | null;
}

export interface ProductAccessoryRuleLookupOption {
  id: number;
  code: string;
  name: string;
}
