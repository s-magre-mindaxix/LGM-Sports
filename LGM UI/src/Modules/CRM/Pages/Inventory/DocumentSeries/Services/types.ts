export interface DocumentSeries {
  documentSeriesId: number;
  documentType: string;
  prefix: string;
  nextNumber: number;
  financialYear: string;
  branchId: number;
  isDeleted: boolean;
}
export type DocumentSeriesListItem = DocumentSeries;
