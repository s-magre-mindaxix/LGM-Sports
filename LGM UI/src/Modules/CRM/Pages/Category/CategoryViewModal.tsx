import React from "react";
import type { CategoryListItem } from "./Services/types";
import {
  FaTimes,
  FaLayerGroup,
  FaInfoCircle,
  FaSitemap,
  FaAlignLeft,
} from "react-icons/fa";

interface CategoryViewModalProps {
  category: CategoryListItem;
  onClose: () => void;
}

const CategoryViewModal: React.FC<CategoryViewModalProps> = ({
  category,
  onClose,
}) => {
  const DataItem = ({
    label,
    value,
    fullWidth = false,
  }: {
    label: string;
    value?: string | number | null;
    fullWidth?: boolean;
  }) => (
    <div
      className={`flex flex-col border-b border-gray-100 py-3 ${
        fullWidth ? "col-span-full" : ""
      }`}
    >
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </span>
      <span className="break-words text-sm font-semibold text-[#0b2c52]">
        {value !== null && value !== undefined && value !== ""
          ? value
          : "N/A"}
      </span>
    </div>
  );

  const SectionHeader = ({
    icon: Icon,
    title,
  }: {
    icon: React.ElementType;
    title: string;
  }) => (
    <div className="mb-4 mt-2 flex items-center gap-2">
      <Icon className="text-lg text-[#0b2c52]" />
      <h3 className="grow border-b-2 border-blue-100 pb-1 text-sm font-extrabold uppercase tracking-tight text-[#0b2c52]">
        {title}
      </h3>
    </div>
  );

  const parentLabel = category.parentCategoryName
    ? category.parentCategoryName
    : category.parentCategoryId
      ? `Category ID: ${category.parentCategoryId}`
      : "None";

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-modal-title"
        className="flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between bg-[#f07837] p-5 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white shadow-inner">
              <FaLayerGroup className="text-3xl text-[#0b2c52]" />
            </div>
            <div>
              <h2
                id="category-modal-title"
                className="text-xl font-bold uppercase tracking-tight sm:text-2xl"
              >
                {category.categoryName || "Category Details"}
              </h2>
              <p className="mt-1 font-mono text-xs tracking-widest text-blue-100">
                Category Code: {category.code || "N/A"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 p-2 transition-transform duration-300 hover:rotate-90"
            title="Close"
            aria-label="Close category details"
          >
            <FaTimes className="text-2xl" />
          </button>
        </header>

        <div className="overflow-y-auto bg-gray-50/50 p-5 sm:p-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <SectionHeader icon={FaInfoCircle} title="Category Information" />
              <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                <DataItem label="Category ID" value={category.categoryId} />
                <DataItem label="Category Code" value={category.code} />
                <DataItem label="Category Name" value={category.categoryName} />
                <DataItem
                  label="Status"
                  value={category.isActive ? "Active" : "Inactive"}
                />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    category.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {category.isActive ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>
            </section>

            <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <SectionHeader icon={FaSitemap} title="Parent Category" />
              <div className="grid grid-cols-1">
                <DataItem
                  label="Parent Category"
                  value={parentLabel}
                  fullWidth
                />
                <DataItem
                  label="Parent Category ID"
                  value={category.parentCategoryId ?? "None"}
                />
              </div>
            </section>

            <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm md:col-span-2">
              <SectionHeader icon={FaAlignLeft} title="Description" />
              <div className="grid grid-cols-1">
                <DataItem
                  label="Category Description"
                  value={category.description || "N/A"}
                  fullWidth
                />
              </div>
            </section>
          </div>
        </div>

        <footer className="flex items-center justify-between gap-4 border-t border-gray-100 bg-white p-5">
          <p className="text-[10px] font-bold uppercase text-gray-400">
            Official Category Details
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#f07837] px-8 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg transition-colors hover:bg-black"
          >
            Close View
          </button>
        </footer>
      </div>
    </div>
  );
};

export default CategoryViewModal;

