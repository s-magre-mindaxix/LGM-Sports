import React from "react";
import type { CustomerTabProps, CustomerContact } from "../Services/types";
import { FaTrashAlt } from "react-icons/fa";
import { buttonStyles } from "../../../../../Components/Common/buttonStyles";
// import Select from "react-select";

interface ExtendedTabProps extends CustomerTabProps {
  errors?: { [key: string]: string[] };
  setErrors?: React.Dispatch<React.SetStateAction<{ [key: string]: string[] }>>;
}

const CustomerContactsTab: React.FC<ExtendedTabProps> = ({
  data,
  setData,
  errors = {},
  setErrors,
}) => {
  // const [departments, setDepartments] = useState<any[]>([]);

  const inputStyle = (hasError: boolean) =>
    `w-full border ${hasError ? "border-red-500 bg-red-50" : "border-gray-300"} rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm`;
  const labelStyle =
    "text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest";

  const getContactError = (index: number, field: string) => {
    return errors[`contacts.${index}.${field}`];
  };

  // useEffect(() => {
  //   const fetchDepartments = async () => {
  //     try {
  //       const res = await apiClient.get(API_ENDPOINTS.Departments);
  //       setDepartments(
  //         Array.isArray(res.data) ? res.data : res.data?.data || [],
  //       );
  //     } catch (error) {
  //       console.error("Failed to fetch departments", error);
  //     }
  //   };
  //   fetchDepartments();
  // }, []);

  const addContact = () => {
    const newContact: CustomerContact = {
      id: 0,
      resPersonName: "",
      designation: "",
      mobileNo: "",
      emailAddress: "",
      departmentName: "",
      altEmailAddress: "",
      altMobileNo: "",
    };
    setData({ ...data, contacts: [...(data.contacts || []), newContact] });
  };

  const updateContact = (
    index: number,
    field: keyof CustomerContact,
    value: any,
  ) => {
    const updated = [...(data.contacts || [])];
    updated[index] = { ...updated[index], [field]: value };
    setData({ ...data, contacts: updated });

    // Clear error for this field
    if (errors[`contacts.${index}.${field}`] && setErrors) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`contacts.${index}.${field}`];
        return newErrors;
      });
    }
  };

  const removeContact = (index: number) => {
    setData({ ...data, contacts: data.contacts.filter((_, i) => i !== index) });
  };

  const contacts =
    data.contacts && data.contacts.length > 0
      ? data.contacts
      : [{} as CustomerContact];

  // const departmentOptions = useMemo(
  //   () =>
  //     departments.map((d) => ({
  //       value: d.id,
  //       label: d.departmentName,
  //     })),
  //   [departments],
  // );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex items-center gap-3 border-b pb-3">
        <span className="text-2xl text-[#0b2c52]">👤</span>
        <h3 className="text-lg font-bold text-[#0b2c52] uppercase tracking-tight">
          Responsible Persons / Contacts
        </h3>
        <span className="text-xs text-red-500 ml-2">
          * All fields are required
        </span>
      </div>

      {errors.contacts && (
        <p className="text-sm text-red-500">{errors.contacts[0]}</p>
      )}

      <div className="space-y-6">
        {contacts.map((contact, index) => (
          <div
            key={index}
            className="relative border p-6 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 shadow-sm"
          >
            {data.contacts?.length > 1 && (
              <button
                onClick={() => removeContact(index)}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-600 transition"
                title="Remove Contact"
              >
                <FaTrashAlt />
              </button>
            )}
            <div className="flex flex-col">
              <label className={labelStyle}>
                Full Name <span className="text-red-500 ">*</span>
              </label>
              <input
                className={inputStyle(
                  !!getContactError(index, "resPersonName"),
                )}
                value={contact.resPersonName || ""}
                onChange={(e) =>
                  updateContact(index, "resPersonName", e.target.value)
                }
                placeholder="Enter full name"
              />
              {getContactError(index, "resPersonName") && (
                <p className="mt-1 text-sm text-red-500">
                  {getContactError(index, "resPersonName")[0]}
                </p>
              )}
            </div>
            <div className="flex flex-col">
              <label className={labelStyle}>
                Department <span className="text-red-500">*</span>
              </label>
              <input
                className={inputStyle(
                  !!getContactError(index, "departmentName"),
                )}
                value={contact.departmentName || ""}
                onChange={(e) =>
                  updateContact(index, "departmentName", e.target.value)
                }
                placeholder="Enter department name"
              />
              {getContactError(index, "departmentName") && (
                <p className="mt-1 text-sm text-red-500">
                  {getContactError(index, "departmentName")[0]}
                </p>
              )}
            </div>
            <div className="flex flex-col">
              <label className={labelStyle}>
                Designation <span className="text-red-500 ">*</span>
              </label>
              <input
                className={inputStyle(!!getContactError(index, "designation"))}
                value={contact.designation || ""}
                onChange={(e) =>
                  updateContact(index, "designation", e.target.value)
                }
                placeholder="Enter designation"
              />
              {getContactError(index, "designation") && (
                <p className="mt-1 text-sm text-red-500">
                  {getContactError(index, "designation")[0]}
                </p>
              )}
            </div>
            <div className="flex flex-col">
              <label className={labelStyle}>
                Mobile No. <span className="text-red-500 ">*</span>
              </label>
              <input
                className={inputStyle(!!getContactError(index, "mobileNo"))}
                value={contact.mobileNo || ""}
                onChange={(e) =>
                  updateContact(index, "mobileNo", e.target.value)
                }
                maxLength={10}
                placeholder="Enter 10-digit mobile number"
              />
              {getContactError(index, "mobileNo") && (
                <p className="mt-1 text-sm text-red-500">
                  {getContactError(index, "mobileNo")[0]}
                </p>
              )}
            </div>
            <div className="flex flex-col">
              <label className={labelStyle}>Alt Mobile No.</label>
              <input
                className={inputStyle(false)}
                value={contact.altMobileNo || ""}
                onChange={(e) =>
                  updateContact(index, "altMobileNo", e.target.value)
                }
                maxLength={10}
                placeholder="Enter alternate mobile number"
              />
            </div>
            <div className="flex flex-col">
              <label className={labelStyle}>
                Email Address <span className="text-red-500 ">*</span>
              </label>
              <input
                className={inputStyle(!!getContactError(index, "emailAddress"))}
                value={contact.emailAddress || ""}
                onChange={(e) =>
                  updateContact(index, "emailAddress", e.target.value)
                }
                placeholder="Enter email address"
              />
              {getContactError(index, "emailAddress") && (
                <p className="mt-1 text-sm text-red-500">
                  {getContactError(index, "emailAddress")[0]}
                </p>
              )}
            </div>
            <div className="flex flex-col">
              <label className={labelStyle}>Alt Email Address</label>
              <input
                className={inputStyle(false)}
                value={contact.altEmailAddress || ""}
                onChange={(e) =>
                  updateContact(index, "altEmailAddress", e.target.value)
                }
                placeholder="Enter alternate email address"
              />
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addContact}
        className={buttonStyles.addmore}
      >
        + Add New Contact
      </button>
    </div>
  );
};

export default CustomerContactsTab;
