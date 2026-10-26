// import React, { useState, useEffect } from "react";
// import { useSearchParams } from "react-router-dom";
// import { Copy, Search } from "lucide-react";
// import { toast } from "sonner";
// import apiClient from "../../../../API/apiClient";
// import { API_ENDPOINTS } from "../../../../API/apiConfig";
// import { FaEdit } from "react-icons/fa";
// import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";

// interface HistoryRecord {
//   id: number;
//   date: string;
//   time: string;
//   rate: number;
// }

// const CurrencyHistory: React.FC = () => {
//   const [searchParams] = useSearchParams();
//   const currencyCode = searchParams.get("cur") || "USD";

//   const [history, setHistory] = useState<HistoryRecord[]>([]);
//   const [editId, setEditId] = useState<number | null>(null);
//   const [editRate, setEditRate] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [loading, setLoading] = useState(true);

//   const symbols: Record<string, string> = {
//     GBP: "£",
//     USD: "$",
//     EUR: "€",
//     CNY: "¥",
//     INR: "₹",
//   };

//   useEffect(() => {
//     const fetchHistory = async () => {
//       try {
//         setLoading(true);
//         const res = await apiClient.get(
//           `${API_ENDPOINTS.CurrencyHistory}?code=${currencyCode}`,
//         );
//         setHistory(res.data);
//       } catch {
//         toast.error("Failed to load currency history");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchHistory();
//   }, [currencyCode]);

//   // Filter logic for search
//   const filteredHistory = history.filter((item) =>
//     item.date.toLowerCase().includes(searchTerm.toLowerCase()),
//   );

//   const handleCopy = () => {
//     const text = filteredHistory
//       .map((h) => `${h.date} ${h.time}: 1 ${currencyCode} = ₹${h.rate}`)
//       .join("\n");
//     navigator.clipboard.writeText(text);
//     toast.success("History copied to clipboard");
//   };

//   const handleSaveRate = async () => {
//     if (!editRate || Number(editRate) <= 0) {
//       toast.error("Please enter valid rate");
//       return;
//     }

//     try {
//       await apiClient.put(API_ENDPOINTS.CurrencyUpdateTodayRate, {
//         code: currencyCode,
//         rate: Number(editRate),
//       });

//       toast.success("Currency rate updated successfully");

//       setHistory((prev) =>
//         prev.map((x) =>
//           x.id === editId ? { ...x, rate: Number(editRate) } : x,
//         ),
//       );

//       setEditId(null);
//       setEditRate("");
//     } catch {
//       toast.error("Failed to update rate");
//     }
//   };

//   return (
//     <div className="p-4 bg-[#f0f2f9] min-h-screen font-sans">
//       <div className="bg-white rounded-[20px] p-6 shadow-md border border-gray-100 h-auto">
//         {/* Header Section */}
//         <div className="mb-6">
//           <div className="flex items-center gap-3">
//             <h2 className="text-2xl font-bold text-[#133561]">
//               Listing of Currency History
//             </h2>
//           </div>
//           <div className="h-1 bg-blue-600 w-44 mt-1 rounded-full ml-12"></div>
//         </div>

//         {/* Toolbar */}
//         <div className="flex justify-between items-center mb-4">
//           <button
//             onClick={handleCopy}
//             className="bg-[#133561] text-white px-5 py-1.5 rounded text-sm font-bold hover:bg-[#1a467e] transition-all flex items-center gap-2"
//           >
//             <Copy size={14} /> Copy
//           </button>

//           <div className="flex items-center gap-2">
//             <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">
//               Search:
//             </span>
//             <div className="relative">
//               <input
//                 type="text"
//                 className="border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500 w-64 shadow-sm"
//                 placeholder="Search by date..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//               <Search
//                 size={14}
//                 className="absolute right-3 top-2.5 text-gray-400"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Table */}
//         <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
//           <table className="w-full text-left border-collapse">
//             <thead className="bg-[#133561] text-white">
//               <tr>
//                 <th className="p-4 font-bold text-sm text-center w-20">
//                   Sr No
//                 </th>

//                 <th className="p-4 font-bold text-sm">Date</th>

//                 <th className="p-4 font-bold text-sm">Time</th>

//                 <th className="p-4 font-bold text-sm uppercase">
//                   {currencyCode}
//                 </th>

//                 <th className="p-4 font-bold text-sm text-center w-[140px]">
//                   INR
//                 </th>

//                 <th className="px-2 py-4 font-bold text-sm text-center w-20">
//                   Action
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="text-gray-700 bg-white">
//               {loading ? (
//                 <tr>
//                   <td colSpan={5} className="p-10 text-center text-gray-400">
//                     Loading history...
//                   </td>
//                 </tr>
//               ) : filteredHistory.length > 0 ? (
//                 filteredHistory.map((item, index) => (
//                   <tr
//                     key={item.id}
//                     className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors"
//                   >
//                     <td className="p-4 text-sm text-center font-medium">
//                       {index + 1}
//                     </td>
//                     <td className="p-4 text-sm font-medium">{item.date}</td>
//                     <td className="p-4 text-sm text-gray-500">{item.time}</td>
//                     <td className="p-4 text-sm font-bold text-[#133561]">
//                       {symbols[currencyCode] || ""} 1
//                     </td>
//                     {/* <td className="p-4 text-sm font-black text-green-600">
//                       ₹ {item.rate.toFixed(2)}
//                     </td> */}
//                     <td className="p-4 text-sm font-black text-green-600 text-center">
//                       {editId === item.id ? (
//                         <input
//                           type="number"
//                           step="0.01"
//                           value={editRate}
//                           onChange={(e) => setEditRate(e.target.value)}
//                           className="border rounded px-2 py-1 w-28 text-sm text-gray-700"
//                         />
//                       ) : (
//                         <>₹ {item.rate.toFixed(2)}</>
//                       )}
//                     </td>

//                     <td className="px-2 py-4 text-center align-middle">
//                       {editId === item.id ? (
//                         <div className="flex items-center justify-center gap-2">
//                           <button
//                             onClick={handleSaveRate}
//                             className="px-4 py-1.5 bg-green-600 text-white rounded-lg font-normal text-sm hover:bg-green-700 transition"
//                           >
//                             Save
//                           </button>

//                           <button
//                             onClick={() => {
//                               setEditId(null);
//                               setEditRate("");
//                             }}
//                             className="px-4 py-1.5 bg-gray-500 text-white rounded-lg font-normal text-sm hover:bg-gray-600 transition"
//                           >
//                             Cancel
//                           </button>
//                         </div>
//                       ) : (
//                         index === 0 && (
//                           <button
//                             onClick={() => {
//                               setEditId(item.id);
//                               setEditRate(item.rate.toString());
//                             }}
//                             className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
//                           >
//                             <FaEdit size={16} />
//                           </button>
//                         )
//                       )}
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={5} className="p-10 text-center text-gray-400">
//                     No history found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CurrencyHistory;





import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Copy, Search } from "lucide-react";
import { toast } from "sonner";
import apiClient from "../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import { FaEdit } from "react-icons/fa";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";

interface HistoryRecord {
  id: number;
  date: string;
  time: string;
  rate: number;
}

const CurrencyHistory: React.FC = () => {
  const [searchParams] = useSearchParams();
  const currencyCode = searchParams.get("cur") || "USD";

  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editRate, setEditRate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const symbols: Record<string, string> = {
    GBP: "£",
    USD: "$",
    EUR: "€",
    CNY: "¥",
    INR: "₹",
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(
          `${API_ENDPOINTS.CurrencyHistory}?code=${currencyCode}`,
        );
        setHistory(res.data);
      } catch {
        toast.error("Failed to load currency history");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [currencyCode]);

  // Filter logic for search
  const filteredHistory = history.filter((item) =>
    item.date.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleCopy = () => {
    const text = filteredHistory
      .map((h) => `${h.date} ${h.time}: 1 ${currencyCode} = ₹${h.rate}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    toast.success("History copied to clipboard");
  };

  const handleSaveRate = async () => {
    if (!editRate || Number(editRate) <= 0) {
      toast.error("Please enter valid rate");
      return;
    }

    try {
      await apiClient.put(API_ENDPOINTS.CurrencyUpdateTodayRate, {
        code: currencyCode,
        rate: Number(editRate),
      });

      toast.success("Currency rate updated successfully");

      setHistory((prev) =>
        prev.map((x) =>
          x.id === editId ? { ...x, rate: Number(editRate) } : x,
        ),
      );

      setEditId(null);
      setEditRate("");
    } catch {
      toast.error("Failed to update rate");
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f6f2] p-4 font-sans sm:p-6">
      <div className="mx-auto max-w-[1600px] rounded-[24px] border border-black/[.06] bg-white p-4 shadow-sm sm:p-6">
        {/* Header Section */}
        <div className="relative mb-7 min-h-[170px] overflow-hidden rounded-2xl bg-[#22282d] sm:min-h-[200px]">
          <img src="https://www.lgmsports.in/hero-images/adjustable-inline-skates.webp" alt="LGM Sports Twister inline skates" className="absolute inset-0 h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#151b20]/90 via-[#151b20]/65 to-[#151b20]/15" />
          <div className="relative flex min-h-[170px] flex-col justify-center px-6 py-7 text-white sm:min-h-[200px] sm:px-9">
            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[.22em] text-[#ffb27f]">LGM Sports · Finance</p>
            <h1 className="text-2xl font-black tracking-tight sm:text-4xl">Currency history</h1>
            <p className="mt-2 text-sm text-white/75">Review and manage exchange rates against Indian rupees.</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 rounded-xl bg-[#f07837] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#dd6328] focus:outline-none focus:ring-4 focus:ring-[#f07837]/20"
          >
            <Copy size={14} /> Copy
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#77766f]">
              Search:
            </span>
            <div className="relative">
              <input
                type="text"
                className="w-full rounded-xl border border-black/10 bg-[#fbfaf8] px-3 py-2.5 pr-9 text-sm outline-none transition focus:border-[#f07837] focus:ring-4 focus:ring-[#f07837]/10 sm:w-64"
                placeholder="Search by date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search
                size={14}
                className="absolute right-3 top-3 text-[#9b9992]"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-black/[.08]">
          <table className="w-full min-w-[680px] border-collapse text-left">
            <thead className="bg-[#f07837] text-white">
              <tr>
                <th className="p-4 font-bold text-sm text-center w-20">
                  Sr No
                </th>

                <th className="p-4 font-bold text-sm">Date</th>

                <th className="p-4 font-bold text-sm">Time</th>

                <th className="p-4 font-bold text-sm uppercase">
                  {currencyCode}
                </th>

                <th className="p-4 font-bold text-sm text-center w-[140px]">
                  INR
                </th>

                <th className="px-2 py-4 font-bold text-sm text-center w-20">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-700 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-gray-400">
                    Loading history...
                  </td>
                </tr>
              ) : filteredHistory.length > 0 ? (
                filteredHistory.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-black/[.05] transition-colors hover:bg-[#fff7f1]"
                  >
                    <td className="p-4 text-sm text-center font-medium">
                      {index + 1}
                    </td>
                    <td className="p-4 text-sm font-medium">{item.date}</td>
                    <td className="p-4 text-sm text-gray-500">{item.time}</td>
                    <td className="p-4 text-sm font-bold text-[#343331]">
                      {symbols[currencyCode] || ""} 1
                    </td>
                    {/* <td className="p-4 text-sm font-black text-green-600">
                      ₹ {item.rate.toFixed(2)}
                    </td> */}
                    <td className="p-4 text-center text-sm font-black text-[#a64a1d]">
                      {editId === item.id ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editRate}
                          onChange={(e) => setEditRate(e.target.value)}
                          className="w-28 rounded-lg border border-black/10 px-2 py-1 text-sm text-gray-700 outline-none focus:border-[#f07837] focus:ring-2 focus:ring-[#f07837]/15"
                        />
                      ) : (
                        <>₹ {item.rate.toFixed(2)}</>
                      )}
                    </td>

                    <td className="px-2 py-4 text-center align-middle">
                      {editId === item.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={handleSaveRate}
                            className="rounded-lg bg-[#f07837] px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-[#dd6328]"
                          >
                            Save
                          </button>

                          <button
                            onClick={() => {
                              setEditId(null);
                              setEditRate("");
                            }}
                            className="rounded-lg bg-[#5e6264] px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-[#414648]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        index === 0 && (
                          <button
                            onClick={() => {
                              setEditId(item.id);
                              setEditRate(item.rate.toString());
                            }}
                            className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
                          >
                            <FaEdit size={16} />
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-gray-400">
                    No history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CurrencyHistory;
