import React, { useEffect, useMemo, useState } from "react";
import {Building2, MapPin, Trash2, Edit2 } from "lucide-react";
import AddLocationModal from "./AddLocationModal";
import { toast } from "sonner";
import ConfirmationModal from "../../../../Components/Common/ConfirmationModal"; // Assuming you have this from the previous Employee context
import {
  deleteLocation,
  getAllLocations,
  type WorkLocation,
} from "./WorkLocationService";
import EditLocationModal from "./EditLocationModal";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";
import LogoLoader from "../../../../Components/Common/LogoLoader";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  bgColor,
}) => (
  <div className={`${bgColor} p-5 rounded-xl text-white flex items-center justify-between transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}>
    <div>
      <p className="text-sm opacity-90">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-xs opacity-80">{description}</p>
    </div>
    <div className="bg-white/20 p-3 rounded-full">
      {icon}
    </div>
  </div>
);

const MultiLocation: React.FC = () => {
  const [locations, setLocations] = useState<WorkLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<WorkLocation | null>(
    null
  );
  // Delete State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      const data = await getAllLocations();
      setLocations(data);
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast.error("Failed to load work locations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleEditClick = (location: WorkLocation) => {
    setSelectedLocation(location);
    setIsEditModalOpen(true);
  };

  const handleDeleteRequest = (id: number, name: string) => {
    setLocationToDelete({ id, name });
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!locationToDelete) return;
    try {
      await deleteLocation(locationToDelete.id);
      toast.success(`${locationToDelete.name} has been deactivated.`);
      fetchLocations();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete location");
    } finally {
      setLocationToDelete(null);
    }
  };

  // Calculate Stats based on real data
  const stats = useMemo(() => {
    const totalPlants = locations.length;
    const activeStates = new Set(locations.map((l) => l.state)).size;
    // Note: Employee count is not available in current DTO, placeholder 0
    return { totalPlants, activeStates };
  }, [locations]);

  return (
    <>
      <div className="p-4 md:p-4 bg-gray-50 min-h-full space-y-6">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Multi-location</h1>
            <p className="text-gray-600 mt-1">
              Manage multiple plant locations and their configurations
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className={buttonStyles.add}
          >
            + Add Location
          </button>
        </div>

        {/* Stats Cards */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Locations"
            value={stats.totalPlants}
            description="Active locations"
            bgColor="bg-[#2eacb3]"
            icon={<Building2 size={22} className="text-blue-600" />}
          />
          <StatCard
            title="States"
            value={stats.activeStates}
            description="Different states"
            bgColor="bg-[#f7c343]"
            icon={<MapPin size={22} className="text-red-600" />}
          />
        </div>

        {/* Plant Locations Table */}
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h2 className="text-xl font-semibold text-gray-800">
            Work Locations
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Manage plant-specific configurations
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#f07837] text-white uppercase text-xs">
                <tr>
                  <th scope="col" className="px-6 py-3 font-medium">
                    Code
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium">
                    Location Name
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium">
                    Address
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium">
                    City
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium">
                    State
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium">
                    Pincode
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                     {<LogoLoader />}
                    </td>
                  </tr>
                ) : locations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No work locations found.
                    </td>
                  </tr>
                ) : (
                  locations.map((loc) => (
                    <tr
                      key={loc.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {loc.locationCode || "-"}
                      </td>
                      <td className="px-6 py-4">{loc.locationName}</td>
                      <td
                        className="px-6 py-4 max-w-xs truncate"
                        title={loc.address}
                      >
                        {loc.address}
                      </td>
                      <td className="px-6 py-4">{loc.city}</td>
                      <td className="px-6 py-4">{loc.state}</td>
                      <td className="px-6 py-4">{loc.pincode}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            loc.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {loc.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEditClick(loc)}
                            className="text-blue-500 hover:text-blue-700 transition-colors"
                            title="Edit Location"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteRequest(loc.id, loc.locationName)
                            }
                            className="text-red-500 hover:text-red-700 transition-colors"
                            title="Delete Location"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AddLocationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchLocations}
      />

      <EditLocationModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedLocation(null);
        }}
        onSuccess={fetchLocations}
        locationData={selectedLocation}
      />

      {/* Reusing your generic confirmation modal if available, otherwise implement simple alert */}
      {isConfirmModalOpen && (
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Work Location"
          message={`Are you sure you want to deactivate ${locationToDelete?.name}?`}
          confirmText="Deactivate"
          confirmButtonVariant="danger"
        />
      )}
    </>
  );
};

export default MultiLocation;
