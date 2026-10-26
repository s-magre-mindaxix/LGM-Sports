export interface BankDetail {
  bankDetailId?: number;
  companyId?: number;
  bankName: string;
  bankAddress: string;
  accountNo: string;
  ifsc: string;
  swiftCode: string;
  iban: string;
  accountHolderName: string;
}
export interface Address {
  addressId?: number;
  companyId?: number;
  addressType: "Correspondence" | "Permanent";
  flatBlock: string;
  premises: string;
  road: string;
  area: string;
  town: string;
  pinCode: string;
  country: string;
  state: string;
  mobileNo: string;
  altMobileNo: string;
  email: string;
  altEmail: string;
}

export interface Director {
  directorId?: number;
  companyId?: number;
  directorName: string;
  designation: string;
  mobileNo: string;
  email: string;
  website: string;
  docsAttachmentPath?: string;
  presentationPPTPath?: string;
  docsAttachment?: File | null;
  presentationPPT?: File | null;
}

export interface Company {
  companyId: number;
  companyCode: string;
  companyName: string;
  companyShortName: string;
  logoPath?: string;
  companyLogo?: File | null;
  pan: string;
  tan: string;
  gstin: string;
  cin: string;
  addresses: Address[];
  directors: Director[];
  bankDetails: BankDetail[];
}
export interface TabProps {
  data: Company;
  setData: React.Dispatch<React.SetStateAction<Company>>;
}

export interface CompanyListItem {
  companyId: number;
  companyName: string;
  directorName: string;
  designation: string;
  address: string;
  mobileNo: string;
  email: string;
}
