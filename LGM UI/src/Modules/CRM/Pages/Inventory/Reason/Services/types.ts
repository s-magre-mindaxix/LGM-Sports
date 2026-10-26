export interface Reason {
  reasonId: number;
  code: string;
  name: string;
  reasonType: string;
  isActive: boolean;
  isDeleted: boolean;
}
export type ReasonListItem = Reason;
