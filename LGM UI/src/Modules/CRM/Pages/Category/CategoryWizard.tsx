import React, { useEffect, useRef, useState } from "react";
import type { Category, CategoryListItem } from "./Services/types";
import {
  getCategories,
  getGeneratedCategoryCode,
  saveCategory,
} from "./Services/CategoryServices";
import { toast } from "sonner";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";

interface CategoryWizardProps {
  editData: Category | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const emptyCategory: Category = {
  categoryId: 0,
  code: "",
  categoryName: "",
  parentCategoryId: null,
  description: "",
  isActive: true,
  isDeleted: false,
};

const CategoryWizard: React.FC<CategoryWizardProps> = ({
  editData,
  onSuccess,
  onCancel,
}) => {
  const [data, setData] = useState<Category>({ ...emptyCategory });
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [parentSearch, setParentSearch] = useState("");
  const [isParentOpen, setIsParentOpen] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const codeRequestRef = useRef(0);

  useEffect(() => {
    codeRequestRef.current += 1;
    setData(editData ? { ...emptyCategory, ...editData } : { ...emptyCategory });
    setErrors({});
    setParentSearch("");
    setIsGeneratingCode(false);
  }, [editData]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setIsLoadingCategories(true);
      try {
        const result = await getCategories();
        if (mounted) setCategories(result);
      } catch (error: unknown) {
        if (!mounted) return;
        console.error("Failed to load categories:", error);
        toast.error("Could not load categories.");
      } finally {
        if (mounted) setIsLoadingCategories(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!data.parentCategoryId) return;
    const selected = categories.find(
      (category) => category.categoryId === data.parentCategoryId,
    );
    if (selected) {
      setParentSearch(`${selected.code} - ${selected.categoryName}`);
    }
  }, [categories, data.parentCategoryId]);

  const parents = categories
    .filter((category) => category.categoryId !== data.categoryId)
    .filter((category) =>
      `${category.code} ${category.categoryName}`
        .toLowerCase()
        .includes(parentSearch.trim().toLowerCase()),
    );

  const update = (
    field: keyof Category,
    value: string | number | boolean | null,
  ) => {
    setData((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: "" }));
  };

  const handleCategoryNameChange = (categoryName: string) => {
    update("categoryName", categoryName);

    const requestId = ++codeRequestRef.current;
    if (!categoryName.trim()) {
      setData((previous) => ({ ...previous, code: "" }));
      setIsGeneratingCode(false);
      return;
    }

    setIsGeneratingCode(true);
    void getGeneratedCategoryCode(categoryName, editData?.categoryId ?? 0)
      .then((generatedCode) => {
        if (requestId !== codeRequestRef.current) return;
        setData((previous) => ({ ...previous, code: generatedCode }));
      })
      .catch((error: unknown) => {
        if (requestId !== codeRequestRef.current) return;
        console.error("Failed to generate category code:", error);
        setData((previous) => ({ ...previous, code: "" }));
        toast.error("Could not generate Category Code. Please try again.");
      })
      .finally(() => {
        if (requestId === codeRequestRef.current) setIsGeneratingCode(false);
      });
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!data.code.trim()) next.code = "Category code is required.";
    if (data.code.trim().length > 50) {
      next.code = "Code cannot exceed 50 characters.";
    }
    if (!data.categoryName.trim()) {
      next.categoryName = "Category name is required.";
    }
    if (data.categoryName.trim().length > 150) {
      next.categoryName = "Category name cannot exceed 150 characters.";
    }
    if (data.description.length > 500) {
      next.description = "Description cannot exceed 500 characters.";
    }
    if (data.parentCategoryId === data.categoryId && data.categoryId > 0) {
      next.parentCategoryId = "A category cannot be its own parent.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (isSaving || isGeneratingCode) return;
    if (!validate()) {
      toast.error("Please correct the highlighted fields.");
      return;
    }

    setIsSaving(true);
    try {
      await saveCategory(data);
      toast.success(
        data.categoryId > 0
          ? "Category updated successfully!"
          : "Category created successfully!",
      );
      onSuccess();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving the category.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
  const labelClass = "mb-1 block text-sm font-semibold text-gray-700";
  const errorText = (key: string) =>
    errors[key] ? <p className="mt-1 text-xs text-red-600">{errors[key]}</p> : null;

  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
      <header className="bg-[#f07837] px-6 py-4 text-white">
        <h2 className="text-lg font-bold uppercase tracking-wide">
          {data.categoryId > 0 ? "Update Category" : "Add Category"}
        </h2>
        <p className="mt-1 text-xs text-white/80">
          Enter category details and optionally choose a parent category.
        </p>
      </header>

      <div className="min-h-[300px] bg-white p-6 md:p-8">
        <div className="mb-6 border-b border-gray-200 pb-3">
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#154068]">
            Category Information
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="code" className={labelClass}>
              Category Code <span className="text-red-500">*</span>
            </label>
            <input
              id="code"
              name="code"
              type="text"
              maxLength={50}
              value={isGeneratingCode ? "Generating..." : data.code}
              readOnly
              className={`${inputClass} bg-gray-100`}
              placeholder="Generated from Category Name"
            />
            {errorText("code")}
          </div>

          <div>
            <label htmlFor="categoryName" className={labelClass}>
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              id="categoryName"
              name="categoryName"
              type="text"
              maxLength={150}
              value={data.categoryName}
              onChange={(event) => handleCategoryNameChange(event.target.value)}
              className={inputClass}
              placeholder="Enter category name"
            />
            {errorText("categoryName")}
          </div>

          <div className="relative">
            <label htmlFor="parentCategory" className={labelClass}>
              Parent Category <span className="text-gray-500">(optional)</span>
            </label>
            <input
              id="parentCategory"
              type="text"
              role="combobox"
              aria-expanded={isParentOpen}
              aria-controls="parent-category-options"
              autoComplete="off"
              value={parentSearch}
              onFocus={() => setIsParentOpen(true)}
              onChange={(event) => {
                setParentSearch(event.target.value);
                setData((previous) => ({ ...previous, parentCategoryId: null }));
                setErrors((previous) => ({ ...previous, parentCategoryId: "" }));
                setIsParentOpen(true);
              }}
              onBlur={() => window.setTimeout(() => setIsParentOpen(false), 150)}
              className={inputClass}
              placeholder={isLoadingCategories ? "Loading categories..." : "Search parent category"}
            />
            {isParentOpen && (
              <ul
                id="parent-category-options"
                role="listbox"
                className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg"
              >
                <li>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setData((previous) => ({ ...previous, parentCategoryId: null }));
                      setParentSearch("");
                      setIsParentOpen(false);
                      setErrors((previous) => ({ ...previous, parentCategoryId: "" }));
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-500 hover:bg-orange-50"
                  >
                    No parent category
                  </button>
                </li>
                {parents.map((category) => (
                  <li key={category.categoryId} role="option">
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        setData((previous) => ({
                          ...previous,
                          parentCategoryId: category.categoryId,
                        }));
                        setParentSearch(`${category.code} - ${category.categoryName}`);
                        setIsParentOpen(false);
                        setErrors((previous) => ({ ...previous, parentCategoryId: "" }));
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-orange-50"
                    >
                      <span className="font-semibold">{category.code}</span>
                      <span className="text-gray-600"> — {category.categoryName}</span>
                    </button>
                  </li>
                ))}
                {parents.length === 0 && (
                  <li className="px-3 py-2 text-sm text-gray-500">
                    {isLoadingCategories ? "Loading..." : "No categories found."}
                  </li>
                )}
              </ul>
            )}
            {errorText("parentCategoryId")}
          </div>

          <div>
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              maxLength={500}
              value={data.description}
              onChange={(event) => update("description", event.target.value)}
              className={inputClass}
              placeholder="Enter category description"
            />
            {errorText("description")}
          </div>

          <div className="md:col-span-2">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={data.isActive}
                onChange={(event) => update("isActive", event.target.checked)}
                className="h-4 w-4 accent-blue-700"
              />
              <span className="text-sm font-semibold text-gray-700">
                Active Category
              </span>
            </label>
          </div>
        </div>
      </div>

      <footer className="flex flex-wrap justify-end gap-3 border-t bg-gray-50 p-5">
        <button type="button" onClick={onCancel} disabled={isSaving} className={buttonStyles.cancel}>
          Cancel
        </button>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving || isGeneratingCode}
          className={buttonStyles.save}
        >
          {isSaving
            ? "Saving..."
            : data.categoryId > 0
              ? "Update"
              : "Save"}
        </button>
      </footer>
    </div>
  );
};

export default CategoryWizard;

