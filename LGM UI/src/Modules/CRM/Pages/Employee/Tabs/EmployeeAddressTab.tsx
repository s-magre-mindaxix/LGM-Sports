// import React, { useMemo } from "react";
// import type { EmployeeFormData } from "../EmployeeWizard";
// import type {
//   CountryItem,
//   StateItem,
// } from "../../../../HRMS/Services/MasterDataService";
// import Select from "react-select";

// interface EmployeeAddressTabProps {
//   type: "cur" | "perm";
//   formData: EmployeeFormData;
//   setFormData: React.Dispatch<React.SetStateAction<EmployeeFormData>>;
//   countries: CountryItem[];
//   states: StateItem[];
// }

// const EmployeeAddressTab: React.FC<EmployeeAddressTabProps> = ({
//   type,
//   formData,
//   setFormData,
//   countries,
//   states,
// }) => {
//   const prefix = type; // 'cur' or 'perm'

//   const handleSame = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.checked) {
//       setFormData((prev) => ({
//         ...prev,
//         permFlatNo: prev.curFlatNo,
//         permPremisesName: prev.curPremisesName,
//         permRoadName: prev.curRoadName,
//         permLocality: prev.curLocality,
//         permTownDistrict: prev.curTownDistrict,
//         permPinNo: prev.curPinNo,
//         permCountryId: prev.curCountryId,
//         permStateId: prev.curStateId,
//         permMobileNo: prev.curMobileNo,
//         permAltMobileNo: prev.curAltMobileNo,
//         permEmail: prev.curEmail,
//         permAltEmail: prev.curAltEmail,
//       }));
//     }
//   };

//   const countryOptions = useMemo(
//     () =>
//       countries.map((c) => ({
//         value: c.id,
//         label: c.countryName,
//       })),
//     [countries],
//   );

//   const stateOptions = useMemo(() => {
//     const selectedCountryId = formData[`${prefix}CountryId`];
//     if (!selectedCountryId) return [];
//     return states
//       .filter((s) => String(s.countryId) === String(selectedCountryId))
//       .map((s) => ({
//         value: s.id,
//         label: s.stateName,
//       }));
//   }, [states, formData, prefix]);

//   const selectedCountryValue =
//     countryOptions.find(
//       (c) => String(c.value) === String(formData[`${prefix}CountryId`]),
//     ) || null;

//   const selectedStateValue =
//     stateOptions.find(
//       (s) => String(s.value) === String(formData[`${prefix}StateId`]),
//     ) || null;

//   const inputStyle =
//     "w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm";
  
//        const RequiredAst = () => <span className="text-red-500 ml-1">*</span>;

//     const labelStyle =
//     "text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest";

//   return (
//     <div className="space-y-8 animate-in fade-in duration-300">
//       {type === "perm" && (
//         <div className="flex justify-end items-center">
//           <input
//             type="checkbox"
//             id="same"
//             className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//             onChange={handleSame}
//           />
//           <label
//             htmlFor="sameAsAbove"
//             className="ml-2 block text-sm text-gray-900"
//           >
//             Same as Current
//           </label>
//         </div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8">
//         {/* ROW 1 */}
//         <div className="relative">
//           <label className={labelStyle}>Flat/Dr/Block No.</label>
//           <input
//             className={inputStyle}
//             value={String(formData[`${prefix}FlatNo`] ?? "")}
//             onChange={(e) =>
//               setFormData((prev) => ({
//                 ...prev,
//                 [`${prefix}FlatNo`]: e.target.value,
//               }))
//             }
//           />
//         </div>
//         <div className="relative">
//           <label className={labelStyle}>Premises Name</label>
//           <input
//             className={inputStyle}
//             value={String(formData[`${prefix}PremisesName`] ?? "")}
//             onChange={(e) =>
//               setFormData((prev) => ({
//                 ...prev,
//                 [`${prefix}PremisesName`]: e.target.value,
//               }))
//             }
//           />
//         </div>
//         <div className="relative">
//           <label className={labelStyle}>Road /Strt/Lane</label>
//           <input
//             className={inputStyle}
//             value={String(formData[`${prefix}RoadName`] ?? "")}
//             onChange={(e) =>
//               setFormData((prev) => ({
//                 ...prev,
//                 [`${prefix}RoadName`]: e.target.value,
//               }))
//             }
//           />
//         </div>

//         {/* ROW 2 */}
//         <div className="relative">
//           <label className={labelStyle}>Area/locality</label>
//           <input
//             className={inputStyle}
//             value={String(formData[`${prefix}Locality`] ?? "")}
//             onChange={(e) =>
//               setFormData((prev) => ({
//                 ...prev,
//                 [`${prefix}Locality`]: e.target.value,
//               }))
//             }
//           />
//         </div>
//         <div className="relative">
//           <label className={labelStyle}>Town/District</label>
//           <input
//             className={inputStyle}
//             value={String(formData[`${prefix}TownDistrict`] ?? "")}
//             onChange={(e) =>
//               setFormData((prev) => ({
//                 ...prev,
//                 [`${prefix}TownDistrict`]: e.target.value,
//               }))
//             }
//           />
//         </div>
//         <div className="relative">
//           <label className={labelStyle}>Pin No.</label>
//           <input
//             className={inputStyle}
//             value={String(formData[`${prefix}PinNo`] ?? "")}
//             onChange={(e) =>
//               setFormData((prev) => ({
//                 ...prev,
//                 [`${prefix}PinNo`]: e.target.value,
//               }))
//             }
//           />
//         </div>

//         {/* ROW 3 */}
//         <div>
//           <label className={labelStyle}>Country</label>
//           <Select
//             options={countryOptions}
//             value={selectedCountryValue}
//             onChange={(opt) =>
//               setFormData((prev) => ({
//                 ...prev,
//                 [`${prefix}CountryId`]: opt?.value || "",
//                 [`${prefix}StateId`]: "", // reset state
//               }))
//             }
//             isClearable
//             isSearchable
//             placeholder="Select a country..."
//             styles={{
//               control: (base) => ({
//                 ...base,
//                 minHeight: 46,
//                 borderRadius: "0.5rem",
//               }),
//             }}
//           />
//         </div>

//         {/* Dynamic State Dropdown */}
//         <div>
//           <label className={labelStyle}>State</label>
//           <Select
//             options={stateOptions}
//             value={selectedStateValue}
//             onChange={(opt) =>
//               setFormData((prev) => ({
//                 ...prev,
//                 [`${prefix}StateId`]: opt?.value || "",
//               }))
//             }
//             isClearable
//             isSearchable
//             isDisabled={!formData[`${prefix}CountryId`]}
//             placeholder="Select a state..."
//             styles={{
//               control: (base) => ({
//                 ...base,
//                 minHeight: 46,
//                 borderRadius: "0.5rem",
//               }),
//             }}
//           />
//         </div>
//         <div className="relative">
//           <label className={labelStyle}>Mobile No.</label>
//           <input
//             className={inputStyle}
//             value={String(formData[`${prefix}MobileNo`] ?? "")}
//             onChange={(e) =>
//               setFormData((prev) => ({
//                 ...prev,
//                 [`${prefix}MobileNo`]: e.target.value,
//               }))
//             }
//           />
//         </div>

//         {/* ROW 4 */}
//         <div className="relative">
//           <label className={labelStyle}>Alt Mobile No.</label>
//           <input
//             className={inputStyle}
//             value={String(formData[`${prefix}AltMobileNo`] ?? "")}
//             onChange={(e) =>
//               setFormData((prev) => ({
//                 ...prev,
//                 [`${prefix}AltMobileNo`]: e.target.value,
//               }))
//             }
//           />
//         </div>
//         <div className="relative">
//           <label className={labelStyle}>Email Address  <RequiredAst /> </label>
//           <input
//             className={inputStyle}
//             value={String(formData[`${prefix}Email`] ?? "")}
//             onChange={(e) =>
//               setFormData((prev) => ({
//                 ...prev,
//                 [`${prefix}Email`]: e.target.value,
//               }))
//             }
//           />
//         </div>
//         <div className="relative">
//           <label className={labelStyle}>Alt Email Address</label>
//           <input
//             className={inputStyle}
//             value={String(formData[`${prefix}AltEmail`] ?? "")}
//             onChange={(e) =>
//               setFormData((prev) => ({
//                 ...prev,
//                 [`${prefix}AltEmail`]: e.target.value,
//               }))
//             }
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EmployeeAddressTab;



import React, { useMemo } from "react";
import type { EmployeeFormData } from "../EmployeeWizard";
import type { CountryItem, StateItem } from "../../../../HRMS/Services/MasterDataService";
import Select from "react-select";

interface EmployeeAddressTabProps {
  type: "cur" | "perm";
  formData: EmployeeFormData;
  setFormData: React.Dispatch<React.SetStateAction<EmployeeFormData>>;
  countries: CountryItem[];
  states: StateItem[];
  errors?: { [key: string]: string[] };
}

const EmployeeAddressTab: React.FC<EmployeeAddressTabProps> = ({ type, formData, setFormData, countries, states, errors = {} }) => {
  const prefix = type;

  const handleSame = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setFormData((prev) => ({
        ...prev,
        permFlatNo: prev.curFlatNo,
        permPremisesName: prev.curPremisesName,
        permRoadName: prev.curRoadName,
        permLocality: prev.curLocality,
        permTownDistrict: prev.curTownDistrict,
        permPinNo: prev.curPinNo,
        permCountryId: prev.curCountryId,
        permStateId: prev.curStateId,
        permMobileNo: prev.curMobileNo,
        permAltMobileNo: prev.curAltMobileNo,
        permEmail: prev.curEmail,
        permAltEmail: prev.curAltEmail,
      }));
    }
  };

  const countryOptions = useMemo(() => countries.map((c) => ({ value: c.id, label: c.countryName })), [countries]);
  const stateOptions = useMemo(() => {
    const selectedCountryId = formData[`${prefix}CountryId`];
    if (!selectedCountryId) return [];
    return states.filter((s) => String(s.countryId) === String(selectedCountryId)).map((s) => ({ value: s.id, label: s.stateName }));
  }, [states, formData, prefix]);

  const selectedCountryValue = countryOptions.find((c) => String(c.value) === String(formData[`${prefix}CountryId`])) || null;
  const selectedStateValue = stateOptions.find((s) => String(s.value) === String(formData[`${prefix}StateId`])) || null;

  const baseInputStyle = "w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm";
  const inputStyle = (hasError: boolean) => `${baseInputStyle} ${hasError ? 'border-red-500 bg-red-50' : 'border-gray-300'}`;
  const labelStyle = "text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest";
  const RequiredAst = () => <span className="text-red-500 ml-1">*</span>;

  const getError = (field: string) => errors[`${prefix}${field.charAt(0).toUpperCase() + field.slice(1)}`]?.[0] || errors[field]?.[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {type === "perm" && (
        <div className="flex justify-end items-center">
          <input type="checkbox" id="same" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" onChange={handleSame} />
          <label htmlFor="sameAsAbove" className="ml-2 block text-sm text-gray-900">Same as Current</label>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8">
        {/* ROW 1 */}
        <div><label className={labelStyle}>Flat/Dr/Block No.</label><input className={baseInputStyle} value={String(formData[`${prefix}FlatNo`] ?? "")} onChange={(e) => setFormData((prev) => ({ ...prev, [`${prefix}FlatNo`]: e.target.value }))} /></div>
        <div><label className={labelStyle}>Premises Name</label><input className={baseInputStyle} value={String(formData[`${prefix}PremisesName`] ?? "")} onChange={(e) => setFormData((prev) => ({ ...prev, [`${prefix}PremisesName`]: e.target.value }))} /></div>
        <div><label className={labelStyle}>Road /Strt/Lane</label><input className={baseInputStyle} value={String(formData[`${prefix}RoadName`] ?? "")} onChange={(e) => setFormData((prev) => ({ ...prev, [`${prefix}RoadName`]: e.target.value }))} /></div>

        {/* ROW 2 */}
        <div><label className={labelStyle}>Area/locality</label><input className={baseInputStyle} value={String(formData[`${prefix}Locality`] ?? "")} onChange={(e) => setFormData((prev) => ({ ...prev, [`${prefix}Locality`]: e.target.value }))} /></div>
        <div><label className={labelStyle}>Town/District</label><input className={baseInputStyle} value={String(formData[`${prefix}TownDistrict`] ?? "")} onChange={(e) => setFormData((prev) => ({ ...prev, [`${prefix}TownDistrict`]: e.target.value }))} /></div>
        <div><label className={labelStyle}>Pin No.</label><input className={baseInputStyle} value={String(formData[`${prefix}PinNo`] ?? "")} onChange={(e) => setFormData((prev) => ({ ...prev, [`${prefix}PinNo`]: e.target.value }))} /></div>

        {/* ROW 3 */}
        <div>
          <label className={labelStyle}>Country</label>
          <Select options={countryOptions} value={selectedCountryValue} onChange={(opt) => setFormData((prev) => ({ ...prev, [`${prefix}CountryId`]: opt?.value || "", [`${prefix}StateId`]: "" }))} isClearable isSearchable placeholder="Select a country..." styles={{ control: (base) => ({ ...base, minHeight: 46, borderRadius: "0.5rem" }) }} />
        </div>
        <div>
          <label className={labelStyle}>State</label>
          <Select options={stateOptions} value={selectedStateValue} onChange={(opt) => setFormData((prev) => ({ ...prev, [`${prefix}StateId`]: opt?.value || "" }))} isClearable isSearchable isDisabled={!formData[`${prefix}CountryId`]} placeholder="Select a state..." styles={{ control: (base) => ({ ...base, minHeight: 46, borderRadius: "0.5rem" }) }} />
        </div>
        {/* <div>
          <label className={labelStyle}>Mobile No.</label>
          <input className={inputStyle(!!getError('mobileNo'))} value={String(formData[`${prefix}MobileNo`] ?? "")} onChange={(e) => setFormData((prev) => ({ ...prev, [`${prefix}MobileNo`]: e.target.value }))} />
          {getError('mobileNo') && <p className="text-xs text-red-500 mt-1">{getError('mobileNo')}</p>}
        </div> */}

        <div>
  <label className={labelStyle}>Mobile No.</label>
  <input 
    className={baseInputStyle} 
    value={String(formData[`${prefix}MobileNo`] ?? "")} 
    onChange={(e) => setFormData((prev) => ({ ...prev, [`${prefix}MobileNo`]: e.target.value }))} 
  />
</div>

        {/* ROW 4 */}
        <div><label className={labelStyle}>Alt Mobile No.</label><input className={baseInputStyle} value={String(formData[`${prefix}AltMobileNo`] ?? "")} onChange={(e) => setFormData((prev) => ({ ...prev, [`${prefix}AltMobileNo`]: e.target.value }))} /></div>
        <div>
          <label className={labelStyle}>Email Address<RequiredAst /></label>
          <input className={inputStyle(!!getError('email'))} value={String(formData[`${prefix}Email`] ?? "")} onChange={(e) => setFormData((prev) => ({ ...prev, [`${prefix}Email`]: e.target.value }))} />
          {getError('email') && <p className="text-xs text-red-500 mt-1">{getError('email')}</p>}
        </div>
        <div><label className={labelStyle}>Alt Email Address</label><input className={baseInputStyle} value={String(formData[`${prefix}AltEmail`] ?? "")} onChange={(e) => setFormData((prev) => ({ ...prev, [`${prefix}AltEmail`]: e.target.value }))} /></div>
      </div>
    </div>
  );
};

export default EmployeeAddressTab;