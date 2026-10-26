// import React, { useState } from "react";
// import {
//   Calendar as CalendarIcon,
//   LayoutGrid,
//   Columns3,
//   Rows3,
//   ChevronDown,
// } from "lucide-react";

// interface LiveGoogleCalendarProps {
//   calendarId: string; 
// }

// const LiveGoogleCalendar: React.FC<LiveGoogleCalendarProps> = ({

//     calendarId 
// }) => {
//   const [viewMode, setViewMode] = useState<"WEEK" | "MONTH" | "AGENDA">(
//     "MONTH",
//   );
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);

//   const calendarUrl = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(
//      calendarId || ""
//   )}&ctz=Asia%2FKolkata&mode=${viewMode}&showPrint=0&showTabs=0&showCalendars=0&showTls=1`;

//   const getViewDetails = (mode: string) => {
//     switch (mode) {
//       case "AGENDA":
//         return { label: "Schedule", icon: <Rows3 size={16} /> };
//       case "MONTH":
//         return { label: "Month", icon: <LayoutGrid size={16} /> };
//       default:
//         return { label: "Week", icon: <Columns3 size={16} /> };
//     }
//   };

//   return (
//     <div className="bg-[#f8fafd] rounded-xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden relative">
//       {/* Calendar Header */}
//       <div className="p-4 flex justify-between items-center bg-white border-b border-gray-100">
//         <div className="flex items-center gap-2">
//           <div className="bg-red-500 p-1.5 rounded-md text-white">
//             <CalendarIcon size={18} />
//           </div>
//           <h3 className="font-bold text-[16px] text-[#133561]">
//             Gaxce Calendar
//           </h3>
//         </div>

//         <div className="flex items-center gap-3 relative">
//           {/* View Switcher Dropdown Toggle */}
//           <div className="relative">
//             <button
//               onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//               className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-[#133561] hover:bg-gray-100 transition-colors"
//             >
//               {getViewDetails(viewMode).icon}
//               <span className="text-sm font-semibold">
//                 {getViewDetails(viewMode).label}
//               </span>
//               <ChevronDown
//                 size={14}
//                 className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
//               />
//             </button>

//             {/* Dropdown Menu */}
//             {isDropdownOpen && (
//               <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-xl rounded-lg z-50 py-1 overflow-hidden">
//                 <button
//                   onClick={() => {
//                     setViewMode("AGENDA");
//                     setIsDropdownOpen(false);
//                   }}
//                   className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
//                 >
//                   <Rows3 size={16} /> Schedule
//                 </button>
//                 <button
//                   onClick={() => {
//                     setViewMode("WEEK");
//                     setIsDropdownOpen(false);
//                   }}
//                   className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
//                 >
//                   <Columns3 size={16} /> Week
//                 </button>
//                 <button
//                   onClick={() => {
//                     setViewMode("MONTH");
//                     setIsDropdownOpen(false);
//                   }}
//                   className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
//                 >
//                   <LayoutGrid size={16} /> Month
//                 </button>
//                 <div className="h-px bg-gray-100 my-1" />
//                 <div className="px-4 py-2 text-[11px] text-gray-400 uppercase font-bold tracking-wider">
//                   Settings
//                 </div>
//                 <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 italic">
//                   Send feedback
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* Today Icon */}
//           <div className="flex gap-1 text-blue-600 cursor-pointer hover:bg-blue-50 p-1 rounded transition-colors">
//             <div className="w-5 h-5 bg-blue-600 rounded-sm flex items-center justify-center text-white text-[10px] font-bold">
//               {new Date().getDate()}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* The Live IFrame */}
//       <div className="grow w-full min-h-[450px] relative bg-white">
//         <iframe
//          key={`${calendarId}-${viewMode}`} // Key ensures iframe reloads when view changes
//           src={calendarUrl}
//           style={{ border: 0 }}
//           width="100%"
//           height="100%"
//           frameBorder="0"
//           scrolling="no"
//           title="Google Calendar"
//           className="opacity-90 hover:opacity-100 transition-opacity"
//         ></iframe>
//       </div>
//     </div>
//   );
// };

// export default LiveGoogleCalendar;




import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  LayoutGrid,
  Columns3,
  Rows3,
  ChevronDown,
} from "lucide-react";

interface LiveGoogleCalendarProps {
  calendarId: string; 
}

const LiveGoogleCalendar: React.FC<LiveGoogleCalendarProps> = ({

    calendarId 
}) => {
  const [viewMode, setViewMode] = useState<"WEEK" | "MONTH" | "AGENDA">(
    "MONTH",
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const calendarUrl = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(
     calendarId || ""
  )}&ctz=Asia%2FKolkata&mode=${viewMode}&showPrint=0&showTabs=0&showCalendars=0&showTls=1`;

  const getViewDetails = (mode: string) => {
    switch (mode) {
      case "AGENDA":
        return { label: "Schedule", icon: <Rows3 size={16} /> };
      case "MONTH":
        return { label: "Month", icon: <LayoutGrid size={16} /> };
      default:
        return { label: "Week", icon: <Columns3 size={16} /> };
    }
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-black/[.07] bg-[#f7f6f2] shadow-sm">
      {/* Calendar Header */}
      <div className="flex items-center justify-between border-b border-black/[.06] bg-white p-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-[#f07837] p-1.5 text-white">
            <CalendarIcon size={18} />
          </div>
          <h3 className="text-[16px] font-bold text-[#252a2e]">
            LGM Sports Calendar
          </h3>
        </div>

        <div className="flex items-center gap-3 relative">
          {/* View Switcher Dropdown Toggle */}
          <div className="relative">
            <button
              type="button"
              aria-expanded={isDropdownOpen}
              aria-haspopup="menu"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 rounded-xl border border-black/10 bg-[#fbfaf8] px-3 py-2 text-[#343331] transition-colors hover:border-[#f07837]/50 hover:bg-[#fff7f1]"
            >
              {getViewDetails(viewMode).icon}
              <span className="text-sm font-semibold">
                {getViewDetails(viewMode).label}
              </span>
              <ChevronDown
                size={14}
                className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div role="menu" className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-black/10 bg-white py-1 shadow-xl">
                <button
                  onClick={() => {
                    setViewMode("AGENDA");
                    setIsDropdownOpen(false);
                  }}
                  role="menuitem"
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-[#fff0e7] hover:text-[#a64a1d]"
                >
                  <Rows3 size={16} /> Schedule
                </button>
                <button
                  onClick={() => {
                    setViewMode("WEEK");
                    setIsDropdownOpen(false);
                  }}
                  role="menuitem"
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-[#fff0e7] hover:text-[#a64a1d]"
                >
                  <Columns3 size={16} /> Week
                </button>
                <button
                  onClick={() => {
                    setViewMode("MONTH");
                    setIsDropdownOpen(false);
                  }}
                  role="menuitem"
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-[#fff0e7] hover:text-[#a64a1d]"
                >
                  <LayoutGrid size={16} /> Month
                </button>
                <div className="my-1 h-px bg-gray-100" />
                <div className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Settings
                </div>
                <button type="button" className="flex w-full items-center gap-3 px-4 py-2 text-sm italic text-gray-700 hover:bg-gray-50">
                  Send feedback
                </button>
              </div>
            )}
          </div>

          {/* Today Icon */}
          <div aria-label="Today" className="flex cursor-pointer gap-1 rounded p-1 text-[#f07837] transition-colors hover:bg-[#fff0e7]">
            <div className="flex h-5 w-5 items-center justify-center rounded-sm bg-[#f07837] text-[10px] font-bold text-white">
              {new Date().getDate()}
            </div>
          </div>
        </div>
      </div>

      {/* The Live IFrame */}
      <div className="relative min-h-[450px] w-full grow bg-white">
        <iframe
         key={`${calendarId}-${viewMode}`} // Key ensures iframe reloads when view changes
          src={calendarUrl}
          style={{ border: 0 }}
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          title="Google Calendar"
          className="opacity-90 hover:opacity-100 transition-opacity"
        ></iframe>
      </div>
    </div>
  );
};

export default LiveGoogleCalendar;
