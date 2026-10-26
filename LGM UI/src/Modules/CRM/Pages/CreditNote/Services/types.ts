
export interface CreditNoteItemDto {
    creditNoteItemId?: number;
    productId: number | null;
    description: string;
    hsnSacCode: string;
    quantity: number;
    rate: number;
    total: number;
    gstAmount: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
}

export interface CreditNoteDto {
    creditNoteId?: number;
    creditNoteNo?: string;
    creditNoteDate?: string;
    invoiceId: number;
    invoiceNo: string;
    creditNoteAmount: number;
    creditReason: string;
    
    customerName?: string;
    companyName?: string;
    vendorName?: string;
    currencyName?: string;
    currencySymbol?: string;
    bankName?: string;
    accountNo?: string;
    ifsc?: string;
    placeOfSupplyName?: string;
    consigneeNameAddress?: string;
    termsConditions?: string;
    
    subTotal: number;
    freightCharges: number;
    grandTotal: number;
    advanceAmount: number;
    balanceAmount: number;
     remainingBalanceAmount?: number;
    items: CreditNoteItemDto[];
}

export interface CreateCreditNoteDto {
    invoiceId: number;
    creditNoteNo: string;
    creditNoteAmount: number;
    creditReason: string;
    remainingBalanceAmount?: number;
}

export interface CreditNoteListDto {
    creditNoteId: number;
    creditNoteNo: string;
    creditNoteDate: string;
    invoiceNo: string;
    creditNoteAmount: number;
     remainingBalanceAmount?: number;
    creditReason: string;
}

export interface InvoiceDropdownDto {
    invoiceId: number;
    invoiceNo: string;
}