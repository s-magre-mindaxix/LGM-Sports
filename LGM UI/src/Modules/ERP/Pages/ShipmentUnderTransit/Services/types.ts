export interface ShipmentUnderTransitListDto {
    shipmentUnderTransitId: number;
    shipmentInitiateId: number;
    shipmentNo: string;
    customerName: string;

    status: string;
    departureDate?: string;
    expectedArrivalDate?: string;
    sourceType: string;
    showAddInventoryButton: boolean;
}

export interface ShipmentUnderTransitDetailsDto {
    shipmentUnderTransitId: number;
    shipmentInitiateId: number;
    shipmentNo: string;
    customerName: string;
    containerNo?: string;
    vesselFlightNo?: string;

       // ADD THESE
    MAWBNo?: string;
    HAWBNo?: string;
    MBLNo?: string;
    HBLNo?: string;

    BOENo?: string;
    BOEDate?: string;

    ETDDate?: string;
    ETADate?: string;

    checklistReceivingDate?: string;
    checklistApprovingDate?: string;

    departureDate?: string;
    expectedArrivalDate?: string;
    
    dutyPaymentDate?: string; // Added
    oocDate?: string;         // Added
    finalDeliveryDate?: string; // Added
    portOfLoading?: string;
    portOfDischarge?: string;
    destination?: string;
    transitRemarks?: string;
    status: string;
    isDelivered: boolean;
    isClosed: boolean;
       // Checklist Details
    checklistExchangeRate?: number;
    checklistAssessableValue?: number;
    checklistTotalDuty?: number;
    checklistGST?: number;
    checklistTotalPayable?: number;
    // BOE Details
    boeExchangeRate?: number;
    boeAssessableValue?: number;
    boeCustomDuty?: number;
    boeGST?: number;
    boeTotalPayable?: number;
    dutyPenalty?: number;
    dutyInterest?: number;
    isChecklistApproved: boolean; // Added
    isBOEApproved: boolean; 
}

export interface CreateShipmentUnderTransitDto {
  shipmentInitiateId: number;
  shipmentAgencyAssignmentId?: number;

  containerNo?: string;
  vesselFlightNo?: string;

  departureDate?: string | null;
  expectedArrivalDate?: string | null;
  actualArrivalDate?: string | null;

  dutyPaymentDate?: string | null;
  oocDate?: string | null;
  finalDeliveryDate?: string | null;

  portOfLoading?: string;
  portOfDischarge?: string;
  destination?: string;

  checklistExchangeRate?: number;
  checklistAssessableValue?: number;
  checklistTotalDuty?: number;
  checklistGST?: number;
  checklistTotalPayable?: number;

  boeExchangeRate?: number;
  boeAssessableValue?: number;
  boeCustomDuty?: number;
  boeGST?: number;
  boeTotalPayable?: number;
  dutyPenalty?: number;
  dutyInterest?: number;
  isChecklistApproved?: boolean;
  isBOEApproved?: boolean;

  transitRemarks?: string;

   MAWBNo?: string;
  HAWBNo?: string;
  MBLNo?: string;
  HBLNo?: string;
  ETDDate?: string | null; // Added
  ETADate?: string | null; // Added
  BOENo?: string;          // Added
  BOEDate?: string | null; // Added
  checklistReceivingDate?: string | null; // Added
  checklistApprovingDate?: string | null; 
}