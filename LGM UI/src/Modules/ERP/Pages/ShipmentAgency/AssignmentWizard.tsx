import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import Select from "react-select"; // Highly recommended for searchable dropdowns
import {
  createAssignment,
  updateAssignment,
  getAgenciesForDropdown,
  getShipmentsForDropdown,
  getShipmentDetails,
  getAgencyDetails,
  uploadAgencyDocument,
} from "./Services/AgencyAssignmentService";
import type { Agency } from "./Services/types";
import { FaShip, FaTruckLoading, FaInfoCircle } from "react-icons/fa";

// Styled InfoDisplay for read-only fields (copied pattern from your PI code)
const InfoDisplay = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div>
    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
      {label}
    </label>
    <div className="flex min-h-10 w-full items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
      {value || "N/A"}
    </div>
  </div>
);

const AssignmentWizard: React.FC<{
  editData: any;
  onSuccess: any;
  onCancel: any;
}> = ({ editData, onSuccess, onCancel }) => {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [shipmentDetails, setShipmentDetails] = useState<any>(null);
  const [isShipmentSelected, setIsShipmentSelected] = useState(false);
  const [, setIsFetching] = useState(false);
  const [sameAsShipper, setSameAsShipper] = useState(false);
  const [sameAsConsignee, setSameAsConsignee] = useState(false);
  const [forwarders, setForwarders] = useState<any[]>([]);
  const [chas, setChas] = useState<any[]>([]);
  const [selectedForwarderId, setSelectedForwarderId] = useState(0);
  const [selectedChaId, setSelectedChaId] = useState(0);
  const [selectedForwarderContact, setSelectedForwarderContact] =
    useState<any>(null);
  const [selectedChaContact, setSelectedChaContact] = useState<any>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<File[]>([]);

  const [formData, setFormData] = useState<{
    shipmentAgencyAssignmentId: number;
    shipmentInitiateId: number;
    agencyId: number;
    referenceNo: string;
    remarks: string;
    pickerAddress: string;
    deliveryAddress: string;
    agencyDocument: File | null;
  }>({
    shipmentAgencyAssignmentId: editData?.shipmentAgencyAssignmentId || 0,

    shipmentInitiateId: editData?.shipmentInitiateId || 0,

    agencyId: editData?.agencyId || 0,

    referenceNo: editData?.referenceNo || "",

    remarks: editData?.remarks || "",

    pickerAddress: editData?.pickerAddress || "",

    deliveryAddress: editData?.deliveryAddress || "",

    agencyDocument: null,
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [a, s] = await Promise.all([
          getAgenciesForDropdown(),
          getShipmentsForDropdown(),
        ]);
        setAgencies(a);
        // Format for React-Select
        setShipments(
          s.map((ship) => ({
            value: ship.shipmentInitiateId,
            label: ship.shipmentNo,
          })),
        );

        // If in Edit Mode, auto-load details
        if (editData?.shipmentInitiateId) {
          handleShipmentSelection(editData.shipmentInitiateId);
        }
      } catch (err) {
        toast.error("Failed to load options");
      }
    };
    loadInitialData();
  }, [editData]);

  useEffect(() => {
    const loadAgencyForEdit = async () => {
      if (!editData?.agencyId || agencies.length === 0) return;

      const agency = agencies.find((x: any) => x.id === editData.agencyId);

      if (!agency) return;

      if (agency.agencyTypeName?.toLowerCase() === "forwarder") {
        setSelectedForwarderId(editData.agencyId);

        await handleAgencySelection(editData.agencyId, "Forwarder");
      } else if (agency.agencyTypeName?.toLowerCase() === "cha") {
        setSelectedChaId(editData.agencyId);

        await handleAgencySelection(editData.agencyId, "CHA");
      }
    };

    loadAgencyForEdit();
  }, [editData, agencies]);

  useEffect(() => {
    setForwarders(
      agencies.filter(
        (x: any) => x.agencyTypeName?.toLowerCase() === "forwarder",
      ),
    );

    setChas(
      agencies.filter((x: any) => x.agencyTypeName?.toLowerCase() === "cha"),
    );
  }, [agencies]);

  const handleShipmentSelection = async (shipmentId: number) => {
    if (!shipmentId) return;
    setIsFetching(true);
    toast.loading("Fetching shipment details...");
    try {
      const details = await getShipmentDetails(shipmentId);
      setShipmentDetails(details);
      setFormData((prev) => ({ ...prev, shipmentInitiateId: shipmentId }));
      setIsShipmentSelected(true);
      toast.dismiss();
    } catch {
      toast.dismiss();
      toast.error("Error fetching shipment details");
    } finally {
      setIsFetching(false);
    }
  };

  const handleAgencySelection = async (
    agencyId: number,
    type: "Forwarder" | "CHA",
  ) => {
    try {
      const agency = await getAgencyDetails(agencyId);

      const contact = agency.contacts?.length > 0 ? agency.contacts[0] : null;

      if (type === "Forwarder") {
        setSelectedForwarderContact(contact);
      } else {
        setSelectedChaContact(contact);
      }

      setFormData((prev) => ({
        ...prev,
        agencyId,
      }));
    } catch {
      toast.error("Unable to load agency details");
    }
  };

  const handleSave = async () => {
    if (!formData.shipmentInitiateId || !formData.agencyId) {
      toast.error("Please select both Shipment and Agency");
      return;
    }

    try {
      if (formData.shipmentAgencyAssignmentId > 0) {
        await updateAssignment(formData);
      } else {
        await createAssignment(formData);
      }

      if (uploadedDocuments.length > 0) {
        await uploadAgencyDocument(
          formData.agencyId,
          formData.shipmentInitiateId,
          uploadedDocuments,
        );
      }

      toast.success("Assignment saved and email sent successfully");

      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Error saving assignment");
    }
  };

  return (
    <div className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 text-left shadow-xl animate-in fade-in zoom-in duration-300">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-[#f07837] px-6 py-5 text-white">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <FaShip />
          {formData.shipmentAgencyAssignmentId > 0
            ? "Edit Agency Assignment"
            : "New Agency Assignment"}
        </h2>
        <button onClick={onCancel} className="text-white/70 hover:text-white">
          Close
        </button>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {/* STEP 1: SHIPMENT SELECTION (Only show when not selected or in create mode) */}
        {!isShipmentSelected && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-8 shadow-inner">
            <label className="mb-3 block text-[11px] font-bold uppercase tracking-widest text-blue-900 text-center">
              Select Shipment to Begin
            </label>
            <div className="max-w-md mx-auto">
              <Select
                options={shipments}
                placeholder="Search Shipment Number..."
                onChange={(opt: any) => handleShipmentSelection(opt.value)}
                className="text-sm"
                menuPortalTarget={document.body}
                menuPosition="fixed"
                styles={{
                  menuPortal: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                }}
              />
            </div>
          </div>
        )}

        {/* STEP 2: DETAILS & EDITABLE FIELDS */}
        {isShipmentSelected && shipmentDetails && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-6">
            {/* READ ONLY SECTION */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <FaInfoCircle /> Shipment Information (Read-Only)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoDisplay
                  label="Shipment No"
                  value={shipmentDetails.shipmentNo}
                />
                <InfoDisplay
                  label="Customer"
                  value={shipmentDetails.customerName}
                />
                <InfoDisplay
                  label="Invoice No"
                  value={shipmentDetails.invoiceNo}
                />
                <InfoDisplay
                  label="Currency"
                  value={shipmentDetails.currencyName}
                />
                <InfoDisplay
                  label="Invoice Value"
                  value={shipmentDetails.invoiceValue}
                />
                <InfoDisplay label="Status" value={shipmentDetails.status} />
                <InfoDisplay
                  label="Shipment Date"
                  value={new Date(
                    shipmentDetails.shipmentDate,
                  ).toLocaleDateString()}
                />
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase">
                    Shipper Address
                  </label>
                  <div className="p-3 bg-slate-50 border rounded-xl text-xs text-slate-600 italic">
                    {shipmentDetails.shipperAddress}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase">
                    Consignee Address
                  </label>
                  <div className="p-3 bg-slate-50 border rounded-xl text-xs text-slate-600 italic">
                    {shipmentDetails.consigneeAddress}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase">
                      Pickup Address
                    </label>

                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={sameAsShipper}
                        onChange={(e) => {
                          setSameAsShipper(e.target.checked);

                          setFormData({
                            ...formData,
                            pickerAddress: e.target.checked
                              ? shipmentDetails.shipperAddress || ""
                              : "",
                          });
                        }}
                      />
                      Same as Shipper Address
                    </label>
                  </div>

                  <textarea
                    rows={3}
                    value={formData.pickerAddress}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pickerAddress: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 p-3 text-sm"
                    placeholder="Enter Picker Address"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase">
                      Delivery Address
                    </label>

                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={sameAsConsignee}
                        onChange={(e) => {
                          setSameAsConsignee(e.target.checked);

                          setFormData({
                            ...formData,
                            deliveryAddress: e.target.checked
                              ? shipmentDetails.consigneeAddress || ""
                              : "",
                          });
                        }}
                      />
                      Same as Consignee Address
                    </label>
                  </div>

                  <textarea
                    rows={3}
                    value={formData.deliveryAddress}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        deliveryAddress: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 p-3 text-sm"
                    placeholder="Enter Delivery Address"
                  />
                </div>
              </div>
            </div>

            {/* ITEM TABLE (Read-Only) */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b bg-slate-50">
                <h4 className="font-semibold text-slate-700">
                  Shipment Box Details
                </h4>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-bold">
                    <tr>
                      <th className="p-3 border text-left">Box No</th>
                      <th className="p-3 border text-center">Net Wt (Kg)</th>
                      <th className="p-3 border text-center">Gross Wt (Kg)</th>
                      <th className="p-3 border text-center">Length (Cm)</th>
                      <th className="p-3 border text-center">Width (Cm)</th>
                      <th className="p-3 border text-center">Height (Cm)</th>
                      <th className="p-3 border text-center">CBM</th>
                      <th className="p-3 border text-left">Remarks</th>
                    </tr>
                  </thead>

                  <tbody>
                    {shipmentDetails.shipmentItems?.map(
                      (item: any, idx: number) => (
                        <tr
                          key={idx}
                          className="border-t border-slate-100 hover:bg-slate-50"
                        >
                          <td className="p-3 border">{item.boxNo}</td>

                          <td className="p-3 border text-center">
                            {item.netWeightKg}
                          </td>

                          <td className="p-3 border text-center">
                            {item.grossWeightKg}
                          </td>

                          <td className="p-3 border text-center">
                            {item.lengthCm}
                          </td>

                          <td className="p-3 border text-center">
                            {item.widthCm}
                          </td>

                          <td className="p-3 border text-center">
                            {item.heightCm}
                          </td>

                          <td className="p-3 border text-center font-semibold">
                            {item.cbm?.toFixed(4)}
                          </td>

                          <td className="p-3 border">{item.remarks}</td>
                        </tr>
                      ),
                    )}
                  </tbody>

                  <tfoot>
                    <tr className="bg-blue-50 font-bold">
                      <td className="p-3 border text-right">Totals</td>

                      <td className="p-3 border text-center">
                        {shipmentDetails.shipmentItems
                          ?.reduce(
                            (sum: number, x: any) =>
                              sum + Number(x.netWeightKg || 0),
                            0,
                          )
                          .toFixed(2)}
                      </td>

                      <td className="p-3 border text-center">
                        {shipmentDetails.shipmentItems
                          ?.reduce(
                            (sum: number, x: any) =>
                              sum + Number(x.grossWeightKg || 0),
                            0,
                          )
                          .toFixed(2)}
                      </td>

                      <td className="border"></td>
                      <td className="border"></td>
                      <td className="border"></td>

                      <td className="p-3 border text-center">
                        {shipmentDetails.shipmentItems
                          ?.reduce(
                            (sum: number, x: any) => sum + Number(x.cbm || 0),
                            0,
                          )
                          .toFixed(4)}
                      </td>

                      <td className="border"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            {/* EDITABLE SECTION */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <FaTruckLoading /> Assignment Details
              </h3>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Agency Contact Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* FORWARDER */}

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Select Forwarder
                    </label>

                    <select
                      className="h-10 w-full rounded-xl border border-slate-300 px-3"
                      value={selectedForwarderId}
                      onChange={(e) => {
                        const agencyId = Number(e.target.value);

                        setSelectedForwarderId(agencyId);
                        setSelectedChaId(0);

                        handleAgencySelection(agencyId, "Forwarder");
                      }}
                    >
                      <option value="0">Select Forwarder</option>

                      {forwarders.map((agency) => (
                        <option key={agency.id} value={agency.id}>
                          {agency.agencyName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* CHA */}

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Select CHA
                    </label>

                    <select
                      className="h-10 w-full rounded-xl border border-slate-300 px-3"
                      value={selectedChaId}
                      onChange={(e) => {
                        const agencyId = Number(e.target.value);

                        setSelectedChaId(agencyId);
                        setSelectedForwarderId(0);

                        handleAgencySelection(agencyId, "CHA");
                      }}
                    >
                      <option value="0">Select CHA</option>

                      {chas.map((agency) => (
                        <option key={agency.id} value={agency.id}>
                          {agency.agencyName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {selectedForwarderContact && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-2">Forwarder Contact</h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <InfoDisplay
                        label="Person Name"
                        value={selectedForwarderContact.personName}
                      />

                      <InfoDisplay
                        label="Designation"
                        value={selectedForwarderContact.designation}
                      />

                      <InfoDisplay
                        label="Department"
                        value={selectedForwarderContact.department}
                      />

                      <InfoDisplay
                        label="Mobile No"
                        value={selectedForwarderContact.mobileNo}
                      />

                      <InfoDisplay
                        label="Email"
                        value={selectedForwarderContact.emailAddress}
                      />
                    </div>
                  </div>
                )}

                {selectedChaContact && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-2">CHA Contact</h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <InfoDisplay
                        label="Person Name"
                        value={selectedChaContact.personName}
                      />

                      <InfoDisplay
                        label="Designation"
                        value={selectedChaContact.designation}
                      />

                      <InfoDisplay
                        label="Department"
                        value={selectedChaContact.department}
                      />

                      <InfoDisplay
                        label="Mobile No"
                        value={selectedChaContact.mobileNo}
                      />

                      <InfoDisplay
                        label="Email"
                        value={selectedChaContact.emailAddress}
                      />
                    </div>
                  </div>
                )}

                {/* Upload Document */}

                <div className="mt-6">
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-2">
                    Upload Document
                  </label>

                  <div className="flex gap-4 items-center">
                    <input
                      type="text"
                      readOnly
                      value={
                        uploadedDocuments.length > 0
                          ? `${uploadedDocuments.length} file(s) selected`
                          : "No file selected"
                      }
                      placeholder="Select Documents"
                      className="flex-1 rounded-xl border border-slate-300 p-3"
                    />

                    <input
                      id="agencyDoc"
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);

                        setUploadedDocuments((prev) => {
                          const merged = [...prev, ...files];

                          const uniqueFiles = merged.filter(
                            (file, index, self) =>
                              index ===
                              self.findIndex(
                                (f) =>
                                  f.name === file.name && f.size === file.size,
                              ),
                          );

                          return uniqueFiles;
                        });

                        e.target.value = "";
                      }}
                    />

                    <label
                      htmlFor="agencyDoc"
                      className="cursor-pointer px-7 py-2 border rounded-xl font-semibold"
                    >
                      Choose File
                    </label>
                  </div>

                  {uploadedDocuments.length > 0 && (
                    <div className="mt-2 text-sm text-green-600">
                      {uploadedDocuments.map((f, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between"
                        >
                          <span>{f.name}</span>

                          <button
                            type="button"
                            className="text-red-500 ml-2"
                            onClick={() =>
                              setUploadedDocuments((prev) =>
                                prev.filter((_, index) => index !== i),
                              )
                            }
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Assignment Remarks
                  </label>
                  <textarea
                    className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm focus:border-blue-500 focus:outline-none text-slate-700 h-24 resize-none"
                    value={formData.remarks}
                    onChange={(e) =>
                      setFormData({ ...formData, remarks: e.target.value })
                    }
                    placeholder="Add internal notes for this agency assignment..."
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
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
                  Save Assignment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentWizard;
