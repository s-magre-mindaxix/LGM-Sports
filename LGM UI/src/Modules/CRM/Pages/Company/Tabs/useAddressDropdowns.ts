import { useState, useEffect, useMemo } from 'react';
import { getAllCountries } from '../../../../HRMS/Pages/Masters/Country/Services/CountryService';
import type { Country } from '../../../../HRMS/Pages/Masters/Country/Services/CountryService';
import { getAllStates } from '../../../../HRMS/Pages/Masters/State/Services/StateService';
import type { State } from '../../../../HRMS/Pages/Masters/State/Services/StateService';
import type { Address } from '../Services/types';


// The format react-select expects for its options
export interface SelectOption {
  value: number;
  label: string;
}

export const useAddressDropdowns = (
  address: Partial<Address>,
  handleChange: (field: keyof Address, value: string) => void
) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [filteredStates, setFilteredStates] = useState<State[]>([]);

  // Fetch all countries and states once when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countriesData, statesData] = await Promise.all([
          getAllCountries(),
          getAllStates(),
        ]);
        setCountries(countriesData);
        setStates(statesData);
      } catch (error) {
        console.error("Failed to fetch countries or states", error);
      }
    };
    fetchData();
  }, []);
  
  // When the selected country changes, filter the states list
  useEffect(() => {
    if (address.country) {
      const selectedCountry = countries.find(c => c.countryName === address.country);
      if (selectedCountry) {
        setFilteredStates(states.filter(s => s.countryId === selectedCountry.id));
      }
    } else {
      setFilteredStates([]);
    }
  }, [address.country, countries, states]);

  // Memoize the formatted options to prevent re-calculating on every render
  const countryOptions: SelectOption[] = useMemo(() =>
    countries.map(c => ({ value: c.id, label: c.countryName })),
    [countries]
  );

  const stateOptions: SelectOption[] = useMemo(() =>
    filteredStates.map(s => ({ value: s.id, label: s.stateName })),
    [filteredStates]
  );
  
  // Find the full option object for the current value to pass to react-select
  const selectedCountryValue = countryOptions.find(opt => opt.label === address.country) || null;
  const selectedStateValue = stateOptions.find(opt => opt.label === address.state) || null;

  // Handle the change event from the Country dropdown
  const handleCountryChange = (selectedOption: SelectOption | null) => {
    handleChange('country', selectedOption ? selectedOption.label : '');
    // IMPORTANT: Clear the state when the country changes
    handleChange('state', ''); 
  };
  
  // Handle the change event from the State dropdown
  const handleStateChange = (selectedOption: SelectOption | null) => {
    handleChange('state', selectedOption ? selectedOption.label : '');
  };

  return {
    countryOptions,
    stateOptions,
    selectedCountryValue,
    selectedStateValue,
    handleCountryChange,
    handleStateChange,
  };
};