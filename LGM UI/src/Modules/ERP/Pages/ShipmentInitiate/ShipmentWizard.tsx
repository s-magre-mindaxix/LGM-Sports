import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  createShipment,
  updateShipment,
  getNextShipmentNo,
} from "./Services/ShipmentService";
import type { ShipmentInitiate } from "./Services/types";
// import SourceTab from "./Tabs/SourceTab";
import SourceTab from "./SourceTab";
import ShipmentDetailsTab from "./ShipmentDetailsTab";
import ItemsTab from "./ItemsTab";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";

const ShipmentWizard: React.FC<{
  editData: any;
  onSuccess: any;
  onCancel: any;
}> = ({ editData, onSuccess, onCancel }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState<ShipmentInitiate>(
    editData || {
      shipmentInitiateId: 0,
      shipmentNo: "",
      sourceType: "",
      shipmentModeId: 0,
      shipmentTypeId: 0,
      invoiceNo: "",
      shipmentDate: new Date().toISOString().split("T")[0],
      items: [],
      sourceItems: [],
    },
  );

  useEffect(() => {
    if (!editData) {
      getNextShipmentNo().then((no) =>
        setData((prev) => ({ ...prev, shipmentNo: no })),
      );
    }
  }, [editData]);

  const tabs = ["Source & Addresses", "Shipment Details", "Packing Details"];

  const handleSave = async () => {
    try {
      data.shipmentInitiateId > 0
        ? await updateShipment(data)
        : await createShipment(data);
      toast.success("Shipment Saved!");
      onSuccess();
    } catch {
      toast.error("Error saving shipment");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
      <div className="flex bg-[#f07837] p-1 gap-1">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`flex-1 py-3 text-[11px] font-bold uppercase ${activeTab === i ? "bg-white text-[#154068]" : "text-white"}`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="p-8">
        {activeTab === 0 && <SourceTab data={data} setData={setData} />}
        {activeTab === 1 && (
          <ShipmentDetailsTab data={data} setData={setData} />
        )}
        {activeTab === 2 && <ItemsTab data={data} setData={setData} />}
      </div>
      <div className="p-4 bg-gray-50 flex justify-end gap-2">
        <button onClick={onCancel} className={buttonStyles.cancel}>
          Cancel
        </button>
        {activeTab > 0 && (
          <button
            onClick={() => setActiveTab(activeTab - 1)}
            className={buttonStyles.back}
          >
            Back
          </button>
        )}
        {activeTab < 2 ? (
          <button
            onClick={() => setActiveTab(activeTab + 1)}
            className={buttonStyles.next}
          >
            Next
          </button>
        ) : (
          <button onClick={handleSave} className={buttonStyles.save}>
            Save Shipment
          </button>
        )}
      </div>
    </div>
  );
};

export default ShipmentWizard;
