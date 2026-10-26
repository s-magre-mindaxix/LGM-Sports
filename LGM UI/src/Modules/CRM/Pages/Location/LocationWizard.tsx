
import React, { useEffect, useRef, useState } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { toast } from "sonner";

import type { Location } from "./Services/types";
import { getGeneratedLocationCode, saveLocation } from "./Services/LocationServices";

import { getWarehouses } from "../Warehouse/Services/WarehouseServices";
import type { WarehouseListItem } from "../Warehouse/Services/types";

import { buttonStyles } from "../../../../Components/Common/buttonStyles";

interface LocationWizardProps {
  editData: Location | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const initialData: Location = {
  locationId: 0,
  warehouseId: 0,
  code: "",
  zone: "",
  rack: "",
  shelf: "",
  bin: "",
  isActive: true,
};

const LocationWizard: React.FC<LocationWizardProps> = ({
  editData,
  onSuccess,
  onCancel,
}) => {
  const [data, setData] = useState<Location>({ ...initialData });
  const [warehouses, setWarehouses] = useState<WarehouseListItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const codeRequestRef = useRef(0);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);

  useEffect(() => {
    codeRequestRef.current += 1;
    setIsGeneratingCode(false);
    setData(
      editData
        ? {
            ...initialData,
            ...editData,
            code: editData.code ?? "",
            zone: editData.zone ?? "",
            rack: editData.rack ?? "",
            shelf: editData.shelf ?? "",
            bin: editData.bin ?? "",
          }
        : { ...initialData },
    );
    setErrors({});
  }, [editData]);

  useEffect(() => {
    const loadWarehouses = async () => {
      try {
        setLoadingWarehouses(true);

        const result = await getWarehouses();
        setWarehouses(result);
      } catch (error) {
        console.error("Error loading warehouses:", error);
        toast.error("Failed to load warehouses.");
      } finally {
        setLoadingWarehouses(false);
      }
    };

    void loadWarehouses();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    const nextData = {
      ...data,
      [name]: name === "warehouseId" ? Number(value) : value,
    };

    setData(nextData);
    setErrors((previous) => ({ ...previous, [name]: "" }));

    if (name === "zone") {
      const requestId = ++codeRequestRef.current;
      const zone = String(nextData.zone ?? "");

      if (!zone.trim()) {
        setData((previous) => ({ ...previous, code: "" }));
        setIsGeneratingCode(false);
        return;
      }

      setData((previous) => ({ ...previous, code: "" }));
      setIsGeneratingCode(true);
      void getGeneratedLocationCode(zone, editData?.locationId ?? 0)
        .then((generatedCode) => {
          if (requestId !== codeRequestRef.current) return;
          setData((previous) => ({ ...previous, code: generatedCode }));
        })
        .catch((error: unknown) => {
          if (requestId !== codeRequestRef.current) return;
          console.error("Failed to generate location code:", error);
          setData((previous) => ({ ...previous, code: "" }));
          toast.error("Could not generate Location Code. Please try again.");
        })
        .finally(() => {
          if (requestId === codeRequestRef.current) {
            setIsGeneratingCode(false);
          }
        });
    }
  };

  const handleActiveChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setData((prev) => ({
      ...prev,
      isActive: e.target.checked,
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!Number.isInteger(data.warehouseId) || data.warehouseId <= 0) {
      newErrors.warehouseId = "Please select a valid warehouse.";
    }

    if (!data.code.trim()) {
      newErrors.code = "Location Code is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (isSaving || isGeneratingCode) return;

    if (!validate()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setIsSaving(true);

      await saveLocation({
        ...data,
        code: data.code.trim(),
        zone: data.zone.trim(),
        rack: data.rack.trim(),
        shelf: data.shelf.trim(),
        bin: data.bin.trim(),
      });

      toast.success(
        data.locationId > 0
          ? "Location updated successfully!"
          : "Location created successfully!",
      );

      onSuccess();
    } catch (error) {
      console.error("Location save error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save location.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100";

  const labelClass =
    "mb-1 block text-sm font-semibold text-gray-700";

  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 bg-[#f07837] px-6 py-4 text-white">
        <FaMapMarkerAlt className="text-xl" />

        <div>
          <h2 className="text-lg font-bold uppercase tracking-wide">
            {data.locationId > 0
              ? "Update Location"
              : "Add Location"}
          </h2>

          <p className="mt-1 text-xs text-blue-100">
            Enter the warehouse location information below.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="min-h-[300px] bg-white p-6 md:p-8">
          <div className="mb-6 border-b border-gray-200 pb-3">
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#154068]">
              Location Information
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* 1. Warehouse */}
            <div>
              <label
                htmlFor="warehouseId"
                className={labelClass}
              >
                Warehouse <span className="text-red-500">*</span>
              </label>

              <select
                id="warehouseId"
                name="warehouseId"
                value={data.warehouseId}
                onChange={handleChange}
                className={inputClass}
                disabled={loadingWarehouses}
              >
                <option value={0}>
                  {loadingWarehouses
                    ? "Loading warehouses..."
                    : "Select Warehouse"}
                </option>

                {warehouses.map((warehouse) => (
                  <option
                    key={warehouse.warehouseId}
                    value={warehouse.warehouseId}
                  >
                    {warehouse.warehouseCode} -{" "}
                    {warehouse.warehouseName}
                  </option>
                ))}
              </select>

              {errors.warehouseId && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.warehouseId}
                </p>
              )}
            </div>

            {/* 2. Location Code */}
            <div>
              <label htmlFor="code" className={labelClass}>
                Location Code{" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                id="code"
                name="code"
                type="text"
                maxLength={50}
                value={isGeneratingCode ? "Generating..." : data.code}
                readOnly
                className={`${inputClass} bg-gray-100`}
                placeholder="Generated from Zone"
              />

              {errors.code && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.code}
                </p>
              )}
            </div>

            {/* 3. Zone */}
            <div>
              <label htmlFor="zone" className={labelClass}>
                Zone
              </label>

              <input
                id="zone"
                name="zone"
                type="text"
                maxLength={100}
                value={data.zone}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter Zone"
              />
            </div>

            {/* 4. Rack */}
            <div>
              <label htmlFor="rack" className={labelClass}>
                Rack
              </label>

              <input
                id="rack"
                name="rack"
                type="text"
                maxLength={100}
                value={data.rack}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter Rack"
              />
            </div>

            {/* 5. Shelf */}
            <div>
              <label htmlFor="shelf" className={labelClass}>
                Shelf
              </label>

              <input
                id="shelf"
                name="shelf"
                type="text"
                maxLength={100}
                value={data.shelf}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter Shelf"
              />
            </div>

            {/* 6. Bin */}
            <div>
              <label htmlFor="bin" className={labelClass}>
                Bin
              </label>

              <input
                id="bin"
                name="bin"
                type="text"
                maxLength={100}
                value={data.bin}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter Bin"
              />
            </div>

            {/* 7. Active Location */}
            <div className="md:col-span-2">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={data.isActive}
                  onChange={handleActiveChange}
                  className="h-4 w-4 accent-blue-700"
                />

                <span className="text-sm font-semibold text-gray-700">
                  Active Location
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap justify-end gap-3 border-t bg-gray-50 p-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className={buttonStyles.cancel}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSaving || isGeneratingCode || loadingWarehouses}
            className={buttonStyles.save}
          >
            {isSaving
              ? "Saving..."
              : data.locationId > 0
                ? "Update"
                : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LocationWizard;



