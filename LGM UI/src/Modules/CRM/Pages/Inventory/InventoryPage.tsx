import React, { useEffect, useState, useMemo } from "react";
import DataTable, { type TableColumn } from "react-data-table-component";
import {
  FaBoxes,
  FaPlusCircle,
  FaHistory,
  FaExchangeAlt,
  FaExclamationTriangle,
  FaTrash,
} from "react-icons/fa";
import { toast } from "sonner";

// Services & Types
import {
  getInventorySummary,
  getScrapHistory,
  getTransactionHistory,
} from "./Services/InventoryService";
import type { InventoryItem, ScrapRecord } from "./Services/types";

// Components
import StockAdjustmentModal from "./StockAdjustmentModal";
import ScrapModal from "./ScrapModal";
import { listingTableStyles } from "../../../../Components/Common/listingTableStyles";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";
import { usePermissions } from "../../../../hooks/usePermissions";
import LogoLoader from "../../../../Components/Common/LogoLoader";

const InventoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"stock" | "scrap" | "logs">(
    "stock",
  );
  const [typeFilter, setTypeFilter] = useState("All");
  const [stockList, setStockList] = useState<InventoryItem[]>([]);
  const [scrapList, setScrapList] = useState<ScrapRecord[]>([]);
  const [logList, setLogList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterText, setFilterText] = useState("");

  const { hasPermission } = usePermissions();
  // const canAdd = hasPermission("Inventory", "CanAdd");
  const canEdit = hasPermission("Inventory", "CanEdit");
  const canDelete = hasPermission("Inventory", "CanDelete");

  const [adjModal, setAdjModal] = useState<{ isOpen: boolean; row: any }>({
    isOpen: false,
    row: null,
  });
  const [scrapModal, setScrapModal] = useState<{ isOpen: boolean; row: any }>({
    isOpen: false,
    row: null,
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "stock")
        setStockList(await getInventorySummary(typeFilter));
      if (activeTab === "logs") setLogList(await getTransactionHistory());
      if (activeTab === "scrap") setScrapList(await getScrapHistory());
    } catch {
      toast.error("Failed to load inventory data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, typeFilter]);

  // --- 1. STOCK SUMMARY COLUMNS ---
  const stockColumns: TableColumn<InventoryItem>[] = [
    {
      name: "Sr. No.",
      selector: (_, i) => (i ?? 0) + 1,
      width: "90px",
      sortable: true,
    },
    {
      name: "Code",
      selector: (row) => row.code,
      sortable: true,
      width: "160px",
    },
    {
      name: "Item Name",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800">{row.name}</span>
          {row.description && (
            <span className="text-xs text-gray-500">({row.description})</span>
          )}
        </div>
      ),
      sortable: true,
      grow: 2,
      wrap: true,
    },
    { name: "Category", selector: (row) => row.itemType, width: "140px" },
    {
      name: "Stock",
      cell: (row) => (
        <div
          className={`flex items-center gap-2 font-black text-lg ${row.currentStock <= row.warningLimit ? "text-red-600" : "text-green-700"}`}
        >
          {row.currentStock}
          {row.currentStock <= row.warningLimit && (
            <FaExclamationTriangle className="animate-bounce" />
          )}
        </div>
      ),
      sortable: true,
      width: "150px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-3">
          {canEdit && (
            <button
              onClick={() => setAdjModal({ isOpen: true, row })}
              className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
            >
              <FaPlusCircle size={16} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => setScrapModal({ isOpen: true, row })}
              className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
            >
              <FaTrash size={16} />
            </button>
          )}
        </div>
      ),
      width: "120px",
    },
  ];

  // --- 2. IN/OUT LOGS COLUMNS ---
  const logColumns: TableColumn<any>[] = [
    {
      name: "Sr. No.",
      selector: (_, i) => (i ?? 0) + 1,
      width: "90px",
      sortable: true,
    },
    {
      name: "Date",
      selector: (row) =>
        row.timestamp
          ? new Date(row.timestamp).toLocaleDateString("en-GB")
          : "-",
      sortable: true,
      width: "120px",
    },
    {
      name: "Item Name",
      selector: (row) => row.itemName,
      grow: 1.5,
      wrap: true,
    },
    {
      name: "Item Code",
      selector: (row) => row.itemCode || "-",
      sortable: true,
      width: "160px",
    },
     {
    name: "Reference",
    cell: (row) => (
      <div className="flex flex-col">
        <span className="font-bold text-[#154068]">{row.referenceNo || "N/A"}</span>
        
        {row.purchaseOrderId && (
          <span className="text-[9px] text-gray-400">PO ID: {row.purchaseOrderId}</span>
        )}
      </div>
    ),
    width: "140px",
  },
    {
      name: "Action",
      cell: (row) => (
        <span
          className={`px-3 py-1 rounded text-[10px] font-black uppercase ${row.transactionType === "Stock In" ? "bg-green-100 text-green-700" : row.transactionType === "Scrap" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}
        >
          {row.transactionType}
        </span>
      ),
      width: "130px",
    },
    {
      name: "Qty",
      selector: (row) => row.quantity,
      width: "80px",
      style: { fontWeight: "bold" },
    },
    { name: "Prev", selector: (row) => row.previousStock, width: "80px" },
    {
      name: "Current",
      selector: (row) => row.newStock,
      width: "100px",
      style: { fontWeight: "900", color: "#143463" },
    },
    {
      name: "Remarks",
      selector: (row) => row.remarks,
      wrap: true,
      width: "180px",
    },
  ];

  // --- 3. SCRAP HISTORY COLUMNS ---
  const scrapColumns: TableColumn<ScrapRecord>[] = [
    {
      name: "Sr. No.",
      selector: (_, i) => (i ?? 0) + 1,
      width: "90px",
      sortable: true,
    },
    {
      name: "Scrap Date",
      selector: (row) => new Date(row.scrapDate).toLocaleDateString(),
      sortable: true,
      width: "150px",
    },
    { name: "Item Name", selector: (row) => row.itemName, grow: 2, wrap: true },
    {
      name: "Qty",
      selector: (row) => row.quantity,
      width: "100px",
      style: { fontWeight: "900" },
    },
    { name: "Reason", selector: (row) => row.reason, wrap: true, grow: 1.5 },
  ];

  const filteredData = useMemo(() => {
    const s = filterText.toLowerCase();
    if (activeTab === "stock")
      return stockList.filter(
        (x) =>
          (x.name || "").toLowerCase().includes(s) ||
          (x.code || "").toLowerCase().includes(s),
      );
    if (activeTab === "logs")
      return logList.filter((x) =>
        (x.itemName || "").toLowerCase().includes(s),
      );
    return scrapList.filter((x) =>
      (x.itemName || "").toLowerCase().includes(s),
    );
  }, [activeTab, stockList, scrapList, logList, filterText]);

  const subHeaderComponent = useMemo(
    () => (
      <div className="flex items-center justify-end w-full mb-4">
        <label className="text-gray-600 mr-2">Search:</label>
        <input
          type="text"
          className="border border-gray-300 rounded-md px-3 py-2 w-72 bg-white"
          placeholder="Search inventory..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>
    ),
    [filterText],
  );

  return (
    <div className="p-4 bg-[#f5f6fa] min-h-screen space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <div className="flex gap-2">
          {["All", "Product", "Accessory"].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t as any)}
              className={`px-5 py-2 rounded-md text-sm font-semibold transition
                                    ${
                                      typeFilter === t
                                        ? "bg-[#f07837] text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
            >
              {t === "All" ? "ALL" : `${t}S`.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex bg-[#f07837] p-1.5 rounded-2xl gap-2 shadow-lg">
          <button
            onClick={() => setActiveTab("stock")}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-[11px] font-black tracking-wider transition ${activeTab === "stock" ? "bg-white text-[#143463] shadow-md" : "text-white/70 hover:text-white"}`}
          >
            <FaBoxes /> SUMMARY
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-[11px] font-black tracking-wider transition ${activeTab === "logs" ? "bg-white text-[#143463] shadow-md" : "text-white/70 hover:text-white"}`}
          >
            <FaExchangeAlt /> IN/OUT LOGS
          </button>
          <button
            onClick={() => setActiveTab("scrap")}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-[11px] font-black tracking-wider transition ${activeTab === "scrap" ? "bg-white text-[#143463] shadow-md" : "text-white/70 hover:text-white"}`}
          >
            <FaHistory /> SCRAP HISTORY
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-black text-[#0b2c52] border-b-2 border-[#0b2c52] pb-1 tracking-tight">
            Inventory Management Master
          </h2>
        </div>

        <DataTable
          columns={
            (activeTab === "stock"
              ? stockColumns
              : activeTab === "logs"
                ? logColumns
                : scrapColumns) as any
          }
          data={filteredData}
          pagination
          striped
          highlightOnHover
          customStyles={listingTableStyles}
          progressPending={isLoading}
          progressComponent={<LogoLoader />}
          // subHeader
          subHeader={subHeaderComponent}
          persistTableHead
        />
      </div>

      {adjModal.isOpen && (
        <StockAdjustmentModal
          row={adjModal.row}
          onClose={() => setAdjModal({ isOpen: false, row: null })}
          onSave={loadData}
        />
      )}
      {scrapModal.isOpen && (
        <ScrapModal
          row={scrapModal.row}
          onClose={() => setScrapModal({ isOpen: false, row: null })}
          onSave={loadData}
        />
      )}
    </div>
  );
};

export default InventoryPage;
