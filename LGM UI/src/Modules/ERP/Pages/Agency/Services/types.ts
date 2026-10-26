export interface AgencyAddress {
    id: number;
    addressType: string;
    flatBlockNo: string;
    premises: string;
    roadStreetLane: string;
    area: string;
    townCity: string;
    pincode: string;
    countryId: number;
    stateId: number;
    countryName?: string; // For display
    stateName?: string;   // For display
    mobileNo: string;
    alternateMobileNo: string;
    emailAddress: string;
    alternateEmailAddress: string;
}

export interface AgencyContact {
    id: number;
    personName: string;
    designation: string;
    department: string;
    mobileNo: string;
    alternateMobileNo: string;
    emailAddress: string;
    docsAttachment?: File | string | null;
    contactFile?: File | null; // For new uploads
}

export interface AgencyBankDetail {
    id: number;
    bankName: string;
    bankAddress: string;
    accountHolderName: string;
    accountNo: string;
    ifscCode: string;
    swiftCode: string;
    ibanNo: string;
    emailAddress: string;
}

export interface Agency {
    id: number;
    agencyName: string;
    agencyCode: string;
    agencyTypeId: number;
    agencyTypeName?: string; // For display
    agencyShortName: string;
    agencyLogo?: File | string | null;
    logoFile?: File | null; // For new uploads
    panNo: string;
    tanNo: string;
    gstin: string;
    cinNo: string;
    iataCode: string;
    fmcCode: string;
    licenseNo: string;
    website: string;
    addresses: AgencyAddress[];
    contacts: AgencyContact[];
    bankDetails: AgencyBankDetail[];
}

// Props for wizard tab components
export interface AgencyTabProps {
    data: Agency;
    setData: React.Dispatch<React.SetStateAction<Agency>>;
}