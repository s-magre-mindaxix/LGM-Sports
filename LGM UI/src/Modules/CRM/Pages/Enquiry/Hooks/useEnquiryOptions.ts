import { useState, useEffect } from "react";
import {
  getAllBanks,
  getCompanies,
} from "../../Company/Services/CompanyService";
import { getVendors } from "../../Vendor/Services/VendorService";
import { getCustomers } from "../../Customer/Services/CustomerService";
import { getCurrencies } from "../../Currency/Services/CurrencyService";
import { getProducts } from "../../Product/Services/ProductService";
import { getAccessories } from "../../Accessories/Services/AccessoriesService";
import { getProductGroups } from "../../../../HRMS/Pages/Masters/ProductGroup/Services/ProductGroupService";
import { getEmployeeSelectionList, getStates } from "../../../../HRMS/Services/MasterDataService";
import { getCompanyGroups } from "../../CompanyGroup/Services/CompanyGroupService";


// 1. Define Option Interface
export interface SelectOption {
  value: number | string;
  label: string;
  rate?: number;
  image?: string;
  mapAccessories?: string | null;
  productCode?: string;
  currencySymbol?: string; 
  productImage?: string; 
  partNo?: string;
  hsnCode?: string; 
  currencyPrices?: any[]; 
  salePrice?: number; 
  stateName?: string;
}

interface EnquiryOptionsState {
  groups: SelectOption[];
  companies: SelectOption[];
  rawCompaniesList: any[];
  vendors: SelectOption[];
  companyGroups: SelectOption[];
  customers: SelectOption[];
  rawCustomersList: any[];
  currencies: SelectOption[];
  states: SelectOption[];
  banks: SelectOption[];
  products: SelectOption[];
  accessories: SelectOption[];
  employees: SelectOption[];
}

export const useEnquiryOptions = () => {
  // 3. Initialize employees in state
  const [options, setOptions] = useState<EnquiryOptionsState>({
    groups: [],
    companies: [],
    rawCompaniesList: [],
    vendors: [],
    companyGroups: [],
    customers: [],
    rawCustomersList: [],
    currencies: [],
    states: [],
    banks: [],
    products: [],
    accessories: [],
    employees: [],
  });

  const fetchAll = async () => {
    try {
      // 4. Added getAllEmployees() to the main Promise.all for better performance
      const [g, c, v, cg, cust, cur, st, p, acc, bks, emp] = await Promise.all([
        getProductGroups(),
        getCompanies(),
        getVendors(),
        getCompanyGroups(),
        getCustomers(),
        getCurrencies(),
        getStates(),
        getProducts(),
        getAccessories(),
        getAllBanks(),
        // getAllEmployees(),
        getEmployeeSelectionList(),
      ]);

      setOptions({
        groups: (g || []).map((x: any) => ({
          value: x.id,
          label: x.groupName,
        })),
        companies: (c || []).map((x: any) => ({
          value: x.companyId,
          label: x.companyName,
          stateId: x.stateId,
          stateName: x.stateName,
        })),
        rawCompaniesList: c || [],
        vendors: (v || []).map((x: any) => ({
          value: x.id,
          label: x.vendorName,
        })),
        companyGroups: (cg || []).map((x: any) => ({
          value: x.id,
          label: x.companyGroupName,
        })),
        customers: (cust || []).map((x: any) => ({
          value: x.id,
          label: x.customerName,
        })),
        rawCustomersList: cust || [],
        currencies: (cur || []).map((x: any) => ({
          value: x.id,
          label: x.currencyName,
          currencySymbol: x.currencySymbol,
        })),
        states: (st || []).map((x: any) => ({
          value: x.id,
          label: x.stateName,
        })),
        banks: (bks || []).map((x: any) => ({
          value: x.bankDetailId,
          label: `${x.bankName} - ${x.accountNo}`,
        })),
        products: (p || []).map((x: any) => ({
          value: x.productId,
          // label: `${x.productCode} - ${x.ProductDescription || x.productName}`,
          label: `${x.productCode} - ${x.ProductDescription || x.productName}${
            x.partNo ? ` (${x.partNo})` : ""
          }`,
          productCode: x.productCode,
          productName: x.productName,
          productDescription:
            x.productDescription || x.ProductDescription || x.productName,
          partNo: x.partNo,
          rate: x.salePrice,
          image: x.productImagePath,
          hsnCode: x.hsnCode,
          mapAccessories: x.mapAccessories,
          currencyPrices: x.currencyPrices,
        })),
        accessories: (acc || []).map((x: any) => ({
          ...x,
          value: x.accessoriesId,
          // label: `${x.accessoriesCode} - ${x.accessoriesDescription}`,
          label: `${x.accessoriesCode} - ${x.accessoriesDescription}${
            x.partNo ? ` (${x.partNo})` : ""
          }`,
          partNo: x.partNo,
          hsnCode: x.hsnCode,
          image: x.accessoriesImagePath,
          currencyPrices: x.currencyPrices,
          salePrice: x.salePrice,
        })),

        employees: (emp || []).map((x: any) => ({
          value: x.id,
          label: `${x.firstName} ${x.lastName} (${x.employeeCode})`,
        })),
      });
    } catch (error) {
      console.error("Error loading Enquiry options", error);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return options;
};
