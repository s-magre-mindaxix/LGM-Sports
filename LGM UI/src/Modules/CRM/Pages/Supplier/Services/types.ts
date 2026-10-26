
export interface Supplier {
  supplierId: number;
  branchId: number;
  supplierCode: string;
  supplierName: string;
  supplierGSTIN: string;
  supplierContact: string;
  supplierAddress: string;
  paymentTerms: string;
  isActive: boolean;
  createdAt?: string;
}

export type SupplierListItem = Supplier;

export interface BranchOption {
  branchId: number;
  branchName: string;
}
