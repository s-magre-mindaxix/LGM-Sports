export interface VendorAddress {
    id: number;
    addressType: 'Correspondence' | 'Permanent';
    flatBlockNo: string;
    premises: string;
    roadStrLane: string;
    area: string;
    town: string;
    pinNo: string;
    countryId: number;
    stateId: number;
    mobileNo: string;
    altMobileNo: string;
    emailAddress: string;
    altEmailAddress: string;
}

export interface VendorContact {
    id: number;
    personName: string;
    designation: string;
    mobileNo: string;
    emailAddress: string;
    docsAttachment?: File | string | null;
}

export interface VendorBankDetail {
    id: number;
    bankName: string;
    bankAddress: string;
    emailAddress: string;
    accountNo: string;
    ifscCode: string;
    accountHolderName: string;
    swiftCode: string;
    ibanNo: string;
}

export interface Vendor {
    id: number;
    vendorName: string;
    // plantCode: string;
    vendorCode: string;
    vendorShortName: string;
    vendorDivision: string;
    vendorLogo?: File | string | null;
    vendorPAN: string;
    vendorTAN: string;
    vatNo: string;
    msmeNo: string;
    gstin: string;
    cin: string;
    addresses: VendorAddress[];
    principalContacts: VendorContact[];
    bankDetails: VendorBankDetail[];
}

export interface VendorTabProps {
    data: Vendor;
    setData: React.Dispatch<React.SetStateAction<Vendor>>;
}