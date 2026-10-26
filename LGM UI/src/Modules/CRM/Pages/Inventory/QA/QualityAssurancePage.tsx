import React, { useEffect, useState, useMemo } from "react";
import DataTable, { type TableColumn } from "react-data-table-component";
import { FaHistory, FaHourglassHalf } from "react-icons/fa"; // Added FaClipboardCheck
import { toast } from "sonner";
import { getPendingQA, getQAHistory } from "./Services/QualityAssuranceService";
import type { QualityAssurance } from "./Services/types";
import QAActionModal from "./QAActionModal";
import { listingTableStyles } from "../../../../../Components/Common/listingTableStyles";
import LogoLoader from "../../../../../Components/Common/LogoLoader";

const QualityAssurancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [list, setList] = useState<QualityAssurance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterText, setFilterText] = useState("");

  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    row: QualityAssurance | null;
  }>({
    isOpen: false,
    row: null,
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data =
        activeTab === "pending" ? await getPendingQA() : await getQAHistory();
      setList(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load quality inspection data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const columns: TableColumn<QualityAssurance>[] = [
    {
      name: "Sr. No.",
      selector: (_, i) => (i ?? 0) + 1,
      width: "80px",
      sortable: true,
    },
    {
      name: "Date",
      selector: (row) => new Date(row.createdDate).toLocaleDateString(),
      sortable: true,
      width: "130px",
    },
      {
    name: "Source Info",
    cell: (row) => (
      <div className="flex flex-col py-2">
        <span className="text-[11px] font-bold text-blue-800">Ship: {row.shipmentNo}</span>
        <span className="text-[10px] text-gray-500">PO: {row.purchaseOrderNo || "N/A"}</span>
      </div>
    ),
    width: "150px",
  },
    { name: "Item Name", selector: (row) => row.itemName, grow: 2, wrap: true },
    { name: "Code", selector: (row) => row.itemCode, width: "160px" },
    {
      name: "Qty",
      selector: (row) => row.quantity,
      width: "80px",
      style: { fontWeight: 900, fontSize: "18px", color: "#143463" },
    },
    {
      name: "Status",
      cell: (row) => {
        const status = row.status?.toUpperCase();
        return (
          <span
            className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${
              status === "PENDING"
                ? "bg-yellow-100 text-yellow-700"
                : status === "ACCEPTED"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
            }`}
          >
            {row.status}
          </span>
        );
      },
      width: "120px",
    },
    {
      name: "Actions",
      cell: (row) =>
        row.status?.toUpperCase() === "PENDING" ? (
          <button
            onClick={() => setActionModal({ isOpen: true, row })}
            className="bg-[#f07837] text-white px-5 py-2 rounded-full font-black text-[12px]  shadow-md hover:bg-[#0f2a4f] transition flex items-center gap-1 hover:scale-105"
          >
            Review Item
          </button>
        ) : (
          <span className="text-[10px] font-bold text-gray-400 italic tracking-widest uppercase ml-4">
            PROCESSED
          </span>
        ),
      width: "160px",
    },
  ];

  const filteredItems = useMemo(() => {
    return list.filter(
      (x) =>
        (x.itemName || "").toLowerCase().includes(filterText.toLowerCase()) ||
        (x.itemCode || "").toLowerCase().includes(filterText.toLowerCase()),
    );
  }, [list, filterText]);

  return (
    <div className="p-4 bg-[#f5f6fa] min-h-screen space-y-6 text-left ">
      {/* Header / Tabs Row */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white p-5 rounded-3xl shadow-md border border-gray-200">
        <div className="flex items-center gap-3"></div>

        <div className="flex bg-[#f07837] p-1.5 rounded-2xl gap-2 shadow-lg">
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-[11px] font-black transition ${activeTab === "pending" ? "bg-white text-[#143463] shadow-md" : "text-white/70 hover:text-white"}`}
          >
            <FaHourglassHalf /> PENDING
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-[11px] font-black transition ${activeTab === "history" ? "bg-white text-[#143463] shadow-md" : "text-white/70 hover:text-white"}`}
          >
            <FaHistory /> QA HISTORY
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8  pb-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-[#143463] pb-1 whitespace-nowrap">
            Listing of Quality Assurance
          </h2>

          <div className="flex items-center justify-end w-full">
            <label className="text-gray-600 mr-2">Search:</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md px-3 py-2 w-72 bg-white"
              placeholder="Search QA..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredItems}
          pagination
          striped
          highlightOnHover
          customStyles={listingTableStyles}
          progressPending={isLoading}
          progressComponent={<LogoLoader />}
          persistTableHead
        />
      </div>

      {actionModal.isOpen && actionModal.row && (
        <QAActionModal
          row={actionModal.row}
          onClose={() => setActionModal({ isOpen: false, row: null })}
          onSave={loadData}
        />
      )}
    </div>
  );
};

export default QualityAssurancePage;
