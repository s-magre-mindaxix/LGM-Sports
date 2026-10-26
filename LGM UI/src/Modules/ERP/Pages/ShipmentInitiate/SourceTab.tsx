import React, { useEffect, useState } from "react";
import {
  getOADropdown,
  getPODropdown,
  getOADetails,
  getPODetails,
} from "./Services/ShipmentService";
import type { ShipmentTabProps, ShipmentDropdown } from "./Services/types";

const SourceTab: React.FC<ShipmentTabProps> = ({ data, setData }) => {
  const [dropdowns, setDropdowns] = useState<ShipmentDropdown[]>([]);

  useEffect(() => {
    if (data.sourceType === "ORDERACCEPTANCE")
      getOADropdown().then(setDropdowns);
    else if (data.sourceType === "PURCHASEORDER")
      getPODropdown().then(setDropdowns);
  }, [data.sourceType]);

  const handleSourceIdChange = async (id: number) => {
    if (!id) return;

    const selectedDoc =
        dropdowns.find(x => x.id === id);

    try {
        const details =
            data.sourceType === "ORDERACCEPTANCE"
                ? await getOADetails(id)
                : await getPODetails(id);

        setData(prev => ({
            ...prev,

            orderAcceptanceId:
                prev.sourceType === "ORDERACCEPTANCE"
                    ? id
                    : undefined,

            purchaseOrderId:
                prev.sourceType === "PURCHASEORDER"
                    ? id
                    : undefined,

            sourceDocumentNo: selectedDoc?.number,

            customerId: details.customerId,
            customerName: details.customerName,
            gstNo: details.gstNo,
            consigneeAddress: details.consigneeAddress,
            shipperAddress: details.shipperAddress,
            invoiceValue: details.invoiceValue,
            currencyId: details.currencyId,
            currencyName: details.currencyName,
            sourceItems: details.sourceItems || [],
              items: [] 
        }));
    }
    catch (err) {
        console.error(err);
    }
};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <label className="block text-xs font-bold text-gray-700 uppercase">
          Source Type
        </label>
        <select
          className="w-full border p-2 rounded"
          value={data.sourceType}
        onChange={e =>
    setData(prev => ({
        ...prev,
        sourceType: e.target.value as any,
         sourceDocumentNo: "",
        orderAcceptanceId: undefined,
        purchaseOrderId: undefined,
        customerId: undefined,
        customerName: "",
        gstNo: "",
        consigneeAddress: "",
        shipperAddress: "",
        invoiceValue: 0,
        currencyId: undefined,
        currencyName: "",
        items: [],
        sourceItems: []
    }))
}
        >
          <option value="">Select Source</option>
          <option value="ORDERACCEPTANCE">Order Acceptance (GBP)</option>
          <option value="PURCHASEORDER">Purchase Order</option>
        </select>

        <label className="block text-xs font-bold text-gray-700 uppercase">
          Source Order No
        </label>
        <select
          className="w-full border p-2 rounded"
          value={
            data.sourceType === "ORDERACCEPTANCE"
              ? data.orderAcceptanceId
              : data.purchaseOrderId
          }
          onChange={(e) => handleSourceIdChange(Number(e.target.value))}
        >
          <option value="0">Select Document</option>
          {dropdowns.map((d) => (
            <option key={d.id} value={d.id}>
              {d.number}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 bg-blue-50 p-4 rounded-lg">
        <h4 className="font-bold text-[#0b2c52] border-b pb-1">Fetched Info</h4>
        <p className="text-sm">
          <b>Customer:</b> {data.customerName || "N/A"}
        </p>
        <p className="text-sm">
          <b>GST:</b> {data.gstNo || "N/A"}
        </p>
        <p className="text-sm">
          <b>Currency:</b> {data.currencyName} | <b>Value:</b>{" "}
          {data.invoiceValue}
        </p>
        <div className="text-xs text-gray-600">
          <p>
            <b>Consignee Addr:</b> {data.consigneeAddress}
          </p>
          <p className="mt-2">
            <b>Shipper Addr:</b> {data.shipperAddress}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SourceTab;
