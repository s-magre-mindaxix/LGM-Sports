export interface Bundle {
  bundleId: number;
  code: string;
  name: string;
  parentProductId: number;
  packagePrice: number;
  taxMode: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  isActive: boolean;
  isDeleted?: boolean;
}

export type BundleListItem = Bundle;
