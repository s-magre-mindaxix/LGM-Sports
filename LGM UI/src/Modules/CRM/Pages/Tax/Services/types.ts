export interface Tax {
  taxId: number;
  code: string;
  name: string;
  rate: number;
  taxType: string;
  effectiveFrom: string;
  effectiveTo: string;
  isActive: boolean;
}

export type TaxListItem = Tax;