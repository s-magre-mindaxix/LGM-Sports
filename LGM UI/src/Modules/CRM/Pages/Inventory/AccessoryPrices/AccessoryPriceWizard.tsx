import React, { useEffect, useMemo, useRef, useState } from "react";

import type { AccessoryPrice } from "./services/types";
import { saveAccessoryPrice } from "./services/AccessoryPriceServices";
import { toast } from "sonner";
import { buttonStyles } from "../../../../../Components/Common/buttonStyles";

// Update these import paths if your API client/config files are in a different folder.
import  apiClient  from "../.././../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";

interface WizardProps {
  editData: AccessoryPrice | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface DropdownOption {
  id: number;
  name: string;
}

const emptyPrice: AccessoryPrice = {
  accessoryPriceId: 0,
  priceListId: 0,
  // accessoryId: 0,
  accessoriesId: 0,
  priceType: "",
  amount: 0,
  minQty: 1,
  effectiveFrom: new Date().toISOString().slice(0, 10),
  effectiveTo: null,
  isActive: true,
  isDeleted: false,
};

const dateInputValue = (value?: string | null) =>
  value ? value.slice(0, 10) : "";

const getArrayFromResponse = (response: any): any[] => {
  const payload = response?.data ?? response;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.$values)) return payload.$values;
  return [];
};

const firstDefined = (item: any, keys: string[]) => {
  for (const key of keys) {
    if (item?.[key] !== undefined && item?.[key] !== null) {
      return item[key];
    }
  }
  return undefined;
};

const mapOptions = (
  rows: any[],
  idKeys: string[],
  nameKeys: string[],
  fallback: string
): DropdownOption[] =>
  rows
    .map((item) => {
      const id = Number(firstDefined(item, idKeys));
      const rawName = firstDefined(item, nameKeys);
      const name = rawName == null || String(rawName).trim() === ""
        ? `${fallback} ${id}`
        : String(rawName).trim();

      return { id, name };
    })
    .filter((item) => Number.isInteger(item.id) && item.id > 0)
    .sort((a, b) => a.id - b.id);

interface SearchableDropdownProps {
  id: string;
  label: string;
  placeholder: string;
  value: number;
  options: DropdownOption[];
  loading: boolean;
  error?: string;
  disabled?: boolean;
  onChange: (id: number) => void;
  inputClass: string;
  labelClass: string;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  id,
  label,
  placeholder,
  value,
  options,
  loading,
  error,
  disabled = false,
  onChange,
  inputClass,
  labelClass,
}) => {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.id === Number(value));

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return options;

    return options.filter(
      (option) =>
        String(option.id).includes(query) ||
        option.name.toLowerCase().includes(query) ||
        `${option.id} - ${option.name}`.toLowerCase().includes(query)
    );
  }, [options, search]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        rootRef.current &&
        event.target instanceof Node &&
        !rootRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={rootRef}>
      <label className={labelClass} htmlFor={`${id}-search`}>
        {label}
      </label>

      <input
        id={`${id}-search`}
        type="text"
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={`${id}-options`}
        aria-autocomplete="list"
        value={
          isOpen
            ? search
            : selectedOption
              ? `${selectedOption.id} - ${selectedOption.name}`
              : ""
        }
        disabled={disabled || loading}
        onFocus={() => {
          setSearch("");
          setIsOpen(true);
        }}
        onClick={() => setIsOpen(true)}
        onChange={(event) => {
          setSearch(event.target.value);
          setIsOpen(true);
        }}
        className={inputClass}
        placeholder={
          loading
            ? `Loading ${label.toLowerCase()} options...`
            : selectedOption
              ? `${selectedOption.id} - ${selectedOption.name}`
              : placeholder
        }
      />

      {isOpen && !disabled && !loading && (
        <div
          id={`${id}-options`}
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                role="option"
                aria-selected={option.id === Number(value)}
                onClick={() => {
                  onChange(option.id);
                  setSearch("");
                  setIsOpen(false);
                }}
                className={`block w-full px-3 py-2 text-left text-sm hover:bg-orange-50 ${
                  option.id === Number(value)
                    ? "bg-orange-50 font-semibold text-[#154068]"
                    : "text-gray-700"
                }`}
              >
                {option.id} - {option.name}
              </button>
            ))
          ) : (
            <p className="px-3 py-2 text-sm text-gray-500">
              No matching options found.
            </p>
          )}
        </div>
      )}

      {loading && (
        <p className="mt-1 text-xs text-gray-500">Loading options...</p>
      )}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

const AccessoryPriceWizard: React.FC<WizardProps> = ({
  editData,
  onSuccess,
  onCancel,
}) => {
  const [data, setData] = useState<AccessoryPrice>({ ...emptyPrice });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [priceLists, setPriceLists] = useState<DropdownOption[]>([]);
  const [accessories, setAccessories] = useState<DropdownOption[]>([]);
  const [isLoadingPriceLists, setIsLoadingPriceLists] = useState(false);
  const [isLoadingAccessories, setIsLoadingAccessories] = useState(false);
  const [priceListLoadError, setPriceListLoadError] = useState("");
  const [accessoryLoadError, setAccessoryLoadError] = useState("");

  useEffect(() => {
    setData(
      editData
        ? {
            ...emptyPrice,
            ...editData,
            effectiveFrom: dateInputValue(editData.effectiveFrom),
            effectiveTo: dateInputValue(editData.effectiveTo) || null,
          }
        : { ...emptyPrice }
    );
    setErrors({});
  }, [editData]);

  // Load dropdown choices from the existing API endpoints.
  useEffect(() => {
    let cancelled = false;

    const loadPriceLists = async () => {
      setIsLoadingPriceLists(true);
      setPriceListLoadError("");

      try {
        const endpoint = API_ENDPOINTS.PriceList || "/PriceLists";
        const response = await apiClient.get(endpoint);
        const options = mapOptions(
          getArrayFromResponse(response),
          ["priceListId", "PriceListId", "id", "Id"],
          ["priceListName", "PriceListName", "name", "Name", "code", "Code"],
          "Price List"
        );

        if (!cancelled) {
          setPriceLists(options);
          if (options.length === 0) {
            setPriceListLoadError(
              "No price lists were returned. Check the Price List API response and field names."
            );
          }
        }
      } catch (error) {
        if (!cancelled) {
          setPriceListLoadError(
            error instanceof Error
              ? `Could not load price lists: ${error.message}`
              : "Could not load price lists."
          );
        }
      } finally {
        if (!cancelled) setIsLoadingPriceLists(false);
      }
    };

    const loadAccessories = async () => {
      setIsLoadingAccessories(true);
      setAccessoryLoadError("");

      try {
        const endpoint =
          API_ENDPOINTS.Accessories ||
          API_ENDPOINTS.Accessory ||
          "/Accessories";
        const response = await apiClient.get(endpoint);
        const options = mapOptions(
          getArrayFromResponse(response),
          ["accessoryId", "AccessoryId", "id", "Id", "accessoriesId", "AccessoriesId"],
          [
            "accessoryName",
            "AccessoryName",
            "name",
            "Name",
            "accessoriesName",
            "AccessoriesName",
            "description",
            "Description",
          ],
          "Accessory"
        );

        if (!cancelled) {
          setAccessories(options);
          if (options.length === 0) {
            setAccessoryLoadError(
              "No accessories were returned. Check the Accessories API response and field names."
            );
          }
        }
      } catch (error) {
        if (!cancelled) {
          setAccessoryLoadError(
            error instanceof Error
              ? `Could not load accessories: ${error.message}`
              : "Could not load accessories."
          );
        }
      } finally {
        if (!cancelled) setIsLoadingAccessories(false);
      }
    };

    void loadPriceLists();
    void loadAccessories();

    return () => {
      cancelled = true;
    };
  }, []);

  const update = (
    field: keyof AccessoryPrice,
    value: string | number | boolean | null
  ) => {
    setData((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};

    if (!Number.isInteger(Number(data.priceListId)) || Number(data.priceListId) <= 0) {
      next.priceListId = "Please select a valid Price List.";
    }

    if (!Number.isInteger(Number(data.accessoriesId)) || Number(data.accessoriesId) <= 0) {
      next.accessoriesId = "Please select a valid Accessories ID.";
    }

    // Kept because the existing AccessoryPrice type requires this separate field.
    // if (!Number.isInteger(Number(data.accessoriesId)) || Number(data.accessoriesId) <= 0) {
    //   next.accessoriesId = "Enter a valid Accessories ID.";
    // }

    if (!data.priceType.trim()) next.priceType = "Price Type is required.";

    if (!Number.isFinite(Number(data.amount)) || Number(data.amount) < 0) {
      next.amount = "Amount must be zero or greater.";
    }

    if (!Number.isInteger(Number(data.minQty)) || Number(data.minQty) < 1) {
      next.minQty = "Minimum quantity must be at least 1.";
    }

    if (!data.effectiveFrom) {
      next.effectiveFrom = "Effective From date is required.";
    }

    if (data.effectiveTo && data.effectiveFrom && data.effectiveTo < data.effectiveFrom) {
      next.effectiveTo = "Effective To must be on or after Effective From.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      toast.error("Please correct the highlighted fields.");
      return;
    }

    setIsSaving(true);

    try {
      await saveAccessoryPrice({
        ...data,
        // Dropdowns store numeric IDs; no display labels are submitted.
        priceListId: Number(data.priceListId),
        // accessoryId: Number(data.accessoryId),
        accessoriesId: Number(data.accessoriesId),
        amount: Number(data.amount),
        minQty: Number(data.minQty),
        effectiveFrom: `${dateInputValue(data.effectiveFrom)}T00:00:00`,
        effectiveTo: data.effectiveTo
          ? `${dateInputValue(data.effectiveTo)}T00:00:00`
          : null,
      });

      toast.success(
        data.accessoryPriceId > 0
          ? "Accessory price updated successfully!"
          : "Accessory price created successfully!"
      );
      onSuccess();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving the accessory price."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#f07837] focus:ring-2 focus:ring-[#f07837]/20 disabled:cursor-not-allowed disabled:bg-gray-100";

  const labelClass =
    "mb-1 block text-xs font-bold uppercase tracking-wide text-gray-600";

  const errorText = (field: string) =>
    errors[field] ? (
      <p className="mt-1 text-xs text-red-600">{errors[field]}</p>
    ) : null;

  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
      <header className="bg-[#f07837] px-6 py-4 text-white">
        <h2 className="text-lg font-bold uppercase tracking-wide">
          {data.accessoryPriceId > 0 ? "Update Accessory Price" : "Add Accessory Price"}
        </h2>
        <p className="mt-1 text-xs text-white/80">
          Enter the price and effective period below.
        </p>
      </header>

      <div className="p-5 sm:p-8">
        <h3 className="mb-5 border-b border-gray-200 pb-3 text-sm font-extrabold uppercase tracking-wide text-[#154068]">
          Price Information
        </h3>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <SearchableDropdown
            id="priceListId"
            label="Price List *"
            placeholder="Search by Price List ID or name..."
            value={Number(data.priceListId)}
            options={priceLists}
            loading={isLoadingPriceLists}
            error={errors.priceListId || priceListLoadError}
            onChange={(id) => update("priceListId", id)}
            inputClass={inputClass}
            labelClass={labelClass}
          />

          <SearchableDropdown
            id="accessoriesId"
            label="Accessories *"
            placeholder="Search by Accessories ID or name..."
            value={Number(data.accessoriesId)}
            options={accessories}
            loading={isLoadingAccessories}
            error={errors.accessoriesId || accessoryLoadError}
            onChange={(id) => update("accessoriesId", id)}
            inputClass={inputClass}
            labelClass={labelClass}
          />

          {/* <div>
            <label className={labelClass} htmlFor="accessoriesId">
              Accessories ID (record key) *
            </label>
            <input
              id="accessoriesId"
              type="number"
              min="1"
              value={data.accessoriesId || ""}
              onChange={(e) => update("accessoriesId", Number(e.target.value))}
              className={inputClass}
              placeholder="Enter Accessories ID"
            />
            {errorText("accessoriesId")}
          </div> */}

          <div>
            <label className={labelClass} htmlFor="priceType">Price Type *</label>
            <input
              id="priceType"
              maxLength={50}
              value={data.priceType}
              onChange={(e) => update("priceType", e.target.value)}
              className={inputClass}
              placeholder="e.g. Retail, Wholesale"
            />
            {errorText("priceType")}
          </div>

          <div>
            <label className={labelClass} htmlFor="amount">Amount *</label>
            <input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={data.amount}
              onChange={(e) =>
                update("amount", e.target.value === "" ? 0 : Number(e.target.value))
              }
              className={inputClass}
              placeholder="0.00"
            />
            {errorText("amount")}
          </div>

          <div>
            <label className={labelClass} htmlFor="minQty">Minimum Quantity *</label>
            <input
              id="minQty"
              type="number"
              min="1"
              step="1"
              value={data.minQty}
              onChange={(e) =>
                update("minQty", e.target.value === "" ? 0 : Number(e.target.value))
              }
              className={inputClass}
            />
            {errorText("minQty")}
          </div>

          <div>
            <label className={labelClass} htmlFor="effectiveFrom">Effective From *</label>
            <input
              id="effectiveFrom"
              type="date"
              value={dateInputValue(data.effectiveFrom)}
              onChange={(e) => update("effectiveFrom", e.target.value)}
              className={inputClass}
            />
            {errorText("effectiveFrom")}
          </div>

          <div>
            <label className={labelClass} htmlFor="effectiveTo">Effective To</label>
            <input
              id="effectiveTo"
              type="date"
              value={dateInputValue(data.effectiveTo)}
              onChange={(e) => update("effectiveTo", e.target.value || null)}
              className={inputClass}
            />
            {errorText("effectiveTo")}
          </div>

          <div className="md:col-span-2">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={data.isActive}
                onChange={(e) => update("isActive", e.target.checked)}
                className="h-4 w-4 accent-[#f07837]"
              />
              <span className="text-sm font-semibold text-gray-700">Active price</span>
            </label>
          </div>
        </div>
      </div>

      <footer className="flex flex-wrap justify-end gap-3 border-t bg-gray-50 p-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className={buttonStyles.cancel}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving}
          className={buttonStyles.save}
        >
          {isSaving ? "Saving..." : data.accessoryPriceId > 0 ? "Update" : "Save"}
        </button>
      </footer>
    </div>
  );
};

export default AccessoryPriceWizard;
