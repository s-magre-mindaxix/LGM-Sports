import React, { useEffect, useState } from "react";
import Select from "react-select";
import { getProducts } from "../Product/Services/ProductService";
import { toast } from "sonner";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";
import { saveProductVariant } from "./Services/ProductVariantService";
import type { ProductOption, ProductVariant } from "./Services/types";

interface WizardProps {
  editData: ProductVariant | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const initialData: ProductVariant = {
  id: 0,
  productId: 0,
  variantName: "",
  variantCode: "",
  attributes: "",
  active: true,
};

const normalizeProduct = (value: unknown): ProductOption | null => {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const id = Number(item.id ?? item.Id ?? item.productId ?? item.ProductId ?? 0);
  const productName = String(item.productName ?? item.ProductName ?? item.name ?? item.Name ?? "").trim();
  const productCode = String(item.productCode ?? item.ProductCode ?? "").trim();
  return Number.isInteger(id) && id > 0 && productName ? { id, productName, productCode } : null;
};

const createVariantCode = (product: ProductOption | undefined, variantName: string): string => {
  const productCode = product?.productCode?.trim().toUpperCase();
  const nameCode = variantName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  if (!productCode || !nameCode) return "";
  return `${productCode}-${nameCode}`.slice(0, 50);
};

const ProductVariantWizard: React.FC<WizardProps> = ({ editData, onSuccess, onCancel }) => {
  const [data, setData] = useState<ProductVariant>({ ...initialData });
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoadingProducts(true);
      try {
        const result = await getProducts();
        if (!mounted) return;
        const list = Array.isArray(result) ? result : [];
        setProducts(list.map(normalizeProduct).filter((item): item is ProductOption => item !== null));
      } catch (error) {
        if (!mounted) return;
        console.error("Failed to load products:", error);
        toast.error("Could not load products. Please try again.");
      } finally {
        if (mounted) setIsLoadingProducts(false);
      }
    };
    void load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    setData(editData ? { ...editData } : { ...initialData });
    setErrors({});
  }, [editData]);

  useEffect(() => {
    if (!data.productId || !data.variantName.trim()) return;
    const product = products.find((item) => item.id === data.productId);
    const variantCode = createVariantCode(product, data.variantName);
    setData((previous) => previous.variantCode === variantCode
      ? previous
      : { ...previous, variantCode });
  }, [data.productId, data.variantName, products]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setData((previous) => {
      if (name === "variantName") {
        const product = products.find((item) => item.id === previous.productId);
        return {
          ...previous,
          variantName: value,
          variantCode: createVariantCode(product, value),
        };
      }
      if (name === "active") {
        return { ...previous, active: (event.target as HTMLInputElement).checked };
      }
      return { ...previous, [name]: value };
    });
    setErrors((previous) => ({ ...previous, [name]: "" }));
  };

  const validate = (variant: ProductVariant = data) => {
    const next: Record<string, string> = {};
    if (!Number.isInteger(variant.productId) || variant.productId <= 0) next.productId = "Please select a product.";
    if (!variant.variantName.trim()) next.variantName = "Variant Name is required.";
    if (!variant.variantCode.trim()) next.variantCode = "Choose a product with a code and enter a variant name to generate the variant code.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (isSaving) return;
    const selectedProduct = products.find((item) => item.id === data.productId);
    const variantToSave = {
      ...data,
      variantCode: createVariantCode(selectedProduct, data.variantName),
    };
    if (!validate(variantToSave)) {
      toast.error("Please correct the highlighted fields.");
      return;
    }
    setData(variantToSave);
    setIsSaving(true);
    try {
      await saveProductVariant(variantToSave);
      toast.success(variantToSave.id > 0 ? "Product variant updated successfully!" : "Product variant created successfully!");
      onSuccess();
    } catch (error: unknown) {
      console.error("Product variant save error:", error);
      toast.error(error instanceof Error ? error.message : "Something went wrong while saving the product variant.");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
  const labelClass = "mb-1 block text-sm font-semibold text-gray-700";
  const productOptions = products.map((product) => ({
    value: product.id,
    label: product.productCode
      ? `${product.productName} (${product.productCode})`
      : product.productName,
  }));

  return <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
    <div className="bg-[#f07837] px-6 py-4 text-white"><h2 className="text-lg font-bold uppercase tracking-wide">{data.id > 0 ? "Update Product Variant" : "Add Product Variant"}</h2><p className="mt-1 text-xs text-white/80">Enter the product variant information below.</p></div>
    <div className="min-h-[300px] bg-white p-6 md:p-8">
      <div className="mb-6 border-b border-gray-200 pb-3"><h3 className="text-sm font-extrabold uppercase tracking-wide text-[#154068]">Variant Information</h3></div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="productId" className={labelClass}>Product <span className="text-red-500">*</span></label>
          <Select
            inputId="productId"
            options={productOptions}
            value={productOptions.find((option) => option.value === data.productId) || null}
            onChange={(option) => {
              const product = products.find((item) => item.id === (option?.value ?? 0));
              setData((previous) => ({
                ...previous,
                productId: option?.value ?? 0,
                variantCode: createVariantCode(product, previous.variantName),
              }));
              setErrors((previous) => ({ ...previous, productId: "" }));
            }}
            isLoading={isLoadingProducts}
            isSearchable
            isClearable
            placeholder={isLoadingProducts ? "Loading products..." : "Search and select a product"}
            noOptionsMessage={() => "No products found"}
            styles={{
              control: (base, state) => ({
                ...base,
                minHeight: 42,
                borderColor: errors.productId ? "#dc2626" : state.isFocused ? "#3b82f6" : "#d1d5db",
                boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
                "&:hover": { borderColor: errors.productId ? "#dc2626" : "#3b82f6" },
              }),
              menu: (base) => ({ ...base, zIndex: 50 }),
            }}
          />
          {errors.productId && <p className="mt-1 text-xs text-red-600">{errors.productId}</p>}
        </div>
        <div><label htmlFor="variantCode" className={labelClass}>Variant Code <span className="text-red-500">*</span></label><input id="variantCode" name="variantCode" value={data.variantCode} maxLength={50} readOnly className={`${inputClass} bg-gray-50`} placeholder="Generated from product code and variant name" />{errors.variantCode && <p className="mt-1 text-xs text-red-600">{errors.variantCode}</p>}</div>
        <div className="md:col-span-2"><label htmlFor="variantName" className={labelClass}>Variant Name <span className="text-red-500">*</span></label><input id="variantName" name="variantName" value={data.variantName} maxLength={100} onChange={handleChange} className={inputClass} placeholder="e.g. 500 ml bottle" />{errors.variantName && <p className="mt-1 text-xs text-red-600">{errors.variantName}</p>}</div>
        <div className="md:col-span-2"><label htmlFor="attributes" className={labelClass}>Attributes</label><textarea id="attributes" name="attributes" rows={4} value={data.attributes ?? ""} onChange={handleChange} className={inputClass} placeholder="Add variant attributes, such as size, color, or pack type" /></div>
        <div className="md:col-span-2"><label className="flex cursor-pointer items-center gap-3"><input type="checkbox" name="active" checked={data.active} onChange={handleChange} className="h-4 w-4 accent-blue-700" /><span className="text-sm font-semibold text-gray-700">Active Variant</span></label></div>
      </div>
    </div>
    <div className="flex flex-wrap justify-end gap-3 border-t bg-gray-50 p-5"><button type="button" onClick={onCancel} disabled={isSaving} className={buttonStyles.cancel}>Cancel</button><button type="button" onClick={() => void handleSave()} disabled={isSaving} className={buttonStyles.save}>{isSaving ? "Saving..." : data.id > 0 ? "Update" : "Save"}</button></div>
  </div>;
};

export default ProductVariantWizard;

