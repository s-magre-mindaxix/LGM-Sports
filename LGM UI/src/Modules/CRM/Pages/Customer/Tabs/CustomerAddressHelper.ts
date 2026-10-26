import type { Customer, CustomerAddress } from "../Services/types";

export const useCustomerAddress = (data: Customer, setData: React.Dispatch<React.SetStateAction<Customer>>, addressType: string) => {
    const address = data.addresses?.find(a => a.addressType === addressType) || ({} as Partial<CustomerAddress>);

    const handleChange = (field: keyof CustomerAddress, value: any) => {
        setData(prev => {
            const updatedAddresses = [...(prev.addresses || [])];
            const idx = updatedAddresses.findIndex(a => a.addressType === addressType);

            if (idx > -1) {
                updatedAddresses[idx] = { ...updatedAddresses[idx], [field]: value };
            } else {
                updatedAddresses.push({ 
                    addressType: addressType as 'Correspondence' | 'Permanent', 
                    [field]: value 
                } as CustomerAddress);
            }
            return { ...prev, addresses: updatedAddresses };
        });
    };

    return { address, handleChange };
};