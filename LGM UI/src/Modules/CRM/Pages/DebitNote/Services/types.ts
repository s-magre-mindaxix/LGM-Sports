export interface DebitNoteItemDto {
    debitNoteItemId?: number;
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
    itemType?: string;
}

export interface DebitNoteDto {
    debitNoteId?: number;
    debitNoteNo?: string;
    debitNoteDate?: string;
    invoiceId: number;
    invoiceNo: string;
    invoiceDate: string;
    invoiceDueDate?: string;
    adjustAmount: number; 
    updatedBalanceAmount: number;
    debitReason: string;
    
    // Metadata Fields
    customerName?: string;
    companyName?: string;
    vendorName?: string;
    productGroupName?: string;
    companyGroupName?: string;
    currencyName?: string;
    currencySymbol?: string;
    bankName?: string;
    accountNo?: string;
    placeOfSupplyName?: string;
    consigneeNameAddress?: string;
    customerPo?: string;
    companyPoDate?: string;
    description?: string;
    
    subTotal: number;
    grandTotal: number;
    items: DebitNoteItemDto[];
}

export interface CreateDebitNoteDto {
    invoiceId: number;
    debitNoteNo: string;
    adjustAmount: number;
    debitReason: string;
}

export interface DebitNoteListDto {
    debitNoteId: number;
    debitNoteNo: string;
    debitNoteDate: string;
    invoiceNo: string;
    adjustAmount: number;
    updatedBalanceAmount: number;
    debitReason: string;
}

export interface InvoiceDropdownDto {
    invoiceId: number;
    invoiceNo: string;
}