import React, { useEffect, useState } from "react";
import { type TableColumn } from "react-data-table-component";
import { toast } from "sonner";
import ListingLayout from "../../../../../Components/Common/ListingLayout";
import { getShipmentLandedCostReport } from "./Services/ShipmentLandedCostService";
import type { ShipmentLandedCostReportDto, ShipmentLandedCostSummaryDto } from "./Services/types";
import SummaryCards from "./SummaryCards";

const ShipmentLandedCostPage: React.FC = () => {
  const [reports, setReports] = useState<ShipmentLandedCostReportDto[]>([]);
  const [summary, setSummary] = useState<ShipmentLandedCostSummaryDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // 1. Add Filter State
  const [filterText, setFilterText] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await getShipmentLandedCostReport();
      setReports(res.reports);
      setSummary(res.summary);
    } catch (error) {
      toast.error("Failed to load Landed Cost Report");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 2. Filter data locally for the table search bar
  const filteredData = reports.filter((item) =>
    (item.shipmentNo?.toLowerCase() || "").includes(filterText.toLowerCase()) ||
    (item.customerName?.toLowerCase() || "").includes(filterText.toLowerCase())
  );

  const columns: TableColumn<ShipmentLandedCostReportDto>[] = [
    { 
      name: "Shipment No", 
      selector: (row) => row.shipmentNo, 
      sortable: true, 
      width: "160px",
       cell: (row) => <span className="font-semibold text-blue-600">{row.shipmentNo}</span>
    },
    { 
      name: "Inv Value (Foreign)", 
      selector: (row) => row.invoiceValue.toLocaleString(undefined, { minimumFractionDigits: 2 }), 
      right: true,
      width: "140px" 
    },
    { 
      name: "Custom Duty", 
      selector: (row) => row.customDuty.toLocaleString(), 
      right: true 
    },
    { 
      name: "IGST", 
      selector: (row) => row.igst.toLocaleString(), 
      right: true 
    },
    { 
      name: "Forwarding Expense", 
      selector: (row) => row.forwardingExpense.toLocaleString(), 
      right: true 
    },
    { 
      name: "Clearing Expense", 
      selector: (row) => row.clearingExpense.toLocaleString(), 
      right: true 
    },
    { 
      name: "Transport Expense", 
      selector: (row) => row.transportationExpense.toLocaleString(), 
      right: true 
    },
    { 
      name: "Total Landed Cost", 
      cell: (row) => (
        <div className="text-right w-full">
          <span className="font-bold text-blue-700">
            ₹{row.totalLandedCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
          <div className="text-[10px] text-gray-400">Ex. Rate: {row.boeExchangeRate}</div>
        </div>
      ), 
      right: true,
      sortable: true,
      width: "180px"
    },
  ];

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen">
      {/* 1. Added Page Header to match Image 1 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Shipment Landed Cost Report</h1>
        <p className="text-slate-500 text-sm">Detailed breakdown of landed costs and expense calculation for all shipments</p>
      </div>

      {/* 2. Summary Section */}
      <div className="mb-8">
        {summary && <SummaryCards summary={summary} />}
      </div>

      {/* 3. Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <ListingLayout
          title="Landed Cost Details" // Changed title to match "Transit Details" style
          columns={columns}
          data={filteredData}
          isLoading={isLoading}
          filterText={filterText}
          onFilterChange={(val) => setFilterText(val)}
          onCreate={undefined} 
        />
      </div>
    </div>
  );
};

export default ShipmentLandedCostPage;