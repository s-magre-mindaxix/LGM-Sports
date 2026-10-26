import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import {
  getAllStates,
  createState,
  deleteState,
  type State,
} from "./Services/StateService";
import {
  getAllCountries,
  type Country,
} from "../Country/Services/CountryService";
import EditStateModal from "./EditStateModal";
import ConfirmationModal from "../../../../../Components/Common/ConfirmationModal";
import { actionButtonStyles } from "../../../../../Components/Common/buttonStyles";
import { FaEdit, FaTrash } from "react-icons/fa";
import Select from "react-select";

const StateMaster: React.FC = () => {
  const [states, setStates] = useState<State[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [stateName, setStateName] = useState("");
  const [countryId, setCountryId] = useState<number | "">("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const [editItem, setEditItem] = useState<State | null>(null);
  const [deleteItem, setDeleteItem] = useState<State | null>(null);

  const countryOptions = useMemo(
    () =>
      countries.map((c) => ({
        value: c.id,
        label: c.countryName,
      })),
    [countries],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [stateData, countryData] = await Promise.all([
        getAllStates(),
        getAllCountries(),
      ]);
      setStates(stateData);
      setCountries(countryData);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stateName || !countryId) return toast.error("Fill all fields");

    setSaving(true);
    try {
      await createState({ stateName, countryId: Number(countryId) });
      toast.success("State added");
      setStateName("");
      setCountryId("");
      load();
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(
    () =>
      states.filter((s) =>
        s.stateName.toLowerCase().includes(search.toLowerCase()),
      ),
    [states, search],
  );

  const getCountryName = (id: number) =>
    countries.find((c) => c.id === id)?.countryName || "-";

  return (
    <div className="p-4 bg-gray-50 min-h-full">
      {/* ADD CARD */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-semibold mb-4">Add State</h3>
        <form onSubmit={handleAdd} className="flex gap-4">
          <input
            value={stateName}
            onChange={(e) => setStateName(e.target.value)}
            placeholder="State Name"
            className="border p-2 rounded w-1/3"
          />
          <Select
            options={countryOptions}
            value={
              countryOptions.find((opt) => opt.value === countryId) || null
            }
            onChange={(selected) =>
              setCountryId(selected ? selected.value : "")
            }
            placeholder="Select Country"
            className="w-1/4"
          />

          <button className="bg-[#f07837] text-white px-4 py-2 rounded flex gap-2">
            {saving ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Plus size={16} />
            )}
            Add
          </button>
        </form>
      </div>

      {/* SEARCH */}
      <div className="mb-4 relative w-1/3">
        <Search className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search state..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 p-2 border rounded w-full"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <table className="w-full text-sm">
          <thead className="bg-[#f07837] text-white text-xs uppercase">
            <tr>
              <th className="px-4 py-2 text-left">State</th>
              <th className="px-4 py-2 text-left">Country</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="text-center py-6">
                  <Loader2 className="animate-spin inline-block" /> Loading...
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="px-4 py-3">{s.stateName}</td>
                  <td className="px-4 py-3">{getCountryName(s.countryId)}</td>
                  <td className="px-4 py-3 text-right flex justify-end gap-4">
                    <button
                      onClick={() => setEditItem(s)}
                      className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
                      title="Edit"
                    >
                      <FaEdit size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteItem(s)}
                      className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
                      title="Delete"
                    >
                      <FaTrash size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editItem && (
        <EditStateModal
          state={editItem}
          countries={countries}
          onClose={() => setEditItem(null)}
          onSuccess={load}
        />
      )}

      <ConfirmationModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={async () => {
          if (deleteItem) {
            await deleteState(deleteItem.id);
            toast.success("Deleted");
            load();
          }
        }}
        title="Delete State"
        message={`Delete ${deleteItem?.stateName}?`}
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default StateMaster;
