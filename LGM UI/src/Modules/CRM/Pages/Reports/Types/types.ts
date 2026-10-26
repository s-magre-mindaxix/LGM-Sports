export type SelectOption = {
  value: number | string;
  label: string;
};

export interface OfferReportFilters {
  group: SelectOption | null;
  company: SelectOption | null;
  vendor: SelectOption | null;
  currency: SelectOption | null;
  placeOfSupply: SelectOption | null;
  status: SelectOption | null;
  companyGroup: SelectOption | null;
  customerCompany: SelectOption | null;
  startDate: string;
  endDate: string;
}

export interface OrderAcceptanceReportFilters {
  group: SelectOption | null;
  company: SelectOption | null;
  vendor: SelectOption | null;
  currency: SelectOption | null;
  placeOfSupply: SelectOption | null;
  companyGroup: SelectOption | null;
  customerCompany: SelectOption | null;
  startDate: string;
  endDate: string;
}

export interface PurchaseOrderReportFilters {
  group: SelectOption | null;
  company: SelectOption | null;
  vendor: SelectOption | null;
  currency: SelectOption | null;
  placeOfSupply: SelectOption | null;
  status: SelectOption | null;
  companyGroup: SelectOption | null;
  customerCompany: SelectOption | null;
  startDate: string;
  endDate: string;
}

export interface ProformaInvoiceReportFilters {
  group: SelectOption | null;
  company: SelectOption | null;
  vendor: SelectOption | null;
  currency: SelectOption | null;
  placeOfSupply: SelectOption | null;
  companyGroup: SelectOption | null;
  customerCompany: SelectOption | null;
  startDate: string;
  endDate: string;
}

export interface InvoiceReportFilters {
  group: SelectOption | null;
  company: SelectOption | null;
  vendor: SelectOption | null;
  currency: SelectOption | null;
  placeOfSupply: SelectOption | null;
  companyGroup: SelectOption | null;
  customerCompany: SelectOption | null;
  startDate: string;
  endDate: string;
}