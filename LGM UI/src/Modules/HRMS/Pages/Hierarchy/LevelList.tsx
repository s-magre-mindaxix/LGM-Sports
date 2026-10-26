import React, { useEffect, useState } from "react";
import apiClient from "../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import AddLevelModal from "./AddLevelModal";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";
import { FaEdit, FaTrash } from "react-icons/fa";
import { usePermissions } from "../../../../hooks/usePermissions";
import ListingLayout from "../../../../Components/Common/ListingLayout";
import { type TableColumn } from "react-data-table-component";

interface Level {
  id: number;
  levelName: string;
  levelOrder: number;
  isActive: boolean;
}

const LevelList: React.FC = () => {
  const [levels, setLevels] = useState<Level[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [filterText, setFilterText] = useState("");

  const { hasPermission } = usePermissions();
  const canAdd = hasPermission("LevelMaster", "CanAdd");
  const canEdit = hasPermission("LevelMaster", "CanEdit");
  const canDelete = hasPermission("LevelMaster", "CanDelete");

  const fetchLevels = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get(API_ENDPOINTS.Levels);
      setLevels(res.data);
    } catch (error) {
      console.error("Failed to fetch levels", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLevels();
    const handleRefresh = () => {
      fetchLevels();
    };

    window.addEventListener("app-refresh", handleRefresh);

    return () => {
      window.removeEventListener("app-refresh", handleRefresh);
    };
  }, []);

  const handleEdit = (level: Level) => {
    setSelectedLevel(level);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this level?")) return;

    try {
      setIsLoading(true);
      await apiClient.delete(`${API_ENDPOINTS.Levels}/${id}`);
      await fetchLevels();
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete level");
      setIsLoading(false);
    }
  };

  const handleAddNew = () => {
    setSelectedLevel(null);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setSelectedLevel(null);
    fetchLevels();
  };

  // --- CHANGES ARE HERE ---
  // We apply inline styles using the cell renderer to match the desired font weight.
  const columns: TableColumn<Level>[] = [
    {
      name: "Sr. No.",
      cell: (_row, index) => (
        <span style={{ fontWeight: 600 }}>{index + 1}</span>
      ), // APPLYING STYLE
      width: "80px",
    },
    {
      name: "Level Name",
      selector: (row) => row.levelName, // Selector is kept for sorting
      cell: (row) => <span style={{ fontWeight: 600 }}>{row.levelName}</span>, // APPLYING STYLE
      sortable: true,
      grow: 3,
    },
    {
      name: "Order",
      selector: (row) => row.levelOrder, // Selector is kept for sorting
      cell: (row) => <span style={{ fontWeight: 600 }}>{row.levelOrder}</span>, // APPLYING STYLE
      sortable: true,
      grow: 1,
    },
    {
      name: "Status",
      // The `font-medium` class already corresponds to fontWeight: 500, so this column is correct.
      cell: (row) =>
        row.isActive ? (
          <span className="text-green-600 font-medium">Active</span>
        ) : (
          <span className="text-red-500 font-medium">Inactive</span>
        ),
      grow: 1,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex justify-center gap-4">
          {canEdit && (
            <button
              onClick={() => handleEdit(row)}
              className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
              title="Edit"
            >
              <FaEdit size={16} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => handleDelete(row.id)}
              className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
              title="Delete"
            >
              <FaTrash size={16} />
            </button>
          )}
        </div>
      ),
      grow: 2,
      center: true,
    },
  ];

  const filteredItems = levels.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(filterText.toLowerCase()),
  );

  return (
    <div className="p-0 sm:p-4">
      <ListingLayout
        title="Listing of Levels"
        columns={columns}
        data={filteredItems}
        isLoading={isLoading}
        filterText={filterText}
        onFilterChange={setFilterText}
        onCreate={canAdd ? handleAddNew : undefined}
        createLabel="+ Add Level"
      />

      <AddLevelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        levelData={selectedLevel}
      />
    </div>
  );
};

export default LevelList;
