import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  FaExclamationTriangle,
  FaMicrochip,
  FaLaptopCode,
  FaBug,
  FaTools,
  FaCommentDots,
  FaTrash,
  FaFileAlt,
  FaPlus,
} from "react-icons/fa";
import type { FaultReport } from "./Services/types";
import {
  createFaultReport,
  updateFaultReport,
  getAllCustomers,
} from "./Services/FaultReportService";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";
import Select from "react-select";

interface FormProps {
  editData: FaultReport | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const initialData: FaultReport = {
  id: 0,
  reportDate: new Date().toISOString().slice(0, 10),
  device: "",
  customerId: 0,
  customerName: "",
  serialNumber: "",
  firmware: "",
  software: "",
  softwareVersion: "",
  specialSoftware: "",
  configuration: "",
  powerSource: "",
  cabelsConnected: "",
  modulesConnected: "",
  modulesFirmware: "",
  voltage: "",
  led: "",
  internalBattery: "",
  gpsBattery: "",
  coldStarted: false,
  defaultReset: false,
  settingChecked: false,
  firmwareUpdated: false,
  notes: "",
  comments: "",
};

const SectionHeader = ({
  title,
  icon,
}: {
  title: string;
  icon: React.ReactNode;
}) => (
  <h3 className="flex items-center gap-2 text-base font-bold text-gray-800 border-b border-gray-300 pb-2 mb-6 mt-4 first:mt-0">
    <span className="text-blue-600">{icon}</span>
    {title}
  </h3>
);

const FaultReportForm: React.FC<FormProps> = ({
  editData,
  onSuccess,
  onCancel,
}) => {
  const labelStyle =
    "text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest";
  const inputStyle =
    "w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm";
  const checkboxLabelStyle =
    "flex items-center gap-3 text-sm font-semibold text-gray-700 cursor-pointer";
  const checkboxStyle =
    "w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer";

  const [data, setData] = useState<FaultReport>(initialData);
  const [customers, setCustomers] = useState<
    { id: number; customerName: string }[]
  >([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const res = await getAllCustomers();
        setCustomers(res);
      } catch {
        toast.error("Failed to load customer list.");
      }
    };
    loadCustomers();
  }, []);

  useEffect(() => {
    if (editData) {
      const formattedDate = editData.reportDate
        ? new Date(editData.reportDate).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10);
      setData({ ...editData, reportDate: formattedDate });
    } else {
      setData(initialData);
    }
  }, [editData]);

  useEffect(() => {
  const urls = (data.reportFiles || []).map((f) =>
    URL.createObjectURL(f)
  );
  setPreviews(urls);

  return () => urls.forEach((u) => URL.revokeObjectURL(u));
}, [data.reportFiles]);

const removeNewFile = (index: number) => {
  setData((prev) => ({
    ...prev,
    reportFiles: prev.reportFiles?.filter((_, i) => i !== index),
  }));
};

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    if (name === "customerId") {
      const selectedCustomer = customers.find((c) => c.id === parseInt(value));
      setData((prev) => ({
        ...prev,
        customerId: parseInt(value),
        customerName: selectedCustomer?.customerName || "",
      }));
    } else if (type === "checkbox") {
      setData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!data.customerId || !data.device.trim() || !data.serialNumber.trim()) {
      toast.error(
        "Please fill out all required fields: Device, Customer, and Serial Number.",
      );
      return;
    }

    const saveAction = async () => {
      if (data.id) {
        await updateFaultReport(data.id, data);
      } else {
        await createFaultReport(data);
      }
    };

    toast.promise(saveAction(), {
      loading: "Saving report...",
      success: () => {
        onSuccess();
        return `Fault Report ${data.id ? "updated" : "created"} successfully!`;
      },
      error: (err: any) =>
        `Failed to save: ${err.message || "An error occurred."}`,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-gray-50 p-4 flex justify-between items-center border-b">
        <div className="flex items-center gap-2">
          <FaExclamationTriangle className="text-xl text-amber-500" />
          <h2 className="text-lg font-bold text-[#0b2c52] uppercase tracking-tight">
            {editData ? "Edit Fault Report" : "Create New Fault Report"}
          </h2>
        </div>
      </div>

      <div className="p-4">
        {/* Hardware Information Section */}
        <section className="mb-5">
          <SectionHeader title="Hardware Information" icon={<FaMicrochip />} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
            <div>
              <label className={labelStyle}>Select Date</label>
              <input
                type="date"
                name="reportDate"
                value={data.reportDate}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
            <div>
              <label className={labelStyle}>Device</label>
              <input
                type="text"
                name="device"
                value={data.device}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
            <div className="flex flex-col">
              <label className={labelStyle}>Customer</label>
              <Select
                options={customers.map((c) => ({
                  value: c.id,
                  label: c.customerName,
                }))}
                value={
                  customers
                    .map((c) => ({
                      value: c.id,
                      label: c.customerName,
                    }))
                    .find((c) => c.value === data.customerId) || null
                }
                onChange={(opt: any) => {
                  setData((prev) => ({
                    ...prev,
                    customerId: opt?.value || 0,
                    customerName: opt?.label || "",
                  }));
                }}
                placeholder="Search Customer..."
                isClearable
                menuPortalTarget={document.body}
                menuPosition="fixed"
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
              />
            </div>
            <div>
              <label className={labelStyle}>Serial Number</label>
              <input
                type="text"
                name="serialNumber"
                value={data.serialNumber}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
            <div>
              <label className={labelStyle}>Firmware</label>
              <input
                type="text"
                name="firmware"
                value={data.firmware}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
            <div>
              <label className={labelStyle}>Power Source</label>
              <input
                type="text"
                name="powerSource"
                value={data.powerSource}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
            <div>
              <label className={labelStyle}>Cables Connected</label>
              <input
                type="text"
                name="cabelsConnected"
                value={data.cabelsConnected}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
            <div>
              <label className={labelStyle}>Modules Connected</label>
              <input
                type="text"
                name="modulesConnected"
                value={data.modulesConnected}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
            <div>
              <label className={labelStyle}>Modules Firmware</label>
              <input
                type="text"
                name="modulesFirmware"
                value={data.modulesFirmware}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
            <div>
              <label className={labelStyle}>Voltage on Antenna Connector</label>
              <input
                type="text"
                name="voltage"
                value={data.voltage}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
            <div>
              <label className={labelStyle}>LED Indications</label>
              <input
                type="text"
                name="led"
                value={data.led}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
          </div>
        </section>

        {/* Software Information Section */}
        <section className="mb-5">
          <SectionHeader title="Software Information" icon={<FaLaptopCode />} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
            <div>
              <label className={labelStyle}>Configuration Software</label>
              <input
                type="text"
                name="configuration"
                value={data.configuration}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
            <div>
              <label className={labelStyle}>Software for Live Data</label>
              <input
                type="text"
                name="software"
                value={data.software}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
            <div>
              <label className={labelStyle}>Software Version</label>
              <input
                type="text"
                name="softwareVersion"
                value={data.softwareVersion}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelStyle}>Special Software (if any)</label>
              <input
                type="text"
                name="specialSoftware"
                value={data.specialSoftware}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
          </div>
        </section>

        {/* Fault Reported by the Customer Section */}
        <section className="mb-5">
          <SectionHeader
            title="Fault Reported by the Customer"
            icon={<FaBug />}
          />
          <textarea
            name="notes"
            value={data.notes}
            onChange={handleChange}
            rows={3}
            className={`${inputStyle} rounded-xl`}
            placeholder="Describe the fault reported by the customer..."
          />
        </section>

        {/* Fault Diagnosis Already Completed Section */}
        <section className="mb-0">
          <SectionHeader
            title="Fault Diagnosis Already Completed"
            icon={<FaTools />}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 items-center">
            {/* Checkboxes */}
            <label className={checkboxLabelStyle}>
              <input
                type="checkbox"
                name="coldStarted"
                checked={data.coldStarted}
                onChange={handleChange}
                className={checkboxStyle}
              />
              Coldstarted?
            </label>
            <label className={checkboxLabelStyle}>
              <input
                type="checkbox"
                name="defaultReset"
                checked={data.defaultReset}
                onChange={handleChange}
                className={checkboxStyle}
              />
              Default Reset?
            </label>
            <label className={checkboxLabelStyle}>
              <input
                type="checkbox"
                name="settingChecked"
                checked={data.settingChecked}
                onChange={handleChange}
                className={checkboxStyle}
              />
              Settings Checked and Screenshots Taken?
            </label>
            <label className={checkboxLabelStyle}>
              <input
                type="checkbox"
                name="firmwareUpdated"
                checked={data.firmwareUpdated}
                onChange={handleChange}
                className={checkboxStyle}
              />
              Firmware Updated or Changed?
            </label>

            {/* Text Inputs */}
            <div>
              <label className={labelStyle}>Internal Battery Voltage?</label>
              <input
                type="text"
                name="internalBattery"
                value={data.internalBattery}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
            <div>
              <label className={labelStyle}>GPS Battery Voltage?</label>
              <input
                type="text"
                name="gpsBattery"
                value={data.gpsBattery}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
          </div>
        </section>

        {/* Comments Section */}
        <section className="mb-0">
          <SectionHeader title="Comments" icon={<FaCommentDots />} />
          <textarea
            name="comments"
            value={data.comments}
            onChange={handleChange}
            rows={3}
            className={`${inputStyle} rounded-xl`}
            placeholder="Comments..."
          />
        </section>

        <section className="mt-6">
  <SectionHeader title="Attachments / Images" icon={<FaFileAlt />} />

  <div className="flex gap-4 overflow-x-auto py-3">
    {/* Upload Button */}
    <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition shrink-0">
      <FaPlus className="text-gray-400" />
      <input
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            setData({
              ...data,
              reportFiles: [
                ...(data.reportFiles || []),
                ...Array.from(e.target.files),
              ],
            });
          }
        }}
      />
    </label>

    {/* Preview */}
    {previews.map((u, i) => (
      <div
        key={i}
        className="relative w-24 h-24 border rounded-xl overflow-hidden group shrink-0"
      >
        <img src={u} className="w-full h-full object-cover" />
        <button
          onClick={() => removeNewFile(i)}
          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
        >
          <FaTrash size={10} />
        </button>
      </div>
    ))}
  </div>
</section>
      </div>

      <div className="bg-gray-50 p-4 flex justify-end items-center border-b">
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className={buttonStyles.cancel + " flex items-center gap-2"}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={buttonStyles.save + " flex items-center gap-2"}
          >
            Save Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default FaultReportForm;
