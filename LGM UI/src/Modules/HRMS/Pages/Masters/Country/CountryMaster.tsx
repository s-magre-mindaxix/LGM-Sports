import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import {
  getAllCountries,
  createCountry,
  deleteCountry,
} from "./Services/CountryService";
import type { Country } from "./Services/CountryService";
import EditCountryModal from "./EditCountryModal";
import ConfirmationModal from "../../../../../Components/Common/ConfirmationModal";
import { actionButtonStyles } from "../../../../../Components/Common/buttonStyles";
import { FaEdit, FaTrash } from "react-icons/fa";

const CountryMaster: React.FC = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");

  const [editItem, setEditItem] = useState<Country | null>(null);
  const [deleteItem, setDeleteItem] = useState<Country | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllCountries();
      setCountries(data);
    } catch {
      toast.error("Failed to load countries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return toast.error("Fill all fields");

    setIsSaving(true);
    try {
      await createCountry({ countryName: name, countryCode: code });
      toast.success("Country added");
      setName("");
      setCode("");
      load();
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = useMemo(
    () =>
      countries.filter((c) =>
        c.countryName.toLowerCase().includes(search.toLowerCase()),
      ),
    [countries, search],
  );

  return (
    <div className="p-4 bg-gray-50 min-h-full">
      {/* ADD FORM */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-semibold mb-4">Add Country</h3>
        <form onSubmit={handleAdd} className="flex gap-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Country Name"
            className="border p-2 rounded w-1/3"
          />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Code"
            className="border p-2 rounded w-1/4"
          />
          <button className="bg-[#f07837] text-white px-4 py-2 rounded flex gap-2">
            {isSaving ? (
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
          placeholder="Search country..."
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
              <th className="px-4 py-2 text-left">Country</th>
              <th className="px-4 py-2 text-left">Code</th>
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
              filtered.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="px-4 py-3">{c.countryName}</td>
                  <td className="px-4 py-3">{c.countryCode}</td>
                  <td className="px-4 py-3 text-right flex justify-end gap-4">
                    <button
                      onClick={() => setEditItem(c)}
                      className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
                      title="Edit"
                    >
                      <FaEdit size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteItem(c)}
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
        <EditCountryModal
          country={editItem}
          onClose={() => setEditItem(null)}
          onSuccess={load}
        />
      )}

      <ConfirmationModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={async () => {
          if (deleteItem) {
            await deleteCountry(deleteItem.id);
            toast.success("Deleted");
            load();
          }
        }}
        title="Delete Country"
        message={`Delete ${deleteItem?.countryName}?`}
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default CountryMaster;
