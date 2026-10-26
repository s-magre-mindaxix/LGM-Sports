export interface InstallationContact {
    id: number;
    name: string;
    designation: string;
}

export interface InstallationReport {
    id: number;
    companyId: number;
    companyName: string;
    customerId: number;
    customerName: string;
    installationDate: string; 
    productInformation: string;
    inspectionSummary: string;
    customerNotes?: string | null;
    place: string;
    createdOn: string;
    customerAddress: string; 
    contacts: InstallationContact[];
}

export interface InstallationReportTabProps {
    data: InstallationReport;
    setData: React.Dispatch<React.SetStateAction<InstallationReport>>;
}