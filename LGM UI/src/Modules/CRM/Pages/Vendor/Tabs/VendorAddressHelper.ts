import type { VendorTabProps, VendorAddress } from "../Services/types";

export const useAddress = (data: VendorTabProps['data'], setData: VendorTabProps['setData'], addressType: string) => {
    // We find the specific address for the UI to display
    const address = data.addresses?.find(a => a.addressType === addressType) || ({} as Partial<VendorAddress>);

    const handleChange = (field: keyof VendorAddress, value: any) => {
        // Use functional update (prev => ...) to avoid race conditions
        setData(prev => {
            const updatedAddresses = [...(prev.addresses || [])];
            const idx = updatedAddresses.findIndex(a => a.addressType === addressType);

            if (idx > -1) {
                // Update existing address
                updatedAddresses[idx] = { ...updatedAddresses[idx], [field]: value };
            } else {
                // Create new address entry
                updatedAddresses.push({ 
                    addressType: addressType as 'Correspondence' | 'Permanent', 
                    [field]: value 
                } as VendorAddress);
            }

            return { ...prev, addresses: updatedAddresses };
        });
    };

    return { address, handleChange };
};