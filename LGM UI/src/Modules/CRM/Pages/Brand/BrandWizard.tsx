
// import React, { useEffect, useState } from "react";
// import { FaTag } from "react-icons/fa";
// import { toast } from "sonner";
// import axios from "axios";

// import type { Brand } from "./Services/types";
// import { saveBrand } from "./Services/BrandServices";
// import { buttonStyles } from "../../../../Components/Common/buttonStyles";

// interface BrandWizardProps {
//     editData: Brand | null;
//     onSuccess: () => void;
//     onCancel: () => void;
// }

// const initialData: Brand = {
//     brandId: 0,
//     code: "",
//     name: "",
//     description: "",
//     isActive: true,
// };

// const BrandWizard: React.FC<BrandWizardProps> = ({
//     editData,
//     onSuccess,
//     onCancel,
// }) => {
//     const [data, setData] = useState<Brand>({ ...initialData });
//     const [errors, setErrors] = useState<Record<string, string>>({});
//     const [isSaving, setIsSaving] = useState(false);

//     useEffect(() => {
//         setData(
//             editData
//                 ? {
//                       ...initialData,
//                       ...editData,
//                       description: editData.description ?? "",
//                   }
//                 : { ...initialData }
//         );

//         setErrors({});
//     }, [editData]);

//     const handleChange = (
//         e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//     ) => {
//         const { name, value } = e.target;

//         setData((prev) => ({
//             ...prev,
//             [name]: value,
//         }));

//         setErrors((prev) => ({
//             ...prev,
//             [name]: "",
//         }));
//     };

//     const handleActiveChange = (
//         e: React.ChangeEvent<HTMLInputElement>
//     ) => {
//         setData((prev) => ({
//             ...prev,
//             isActive: e.target.checked,
//         }));
//     };

//     const validate = (): boolean => {
//         const nextErrors: Record<string, string> = {};

//         if (!data.code.trim()) {
//             nextErrors.code = "Code is required.";
//         }

//         if (!data.name.trim()) {
//             nextErrors.name = "Name is required.";
//         }

//         setErrors(nextErrors);

//         if (Object.keys(nextErrors).length > 0) {
//             toast.error("Please fill in all required fields.");
//             return false;
//         }

//         return true;
//     };

//     const handleSubmit = async (
//         e: React.FormEvent<HTMLFormElement>
//     ) => {
//         e.preventDefault();

//         if (isSaving || !validate()) {
//             return;
//         }

//         const payload: Brand = {
//             ...data,
//             code: data.code.trim(),
//             name: data.name.trim(),
//             description: data.description.trim(),
//             isActive: data.isActive,
//         };

//         try {
//             setIsSaving(true);

//             console.log("Saving Brand payload:", payload);

//             await saveBrand(payload);

//             toast.success(
//                 data.brandId > 0
//                     ? "Brand updated successfully."
//                     : "Brand created successfully."
//             );

//             onSuccess();
//         } catch (error: unknown) {
//             console.error("Brand save error:", error);

//             if (axios.isAxiosError(error)) {
//                 const status = error.response?.status;
//                 const responseData = error.response?.data;

//                 console.error("Brand API URL:", error.config?.url);
//                 console.error("HTTP method:", error.config?.method);
//                 console.error("HTTP status:", status);
//                 console.error("Backend response:", responseData);
//                 console.error("Request payload:", error.config?.data);

//                 const backendMessage =
//                     typeof responseData === "string"
//                         ? responseData
//                         : responseData?.message ||
//                           responseData?.title ||
//                           responseData?.detail ||
//                           (responseData?.errors
//                               ? Object.values(
//                                     responseData.errors
//                                 )
//                                     .flat()
//                                     .join(" ")
//                               : null);

//                 if (status === 400) {
//                     toast.error(
//                         backendMessage ||
//                             "Invalid brand data. Please check the required fields."
//                     );
//                 } else if (status === 404) {
//                     toast.error(
//                         "Brand API endpoint not found. Check the API URL."
//                     );
//                 } else if (status === 409) {
//                     toast.error(
//                         backendMessage ||
//                             "A brand with this code may already exist."
//                     );
//                 } else if (status === 500) {
//                     toast.error(
//                         backendMessage ||
//                             "Server error while saving the brand. Check the backend logs."
//                     );
//                 } else if (!error.response) {
//                     toast.error(
//                         "Cannot connect to the API. Check whether the backend is running."
//                     );
//                 } else {
//                     toast.error(
//                         backendMessage ||
//                             `Failed to save brand. HTTP status: ${status}`
//                     );
//                 }
//             } else {
//                 toast.error(
//                     error instanceof Error
//                         ? error.message
//                         : "An unexpected error occurred while saving the brand."
//                 );
//             }
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     const inputClass =
//         "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

//     const labelClass =
//         "mb-1 block text-sm font-semibold text-gray-700";

//     return (
//         <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
//             <div className="flex items-center gap-3 bg-[#f07837] px-6 py-4 text-white">
//                 <FaTag className="text-xl" />

//                 <div>
//                     <h2 className="text-lg font-bold uppercase">
//                         {data.brandId > 0
//                             ? "Update Brand"
//                             : "Add Brand"}
//                     </h2>

//                     <p className="mt-1 text-xs text-blue-100">
//                         Enter brand information below.
//                     </p>
//                 </div>
//             </div>

//             <form onSubmit={handleSubmit}>
//                 <div className="p-6 md:p-8">
//                     <h3 className="mb-6 border-b border-gray-200 pb-3 text-sm font-extrabold uppercase tracking-wide text-[#154068]">
//                         Brand Information
//                     </h3>

//                     <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
//                         {/* Code */}
//                         <div>
//                             <label
//                                 htmlFor="code"
//                                 className={labelClass}
//                             >
//                                 Code <span className="text-red-500">*</span>
//                             </label>

//                             <input
//                                 id="code"
//                                 name="code"
//                                 type="text"
//                                 maxLength={50}
//                                 value={data.code}
//                                 onChange={handleChange}
//                                 className={inputClass}
//                                 placeholder="Enter Brand Code"
//                                 required
//                             />

//                             {errors.code && (
//                                 <p className="mt-1 text-xs text-red-600">
//                                     {errors.code}
//                                 </p>
//                             )}
//                         </div>

//                         {/* Name */}
//                         <div>
//                             <label
//                                 htmlFor="name"
//                                 className={labelClass}
//                             >
//                                 Name <span className="text-red-500">*</span>
//                             </label>

//                             <input
//                                 id="name"
//                                 name="name"
//                                 type="text"
//                                 maxLength={100}
//                                 value={data.name}
//                                 onChange={handleChange}
//                                 className={inputClass}
//                                 placeholder="Enter Brand Name"
//                                 required
//                             />

//                             {errors.name && (
//                                 <p className="mt-1 text-xs text-red-600">
//                                     {errors.name}
//                                 </p>
//                             )}
//                         </div>

//                         {/* Description */}
//                         <div className="md:col-span-2">
//                             <label
//                                 htmlFor="description"
//                                 className={labelClass}
//                             >
//                                 Description
//                             </label>

//                             <textarea
//                                 id="description"
//                                 name="description"
//                                 rows={3}
//                                 maxLength={500}
//                                 value={data.description}
//                                 onChange={handleChange}
//                                 className={inputClass}
//                                 placeholder="Enter Description"
//                             />
//                         </div>

//                         {/* Active */}
//                         <div className="md:col-span-2">
//                             <label className="flex cursor-pointer items-center gap-3">
//                                 <input
//                                     type="checkbox"
//                                     name="isActive"
//                                     checked={data.isActive}
//                                     onChange={handleActiveChange}
//                                     className="h-4 w-4 accent-blue-700"
//                                 />

//                                 <span className="text-sm font-semibold text-gray-700">
//                                     Active
//                                 </span>
//                             </label>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Footer */}
//                 <div className="flex flex-wrap justify-end gap-3 border-t bg-gray-50 p-5">
//                     <button
//                         type="button"
//                         onClick={onCancel}
//                         disabled={isSaving}
//                         className={buttonStyles.cancel}
//                     >
//                         Cancel
//                     </button>

//                     <button
//                         type="submit"
//                         disabled={isSaving}
//                         className={buttonStyles.save}
//                     >
//                         {isSaving
//                             ? "Saving..."
//                             : data.brandId > 0
//                               ? "Update"
//                               : "Save"}
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default BrandWizard;



import React, { useEffect, useRef, useState } from "react";
import { FaTag } from "react-icons/fa";
import { toast } from "sonner";
import axios from "axios";

import type { Brand } from "./Services/types";
import { getGeneratedBrandCode, saveBrand } from "./Services/BrandServices";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";

interface BrandWizardProps {
    editData: Brand | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const initialData: Brand = {
    brandId: 0,
    code: "",
    name: "",
    description: "",
    isActive: true,
};

const BrandWizard: React.FC<BrandWizardProps> = ({ editData, onSuccess, onCancel }) => {
    const [data, setData] = useState<Brand>({ ...initialData });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isGeneratingCode, setIsGeneratingCode] = useState(false);
    const codeRequestRef = useRef(0);

    useEffect(() => {
        codeRequestRef.current += 1;
        setData(
            editData
                ? {
                      ...initialData,
                      ...editData,
                      description: editData.description ?? "",
                  }
                : { ...initialData },
        );
        setErrors({});
        setIsGeneratingCode(false);
    }, [editData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setData((prev) => ({
            ...prev,
            [name]: value,
            // Re-generate the code whenever the brand name changes.
            ...(name === "name" ? { code: "" } : {}),
        }));

        setErrors((prev) => ({ ...prev, [name]: "" }));

        if (name === "name") {
            const requestId = ++codeRequestRef.current;
            const brandName = value;

            if (!brandName.trim()) {
                setData((prev) => ({ ...prev, code: "" }));
                setIsGeneratingCode(false);
                return;
            }

            setIsGeneratingCode(true);
            void getGeneratedBrandCode(brandName, editData?.brandId ?? 0)
                .then((generatedCode) => {
                    if (requestId !== codeRequestRef.current) return;
                    setData((prev) => ({ ...prev, code: generatedCode }));
                })
                .catch((error) => {
                    if (requestId !== codeRequestRef.current) return;
                    console.error("Failed to generate brand code:", error);
                    setData((prev) => ({ ...prev, code: "" }));
                    toast.error("Could not generate Brand Code. Please try again.");
                })
                .finally(() => {
                    if (requestId === codeRequestRef.current) setIsGeneratingCode(false);
                });
        }
    };

    const handleActiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData((prev) => ({ ...prev, isActive: e.target.checked }));
    };

    const validate = (): boolean => {
        const nextErrors: Record<string, string> = {};

        if (!data.code.trim()) nextErrors.code = "Code is required.";
        if (!data.name.trim()) nextErrors.name = "Name is required.";

        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            toast.error("Please fill in all required fields.");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isSaving || isGeneratingCode || !validate()) return;

        const payload: Brand = {
            ...data,
            code: data.code.trim(),
            name: data.name.trim(),
            description: data.description.trim(),
            isActive: data.isActive,
        };

        try {
            setIsSaving(true);
            console.log("Saving Brand payload:", payload);
            await saveBrand(payload);

            toast.success(data.brandId > 0 ? "Brand updated successfully." : "Brand created successfully.");
            onSuccess();
        } catch (error: unknown) {
            console.error("Brand save error:", error);

            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                const responseData = error.response?.data;
                console.error("Brand API URL:", error.config?.url);
                console.error("HTTP method:", error.config?.method);
                console.error("HTTP status:", status);
                console.error("Backend response:", responseData);
                console.error("Request payload:", error.config?.data);

                const backendMessage =
                    typeof responseData === "string"
                        ? responseData
                        : responseData?.message ||
                          responseData?.title ||
                          responseData?.detail ||
                          (responseData?.errors
                              ? Object.values(responseData.errors).flat().join(" ")
                              : null);

                if (status === 400) {
                    toast.error(backendMessage || "Invalid brand data. Please check the required fields.");
                } else if (status === 404) {
                    toast.error("Brand API endpoint not found. Check the API URL.");
                } else if (status === 409) {
                    toast.error(backendMessage || "A brand with this code may already exist.");
                } else if (status === 500) {
                    toast.error(backendMessage || "Server error while saving the brand. Check the backend logs.");
                } else if (!error.response) {
                    toast.error("Cannot connect to the API. Check whether the backend is running.");
                } else {
                    toast.error(backendMessage || `Failed to save brand. HTTP status: ${status}`);
                }
            } else {
                toast.error(error instanceof Error ? error.message : "An unexpected error occurred while saving the brand.");
            }
        } finally {
            setIsSaving(false);
        }
    };

    const inputClass = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
    const labelClass = "mb-1 block text-sm font-semibold text-gray-700";

    return (
        <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-center gap-3 bg-[#f07837] px-6 py-4 text-white">
                <FaTag className="text-xl" />
                <div>
                    <h2 className="text-lg font-bold uppercase">
                        {data.brandId > 0 ? "Update Brand" : "Add Brand"}
                    </h2>
                    <p className="mt-1 text-xs text-blue-100">Enter brand information below.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="p-6 md:p-8">
                    <h3 className="mb-6 border-b border-gray-200 pb-3 text-sm font-extrabold uppercase tracking-wide text-[#154068]">
                        Brand Information
                    </h3>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                            <label htmlFor="code" className={labelClass}>
                                Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="code"
                                name="code"
                                type="text"
                                maxLength={50}
                                value={isGeneratingCode ? "Generating..." : data.code}
                                className={`${inputClass} bg-gray-100`}
                                placeholder="Generated from Brand Name"
                                readOnly
                                required
                            />
                            {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code}</p>}
                        </div>

                        <div>
                            <label htmlFor="name" className={labelClass}>
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                maxLength={100}
                                value={data.name}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="Enter Brand Name"
                                required
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="description" className={labelClass}>Description</label>
                            <textarea
                                id="description"
                                name="description"
                                rows={3}
                                maxLength={500}
                                value={data.description}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="Enter Description"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="flex cursor-pointer items-center gap-3">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={data.isActive}
                                    onChange={handleActiveChange}
                                    className="h-4 w-4 accent-blue-700"
                                />
                                <span className="text-sm font-semibold text-gray-700">Active</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap justify-end gap-3 border-t bg-gray-50 p-5">
                    <button type="button" onClick={onCancel} disabled={isSaving} className={buttonStyles.cancel}>
                        Cancel
                    </button>
                    <button type="submit" disabled={isSaving || isGeneratingCode} className={buttonStyles.save}>
                        {isSaving ? "Saving..." : data.brandId > 0 ? "Update" : "Save"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BrandWizard;
