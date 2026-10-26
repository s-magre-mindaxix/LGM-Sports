import { useState, useEffect } from "react";
import { getProductGroups } from "../../../../HRMS/Pages/Masters/ProductGroup/Services/ProductGroupService";
import { getCategories } from "../../../../HRMS/Pages/Masters/Category/Services/CategoryService";
import { getProductTypes } from "../../../../HRMS/Pages/Masters/ProductTypes/Services/ProductTypeService";
import { getProductVariants } from "../../../../HRMS/Pages/Masters/ProductVariant/Services/ProductVariantService";
import { getProductVersions } from "../../../../HRMS/Pages/Masters/ProductVersion/Services/ProductVersionService";
import { getCurrencies } from "../../Currency/Services/CurrencyService";
import { getPartConditions } from "../../../../HRMS/Pages/Masters/PartCondition/Services/PartConditionService";
import { getAccessories } from "../../Accessories/Services/AccessoriesService";
// import { getProductGroups } from "../../ProductGroup/ProductGroupService";
// import { getCategories } from "../../Category/CategoryService";
// import { getProductTypes } from "../../ProductType/ProductTypeService";
// import { getProductVariants } from "../../ProductVariant/ProductVariantService";
// import { getProductVersions } from "../../ProductVersion/ProductVersionService";
// import { getCurrencies } from "../../Currency/CurrencyService";
// import { getPartConditions } from "../../PartCondition/PartConditionService";

export interface DropdownOption {
    value: number;
    label: string;
}

// Define the shape of the entire options state
interface ProductOptions {
    groups: DropdownOption[];
    categories: DropdownOption[];
    types: DropdownOption[];
    variants: DropdownOption[];
    versions: DropdownOption[];
    currencies: DropdownOption[];
    conditions: DropdownOption[];
     accessories: DropdownOption[];
      currencies_full: any[];
}

export const useProductDropdowns = () => {
    // 1. Initialize with the interface type to avoid "never[]" errors
    const [options, setOptions] = useState<ProductOptions>({
        groups: [],
        categories: [],
        types: [],
        variants: [],
        versions: [],
        currencies: [],
        conditions: [],
         accessories: [],
          currencies_full: [] 
    });

    const fetchAll = async () => {
        try {
            const [g, c, t, v, vr, cur, con,acc] = await Promise.all([
                getProductGroups(),
                getCategories(),
                getProductTypes(),
                getProductVariants(),
                getProductVersions(),
                getCurrencies(),
                getPartConditions(),
                getAccessories()
            ]);

            // 2. Map the API results to the Label/Value format for react-select
            setOptions({
                groups: (g || []).map((x: any) => ({ value: x.id, label: x.groupName })),
                categories: (c || []).map((x: any) => ({ value: x.id, label: x.categoryName })),
                types: (t || []).map((x: any) => ({ value: x.id, label: x.productTypeName })),
                variants: (v || []).map((x: any) => ({ value: x.id, label: x.variantName })),
                versions: (vr || []).map((x: any) => ({ value: x.id, label: x.versionName })),
                currencies: (cur || []).map((x: any) => ({ value: x.id, label: x.currencyName })),
                conditions: (con || []).map((x: any) => ({ value: x.id, label: x.partConditionName })),
                accessories: (acc || []).map((x: any) => ({ value: x.accessoriesId, label: `${x.accessoriesCode} - ${x.accessoriesDescription}` })),
                   currencies_full: cur || [] 
            });
            
        } catch (error) {
            console.error("Error loading dropdown options", error);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    return { options, refresh: fetchAll };
};