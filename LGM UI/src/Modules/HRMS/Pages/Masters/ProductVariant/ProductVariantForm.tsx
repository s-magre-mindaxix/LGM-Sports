// import React, { useState, useEffect } from "react";
// import type { ProductVariant } from "./Services/types";



// interface Props {
//   onCancel: () => void;
//   onSave: (data: ProductVariant) => void;
//   editData: ProductVariant | null;
// }

// const ProductVariantForm: React.FC<Props> = ({ onCancel, onSave, editData }) => {
//   const [name, setName] = useState("");

//   useEffect(() => {
//     setName(editData ? editData.variantName : "");
//   }, [editData]);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!name.trim()) return;
//     onSave({ id: editData?.id || 0, variantName: name.trim() });
//   };

//   return (
//     <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2">
//       <div className="border-b bg-gray-50 px-6 py-3">
//         <h3 className="font-bold text-gray-700">
//             {editData ? "Edit Variant" : "Add New Variant"}
//         </h3>
//       </div>
//       <form onSubmit={handleSubmit} className="p-6">
//         <div className="max-w-xl">
//             <label className="block text-sm font-medium text-gray-600 mb-2">Variant Name</label>
//             <input
//               autoFocus
//               className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition"
//               placeholder="Enter Variant"
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

// export default ProductVariantForm;


import React, { useState, useEffect } from "react";
import type { ProductVariant } from "./Services/types";
import { saveProductVariant } from "./Services/ProductVariantService";
import { toast } from "sonner";

interface Props {
  onCancel: () => void;
  onSave: (data: ProductVariant) => void;
  editData: ProductVariant | null;
}

const ProductVariantForm: React.FC<Props> = ({ onCancel, onSave, editData }) => {
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(editData ? editData.variantName : "");
  }, [editData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      const payload = { id: editData?.id || 0, variantName: name.trim() };
      await saveProductVariant(payload);
      toast.success("Variant saved");
      onSave(payload);
    } catch (error) { toast.error("Error saving variant"); }
    finally { setIsSaving(false); }
  };

  return (
     <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2">
      <div className="border-b bg-gray-50 px-6 py-3">
        <h3 className="font-bold text-gray-700">{editData ? "Edit Variant" : "Add New Variant"}</h3>
      </div>
      <form onSubmit={handleSubmit} className="p-6">
        <div className="max-w-xl">
            <label className="block text-sm font-medium text-gray-600 mb-2">Variant Name</label>
            <input autoFocus className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:border-blue-500" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="flex gap-3 mt-6">
          <button type="submit" disabled={isSaving} className="bg-green-700 text-white px-8 py-2 rounded-lg font-semibold disabled:bg-gray-400">{isSaving ? "Saving..." : "Save"}</button>
          <button type="button" onClick={onCancel} className="bg-gray-500 text-white px-8 py-2 rounded-lg">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default ProductVariantForm;