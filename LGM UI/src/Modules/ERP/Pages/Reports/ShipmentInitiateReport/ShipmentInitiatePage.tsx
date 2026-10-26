import React, { useEffect, useState } from "react";
import { type TableColumn } from "react-data-table-component";
import { toast } from "sonner";
import ListingLayout from "../../../../../Components/Common/ListingLayout";
import { getShipmentStatusReport } from "./Services/ShipmentInitiateService";
import type { ShipmentStatusReportDto, ShipmentStatusSummary } from "./Services/types";
import SummaryCards from "./SummaryCards";

const ShipmentStatusPage: React.FC = () => {
  const [reports, setReports] = useState<ShipmentStatusReportDto[]>([]);
 const [summary, setSummary] = useState<ShipmentStatusSummary>({
  totalShipments: 0,
  shipmentInitiated: 0,
  shipmentInTransit: 0,
  shipmentClosed: 0,
});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getShipmentStatusReport();
      setReports(data);
      
      // Calculate summary totals from the fetched data
     const totals = {
  totalShipments: data.length,
  shipmentInitiated: data.filter(
    x => x.status === "Shipment Initiated"
  ).length,

  shipmentInTransit: data.filter(
    x => x.status === "In Transit"
  ).length,

  shipmentClosed: data.filter(
    x => x.status === "Closed"
  ).length,
};

setSummary(totals);

    } catch (error) {
      toast.error("Failed to load Shipment Status Report");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns: TableColumn<ShipmentStatusReportDto>[] = [
    {
      name: "Shipment No",
      selector: (row) => row.shipmentNo,
      sortable: true,
      cell: (row) => <span className="font-bold text-blue-700">{row.shipmentNo}</span>,
      width: "150px"
    },
    {
      name: "Shipment Date",
      selector: (row) => new Date(row.shipmentDate).toLocaleDateString(),
      sortable: true,
      width: "130px"
    },
    {
      name: "Customer Name",
      selector: (row) => row.customerName || "N/A",
      sortable: true,
      grow: 2,
    },
    {
      name: "Invoice Info",
      cell: (row) => (
        <div className="py-1">
          <div className="font-medium text-gray-800">{row.invoiceNo || "No Inv."}</div>
          <div className="text-[11px] text-gray-500">
            {row.invoiceValue?.toLocaleString()} {row.currencyName}
          </div>
        </div>
      ),
      width: "160px"
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <span className="px-2 py-1 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase">
          {row.status}
        </span>
      ),
      width: "120px"
    },
    {
      name: "Net Weight",
      selector: (row) => `${row.totalNetWeightKg.toLocaleString()} kg`,
      right: true,
    },
    {
      name: "Gross Weight",
      selector: (row) => `${row.totalGrossWeightKg.toLocaleString()} kg`,
      right: true,
    },
    {
      name: "CBM",
      selector: (row) => row.totalCBM.toFixed(3),
      right: true,
      width: "100px"
    },
  ];

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Top Summary Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-800">Shipment Status Report</h1>
        <p className="text-sm text-gray-500">Overview of all active and completed shipments</p>
      </div>

     <SummaryCards
    summary={summary}
    onCardClick={(status) => setSelectedStatus(status)}
/>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <ListingLayout
          title="Shipment Details"
          columns={columns}
         data={
    selectedStatus === "All"
        ? reports
        : reports.filter(x => x.status === selectedStatus)
}
          isLoading={isLoading}
          // Passing empty search functionality since filters were removed
          filterText=""
          onFilterChange={() => {}}
          onCreate={undefined} 
        />
      </div>
    </div>
  );
};

export default ShipmentStatusPage;