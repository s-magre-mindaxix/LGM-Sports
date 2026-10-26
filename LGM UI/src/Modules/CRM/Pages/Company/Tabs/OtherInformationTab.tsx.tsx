import React, { useEffect } from "react";
import type { TabProps, Director } from "../Services/types";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import { buttonStyles } from "../../../../../Components/Common/buttonStyles";

interface ExtendedTabProps extends TabProps {
  errors?: { [key: string]: string[] };
  setErrors?: React.Dispatch<React.SetStateAction<{ [key: string]: string[] }>>;
}

const OtherInformationTab: React.FC<ExtendedTabProps> = ({
  data,
  setData,
  errors = {},
  setErrors,
}) => {
  const inputStyle = (hasError: boolean) =>
    `w-full border ${hasError ? "border-red-500 bg-red-50" : "border-gray-300"} rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm`;
  const labelStyle =
    "text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest";

  const getDirectorError = (index: number, field: string) => {
    return errors[`directors.${index}.${field}`];
  };

  const updateDirector = (
    index: number,
    field: keyof Director,
    value: string | File | null,
  ) => {
    const updatedDirectors = [...(data.directors || [])];
    updatedDirectors[index] = { ...updatedDirectors[index], [field]: value };
    setData({ ...data, directors: updatedDirectors });

    const errorKey = `directors.${index}.${field}`;
    if (errors[errorKey] && setErrors) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const addDirector = () => {
    const newDirector: Director = {
      directorName: "",
      designation: "",
      mobileNo: "",
      email: "",
      website: "",
    };
    setData({ ...data, directors: [...(data.directors || []), newDirector] });
  };

  const removeDirector = (index: number) => {
    if (data.directors.length === 1) return;
    const updatedDirectors = data.directors.filter((_, i) => i !== index);
    setData({ ...data, directors: updatedDirectors });
  };

  useEffect(() => {
    if (!data.directors || data.directors.length === 0) {
      setData((prev) => ({
        ...prev,
        directors: [
          {
            directorName: "",
            designation: "",
            mobileNo: "",
            email: "",
            website: "",
          },
        ],
      }));
    }
  }, [data.directors, setData]);

  const SERVER_URL = API_ENDPOINTS.BaseUrl.replace("/api", "");

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <span className="text-2xl">ℹ️</span> Other Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div>
          <label className={labelStyle}>Company PAN</label>
          <input
            className={inputStyle(!!errors.pan)}
            value={data.pan || ""}
            onChange={(e) =>
              setData({ ...data, pan: e.target.value.toUpperCase() })
            }
          />
          {errors.pan && (
            <p className="mt-1 text-sm text-red-500">{errors.pan[0]}</p>
          )}
        </div>
        <div>
          <label className={labelStyle}>Company TAN</label>
          <input
            className={inputStyle(false)}
            value={data.tan || ""}
            onChange={(e) =>
              setData({ ...data, tan: e.target.value.toUpperCase() })
            }
          />
        </div>
        <div>
          <label className={labelStyle}>GSTIN No</label>
          <input
            className={inputStyle(!!errors.gstin)}
            value={data.gstin || ""}
            onChange={(e) =>
              setData({ ...data, gstin: e.target.value.toUpperCase() })
            }
          />
          {errors.gstin && (
            <p className="mt-1 text-sm text-red-500">{errors.gstin[0]}</p>
          )}
        </div>
        <div>
          <label className={labelStyle}>CIN NO</label>
          <input
            className={inputStyle(!!errors.cin)}
            value={data.cin || ""}
            onChange={(e) =>
              setData({ ...data, cin: e.target.value.toUpperCase() })
            }
          />
          {errors.cin && (
            <p className="mt-1 text-sm text-red-500">{errors.cin[0]}</p>
          )}
        </div>
      </div>

      <hr className="my-6" />

      <div className="mb-4">
        <h4 className="text-md font-semibold text-gray-700 flex items-center gap-2">
          <span className="text-xl">👥</span> Director Information
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          All director fields are required
        </p>
      </div>

      {(data.directors || []).map((director, index) => (
        <div
          key={index}
          className="border p-4 rounded-lg mb-4 relative bg-white"
        >
          <button
            onClick={() => removeDirector(index)}
            className="absolute top-2 right-2 text-red-500 font-bold hover:text-red-700"
          >
            X
          </button>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={labelStyle}>
                Directors Info (Name) <span className="text-red-500 ">*</span>
              </label>
              <input
                className={inputStyle(
                  !!getDirectorError(index, "directorName"),
                )}
                value={director.directorName}
                onChange={(e) =>
                  updateDirector(index, "directorName", e.target.value)
                }
                placeholder="Enter director name"
              />
              {getDirectorError(index, "directorName") && (
                <p className="mt-1 text-sm text-red-500">
                  {getDirectorError(index, "directorName")[0]}
                </p>
              )}
            </div>
            <div>
              <label className={labelStyle}>
                Designation <span className="text-red-500 ">*</span>
              </label>
              <input
                className={inputStyle(!!getDirectorError(index, "designation"))}
                value={director.designation}
                onChange={(e) =>
                  updateDirector(index, "designation", e.target.value)
                }
                placeholder="Enter designation"
              />
              {getDirectorError(index, "designation") && (
                <p className="mt-1 text-sm text-red-500">
                  {getDirectorError(index, "designation")[0]}
                </p>
              )}
            </div>
            <div>
              <label className={labelStyle}>
                Mobile No <span className="text-red-500 ">*</span>
              </label>
              <input
                className={inputStyle(!!getDirectorError(index, "mobileNo"))}
                value={director.mobileNo}
                onChange={(e) =>
                  updateDirector(index, "mobileNo", e.target.value)
                }
                maxLength={10}
                placeholder="Enter 10-digit mobile number"
              />
              {getDirectorError(index, "mobileNo") && (
                <p className="mt-1 text-sm text-red-500">
                  {getDirectorError(index, "mobileNo")[0]}
                </p>
              )}
            </div>
            <div>
              <label className={labelStyle}>
                Email Id <span className="text-red-500 ">*</span>
              </label>
              <input
                type="email"
                className={inputStyle(!!getDirectorError(index, "email"))}
                value={director.email}
                onChange={(e) => updateDirector(index, "email", e.target.value)}
                placeholder="Enter email address"
              />
              {getDirectorError(index, "email") && (
                <p className="mt-1 text-sm text-red-500">
                  {getDirectorError(index, "email")[0]}
                </p>
              )}
            </div>
            <div>
              <label className={labelStyle}>Docs Attachments</label>
              <input
                type="file"
                className="hidden"
                id={`doc-upload-${index}`}
                onChange={(e) =>
                  e.target.files &&
                  updateDirector(index, "docsAttachment", e.target.files[0])
                }
              />
              <label
                htmlFor={`doc-upload-${index}`}
                className="w-full text-center block bg-[#f07837] text-white px-4 py-2 rounded-lg cursor-pointer text-sm hover:bg-[#0d3357] transition"
              >
                {director.docsAttachment ? "Change File" : "Browse..."}
              </label>
              {director.docsAttachment &&
                typeof director.docsAttachment !== "string" && (
                  <p className="text-[10px] text-blue-600 mt-1 truncate">
                    New: {director.docsAttachment.name}
                  </p>
                )}
              {director.docsAttachmentPath && !director.docsAttachment && (
                <a
                  href={`${SERVER_URL}${director.docsAttachmentPath}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-green-600 mt-1 block hover:underline"
                >
                  View Existing Document
                </a>
              )}
            </div>
            <div>
              <label className={labelStyle}>Presentation PPT</label>
              <input
                type="file"
                className="hidden"
                id={`ppt-upload-${index}`}
                onChange={(e) =>
                  e.target.files &&
                  updateDirector(index, "presentationPPT", e.target.files[0])
                }
              />
              <label
                htmlFor={`ppt-upload-${index}`}
                className="w-full text-center block bg-[#f07837] text-white px-4 py-2 rounded-lg cursor-pointer text-sm hover:bg-[#0d3357] transition"
              >
                {director.presentationPPT ? "Change PPT" : "Browse..."}
              </label>
              {director.presentationPPT &&
                typeof director.presentationPPT !== "string" && (
                  <p className="text-[10px] text-blue-600 mt-1 truncate">
                    New: {director.presentationPPT.name}
                  </p>
                )}
              {director.presentationPPTPath && !director.presentationPPT && (
                <a
                  href={`${SERVER_URL}${director.presentationPPTPath}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-green-600 mt-1 block hover:underline"
                >
                  View Existing PPT
                </a>
              )}
            </div>
            <div className="md:col-span-3">
              <label className={labelStyle}>Websites Address</label>
              <input
                className={inputStyle(false)}
                value={director.website}
                onChange={(e) =>
                  updateDirector(index, "website", e.target.value)
                }
                placeholder="Enter website URL"
              />
            </div>
          </div>
        </div>
      ))}

      <button onClick={addDirector} className={buttonStyles.addmore}>
        + Add More
      </button>
    </div>
  );
};

export default OtherInformationTab;
