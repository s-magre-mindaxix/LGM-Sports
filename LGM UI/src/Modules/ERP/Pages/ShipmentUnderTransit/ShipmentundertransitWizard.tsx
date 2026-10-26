import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import Select from "react-select";
import {
  FaTruckLoading,
  FaCalendarAlt,
  FaMapMarkedAlt,
  FaFileAlt,
  FaFileInvoiceDollar, // Added
  FaGavel, // Added
} from "react-icons/fa";
import {
  getOpenShipments,
  createTransit,
  updateTransit,
} from "./Services/ShipmentUnderTransitService";

const TransitWizard: React.FC<{
  editData: any;
  onSuccess: () => void;
  onCancel: () => void;
}> = ({ editData, onSuccess, onCancel }) => {
  type ShipmentOption = {
    value: number;
    label: string;
    shipmentModeName?: string;
  };

  const [shipmentOptions, setShipmentOptions] = useState<ShipmentOption[]>([]);
  const [shipmentData, setShipmentData] = useState<any[]>([]);
  const [selectedShipmentMode, setSelectedShipmentMode] = useState<string>("");

  const [formData, setFormData] = useState<any>({
    shipmentUnderTransitId: 0,
    shipmentInitiateId: 0,
    shipmentAgencyAssignmentId: null,
    containerNo: "",
    vesselFlightNo: "",

    MAWBNo: "", // Changed from awbNo
    HAWBNo: "", // New
    MBLNo: "", // New
    HBLNo: "",

    ETDDate: "", // Added
    ETADate: "", // Added
    BOENo: "", // Added
    BOEDate: "", // Added
    checklistReceivingDate: "", // Added
    checklistApprovingDate: "", // Added
    departureDate: new Date().toISOString().split("T")[0],
    expectedArrivalDate: "",
    actualArrivalDate: "",
    portOfLoading: "",
    portOfDischarge: "",
    destination: "",
    status: "In Transit",
    transitRemarks: "",
    checklistExchangeRate: 0,
    checklistAssessableValue: 0,
    checklistTotalDuty: 0,
    checklistGST: 0,
    checklistTotalPayable: 0,
    boeExchangeRate: 0,
    boeAssessableValue: 0,
    boeCustomDuty: 0,
    boeGST: 0,
    boeTotalPayable: 0,
    dutyPenalty: 0,
    dutyInterest: 0,
    dutyPaymentDate: "",
    oocDate: "",
    finalDeliveryDate: "",
    isChecklistApproved: false,
    isBOEApproved: false,
    ...editData,
  });

  // Helper for numeric inputs
  const handleNumberChange = (field: string, val: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: parseFloat(val) || 0 }));
  };

  useEffect(() => {
    if (editData) {
      // Set mode for edit state
      setSelectedShipmentMode(editData.shipmentModeName || "");
    } else {
      getOpenShipments().then((data) => {
        setShipmentData(data);
        setShipmentOptions(
          data.map((x: any) => ({
            value: x.shipmentInitiateId,
            label: `${x.shipmentNo} (${x.shipmentModeName})`,
            shipmentModeName: x.shipmentModeName,
          })),
        );
      });
    }
  }, [editData]);

  useEffect(() => {
    if (editData) {
      setFormData((prev: any) => ({
        ...prev,
        ...editData,
      }));

      setSelectedShipmentMode(editData.shipmentModeName || "");
    }
  }, [editData]);

  const handleSave = async () => {
    try {
      if (!formData.shipmentInitiateId)
        return toast.error("Please select a shipment");

      let autoStatus = formData.status;

      if (formData.finalDeliveryDate) {
        autoStatus = "Delivered";
      } else if (formData.oocDate) {
        autoStatus = "Customs Cleared";
      }

      const payload = {
        ...formData,
        status: autoStatus,
        departureDate: formData.departureDate || null,

        expectedArrivalDate: formData.expectedArrivalDate || null,

        actualArrivalDate: formData.actualArrivalDate || null,

        dutyPaymentDate: formData.dutyPaymentDate || null,

        oocDate: formData.oocDate || null,

        finalDeliveryDate: formData.finalDeliveryDate || null,

        ETDDate: formData.ETDDate || null,
        ETADate: formData.ETADate || null,
        BOEDate: formData.BOEDate || null,
        checklistReceivingDate: formData.checklistReceivingDate || null,
        checklistApprovingDate: formData.checklistApprovingDate || null,
      };

      if (editData) {
        await updateTransit(payload);
      } else {
        await createTransit(payload);
      }

      toast.success("Transit record saved successfully");
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data || "Operation failed");
    }
  };

  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl animate-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="bg-[#f07837] px-6 py-4 text-white flex justify-between items-center">
        <h2 className="text-md font-bold uppercase tracking-wider flex items-center gap-2">
          <FaTruckLoading />
          {editData
            ? `Updating Transit: ${editData.shipmentNo}`
            : "Initiate Transit Tracking"}
        </h2>
        <button onClick={onCancel} className="text-sm hover:underline">
          Close
        </button>
      </div>

      <div className="p-6 space-y-6 text-left">
        {/* Shipment Selection */}
        {!editData && (
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <label className="block text-xs font-bold text-blue-900 mb-2 uppercase">
              Select Shipment to Move to Transit
            </label>
            <Select
              options={shipmentOptions}
              placeholder="Search Shipment Number..."
              onChange={(opt: any) => {
                const shipment = shipmentData.find(
                  (x) => x.shipmentInitiateId === opt.value,
                );
                setFormData((prev: any) => ({
                  ...prev,
                  shipmentInitiateId: opt.value,
                }));
                setSelectedShipmentMode(shipment?.shipmentModeName || "");
              }}
            />
          </div>
        )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-sky-50 border border-sky-200 rounded-xl p-5 shadow-sm">
          {/* Section 1: Route Identifiers */}
          <div className="col-span-full flex items-center gap-2 text-slate-400 mb-2 border-b pb-1">
            <FaMapMarkedAlt size={14} />
            <span className="text-[11px] font-bold uppercase">
              Basic Details
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">
              Port of Loading
            </label>
            <input
              className="w-full h-10 border rounded-lg px-3 text-sm"
              value={formData.portOfLoading || ""}
              onChange={(e) =>
                setFormData({ ...formData, portOfLoading: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">
              Port of Discharge
            </label>
            <input
              className="w-full h-10 border rounded-lg px-3 text-sm"
              value={formData.portOfDischarge || ""}
              onChange={(e) =>
                setFormData({ ...formData, portOfDischarge: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">
              Final Destination
            </label>
            <input
              className="w-full h-10 border rounded-lg px-3 text-sm"
              value={formData.destination || ""}
              onChange={(e) =>
                setFormData({ ...formData, destination: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">
              Current Status
            </label>
            <select
              className="w-full h-10 border rounded-lg px-3 text-sm font-semibold text-blue-700 bg-blue-50"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
            >
              <option value="In Transit">In Transit</option>
              {/* <option value="Reached Port">Reached Port</option> */}
              <option value="Customs Cleared">Customs Cleared</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>

          {/* Section 2: Mode Specific Logistics */}
        <div className="col-span-full mt-4 bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm">
    <div className="flex items-center gap-2 text-amber-700 mb-4 border-b border-amber-200 pb-2">
            <FaTruckLoading size={14} />
            <span className="text-[11px] font-bold uppercase">
              Logistics Details ({selectedShipmentMode || "Select Mode"})
            </span>
          </div>

           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          {selectedShipmentMode === "AIR" && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  MAWB No
                </label>
                <input
                  className="w-full h-10 border rounded-lg px-3 text-sm"
                  value={formData.MAWBNo || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, MAWBNo: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  HAWB No
                </label>
                <input
                  className="w-full h-10 border rounded-lg px-3 text-sm"
                  value={formData.HAWBNo || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, HAWBNo: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  Flight No
                </label>
                <input
                  className="w-full h-10 border rounded-lg px-3 text-sm"
                  value={formData.vesselFlightNo || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, vesselFlightNo: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-blue-600 uppercase">
                  ETD Date
                </label>
                <input
                  type="date"
                  className="w-full h-10 border border-blue-200 rounded-lg px-3 text-sm"
                  value={formData.ETDDate?.split("T")[0] || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, ETDDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-blue-600 uppercase">
                  ETA Date
                </label>
                <input
                  type="date"
                  className="w-full h-10 border border-blue-200 rounded-lg px-3 text-sm"
                  value={formData.ETADate?.split("T")[0] || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, ETADate: e.target.value })
                  }
                />
              </div>
            </>
          )}

          {selectedShipmentMode === "OCEAN" && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  MBL No
                </label>
                <input
                  className="w-full h-10 border rounded-lg px-3 text-sm"
                  value={formData.MBLNo || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, MBLNo: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  HBL No
                </label>
                <input
                  className="w-full h-10 border rounded-lg px-3 text-sm"
                  value={formData.HBLNo || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, HBLNo: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  Container No
                </label>
                <input
                  className="w-full h-10 border rounded-lg px-3 text-sm"
                  value={formData.containerNo || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, containerNo: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  Vessel No
                </label>
                <input
                  className="w-full h-10 border rounded-lg px-3 text-sm"
                  value={formData.vesselFlightNo || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, vesselFlightNo: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-blue-600 uppercase">
                  ETD Date
                </label>
                <input
                  type="date"
                  className="w-full h-10 border border-blue-200 rounded-lg px-3 text-sm"
                  value={formData.ETDDate?.split("T")[0] || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, ETDDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-blue-600 uppercase">
                  ETA Date
                </label>
                <input
                  type="date"
                  className="w-full h-10 border border-blue-200 rounded-lg px-3 text-sm"
                  value={formData.ETADate?.split("T")[0] || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, ETADate: e.target.value })
                  }
                />
              </div>
            </>
          )}
          </div>
                    </div>


          {/* Section 3: Financials - Checklist */}
          {/* Section 3: Financials - Checklist */}
         <div className="col-span-full mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-sm">
    <div className="flex items-center justify-between mb-4 border-b border-emerald-200 pb-2">
            <div className="flex items-center gap-2 text-emerald-600">
              <FaFileInvoiceDollar size={14} />
              <span className="text-[11px] font-bold uppercase">
                Checklist Financials
              </span>
            </div>
            {/* Checkbox for Approval */}
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                checked={formData.isChecklistApproved}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isChecklistApproved: e.target.checked,
                  })
                }
              />
              <span className="text-[10px] font-bold text-emerald-700 uppercase group-hover:underline">
                Approve Checklist
              </span>
            </label>
          </div>
          <div className="col-span-full grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                Exchange Rate
              </label>
              <input
                type="number"
                className="w-full h-10 border rounded-lg px-3 text-sm"
                value={formData.checklistExchangeRate}
                onChange={(e) =>
                  handleNumberChange("checklistExchangeRate", e.target.value)
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                Total Accessable Value
              </label>
              <input
                type="number"
                className="w-full h-10 border rounded-lg px-3 text-sm"
                value={formData.checklistAssessableValue}
                onChange={(e) =>
                  handleNumberChange("checklistAssessableValue", e.target.value)
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                Total Duty
              </label>
              <input
                type="number"
                className="w-full h-10 border rounded-lg px-3 text-sm"
                value={formData.checklistTotalDuty}
                onChange={(e) =>
                  handleNumberChange("checklistTotalDuty", e.target.value)
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                GST
              </label>
              <input
                type="number"
                className="w-full h-10 border rounded-lg px-3 text-sm"
                value={formData.checklistGST}
                onChange={(e) =>
                  handleNumberChange("checklistGST", e.target.value)
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                Total Payable
              </label>
              <input
                type="number"
                className="w-full h-10 border rounded-lg px-3 text-sm bg-emerald-50 border-emerald-200"
                value={formData.checklistTotalPayable}
                onChange={(e) =>
                  handleNumberChange("checklistTotalPayable", e.target.value)
                }
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                Checklist Receiving Date
              </label>
              <input
                type="date"
                className="w-full h-10 border rounded-lg px-3 text-sm"
                value={formData.checklistReceivingDate?.split("T")[0] || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    checklistReceivingDate: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
               Checklist Approving Date
              </label>
              <input
                type="date"
                className="w-full h-10 border rounded-lg px-3 text-sm"
                value={formData.checklistApprovingDate?.split("T")[0] || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    checklistApprovingDate: e.target.value,
                  })
                }
              />
            </div>
          </div>
          </div>

          {/* Section 4: Financials - BOE */}
         <div className="col-span-full mt-4 bg-indigo-50 border border-indigo-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center mb-4 border-b border-indigo-200 pb-2">
          <div className="flex items-center gap-2 text-indigo-600">
            <FaGavel size={14} />
            <span className="text-[11px] font-bold uppercase">
              Bill of Entry (BOE) Details
            </span>
          </div>
        </div>
          <div className="col-span-full grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                BOE No
              </label>
              <input
                className="w-full h-10 border rounded-lg px-3 text-sm"
                value={formData.BOENo || ""}
                onChange={(e) =>
                  setFormData({ ...formData, BOENo: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                BOE Date
              </label>
              <input
                type="date"
                className="w-full h-10 border rounded-lg px-3 text-sm"
                value={formData.BOEDate?.split("T")[0] || ""}
                onChange={(e) =>
                  setFormData({ ...formData, BOEDate: e.target.value })
                }
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                BOE Exchange Rate
              </label>
              <input
                type="number"
                className="w-full h-10 border rounded-lg px-3 text-sm"
                value={formData.boeExchangeRate}
                onChange={(e) =>
                  handleNumberChange("boeExchangeRate", e.target.value)
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                BOE Accessable Value
              </label>
              <input
                type="number"
                className="w-full h-10 border rounded-lg px-3 text-sm"
                value={formData.boeAssessableValue}
                onChange={(e) =>
                  handleNumberChange("boeAssessableValue", e.target.value)
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                Custom Duty
              </label>
              <input
                type="number"
                className="w-full h-10 border rounded-lg px-3 text-sm"
                value={formData.boeCustomDuty}
                onChange={(e) =>
                  handleNumberChange("boeCustomDuty", e.target.value)
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                BOE GST
              </label>
              <input
                type="number"
                className="w-full h-10 border rounded-lg px-3 text-sm"
                value={formData.boeGST}
                onChange={(e) => handleNumberChange("boeGST", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                BOE Payable
              </label>
              <input
                type="number"
                className="w-full h-10 border rounded-lg px-3 text-sm bg-indigo-50 border-indigo-200"
                value={formData.boeTotalPayable}
                onChange={(e) =>
                  handleNumberChange("boeTotalPayable", e.target.value)
                }
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                Duty Penalty
              </label>
              <input
                type="number"
                className="w-full h-10 border rounded-lg px-3 text-sm"
                value={formData.dutyPenalty}
                onChange={(e) =>
                  handleNumberChange("dutyPenalty", e.target.value)
                }
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                Duty Interest
              </label>
              <input
                type="number"
                className="w-full h-10 border rounded-lg px-3 text-sm"
                value={formData.dutyInterest}
                onChange={(e) =>
                  handleNumberChange("dutyInterest", e.target.value)
                }
              />
            </div>
          </div>
          </div>


          {/* Section 5: Timelines */}
         <div className="col-span-full mt-4 bg-orange-100 border border-orange-200 rounded-xl p-5 shadow-sm">
    <div className="flex items-center gap-2 text-orange-700 mb-4 border-b border-orange-200 pb-2">
            <FaCalendarAlt size={14} />
            <span className="text-[11px] font-bold uppercase">
              Timeline & Arrival
            </span>
          </div>

           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">
              Actual Date of Departure
            </label>
            <input
              type="date"
              className="w-full h-10 border rounded-lg px-3 text-sm"
              value={formData.departureDate?.split("T")[0] || ""}
              onChange={(e) =>
                setFormData({ ...formData, departureDate: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">
              Actual Date of Arrival
            </label>
            <input
              type="date"
              className="w-full h-10 border rounded-lg px-3 text-sm"
              value={formData.expectedArrivalDate?.split("T")[0] || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  expectedArrivalDate: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">
              Duty Payment Date
            </label>
            <input
              type="date"
              className="w-full h-10 border rounded-lg px-3 text-sm"
              value={formData.dutyPaymentDate?.split("T")[0]}
              onChange={(e) =>
                setFormData({ ...formData, dutyPaymentDate: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">
              OOC Date
            </label>
            <input
              type="date"
              className="w-full h-10 border rounded-lg px-3 text-sm"
              value={formData.oocDate?.split("T")[0]}
              onChange={(e) =>
                setFormData({ ...formData, oocDate: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">
              Final Delivery Date
            </label>
            <input
              type="date"
              className="w-full h-10 border rounded-lg px-3 text-sm bg-blue-50 border-blue-200"
              value={formData.finalDeliveryDate?.split("T")[0]}
              onChange={(e) =>
                setFormData({ ...formData, finalDeliveryDate: e.target.value })
              }
            />
          </div>
            </div>
            </div>


          {/* Section 6: Remarks */}
          <div className="col-span-full flex items-center gap-2 text-slate-400 mt-4 mb-2 border-b pb-1">
            <FaFileAlt size={14} />
            <span className="text-[11px] font-bold uppercase">
              Additional Remarks
            </span>
          </div>

          <div className="col-span-full space-y-1">
            <textarea
              className="w-full border rounded-lg p-3 text-sm h-20 resize-none"
              placeholder="Enter any transit updates or remarks here..."
              value={formData.transitRemarks || ""}
              onChange={(e) =>
                setFormData({ ...formData, transitRemarks: e.target.value })
              }
            />
          </div>
        </div>

        {/* Footer Actions */}
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
            {editData ? "Update Transit" : "Start Transit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransitWizard;
