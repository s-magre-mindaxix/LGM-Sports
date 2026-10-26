// import React, { useState, useEffect } from "react";
// import type { ProductType } from "./Services/types";


// interface Props {
//   onCancel: () => void;
//   onSave: (data: ProductType) => void;
//   editData: ProductType | null;
// }

// const ProductTypeForm: React.FC<Props> = ({ onCancel, onSave, editData }) => {
//   const [name, setName] = useState("");

//   useEffect(() => {
//     setName(editData ? editData.productTypeName : "");
//   }, [editData]);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!name.trim()) return;
//     onSave({ id: editData?.id || 0, productTypeName: name.trim() });
//   };

//   return (
//     <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2">
//       <div className="border-b bg-gray-50 px-6 py-3">
//         <h3 className="font-bold text-gray-700">
//             {editData ? "Edit Product Type" : "Add New Product Type"}
//         </h3>
//       </div>
//       <form onSubmit={handleSubmit} className="p-6">
//         <div className="max-w-xl">
//             <label className="block text-sm font-medium text-gray-600 mb-2">Product Type</label>
//             <input
//               autoFocus
//               className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition"
//               placeholder="Enter Product Type"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//             />
//         </div>
        
//         <div className="flex justify-start gap-3 mt-6">
//           <button type="submit" className="bg-green-700 text-white px-8 py-2 rounded-lg font-semibold hover:bg-green-800 transition shadow-md">
//             {editData ? "Update" : "Add"}
//           </button>
//           <button type="button" onClick={onCancel} className="bg-gray-500 text-white px-8 py-2 rounded-lg font-semibold hover:bg-gray-600 transition shadow-md">
//             Cancel
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default ProductTypeForm;


import React, { useState, useEffect } from "react";
import type { ProductType } from "./Services/types";
import { saveProductType } from "./Services/ProductTypeService";
import { toast } from "sonner";

interface Props {
  onCancel: () => void;
  onSave: (data: ProductType) => void;
  editData: ProductType | null;
}

const ProductTypeForm: React.FC<Props> = ({ onCancel, onSave, editData }) => {
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(editData ? editData.productTypeName : "");
  }, [editData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Please enter product type");

    setIsSaving(true);
    try {
      const payload = { id: editData?.id || 0, productTypeName: name.trim() };
      await saveProductType(payload);
      toast.success("Type saved successfully");
      onSave(payload);
    } catch (error) {
      toast.error("Error saving type");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2">
      <div className="border-b bg-gray-50 px-6 py-3">
        <h3 className="font-bold text-gray-700">{editData ? "Edit Product Type" : "Add New Product Type"}</h3>
      </div>
      <form onSubmit={handleSubmit} className="p-6">
        <div className="max-w-xl">
            <label className="block text-sm font-medium text-gray-600 mb-2">Product Type</label>
            <input
              autoFocus
              className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:border-blue-500 transition"
              placeholder="Enter product type"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
        </div>
        <div className="flex justify-start gap-3 mt-6">
          <button type="submit" disabled={isSaving} className="bg-green-700 text-white px-8 py-2 rounded-lg font-semibold hover:bg-green-800 disabled:bg-gray-400">
            {isSaving ? "Saving..." : (editData ? "Update" : "Add")}
          </button>
          <button type="button" onClick={onCancel} className="bg-gray-500 text-white px-8 py-2 rounded-lg font-semibold">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default ProductTypeForm;