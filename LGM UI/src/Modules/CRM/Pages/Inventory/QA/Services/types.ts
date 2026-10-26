export interface QualityAssurance {
  id: number;
  createdDate: string;
  itemName: string;
  itemCode: string;
  quantity: number;
  status: string;
  itemType: string;
  remarks?: string;
   shipmentNo?: string;
  purchaseOrderNo?: string;
  purchaseOrderId?: number;
  shipmentInitiateId?: number;
  actionDate?: string;
}

export interface QAStatusUpdatePayload {
  id: number;
  status: string;
  remarks?: string;
}
