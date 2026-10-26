import { useEffect, useState, useMemo } from "react";
import { FaTimes } from "react-icons/fa";
import DataTable, { type TableColumn } from "react-data-table-component";
import apiClient from "../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import { listingTableStyles } from "../../../../Components/Common/listingTableStyles";

const AccessoryLogModal = ({
  accessoryId,
  onClose,
  accessoryName,
}: any) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    apiClient
      .get(`${API_ENDPOINTS.Accessories}/${accessoryId}/logs`)
      .then((res) => setLogs(res.data))
      .finally(() => setIsLoading(false));
  }, [accessoryId]);

  const filteredItems = useMemo(
    () =>
      logs.filter((item) =>
        (item.reason || "").toLowerCase().includes(filterText.toLowerCase()),
      ),
    [logs, filterText],
  );

  const columns: TableColumn<any>[] = [
    { name: "Sr. No.", selector: (_, i) => (i ?? 0) + 1, width: "90px" },
    {
      name: "Date & Time",
      selector: (row) => new Date(row.timestamp).toLocaleString(),
      sortable: true,
      width: "220px",
    },
    {
      name: "Action",
      cell: (row) => (
        <span
          className={`font-extrabold ${
            row.actionType === "Addition" ? "text-green-600" : "text-red-600"
          }`}
        >
          {row.actionType}
        </span>
      ),
      width: "150px",
    },
    {
      name: "Qty",
      selector: (row) => row.quantity,
      width: "100px",
      style: { fontWeight: "900" },
    },
    {
      name: "Reference Reason",
      selector: (row) => row.reason || "N/A",
      grow: 2,
      wrap: true,
    },
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#17191b]/55 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-6xl animate-in flex-col overflow-hidden rounded-3xl border border-black/10 bg-white shadow-2xl zoom-in">
        <div className="flex items-center justify-between gap-4 border-b-4 border-[#f07837] bg-[#252a2e] p-5 text-white sm:p-6">
          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[.2em] text-[#ffb27f]">
              LGM Sports · Inventory
            </p>
            <h3 className="truncate text-lg font-black sm:text-xl">
              Inventory history: {accessoryName}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close inventory history"
            className="shrink-0 rounded-full bg-white/10 p-2 transition hover:rotate-90 hover:bg-white/20"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="overflow-y-auto bg-[#f7f6f2] p-4 sm:p-8">
          <div className="mb-5 flex justify-end">
            <input
              type="text"
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium outline-none transition placeholder:text-[#a6a29b] focus:border-[#f07837] focus:ring-4 focus:ring-[#f07837]/10 sm:w-80"
              placeholder="Search history..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>

          <div className="overflow-hidden rounded-2xl border border-black/[.07] bg-white">
            <DataTable
              columns={columns}
              data={filteredItems}
              pagination
              striped
              highlightOnHover
              customStyles={listingTableStyles}
              progressPending={isLoading}
              persistTableHead
            />
          </div>
        </div>

        <div className="flex justify-end border-t border-black/[.07] bg-white p-4 sm:p-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#e8e6e1] px-5 py-2.5 text-sm font-semibold text-[#4f504d] transition hover:bg-[#dddad3]"
          >
            Close logs
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessoryLogModal;