import React from "react";
import { Plus, Trash2, GraduationCap, Briefcase } from "lucide-react";
import type {
  EmployeeFormData,
  Experience,
  Qualification,
} from "../EmployeeWizard";

interface ExpQualTabProps {
  formData: EmployeeFormData;
  setFormData: React.Dispatch<React.SetStateAction<EmployeeFormData>>;
}

const ExpQualTab: React.FC<ExpQualTabProps> = ({ formData, setFormData }) => {
  const inputStyle =
    "w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm";
  const labelStyle =
    "text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest";

  // --- Qualification Logic ---
  const addQual = () => {
    setFormData((prev) => ({
      ...prev,
      qualifications: [
        ...prev.qualifications,
        { degree: "", university: "", passingYear: "", percentage: "" },
      ],
    }));
  };

  const removeQual = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index),
    }));
  };

  const updateQual = (
    index: number,
    field: keyof Qualification,
    value: string,
  ) => {
    const updated = [...formData.qualifications];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, qualifications: updated });
  };

  // --- Experience Logic ---
  const addExp = () => {
    setFormData((prev) => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        {
          companyName: "",
          designation: "",
          fromDate: "",
          toDate: "",
          location: "",
        },
      ],
    }));
  };

  const removeExp = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index),
    }));
  };

  const updateExp = (index: number, field: keyof Experience, value: string) => {
    const updated = [...formData.experiences];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, experiences: updated });
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      {/* --- SECTION 1: QUALIFICATIONS --- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <div className="flex items-center gap-2 text-[#154068] font-bold">
            <GraduationCap size={22} />
            <h3 className="text-lg">Educational Qualifications</h3>
          </div>
          <button
            type="button"
            onClick={addQual}
            className="text-[#154068] font-bold text-sm flex items-center gap-1 hover:underline"
          >
            <Plus size={16} /> Add More
          </button>
        </div>

        {formData.qualifications.map((qual, idx) => (
          <div
            key={idx}
            className="relative grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm pt-8"
          >
            {idx > 0 && (
              <button
                type="button"
                onClick={() => removeQual(idx)}
                className="absolute top-2 right-2 text-red-400 hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            )}
            <div className="relative">
              <label className={labelStyle}>Degree/Diploma</label>
              <input
                className={inputStyle}
                value={qual.degree}
                onChange={(e) => updateQual(idx, "degree", e.target.value)}
              />
            </div>
            <div className="relative">
              <label className={labelStyle}>University/Board</label>
              <input
                className={inputStyle}
                value={qual.university}
                onChange={(e) => updateQual(idx, "university", e.target.value)}
              />
            </div>
            <div className="relative">
              <label className={labelStyle}>Passing Year</label>
              <input
                className={inputStyle}
                value={qual.passingYear}
                onChange={(e) => updateQual(idx, "passingYear", e.target.value)}
              />
            </div>
            <div className="relative">
              <label className={labelStyle}>Percentage (%)</label>
              <input
                className={inputStyle}
                value={qual.percentage}
                onChange={(e) => updateQual(idx, "percentage", e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* --- SECTION 2: EXPERIENCE --- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <div className="flex items-center gap-2 text-[#154068] font-bold">
            <Briefcase size={22} />
            <h3 className="text-lg">Work Experience</h3>
          </div>
          <button
            type="button"
            onClick={addExp}
            className="text-[#154068] font-bold text-sm flex items-center gap-1 hover:underline"
          >
            <Plus size={16} /> Add More
          </button>
        </div>

        {formData.experiences.map((exp, idx) => (
          <div
            key={idx}
            className="relative grid grid-cols-1 md:grid-cols-5 gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm pt-8"
          >
            {idx > 0 && (
              <button
                type="button"
                onClick={() => removeExp(idx)}
                className="absolute top-2 right-2 text-red-400 hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            )}
            <div className="relative">
              <label className={labelStyle}>Company Name</label>
              <input
                className={inputStyle}
                value={exp.companyName}
                onChange={(e) => updateExp(idx, "companyName", e.target.value)}
              />
            </div>
            <div className="relative">
              <label className={labelStyle}>Designation</label>
              <input
                className={inputStyle}
                value={exp.designation}
                onChange={(e) => updateExp(idx, "designation", e.target.value)}
              />
            </div>
            <div className="relative">
              <label className={labelStyle}>From Date</label>
              <input
                type="date"
                className={inputStyle}
                value={exp.fromDate}
                onChange={(e) => updateExp(idx, "fromDate", e.target.value)}
              />
            </div>
            <div className="relative">
              <label className={labelStyle}>To Date</label>
              <input
                type="date"
                className={inputStyle}
                value={exp.toDate}
                onChange={(e) => updateExp(idx, "toDate", e.target.value)}
              />
            </div>
            <div className="relative">
              <label className={labelStyle}>Location</label>
              <input
                className={inputStyle}
                value={exp.location}
                onChange={(e) => updateExp(idx, "location", e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpQualTab;
