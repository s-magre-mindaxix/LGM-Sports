import React, { useEffect, useState } from "react";
import apiClient from "../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  levelData?: any;
}

const AddLevelModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  levelData,
}) => {
  const [levelName, setLevelName] = useState("");
  const [levelOrder, setLevelOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setLevelName("");
    setLevelOrder(1);
    setIsActive(true);
  };

  useEffect(() => {
    if (levelData) {
      setLevelName(levelData.levelName);
      setLevelOrder(levelData.levelOrder);
      setIsActive(levelData.isActive);
    } else {
      setLevelName("");
      setLevelOrder(1);
      setIsActive(true);
    }
  }, [levelData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (levelData) {
        await apiClient.put(`${API_ENDPOINTS.Levels}/${levelData.id}`, {
          levelName,
          levelOrder,
          isActive,
        });
      } else {
        await apiClient.post(API_ENDPOINTS.Levels, {
          levelName,
          levelOrder,
          isActive,
        });
        resetForm();
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Save failed", error);
      alert("Error saving level");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-4">
          {levelData ? "Edit Level" : "Add Level"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm">Level Name</label>
            <input
              type="text"
              value={levelName}
              onChange={(e) => setLevelName(e.target.value)}
              className="w-full border rounded px-3 py-2 mt-1"
              required
            />
          </div>

          <div>
            <label className="text-sm">Level Order</label>
            <input
              type="number"
              value={levelOrder}
              onChange={(e) => setLevelOrder(Number(e.target.value))}
              className="w-full border rounded px-3 py-2 mt-1"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <label>Active</label>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className={buttonStyles.cancel}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={buttonStyles.save}
            >
              {levelData ? "Update Level" : "Save Level"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLevelModal;
