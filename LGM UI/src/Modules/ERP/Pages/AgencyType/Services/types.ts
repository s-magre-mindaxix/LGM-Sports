export interface AgencyType {
    id: number;
    agencyTypeName: string;
}

// This interface is often defined directly in the form component,
// but creating it here can be useful for consistency.
export interface AgencyTypeFormProps {
    data: AgencyType;
    setData: React.Dispatch<React.SetStateAction<AgencyType>>;
}