// import React, { useCallback, useEffect, useState } from "react";
// import {
//   Building2,
//   Users,
//   Truck,
//   UserCircle,
//   Package,
//   Box,
//   PoundSterling,
//   DollarSign,
//   Euro,
//   StickyNote,
//   JapaneseYen,
//   X,
// } from "lucide-react";
// import { useAuth } from "../../../../hooks/useAuth";
// import apiClient from "../../../../API/apiClient";
// import { API_ENDPOINTS } from "../../../../API/apiConfig";
// import { toast } from "sonner";
// import NoteModal from "../UserNote/NoteModal";
// import LiveGoogleCalendar from "./LiveGoogleCalendar";
// import { useNavigate } from "react-router-dom";
//   // import { useNavigate } from "react-router-dom";

// // --- Components ---

// interface UserNote {
//   id: number;
//   content: string;
//   gradientClass: string;
//   authorRole: string;
//   updatedAt: string;
// }

// interface CrmDashboardStats {
//   companies: number;
//   employees: number;
//   vendors: number;
//   customers: number;
//   products: number;
//   accessories: number;
//   offers: number;
//   enquiries: number;
//   orderAcceptances: number;
//   proformaInvoices: number;
//   invoices: number;
// }

// const CurrencyCard = ({
//   title,
//   value,
//   symbol,
//   onClick,
// }: {
//   title: string;
//   value: string;
//   symbol: React.ReactNode;
//   onClick?: () => void;
// }) => (
//   <div
//     onClick={onClick}
//     className="relative w-full h-[89.39px] bg-linear-to-r from-[#4a6fa3] to-[#b4c87a] rounded-lg p-3 shadow-lg transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl"
//   >
//     <div className="flex flex-col h-full justify-between">
//       <p className="text-[13.6px] font-bold text-white/90  tracking-wide drop-shadow-sm">
//         {title}
//       </p>
//       <h2 className="text-[22px] font-bold text-white drop-shadow-md tracking-wide">
//         {value}
//       </h2>
//     </div>
//     <div className="absolute bottom-3 right-3 bg-black/35 rounded-lg w-9 h-10 flex items-center justify-center text-white shadow-inner">
//       {symbol}
//     </div>
//   </div>
// );

// const StatCard = ({
//   icon,
//   title,
//   count,
//   onClick,
// }: {
//   icon: React.ReactNode;
//   title: string;
//   count: string;
//   onClick?: () => void;
// }) => (
//   <div onClick={onClick} className="w-full h-[81px] bg-linear-to-br from-[#4a6fa3] to-[#b4c87a] rounded-lg p-2 flex flex-col items-center justify-center gap-1 shadow-lg transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl">
//     <div className="text-white drop-shadow-sm">{icon}</div>
//     <p className="text-[16px] font-bold text-white/95 tracking-wide leading-none text-center drop-shadow-sm">
//       {title}
//     </p>
//     <h2 className="text-[16px] font-bold text-white leading-none mt-0.5 drop-shadow-md">
//       {count}
//     </h2>
//   </div>
// );

// const ProcessCard = ({ title, value, onClick }: { title: string; value: string; onClick?: () => void; }) => (
//   <div onClick={onClick} className="w-full h-[70.39px] bg-linear-to-r from-[#4a6fa3] to-[#b4c87a] rounded-lg pl-4 py-3 flex flex-col justify-between shadow-lg transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl">
//     <p className="text-[12px] font-bold text-white/90 uppercase tracking-wide drop-shadow-sm">
//       {title}
//     </p>
//     <h2 className="text-[20px] font-bold text-white leading-none drop-shadow-md">
//       {value}
//     </h2>
//   </div>
// );

// const CRMHome: React.FC = () => {
//   // const navigate = useNavigate();
//   const { user } = useAuth();
//   const [rates, setRates] = useState({
//     GBP: "0.00",
//     USD: "0.00",
//     EUR: "0.00",
//     CNY: "0.00",
//   });
//   const [loadingRates, setLoadingRates] = useState(true);
//   const navigate = useNavigate();
//   // const currentUserEmail = user?.email || "";
//   const [notes, setNotes] = useState<UserNote[]>([]);
//   const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
//   const [stats, setStats] = useState<CrmDashboardStats | null>(null);

//   const fetchNotes = useCallback(async () => {
//     try {
//       const res = await apiClient.get(API_ENDPOINTS.UserNotes);
//       setNotes(res.data);
//     } catch {
//       console.error("Failed to fetch notes");
//     }
//   }, []);

//   useEffect(() => {
//     fetchNotes();
//   }, [fetchNotes]);

//   const handleAddNote = async (content: string, gradient: string) => {
//     try {
//       await apiClient.post(API_ENDPOINTS.UserNotes, {
//         content,
//         gradientClass: gradient,
//         authorRole: user?.role || "User",
//       });
//       fetchNotes(); // Refresh list
//     } catch {
//       toast.error("Failed to save note");
//     }
//   };

//   const handleDeleteNote = async (id: number) => {
//     try {
//       await apiClient.delete(`${API_ENDPOINTS.UserNotes}/${id}`);
//       fetchNotes();
//     } catch {
//       toast.error("Delete failed");
//     }
//   };

//   const formatNoteDate = (dateString: string) => {
//     const date = new Date(
//       dateString.endsWith("Z") ? dateString : dateString + "Z",
//     );

//     const day = String(date.getDate()).padStart(2, "0");
//     const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
//     const year = date.getFullYear();

//     let hours = date.getHours();
//     const minutes = String(date.getMinutes()).padStart(2, "0");
//     const ampm = hours >= 12 ? "PM" : "AM";
//     hours = hours % 12;
//     hours = hours ? hours : 12;

//     return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
//   };

//   const fetchLiveRates = useCallback(async () => {
//     try {
//       setLoadingRates(true);
//       // // Do not delete this comment
//       // // Live Rate
//       // const [gbpRes, usdRes, eurRes, cnyRes] = await Promise.all([
//       //   apiClient.get(API_ENDPOINTS.WiseRate, {
//       //     params: { source: "GBP", target: "INR" },
//       //   }),
//       //   apiClient.get(API_ENDPOINTS.WiseRate, {
//       //     params: { source: "USD", target: "INR" },
//       //   }),
//       //   apiClient.get(API_ENDPOINTS.WiseRate, {
//       //     params: { source: "EUR", target: "INR" },
//       //   }),
//       //   apiClient.get(API_ENDPOINTS.WiseRate, {
//       //     params: { source: "CNY", target: "INR" },
//       //   }),
//       // ]);

//       // Locked Rate
//        const [gbpRes, usdRes, eurRes, cnyRes] = await Promise.all([
//         apiClient.get(API_ENDPOINTS.LockedRate, {
//           params: { source: "GBP", target: "INR" },
//         }),
//         apiClient.get(API_ENDPOINTS.LockedRate, {
//           params: { source: "USD", target: "INR" },
//         }),
//         apiClient.get(API_ENDPOINTS.LockedRate, {
//           params: { source: "EUR", target: "INR" },
//         }),
//         apiClient.get(API_ENDPOINTS.LockedRate, {
//           params: { source: "CNY", target: "INR" },
//         }),
//       ]);

//       const newRates = {
//         GBP: Number(gbpRes.data.rate || 0).toFixed(2),
//         USD: Number(usdRes.data.rate || 0).toFixed(2),
//         EUR: Number(eurRes.data.rate || 0).toFixed(2),
//         CNY: Number(cnyRes.data.rate || 0).toFixed(2),
//       };

//       setRates(newRates);

//       // await Promise.all(
//       //   Object.entries(newRates).map(([code, rate]) =>
//       //     apiClient.post(API_ENDPOINTS.CurrencyLog, {
//       //       code,
//       //       rate: parseFloat(rate),
//       //     }),
//       //   ),
//       // );
//     } catch (error) {
//       console.error("Failed to fetch Wise rates", error);
//       toast.error("Failed to load Wise currency rates");
//     } finally {
//       setLoadingRates(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchLiveRates();
//   }, [fetchLiveRates]);

//   const fetchDashboardStats = async () => {
//     try {
//       const res = await apiClient.get<CrmDashboardStats>(
//         API_ENDPOINTS.CrmDashboardStats,
//       );
//       setStats(res.data);
//     } catch {
//       toast.error("Failed to load dashboard stats");
//     }
//   };

//   useEffect(() => {
//     fetchDashboardStats();
//   }, []);

//   return (
//     <div className="bg-[#eef2f7] min-h-screen">
//       <div className="grow p-0 ">
//         <div className="bg-[#d3d9df] rounded-[20px] p-2 shadow-md border border-white/60 m-0">
//           {/* Main Grid */}
//           <div className="grid grid-cols-12 gap-2">
//             {/* LEFT: Currency Cards */}
//             <div className="col-span-12 xl:col-span-5">
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 cursor-pointer">
//                 <CurrencyCard
//                   title="Value in GBP"
//                   value={loadingRates ? "..." : rates.GBP}
//                   symbol={<PoundSterling size={18} />}
//                   // onClick={() => navigate("/crm/currency-history?cur=GBP")}
//                   onClick={() =>
//                     window.open("/crm/currency-history?cur=GBP", "_blank")
//                   }
//                 />
//                 <CurrencyCard
//                   title="Value in USD"
//                   value={loadingRates ? "..." : rates.USD}
//                   symbol={<DollarSign size={18} />}
//                   // onClick={() => navigate("/crm/currency-history?cur=USD")}
//                   onClick={() =>
//                     window.open("/crm/currency-history?cur=USD", "_blank")
//                   }
//                 />
//                 <CurrencyCard
//                   title="Value in EUR"
//                   value={loadingRates ? "..." : rates.EUR}
//                   symbol={<Euro size={18} />}
//                   // onClick={() => navigate("/crm/currency-history?cur=EUR")}
//                   onClick={() =>
//                     window.open("/crm/currency-history?cur=EUR", "_blank")
//                   }
//                 />
//                 <CurrencyCard
//                   title="Value in CNY"
//                   value={loadingRates ? "..." : rates.CNY}
//                   symbol={<JapaneseYen size={18} />}
//                   // onClick={() => navigate("/crm/currency-history?cur=CNY")}
//                   onClick={() =>
//                     window.open("/crm/currency-history?cur=CNY", "_blank")
//                   }
//                 />
//                 {/* INR Card */}
//                 <div className="sm:col-span-1">
//                   <CurrencyCard
//                     title="Value in INR"
//                     value="1.00"
//                     symbol={<span className="font-bold text-lg pb-1">₹</span>}
//                     // onClick={() => navigate("/crm/currency-history?cur=INR")}
//                     onClick={() =>
//                       window.open("/crm/currency-history?cur=INR", "_blank")
//                     }
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* RIGHT: Masters Stats */}
//             <div className="col-span-12 xl:col-span-7">
//               <div className="grid grid-cols-2 md:grid-cols-3 gap-2 cursor-pointer">
//                 <StatCard
//                   icon={<Building2 size={18} />}
//                   title="Companies"
//                   count={stats?.companies?.toString() ?? "0"}
//                   onClick={() => navigate("/crm/master/company")}
//                 />
//                 <StatCard
//                   icon={<Users size={18} />}
//                   title="Employees"
//                   count={stats?.employees?.toString() ?? "0"}
//                   onClick={() => navigate("/hrms/master/employee")}
//                 />
//                 <StatCard
//                   icon={<Truck size={18} />}
//                   title="Vendors"
//                   count={stats?.vendors?.toString() ?? "0"}
//                   onClick={() => navigate("/crm/master/vendor")}
//                 />
//                 <StatCard
//                   icon={<UserCircle size={18} />}
//                   title="Customers"
//                   count={stats?.customers?.toString() ?? "0"}
//                   onClick={() => navigate("/crm/master/customer")}
//                 />
//                 <StatCard
//                   icon={<Package size={18} />}
//                   title="Products"
//                   count={stats?.products?.toString() ?? "0"}
//                   onClick={() => navigate("/crm/master/product")}
//                 />
//                 <StatCard
//                   icon={<Box size={18} />}
//                   title="Accessories"
//                   count={stats?.accessories?.toString() ?? "0"}
//                   onClick={() => navigate("/crm/master/accessories")}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Divider */}
//           <div className="my-3 h-px bg-white w-full" />

//           {/* BOTTOM ROW: Process Totals */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 cursor-pointer">
//           <ProcessCard
//               title="Total Enquiry"
//               value={stats?.enquiries?.toString() ?? "0"}
//               onClick={() => navigate("/crm/sales/enquiry")}
//             />
//             <ProcessCard
//               title="Total Offer"
//               value={stats?.offers?.toString() ?? "0"}
//               onClick={() => navigate("/crm/sales/offer")}
//             />
//             <ProcessCard
//               title="Total Order Acceptance"
//               value={stats?.orderAcceptances?.toString() ?? "0"}
//               onClick={() => navigate("/crm/sales/order-acceptance")}
//             />
//             <ProcessCard
//               title="Total Proforma Invoice"
//               value={stats?.proformaInvoices?.toString() ?? "0"}
//               onClick={() => navigate("/crm/accounts/proforma")}
//             />
//             <ProcessCard
//               title="Total Invoice"
//               value={stats?.invoices?.toString() ?? "0"}
//               onClick={() => navigate("/crm/accounts/invoice")}
//             />
//           </div>

//           <div className="my-3 h-px bg-white w-full" />

//           {/* Calendar & Notes Section */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-2">
//             {/* Calendar */}
//             {/* <LiveGoogleCalendar userEmail="rajeshg.nucleosys@gmail.com" /> */}
//            {user ? (
//             <LiveGoogleCalendar calendarId={user.googleCalendarId || ""} />
//           )  : (
//               <div className="bg-white rounded-xl p-4 min-h-[450px] flex items-center justify-center border border-gray-200">
//                 <p className="text-gray-400 font-medium">Loading Calendar...</p>
//               </div>
//             )}

//             {/* Team Notes */}
//             <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100 min-h-[350px]">
//               <div className="flex items-center justify-between mb-4">
//                 <div className="flex items-center gap-2">
//                   <div className="bg-amber-500 p-1.5 rounded-md text-white">
//                     <StickyNote size={18} />
//                   </div>
//                   <h3 className="font-bold text-[16px] text-[#154068]">
//                     My Notes
//                   </h3>
//                 </div>
//                 {/* Create Button */}
//                 <button
//                   onClick={() => setIsNoteModalOpen(true)}
//                   className="flex items-center gap-2 bg-[#f07837] text-white px-4 py-2 rounded-full shadow-md hover:bg-[#1d467b] transition-all"
//                 >
//                   <span className="text-xl leading-none">+</span>
//                   <span className="text-sm font-medium">Add Note</span>
//                 </button>
//               </div>

//               <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2">
//                 {notes.length > 0 ? (
//                   notes.map((note) => (
//                     <div
//                       key={note.id}
//                       className={`relative bg-linear-to-br ${note.gradientClass} rounded-2xl p-4 text-white shadow-md transition-all duration-300 hover:-translate-y-1 group`}
//                     >
//                       {/* Delete button on hover */}
//                       <button
//                         onClick={() => handleDeleteNote(note.id)}
//                         className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-black/20 hover:bg-red-500 p-1 rounded-full transition-all"
//                       >
//                         <X size={12} />
//                       </button>

//                       <p className="text-[14px] font-medium leading-relaxed mb-2">
//                         {note.content}
//                       </p>
//                       <p className="text-[11px] mt-2 font-bold opacity-80 border-t border-white/20 pt-2">
//                         Updated: {formatNoteDate(note.updatedAt)}
//                       </p>
//                     </div>
//                   ))
//                 ) : (
//                   <div className="text-center mt-20 text-gray-300 italic">
//                     No notes created yet.
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <NoteModal
//         isOpen={isNoteModalOpen}
//         onClose={() => setIsNoteModalOpen(false)}
//         onSave={handleAddNote}
//       />

//       <footer className="w-full bg-[#e9ecf7] py-6 mt-4 border-t border-gray-200">
//         <div className="container mx-auto text-center">
//           <p className="text-[15px] font-medium text-[#133561] tracking-wide">
//             © 2026 <span className="font-bold">Gaxce Sensors</span>. All rights
//             reserved.
//           </p>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default CRMHome;


import React, { useCallback, useEffect, useState } from "react";
import {
  Building2,
  Users,
  Truck,
  UserCircle,
  Package,
  Box,
  PoundSterling,
  DollarSign,
  Euro,
  StickyNote,
  JapaneseYen,
  X,
} from "lucide-react";
import { useAuth } from "../../../../hooks/useAuth";
import apiClient from "../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import { toast } from "sonner";
import NoteModal from "../UserNote/NoteModal";
import LiveGoogleCalendar from "./LiveGoogleCalendar";
import { useNavigate } from "react-router-dom";
  // import { useNavigate } from "react-router-dom";

// --- Components ---

interface UserNote {
  id: number;
  content: string;
  gradientClass: string;
  authorRole: string;
  updatedAt: string;
}

interface CrmDashboardStats {
  companies: number;
  employees: number;
  vendors: number;
  customers: number;
  products: number;
  accessories: number;
  offers: number;
  enquiries: number;
  orderAcceptances: number;
  proformaInvoices: number;
  invoices: number;
}

const CurrencyCard = ({
  title,
  value,
  symbol,
  onClick,
}: {
  title: string;
  value: string;
  symbol: React.ReactNode;
  onClick?: () => void;
}) => (
  <div
    onClick={onClick}
    className="relative w-full h-[89.39px] bg-linear-to-r from-[#f07837] to-[#e59b68] rounded-2xl p-4 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
  >
    <div className="flex flex-col h-full justify-between">
      <p className="text-[13.6px] font-bold text-white/90  tracking-wide drop-shadow-sm">
        {title}
      </p>
      <h2 className="text-[22px] font-bold text-white drop-shadow-md tracking-wide">
        {value}
      </h2>
    </div>
    <div className="absolute bottom-3 right-3 bg-black/35 rounded-lg w-9 h-10 flex items-center justify-center text-white shadow-inner">
      {symbol}
    </div>
  </div>
);

const StatCard = ({
  icon,
  title,
  count,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  count: string;
  onClick?: () => void;
}) => (
  <div onClick={onClick} className="w-full h-[81px] bg-white border border-[#f07837]/15 rounded-2xl p-2 flex flex-col items-center justify-center gap-1 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#f07837]/40 hover:shadow-lg">
    <div className="text-[#f07837]">{icon}</div>
    <p className="text-[16px] font-bold text-[#343331] tracking-wide leading-none text-center">
      {title}
    </p>
    <h2 className="text-[16px] font-bold text-[#a64a1d] leading-none mt-0.5">
      {count}
    </h2>
  </div>
);

const ProcessCard = ({ title, value, onClick }: { title: string; value: string; onClick?: () => void; }) => (
  <div onClick={onClick} className="w-full h-[70.39px] bg-white border border-[#f07837]/15 rounded-2xl pl-4 py-3 flex flex-col justify-between shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#f07837]/40 hover:shadow-lg">
    <p className="text-[12px] font-bold text-[#77766f] uppercase tracking-wide">
      {title}
    </p>
    <h2 className="text-[20px] font-bold text-[#a64a1d] leading-none">
      {value}
    </h2>
  </div>
);

const CRMHome: React.FC = () => {
  // const navigate = useNavigate();
  const { user } = useAuth();
  const [rates, setRates] = useState({
    GBP: "0.00",
    USD: "0.00",
    EUR: "0.00",
    CNY: "0.00",
  });
  const [loadingRates, setLoadingRates] = useState(true);
  const navigate = useNavigate();
  // const currentUserEmail = user?.email || "";
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [stats, setStats] = useState<CrmDashboardStats | null>(null);

  const fetchNotes = useCallback(async () => {
    try {
      const res = await apiClient.get(API_ENDPOINTS.UserNotes);
      setNotes(res.data);
    } catch {
      console.error("Failed to fetch notes");
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleAddNote = async (content: string, gradient: string) => {
    try {
      await apiClient.post(API_ENDPOINTS.UserNotes, {
        content,
        gradientClass: gradient,
        authorRole: user?.role || "User",
      });
      fetchNotes(); // Refresh list
    } catch {
      toast.error("Failed to save note");
    }
  };

  const handleDeleteNote = async (id: number) => {
    try {
      await apiClient.delete(`${API_ENDPOINTS.UserNotes}/${id}`);
      fetchNotes();
    } catch {
      toast.error("Delete failed");
    }
  };

  const formatNoteDate = (dateString: string) => {
    const date = new Date(
      dateString.endsWith("Z") ? dateString : dateString + "Z",
    );

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;

    return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
  };

  const fetchLiveRates = useCallback(async () => {
    try {
      setLoadingRates(true);
      // // Do not delete this comment
      // // Live Rate
      // const [gbpRes, usdRes, eurRes, cnyRes] = await Promise.all([
      //   apiClient.get(API_ENDPOINTS.WiseRate, {
      //     params: { source: "GBP", target: "INR" },
      //   }),
      //   apiClient.get(API_ENDPOINTS.WiseRate, {
      //     params: { source: "USD", target: "INR" },
      //   }),
      //   apiClient.get(API_ENDPOINTS.WiseRate, {
      //     params: { source: "EUR", target: "INR" },
      //   }),
      //   apiClient.get(API_ENDPOINTS.WiseRate, {
      //     params: { source: "CNY", target: "INR" },
      //   }),
      // ]);

      // Locked Rate
       const [gbpRes, usdRes, eurRes, cnyRes] = await Promise.all([
        apiClient.get(API_ENDPOINTS.LockedRate, {
          params: { source: "GBP", target: "INR" },
        }),
        apiClient.get(API_ENDPOINTS.LockedRate, {
          params: { source: "USD", target: "INR" },
        }),
        apiClient.get(API_ENDPOINTS.LockedRate, {
          params: { source: "EUR", target: "INR" },
        }),
        apiClient.get(API_ENDPOINTS.LockedRate, {
          params: { source: "CNY", target: "INR" },
        }),
      ]);

      const newRates = {
        GBP: Number(gbpRes.data.rate || 0).toFixed(2),
        USD: Number(usdRes.data.rate || 0).toFixed(2),
        EUR: Number(eurRes.data.rate || 0).toFixed(2),
        CNY: Number(cnyRes.data.rate || 0).toFixed(2),
      };

      setRates(newRates);

      // await Promise.all(
      //   Object.entries(newRates).map(([code, rate]) =>
      //     apiClient.post(API_ENDPOINTS.CurrencyLog, {
      //       code,
      //       rate: parseFloat(rate),
      //     }),
      //   ),
      // );
    } catch (error) {
      console.error("Failed to fetch Wise rates", error);
      toast.error("Failed to load Wise currency rates");
    } finally {
      setLoadingRates(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveRates();
  }, [fetchLiveRates]);

  const fetchDashboardStats = async () => {
    try {
      const res = await apiClient.get<CrmDashboardStats>(
        API_ENDPOINTS.CrmDashboardStats,
      );
      setStats(res.data);
    } catch {
      toast.error("Failed to load dashboard stats");
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return (
    <div className="bg-[#f7f6f2] min-h-screen text-[#252a2e]">
      <div className="grow p-0 ">
        <div className="relative mx-3 mt-3 h-[190px] overflow-hidden rounded-3xl bg-[#252a2e] sm:mx-5 sm:mt-5 sm:h-[230px]">
          <img src="https://www.lgmsports.in/hero-images/adjustable-inline-skates.webp" alt="LGM Sports Twister adjustable inline skates" className="absolute inset-0 h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#151b20]/90 via-[#151b20]/60 to-transparent" />
          <div className="relative flex h-full flex-col justify-center px-6 text-white sm:px-10">
            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[.22em] text-[#ffb27f]">LGM Sports · New Collection 2025</p>
            <h1 className="text-2xl font-black tracking-tight sm:text-4xl">Adjustable inline skates.</h1>
            <p className="mt-2 max-w-xl text-xs text-white/75 sm:text-sm">Twister skates made to find the perfect fit, with four-size adjustability and easy adjustment.</p>
            <a href="https://www.lgmsports.in/twister-inline-skates/" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex w-fit items-center rounded-full bg-[#f07837] px-4 py-2 text-[10px] font-extrabold uppercase tracking-[.14em] text-white transition hover:bg-[#dd6328]">Explore Twister skates <span className="ml-2" aria-hidden="true">↗</span></a>
          </div>
        </div>
        <style>{`@keyframes lgm-crm-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } } .lgm-crm-marquee { animation: lgm-crm-marquee 28s linear infinite; } @media (prefers-reduced-motion: reduce) { .lgm-crm-marquee { animation: none; } }`}</style>
        <div className="mx-3 mt-3 overflow-hidden rounded-xl border border-[#f07837]/15 bg-[#fff0e7] py-2.5 sm:mx-5">
          <div className="lgm-crm-marquee flex w-max">
            {[0, 1].map((copy) => <div key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
              {["Twister adjustable inline skates", "Four-size adjustable fit", "Easy adjustment", "LGM Sports · Pune, India"].map((item) => <span key={`${copy}-${item}`} className="flex items-center px-6 text-[9px] font-extrabold uppercase tracking-[.18em] text-[#a64a1d] sm:px-10 sm:text-[10px]">{item}<span className="ml-10 h-1.5 w-1.5 rotate-45 bg-[#f07837]" /></span>)}
            </div>)}
          </div>
        </div>
        <div className="bg-transparent rounded-[20px] p-2 sm:p-4 m-0">
          {/* Main Grid */}
          <div className="grid grid-cols-12 gap-2">
            {/* LEFT: Currency Cards */}
            <div className="col-span-12 xl:col-span-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 cursor-pointer">
                <CurrencyCard
                  title="Value in GBP"
                  value={loadingRates ? "..." : rates.GBP}
                  symbol={<PoundSterling size={18} />}
                  // onClick={() => navigate("/crm/currency-history?cur=GBP")}
                  onClick={() =>
                    window.open("/crm/currency-history?cur=GBP", "_blank")
                  }
                />
                <CurrencyCard
                  title="Value in USD"
                  value={loadingRates ? "..." : rates.USD}
                  symbol={<DollarSign size={18} />}
                  // onClick={() => navigate("/crm/currency-history?cur=USD")}
                  onClick={() =>
                    window.open("/crm/currency-history?cur=USD", "_blank")
                  }
                />
                <CurrencyCard
                  title="Value in EUR"
                  value={loadingRates ? "..." : rates.EUR}
                  symbol={<Euro size={18} />}
                  // onClick={() => navigate("/crm/currency-history?cur=EUR")}
                  onClick={() =>
                    window.open("/crm/currency-history?cur=EUR", "_blank")
                  }
                />
                <CurrencyCard
                  title="Value in CNY"
                  value={loadingRates ? "..." : rates.CNY}
                  symbol={<JapaneseYen size={18} />}
                  // onClick={() => navigate("/crm/currency-history?cur=CNY")}
                  onClick={() =>
                    window.open("/crm/currency-history?cur=CNY", "_blank")
                  }
                />
                {/* INR Card */}
                <div className="sm:col-span-1">
                  <CurrencyCard
                    title="Value in INR"
                    value="1.00"
                    symbol={<span className="font-bold text-lg pb-1">₹</span>}
                    // onClick={() => navigate("/crm/currency-history?cur=INR")}
                    onClick={() =>
                      window.open("/crm/currency-history?cur=INR", "_blank")
                    }
                  />
                </div>
              </div>
            </div>

            {/* RIGHT: Masters Stats */}
            <div className="col-span-12 xl:col-span-7">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 cursor-pointer">
                <StatCard
                  icon={<Building2 size={18} />}
                  title="Companies"
                  count={stats?.companies?.toString() ?? "0"}
                  onClick={() => navigate("/crm/master/company")}
                />
                <StatCard
                  icon={<Users size={18} />}
                  title="Employees"
                  count={stats?.employees?.toString() ?? "0"}
                  onClick={() => navigate("/hrms/master/employee")}
                />
                <StatCard
                  icon={<Truck size={18} />}
                  title="Vendors"
                  count={stats?.vendors?.toString() ?? "0"}
                  onClick={() => navigate("/crm/master/vendor")}
                />
                <StatCard
                  icon={<UserCircle size={18} />}
                  title="Customers"
                  count={stats?.customers?.toString() ?? "0"}
                  onClick={() => navigate("/crm/master/customer")}
                />
                <StatCard
                  icon={<Package size={18} />}
                  title="Products"
                  count={stats?.products?.toString() ?? "0"}
                  onClick={() => navigate("/crm/master/product")}
                />
                <StatCard
                  icon={<Box size={18} />}
                  title="Accessories"
                  count={stats?.accessories?.toString() ?? "0"}
                  onClick={() => navigate("/crm/master/accessories")}
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="my-3 h-px bg-white w-full" />

          {/* BOTTOM ROW: Process Totals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 cursor-pointer">
          <ProcessCard
              title="Total Enquiry"
              value={stats?.enquiries?.toString() ?? "0"}
              onClick={() => navigate("/crm/sales/enquiry")}
            />
            <ProcessCard
              title="Total Offer"
              value={stats?.offers?.toString() ?? "0"}
              onClick={() => navigate("/crm/sales/offer")}
            />
            <ProcessCard
              title="Total Order Acceptance"
              value={stats?.orderAcceptances?.toString() ?? "0"}
              onClick={() => navigate("/crm/sales/order-acceptance")}
            />
            <ProcessCard
              title="Total Proforma Invoice"
              value={stats?.proformaInvoices?.toString() ?? "0"}
              onClick={() => navigate("/crm/accounts/proforma")}
            />
            <ProcessCard
              title="Total Invoice"
              value={stats?.invoices?.toString() ?? "0"}
              onClick={() => navigate("/crm/accounts/invoice")}
            />
          </div>

          <div className="my-3 h-px bg-white w-full" />

          {/* Calendar & Notes Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-2">
            {/* Calendar */}
            {/* <LiveGoogleCalendar userEmail="rajeshg.nucleosys@gmail.com" /> */}
           {user ? (
            <LiveGoogleCalendar calendarId={user.googleCalendarId || ""} />
          )  : (
              <div className="bg-white rounded-xl p-4 min-h-[450px] flex items-center justify-center border border-gray-200">
                <p className="text-gray-400 font-medium">Loading Calendar...</p>
              </div>
            )}

            {/* Team Notes */}
            <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100 min-h-[350px]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-[#f07837] p-1.5 rounded-md text-white">
                    <StickyNote size={18} />
                  </div>
                  <h3 className="font-bold text-[16px] text-[#252a2e]">
                    My Notes
                  </h3>
                </div>
                {/* Create Button */}
                <button
                  onClick={() => setIsNoteModalOpen(true)}
                  className="flex items-center gap-2 bg-[#f07837] text-white px-4 py-2 rounded-full shadow-sm hover:bg-[#dd6328] transition-all"
                >
                  <span className="text-xl leading-none">+</span>
                  <span className="text-sm font-medium">Add Note</span>
                </button>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2">
                {notes.length > 0 ? (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      className={`relative bg-linear-to-br ${note.gradientClass} rounded-2xl p-4 text-white shadow-md transition-all duration-300 hover:-translate-y-1 group`}
                    >
                      {/* Delete button on hover */}
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-black/20 hover:bg-red-500 p-1 rounded-full transition-all"
                      >
                        <X size={12} />
                      </button>

                      <p className="text-[14px] font-medium leading-relaxed mb-2">
                        {note.content}
                      </p>
                      <p className="text-[11px] mt-2 font-bold opacity-80 border-t border-white/20 pt-2">
                        Updated: {formatNoteDate(note.updatedAt)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center mt-20 text-gray-300 italic">
                    No notes created yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSave={handleAddNote}
      />

      <footer className="w-full bg-white/70 py-6 mt-4 border-t border-black/[.07]">
        <div className="container mx-auto text-center">
          <p className="text-[15px] font-medium text-[#77766f] tracking-wide">
            © {new Date().getFullYear()} <span className="font-bold text-[#252a2e]">LGM Sports</span>. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CRMHome;
