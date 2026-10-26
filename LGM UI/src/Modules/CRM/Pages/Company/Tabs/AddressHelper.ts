

import type { TabProps, Address } from "../Services/types";

export const useAddress = (
    data: TabProps['data'],
    setData: TabProps['setData'],
    addressType: Address['addressType']
) => {
    const address = data.addresses?.find(a => a.addressType === addressType) || ({} as Partial<Address>);

    const handleChange = (field: keyof Address, value: string) => {
        setData(prev => {
            const updatedAddresses = [...(prev.addresses || [])];
            const existingAddressIndex = updatedAddresses.findIndex(a => a.addressType === addressType);

            if (existingAddressIndex > -1) {
                updatedAddresses[existingAddressIndex] = { ...updatedAddresses[existingAddressIndex], [field]: value };
            } else {
                const existingAddress = updatedAddresses.find(a => a.addressType === addressType) || ({} as Address);
                const newAddress = { ...existingAddress, [field]: value, addressType };
                updatedAddresses.push(newAddress);
            }

            return { ...prev, addresses: updatedAddresses };
        });
    };

    return { address, handleChange };
};
