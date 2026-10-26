import React, { useState } from "react";
import { X, Hash, Building2, MapPin, FileText, Map } from "lucide-react";
import { toast } from "sonner";
import { createLocation, type WorkLocationDto } from "./WorkLocationService";
import { AxiosError } from "axios";

interface AddLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Callback to refresh parent list
}

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  icon?: React.ReactNode;
}

interface SelectFieldProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  name: string;
  children: React.ReactNode;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  icon,
  ...rest
}) => (
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label} <span className="text-red-500">*</span>
    </label>
    <div className="relative">
      {icon && (
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          {icon}
        </span>
      )}
      <input
        id={name}
        name={name}
        className={`w-full ${
          icon ? "pl-10" : "pl-3"
        } pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm`}
        {...rest}
      />
    </div>
  </div>
);

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  name,
  children,
  ...rest
}) => (
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label} <span className="text-red-500">*</span>
    </label>
    <select
      id={name}
      name={name}
      className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
      {...rest}
    >
      {children}
    </select>
  </div>
);

const AddLocationModal: React.FC<AddLocationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<WorkLocationDto>({
    locationCode: "",
    locationName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    isActive: true,
  });

  if (!isOpen) return null;

  const handleClose = () => {
    setFormData({
      locationCode: "",
      locationName: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      isActive: true,
    });
    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await createLocation(formData);
      toast.success("Location created successfully");
      onSuccess();
      handleClose();
    } catch (error) {
      console.error(error);
      if (error instanceof AxiosError && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to create location");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-transparent backdrop-brightness-70 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center border-b p-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Add New Location
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Location Code"
              name="locationCode"
              placeholder="e.g., LOC001"
              icon={<Hash size={18} />}
              value={formData.locationCode}
              onChange={handleChange}
              // Not strictly required in DTO (string?), but good for UI
            />
            <InputField
              label="Location Name"
              name="locationName"
              placeholder="e.g., Mumbai Headquarters"
              icon={<Building2 size={18} />}
              value={formData.locationName}
              onChange={handleChange}
              required
            />

            <div className="md:col-span-2">
              <InputField
                label="Address"
                name="address"
                placeholder="e.g., 123 Industrial Estate"
                icon={<FileText size={18} />}
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <InputField
              label="City"
              name="city"
              placeholder="e.g., Hyderabad"
              icon={<MapPin size={18} />}
              value={formData.city}
              onChange={handleChange}
              required
            />

            <SelectField
              label="State"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
            >
              <option value="">Select a state</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Telangana">Telangana</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Delhi">Delhi</option>
              {/* Add more states as needed */}
            </SelectField>

            <InputField
              label="Pincode"
              name="pincode"
              placeholder="e.g., 500081"
              icon={<Map size={18} />}
              value={formData.pincode}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex justify-end items-center gap-3 border-t p-4 bg-gray-50 rounded-b-lg">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="bg-gray-500 text-white px-8 py-2 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-green-700 text-white px-8 py-2 rounded-lg font-semibold hover:bg-green-800 disabled:bg-gray-400"
            >
              {isLoading ? "Saving..." : "Add Location"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLocationModal;
