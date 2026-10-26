import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import Select from "react-select";
import {
  FaShippingFast,
  FaCalendarAlt,
  FaTruckLoading,
  FaStickyNote,
  // New Icon
  FaTasks,
  FaPlus,
  FaTrash,
  FaBoxes,
} from "react-icons/fa";
import {
  getShipmentDropdown,
  getShipmentDetails,
  createDispatch,
  updateDispatch,
} from "./Services/DispatchService";
import type { ShipmentItemDto, DispatchSelectionDto } from "./Services/types"; // Added ShipmentItemDto
import axios from "axios";
import { API_ENDPOINTS } from "../../../../API/apiConfig";

const DispatchWizard: React.FC<{
  editData: any;
  options?: any;
  onSuccess: () => void;
  onCancel: () => void;
}> = ({ editData, onSuccess, onCancel }) => {
  const [dispatchType, setDispatchType] = useState<"shipment" | "stock">(
    editData?.shipmentInitiateId === 0 || editData?.dispatchType === "stock"
      ? "stock"
      : "shipment",
  );
  const [shipmentOptions, setShipmentOptions] = useState<any[]>([]);
  const [shipmentItems, setShipmentItems] = useState<ShipmentItemDto[]>([]); // New State
  const [dispatches, setDispatches] = useState<DispatchSelectionDto[]>([]);
  const [, setIsFetchingDetails] = useState(false);
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [productOptions, setProductOptions] = useState<any[]>([]);
  const [accessoryOptions, setAccessoryOptions] = useState<any[]>([]);

  const [formData, setFormData] = useState<any>({
    dispatchId: 0,
    shipmentInitiateId: 0,
    dispatchDate: null,
    materialDispatch: false,
    docketNo: "",
    deliveredDate: null,
    deliveredOnDate: false,
    remarks: "",
    status: "Pending",
    ...editData,
  });

  useEffect(() => {
    getShipmentDropdown().then((data) => {
      // Load Products
      axios.get(API_ENDPOINTS.Products).then((res) => {
        const list = (res.data || []).map((x: any) => {
          const code = x.productCode || "";
          const name = x.productName || "";
          return {
            value: x.productId,
            label: code ? `${code} - ${name}` : name, // <--- Combines Product Code + Name
            code: code,
            description: x.description || name,
          };
        });

        setProductOptions(list);
      });

      // Load Accessories
      axios.get(API_ENDPOINTS.Accessories).then((res) => {
        const list = (res.data || []).map((x: any) => {
          const code = x.accessoriesCode || x.accessoryCode || "";
          const name =
            x.accessoriesDescription ||
            x.accessoriesName ||
            x.accessoryName ||
            "";

          return {
            value: x.accessoriesId || x.accessoryId,
            label: code ? `${code} - ${name}` : name, // <--- Combines Accessory Code + Description/Name
            code: code,
            description: name,
          };
        });

        setAccessoryOptions(list);
      });

      setShipmentOptions(
        data.map((x) => ({
          value: x.shipmentInitiateId,
          label: x.shipmentNo,
        })),
      );
    });

if (editData) {
    setFormData(editData);

    if (editData.shipmentInitiateId > 0) {

        handleShipmentChange(editData.shipmentInitiateId, true);

    } else {

        // STOCK DISPATCH
        setShipmentItems(editData.dispatchItems || []);

        setStockItems(editData.stockItems || []);

        setDispatches(
            (editData.dispatchDetails || []).map((x: any) => ({
                ...x,
                isSelected: true
            }))
        );
    }
}
  }, [editData]);

  const handleShipmentChange = async (
    shipmentId: number,
    isInitialLoad = false,
  ) => {
    setIsFetchingDetails(true);

    try {
      if (isInitialLoad) {
        setShipmentItems(editData?.dispatchItems || []);
        setDispatches(
          (editData?.dispatchDetails || []).map((x: any) => ({
            ...x,
            isSelected: true,
          })),
        );
        return;
      }

      const details = await getShipmentDetails(shipmentId);

      setShipmentItems(details.items || []);
      setDispatches(details.dispatches || []);

      setFormData((prev: any) => ({
        ...prev,
        shipmentInitiateId: shipmentId,
      }));
    } catch {
      toast.error("Error fetching shipment details");
    } finally {
      setIsFetchingDetails(false);
    }
  };
  // Toggle selection for dispatch numbers
  const handleDispatchToggle = (index: number) => {
    setDispatches((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, isSelected: !item.isSelected } : item,
      ),
    );
  };

  // --- MANUAL PRODUCT & ACCESSORY MANAGEMENT (Stock Dispatch) ---
  const addStockProductRow = () => {
    setStockItems((prev) => [
      ...prev,
      {
        itemType: "Product",
        productId: 0,
        itemCode: "",
        description: "",
        qty: 0,
      },
    ]);
  };

  const addStockAccessoryRow = () => {
    setStockItems((prev) => [
      ...prev,
      {
        itemType: "Accessory",
        accessoryId: 0,
        itemCode: "",
        description: "",
        qty: 1,
      },
    ]);
  };

  const updateStockItem = (index: number, field: string, value: any) => {
    setStockItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  const removeStockItem = (index: number) => {
    setStockItems((prev) => prev.filter((_, i) => i !== index));
  };

  // --- ITEM / BOX MANAGEMENT (Exact match with ItemsTab) ---
  const addItem = () => {
    const newItem: ShipmentItemDto = {
      shipmentItemId: 0,
      boxNo: "",
      netWeightKg: 0,
      grossWeightKg: 0,
      lengthCm: 0,
      widthCm: 0,
      heightCm: 0,
      cbm: 0,
      remarks: "",
    };
    setShipmentItems((prev) => [...prev, newItem]);
  };

  const updateItem = (
    index: number,
    field: keyof ShipmentItemDto,
    value: any,
  ) => {
    const updated = [...shipmentItems];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    const item = updated[index];
    item.cbm =
      (Number(item.lengthCm || 0) *
        Number(item.widthCm || 0) *
        Number(item.heightCm || 0)) /
      1000000;

    setShipmentItems(updated);
  };

  const removeItem = (index: number) => {
    setShipmentItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculations for Totals Row
  const totalNetWeight = shipmentItems.reduce(
    (sum, item) => sum + Number(item.netWeightKg || 0),
    0,
  );

  const totalGrossWeight = shipmentItems.reduce(
    (sum, item) => sum + Number(item.grossWeightKg || 0),
    0,
  );

  const totalCBM = shipmentItems.reduce(
    (sum, item) => sum + Number(item.cbm || 0),
    0,
  );

  const handleSave = async () => {
    try {
      if (dispatchType === "shipment" && !formData.shipmentInitiateId) {
        return toast.error("Please select a shipment");
      }

      // Attach selected dispatch details to payload
      const payload = {
        ...formData,

        shipmentInitiateId:
          dispatchType === "shipment" ? formData.shipmentInitiateId : 0,

        dispatchDetails:
          dispatchType === "shipment"
            ? dispatches
            : [
                {
                  orderAcceptanceId: 0,
                  dispatchNo: "",
                  customerName: "Stock Dispatch",
                  isSelected: true,
                },
              ],

        dispatchItems: shipmentItems,

        stockItems: dispatchType === "stock" ? stockItems : [],
      };

      if (editData) {
        await updateDispatch(payload);
      } else {
        await createDispatch(payload);
      }

      toast.success("Dispatch saved successfully");
      onSuccess();
    } catch (err: any) {
      console.log(err.response?.data);
      toast.error(
        err.response?.data?.Message ||
          err.response?.data?.message ||
          "Operation failed",
      );
    }
  };

  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      minHeight: "40px",
      borderRadius: "10px",
      border: state.isFocused ? "1px solid #3b82f6" : "1px solid #d1d5db",
      boxShadow: "none",
      backgroundColor: "#ffffff",
      "&:hover": {
        borderColor: "#3b82f6",
      },
    }),

    valueContainer: (provided: any) => ({
      ...provided,
      padding: "0 12px",
    }),

    placeholder: (provided: any) => ({
      ...provided,
      color: "#94a3b8",
      fontSize: "14px",
    }),

    singleValue: (provided: any) => ({
      ...provided,
      color: "#1e293b",
      fontSize: "14px",
      fontWeight: 500,
    }),

    indicatorSeparator: (provided: any) => ({
      ...provided,
      backgroundColor: "#e5e7eb",
    }),

    dropdownIndicator: (provided: any) => ({
      ...provided,
      color: "#6b7280",
      "&:hover": {
        color: "#2563eb",
      },
    }),

    menu: (provided: any) => ({
      ...provided,
      borderRadius: "10px",
      overflow: "hidden",
      zIndex: 9999,
    }),

    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#2563eb"
        : state.isFocused
          ? "#eff6ff"
          : "#fff",
      color: state.isSelected ? "#fff" : "#1e293b",
      cursor: "pointer",
    }),
  };

  return (
    <div className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-xl animate-in zoom-in-95 duration-300">
      <div className="bg-[#1e293b] px-6 py-4 text-white flex justify-between items-center">
        <h2 className="text-md font-bold uppercase tracking-wider flex items-center gap-2">
          <FaShippingFast />{" "}
          {editData ? `Edit Dispatch` : "Create New Dispatch"}
        </h2>
        <button
          onClick={onCancel}
          className="text-sm hover:underline text-slate-300"
        >
          Close
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* --- DISPATCH SOURCE SELECTION TOGGLE --- */}
        <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 flex items-center gap-6">
          <span className="text-xs font-bold text-slate-700 uppercase">
            Dispatch Source:
          </span>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="dispatchType"
              value="shipment"
              checked={dispatchType === "shipment"}
              onChange={() => setDispatchType("shipment")}
              className="accent-blue-600"
            />
            <span className="text-sm font-semibold text-slate-800 flex items-center gap-1">
              <FaShippingFast className="text-blue-600" /> Select From Shipment
              No.
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="dispatchType"
              value="stock"
              checked={dispatchType === "stock"}
              onChange={() => setDispatchType("stock")}
              className="accent-purple-600"
            />
            <span className="text-sm font-semibold text-slate-800 flex items-center gap-1">
              <FaBoxes className="text-purple-600" /> Dispatch From Stock
            </span>
          </label>
        </div>

        {/* Step 1: Shipment Option OR Manual Stock Dispatch */}
        {dispatchType === "shipment" ? (
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase">
                  Select Shipment No.
                </label>
                <Select
                  styles={customSelectStyles}
                  isDisabled={!!editData}
                  options={shipmentOptions}
                  value={
                    shipmentOptions.find(
                      (x) => x.value === formData.shipmentInitiateId,
                    ) ||
                    (formData.shipmentInitiateId
                      ? {
                          value: formData.shipmentInitiateId,
                          label: formData.shipmentNo,
                        }
                      : null)
                  }
                  onChange={(opt: any) => handleShipmentChange(opt.value)}
                />
              </div>

              {/* --- NEW SECTION: Dispatch Numbers Checkbox Selection --- */}
              {dispatches.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <label className="text-[11px] font-black text-slate-700 uppercase flex items-center gap-2">
                    <FaTasks className="text-blue-500" /> Select Dispatch
                    Numbers
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {dispatches.map((item, idx) => (
                      <label
                        key={idx}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                          item.isSelected
                            ? "bg-blue-50 border-blue-400 text-blue-900"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={item.isSelected}
                          onChange={() => handleDispatchToggle(idx)}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold uppercase tracking-wide">
                            {item.dispatchNo}
                          </span>

                          <span className="text-[11px] text-slate-500 font-medium">
                            {item.customerName}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* MANUAL PRODUCT & ACCESSORY SECTION (Stock Dispatch) */
          <div className="bg-purple-50 p-6 rounded-xl border border-purple-200 space-y-4 overflow-visible">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-purple-900 flex items-center gap-2">
                <FaBoxes /> Stock Products & Accessories
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={addStockProductRow}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 shadow"
                >
                  <FaPlus /> Add Product Row
                </button>
                <button
                  type="button"
                  onClick={addStockAccessoryRow}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 shadow"
                >
                  <FaPlus /> Add Accessory Row
                </button>
              </div>
            </div>

            <table className="w-full text-xs border-collapse border bg-white rounded-lg">
              <thead>
                <tr className="bg-purple-900 text-white">
                  <th className="border p-2 w-12 text-center">#</th>
                  <th className="border p-2 w-28 text-center">Type</th>
                  <th className="border p-2 w-1/2">Item Selection</th>
                  <th className="border p-2">Description</th>
                  <th className="border p-2 w-24 text-center">Qty</th>
                  <th className="border p-2 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody>
                {stockItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center p-4 text-slate-400 italic"
                    >
                      No stock items added yet. Click "+ Add Product Row" or "+
                      Add Paid Accessory".
                    </td>
                  </tr>
                ) : (
                  stockItems.map((item, idx) => {
                    const isProduct = item.itemType === "Product";
                    return (
                      <tr key={idx} className="hover:bg-slate-50 border-b">
                        <td className="border p-2 text-center font-bold">
                          {idx + 1}
                        </td>
                        <td className="border p-2 text-center">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              isProduct
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : "bg-purple-100 text-purple-800 border border-purple-200"
                            }`}
                          >
                            {item.itemType}
                          </span>
                        </td>
                        <td className="border p-2">
                          <Select
                            options={
                              isProduct ? productOptions : accessoryOptions
                            }
                            value={
                              isProduct
                                ? productOptions.find(
                                    (p: any) => p.value === item.productId,
                                  )
                                : accessoryOptions.find(
                                    (a: any) => a.value === item.accessoryId,
                                  )
                            }
                            onChange={(opt: any) => {
                              setStockItems((prev) =>
                                prev.map((row, i) => {
                                  if (i !== idx) return row;

                                  return {
                                    ...row,

                                    productId: isProduct
                                      ? (opt?.value ?? 0)
                                      : null,

                                    accessoryId: !isProduct
                                      ? (opt?.value ?? 0)
                                      : null,

                                    itemCode: opt?.code ?? "",

                                    description: opt?.description ?? "",
                                  };
                                }),
                              );
                            }}
                            placeholder={
                              isProduct
                                ? "Select Product..."
                                : "Select Accessory..."
                            }
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            styles={{
                              menuPortal: (base) => ({
                                ...base,
                                zIndex: 99999,
                              }),
                              menu: (base) => ({
                                ...base,
                                zIndex: 99999,
                              }),
                            }}
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="text"
                            className="w-full border rounded p-2 text-xs"
                            placeholder="Description / Remarks"
                            value={item.description || ""}
                            onChange={(e) =>
                              updateStockItem(
                                idx,
                                "description",
                                e.target.value,
                              )
                            }
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="number"
                            min={1}
                            className="w-full border rounded p-2 text-xs text-center"
                            value={item.qty ?? 1}
                            onChange={(e) =>
                              updateStockItem(
                                idx,
                                "qty",
                                Number(e.target.value) || 1,
                              )
                            }
                          />
                        </td>
                        <td className="border p-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeStockItem(idx)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
        {/* --- SHIPMENT BOXES SECTION (EXACT DESIGN MATCH WITH ItemsTab) --- */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-[#0b2c52]">Shipment Boxes</h3>
            <button
              type="button"
              onClick={addItem}
              className="bg-green-600 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
            >
              <FaPlus /> Add Row
            </button>
          </div>
          <table className="w-full text-xs border-collapse border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Box No</th>
                <th className="border p-2">Net Weight (Kg)</th>
                <th className="border p-2">Gross Weight (Kg)</th>
                <th className="border p-2">Length (Cm)</th>
                <th className="border p-2">Width (Cm)</th>
                <th className="border p-2">Height (Cm)</th>
                <th className="border p-2">CBM</th>
                <th className="border p-2">Remarks</th>
                <th className="border p-2"></th>
              </tr>
            </thead>
            <tbody>
              {shipmentItems.map((item, idx) => (
                <tr key={idx}>
                  <td className="border p-1">
                    <input
                      className="w-full p-1"
                      value={item.boxNo || ""}
                      onChange={(e) => updateItem(idx, "boxNo", e.target.value)}
                    />
                  </td>
                  <td className="border p-1">
                    <input
                      type="number"
                      className="w-full p-1"
                      value={item.netWeightKg}
                      onChange={(e) =>
                        updateItem(idx, "netWeightKg", e.target.value)
                      }
                    />
                  </td>
                  <td className="border p-1">
                    <input
                      type="number"
                      className="w-full p-1"
                      value={item.grossWeightKg}
                      onChange={(e) =>
                        updateItem(idx, "grossWeightKg", e.target.value)
                      }
                    />
                  </td>
                  <td className="border p-1">
                    <input
                      type="number"
                      className="w-full p-1"
                      value={item.lengthCm}
                      onChange={(e) =>
                        updateItem(idx, "lengthCm", e.target.value)
                      }
                    />
                  </td>
                  <td className="border p-1">
                    <input
                      type="number"
                      className="w-full p-1"
                      value={item.widthCm}
                      onChange={(e) =>
                        updateItem(idx, "widthCm", e.target.value)
                      }
                    />
                  </td>
                  <td className="border p-1">
                    <input
                      type="number"
                      className="w-full p-1"
                      value={item.heightCm}
                      onChange={(e) =>
                        updateItem(idx, "heightCm", e.target.value)
                      }
                    />
                  </td>
                  <td className="border p-1 bg-gray-50 text-center font-bold">
                    {(item.cbm || 0).toFixed(4)}
                  </td>
                  <td className="border p-1">
                    <input
                      className="w-full p-1"
                      value={item.remarks || ""}
                      onChange={(e) =>
                        updateItem(idx, "remarks", e.target.value)
                      }
                    />
                  </td>
                  <td className="border p-1 text-center">
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="text-red-500"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-blue-50 font-bold">
                <td className="border p-2 text-right">Totals</td>
                <td className="border p-2">{totalNetWeight.toFixed(2)}</td>
                <td className="border p-2">{totalGrossWeight.toFixed(2)}</td>
                <td className="border p-2" colSpan={3}></td>
                <td className="border p-2 text-center">
                  {totalCBM.toFixed(4)}
                </td>
                <td className="border p-2" colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Step 2: Manual Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-blue-600 border-b pb-1 uppercase flex items-center gap-2">
              <FaCalendarAlt /> Schedule
            </h3>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                Dispatch Date
              </label>
              <input
                type="date"
                className="w-full h-10 border rounded-lg px-3 text-sm"
                value={formData.dispatchDate?.split("T")[0]}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dispatchDate: e.target.value || null,
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-emerald-600 border-b pb-1 uppercase flex items-center gap-2">
              <FaTruckLoading /> Tracking
            </h3>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                Docket No.
              </label>
              <input
                className="w-full h-10 border rounded-lg px-3 text-sm"
                value={formData.docketNo}
                onChange={(e) =>
                  setFormData({ ...formData, docketNo: e.target.value })
                }
              />
            </div>
            <div className="flex items-center gap-4 py-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.materialDispatch}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      materialDispatch: e.target.checked,
                    })
                  }
                />
                <span className="text-[11px] font-bold uppercase text-slate-600">
                  Material Dispatched
                </span>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-purple-600 border-b pb-1 uppercase flex items-center gap-2">
              <FaCalendarAlt /> Delivery
            </h3>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                Delivered Date
              </label>
              <input
                type="date"
                className="w-full h-10 border rounded-lg px-3 text-sm"
                value={formData.deliveredDate?.split("T")[0]}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    deliveredDate: e.target.value || null,
                  })
                }
              />
            </div>

            <div className="flex items-center gap-4 py-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.deliveredOnDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      deliveredOnDate: e.target.checked,
                    })
                  }
                />
                <span className="text-[11px] font-bold uppercase text-slate-600">
                  Delivered On Date
                </span>
              </label>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                Status
              </label>
              <select
                className="w-full h-10 border rounded-lg px-3 text-sm"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="Pending">Pending</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
            <FaStickyNote /> Remarks
          </label>
          <textarea
            className="w-full border rounded-lg p-3 text-sm h-20"
            value={formData.remarks}
            onChange={(e) =>
              setFormData({ ...formData, remarks: e.target.value })
            }
          />
        </div>

        <div className="pt-6 border-t flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-8 py-2.5 bg-gray-500 text-white rounded-lg font-normal text-sm hover:bg-gray-600 transition"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            className="px-10 py-2.5 bg-green-600 text-white rounded-lg font-normal text-sm hover:bg-green-700 transition"
          >
            {editData ? "Update Dispatch" : "Confirm Dispatch"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DispatchWizard;
