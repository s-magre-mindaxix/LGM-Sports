import React, { useEffect } from "react";
import type { TabProps, BankDetail } from "../Services/types";
import { buttonStyles } from "../../../../../Components/Common/buttonStyles";

interface ExtendedTabProps extends TabProps {
  errors?: { [key: string]: string[] };
}

const BankDetailsTab: React.FC<ExtendedTabProps> = ({
  data,
  setData,
  errors = {},
}) => {
  const inputStyle = (hasError: boolean) =>
    `w-full border ${hasError ? "border-red-500 bg-red-50" : "border-gray-300"} rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm`;
  const labelStyle =
    "text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest";

  const getError = (index: number, field: string) => {
    return errors[`bankDetails.${index}.${field}`];
  };

  const updateBankDetail = (
    index: number,
    field: keyof BankDetail,
    value: string,
  ) => {
    const updatedBankDetails = [...(data.bankDetails || [])];

    updatedBankDetails[index] = {
      ...updatedBankDetails[index],
      [field]: value,
    };

    setData({ ...data, bankDetails: updatedBankDetails });
  };
  const addBankDetail = () => {
    const newBankDetail: BankDetail = {
      bankName: "",
      bankAddress: "",
      accountNo: "",
      ifsc: "",
      swiftCode: "",
      iban: "",
      accountHolderName: "",
    };
    setData({
      ...data,
      bankDetails: [...(data.bankDetails || []), newBankDetail],
    });
  };

  const removeBankDetail = (index: number) => {
    if (data.bankDetails.length === 1) return;
    const updatedBankDetails = data.bankDetails.filter((_, i) => i !== index);
    setData({ ...data, bankDetails: updatedBankDetails });
  };

  useEffect(() => {
    if (!data.bankDetails || data.bankDetails.length === 0) {
      setData((prev) => ({
        ...prev,
        bankDetails: [
          {
            bankName: "",
            bankAddress: "",
            accountNo: "",
            ifsc: "",
            swiftCode: "",
            iban: "",
            accountHolderName: "",
          },
        ],
      }));
    }
  }, [data.bankDetails, setData]);

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
        🏦 Bank Details
      </h3>
      {errors.bankDetails && (
        <p className="mb-4 text-sm text-red-500">{errors.bankDetails[0]}</p>
      )}
      {(data.bankDetails || []).map((bank, index) => (
        <div
          key={index}
          className="border p-4 rounded-lg mb-4 relative bg-white"
        >
          <button
            onClick={() => removeBankDetail(index)}
            className="absolute top-2 right-2 text-red-500 font-bold hover:text-red-700"
          >
            X
          </button>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={labelStyle}>
                Bank Name <span className="text-red-500 ">*</span>
              </label>
              <input
                className={inputStyle(!!getError(index, "bankName"))}
                value={bank.bankName}
                onChange={(e) =>
                  updateBankDetail(index, "bankName", e.target.value)
                }
              />
              {getError(index, "bankName") && (
                <p className="mt-1 text-sm text-red-500">
                  {getError(index, "bankName")[0]}
                </p>
              )}
            </div>
            <div>
              <label className={labelStyle}>Bank Address</label>
              <input
                className={inputStyle(false)}
                value={bank.bankAddress}
                onChange={(e) =>
                  updateBankDetail(index, "bankAddress", e.target.value)
                }
              />
            </div>
            <div>
              <label className={labelStyle}>
                Account No <span className="text-red-500 ">*</span>
              </label>
              <input
                className={inputStyle(!!getError(index, "accountNo"))}
                value={bank.accountNo}
                onChange={(e) =>
                  updateBankDetail(index, "accountNo", e.target.value)
                }
              />
              {getError(index, "accountNo") && (
                <p className="mt-1 text-sm text-red-500">
                  {getError(index, "accountNo")[0]}
                </p>
              )}
            </div>
            <div>
              <label className={labelStyle}>
                IFSC Code <span className="text-red-500 ">*</span>
              </label>
              <input
                className={inputStyle(!!getError(index, "ifsc"))}
                value={bank.ifsc}
                onChange={(e) =>
                  updateBankDetail(index, "ifsc", e.target.value)
                }
              />
              {getError(index, "ifsc") && (
                <p className="mt-1 text-sm text-red-500">
                  {getError(index, "ifsc")[0]}
                </p>
              )}
            </div>
            <div>
              <label className={labelStyle}>
                Account Holder Name <span className="text-red-500 ">*</span>
              </label>
              <input
                className={inputStyle(!!getError(index, "accountHolderName"))}
                value={bank.accountHolderName}
                onChange={(e) =>
                  updateBankDetail(index, "accountHolderName", e.target.value)
                }
              />
              {getError(index, "accountHolderName") && (
                <p className="mt-1 text-sm text-red-500">
                  {getError(index, "accountHolderName")[0]}
                </p>
              )}
            </div>
            <div>
              <label className={labelStyle}>Swift Code</label>
              <input
                className={inputStyle(false)}
                value={bank.swiftCode}
                onChange={(e) =>
                  updateBankDetail(index, "swiftCode", e.target.value)
                }
              />
            </div>
            <div>
              <label className={labelStyle}>IBAN No</label>
              <input
                className={inputStyle(false)}
                value={bank.iban}
                onChange={(e) =>
                  updateBankDetail(index, "iban", e.target.value)
                }
              />
            </div>
          </div>
        </div>
      ))}
      <button onClick={addBankDetail} className={buttonStyles.addmore}>
        + Add More
      </button>
    </div>
  );
};

export default BankDetailsTab;
