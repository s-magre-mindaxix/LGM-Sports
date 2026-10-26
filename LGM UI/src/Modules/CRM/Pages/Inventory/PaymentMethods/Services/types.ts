export interface PaymentMethod {
  paymentMethodId: number;
  code: string;
  name: string;
  isActive: boolean;
  isDeleted: boolean;
}
export type PaymentMethodListItem = PaymentMethod;
