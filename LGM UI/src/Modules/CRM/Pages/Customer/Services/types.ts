export interface CustomerAddress {
    id: number;
    addressType: 'Correspondence' | 'Permanent';
    flatBlockNo: string;
    premisesName: string;
    road: string;
    area: string;
    town: string;
    pinNo: string;
    countryId: number;
    countryName?: string;
    stateId: number;
    stateName?: string;
}

export interface CustomerContact {
    id: number;
    resPersonName: string;
    // departmentId: number;
    departmentName: string;
    designation: string;
    mobileNo: string;
    altMobileNo: string;
    emailAddress: string;
    altEmailAddress: string;
}

export interface Customer {
    id: number;
    customerName: string;
    customerCode: string;
    customerShortName: string;
    branch: string;
    plantCode: string;
    companyGroupId: number;
    companyGroupName?: string;
    //vendorId?: number | null;
    vendorName: string;
    vendorCode?: string;
    foreignVendorCode?: string;
    customerPAN: string;
    customerTAN: string;
    gstin: string;
    cin: string;
    msmeNo: string;
    docsAttachment?: string; 
    attachmentFile?: File | null;
    addresses: CustomerAddress[];
    contacts: CustomerContact[];
}

export interface CustomerTabProps {
    data: Customer;
    setData: React.Dispatch<React.SetStateAction<Customer>>;
}

export interface CompanyGroupOption {
  id: number;
  companyGroupName: string;
}

export interface VendorOption {
  id: number;
  vendorName: string;
  vendorCode?: string;
}