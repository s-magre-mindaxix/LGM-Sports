// import React, { useState, useEffect, useRef } from "react";
// import {
//   Bell,
//   Database,
//   Folder,
//   Key,
//   LogOut,
//   Menu,
//   RefreshCw,
//   User,
// } from "lucide-react";
// import ChangePasswordModal from "./ChangePasswordModal";
// import { useAuth } from "../hooks/useAuth";
// import { useDispatch, useSelector } from "react-redux";
// import type { AppDispatch, RootState } from "../store";
// import { toast } from "sonner";

// import {
//   type Notification,
//   markAllAsRead,
//   markOneNotificationRead,
//   fetchNotifications,
// } from "../features/Notifications/notificationSlice";
// import { markAllNotificationsAsRead } from "../Modules/HRMS/Services/notificationService";
// import { useNavigate } from "react-router-dom";
// import {
//   startSignalRConnection,
//   stopSignalRConnection,
// } from "../Modules/HRMS/Services/signalRService";

// interface NavbarProps {
//   toggleSidebar: () => void;
// }

// const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);
//   const [isNotificationOpen, setIsNotificationOpen] = useState(false);
//   const notificationRef = useRef<HTMLDivElement>(null);
//   const { user, logout } = useAuth();

//   const navigate = useNavigate();

//   const dispatch: AppDispatch = useDispatch();

//   useEffect(() => {
//     if (user?.employeeId) {
//       // Fetch old notifications from DB
//       dispatch(fetchNotifications());

//       // Start realtime SignalR
//       startSignalRConnection(dispatch);
//     }

//     return () => {
//       stopSignalRConnection();
//     };
//   }, [dispatch, user?.employeeId]);

//   const { notifications, unreadCount } = useSelector(
//     (state: RootState) => state.notifications,
//   );

//   useEffect(() => {
//     if (user?.employeeId) {
//       dispatch(fetchNotifications());
//     }
//   }, [dispatch, user?.employeeId]);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(event.target as Node)
//       ) {
//         setIsDropdownOpen(false);
//       }
//       if (
//         notificationRef.current &&
//         !notificationRef.current.contains(event.target as Node)
//       ) {
//         setIsNotificationOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   useEffect(() => {
//     if (!isNotificationOpen) return;
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         notificationRef.current &&
//         !notificationRef.current.contains(event.target as Node)
//       ) {
//         setIsNotificationOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [isNotificationOpen]);

//   const handleMarkAllRead = async () => {
//     if (unreadCount === 0) return;
//     try {
//       await markAllNotificationsAsRead();
//       dispatch(markAllAsRead());
//       toast.success("All notifications marked as read.");
//     } catch {
//       toast.error("Failed to mark notifications as read.");
//     }
//   };

//   const openChangePasswordModal = () => {
//     setIsModalOpen(true);
//     setIsDropdownOpen(false);
//   };

//   const handleLogout = () => {
//     setIsDropdownOpen(false);
//     logout();
//   };

//   // const getInitials = () => {
//   //   if (user?.firstName && user?.lastName) {
//   //     return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
//   //   }
//   //   return <User className="h-5 w-5 text-blue-700" />;
//   // };

//   const handleNotificationClick = (notification: Notification) => {
//     console.log("Clicked on notification:", notification);

//     if (!notification.isRead) {
//       console.log(
//         "Dispatching action to mark as read for ID:",
//         notification.id,
//       );
//       dispatch(markOneNotificationRead(notification.id));
//     } else {
//       console.log("Notification is already read. No action dispatched.");
//     }
//   };

//   const formatTimeAgo = (dateString: string): string => {
//     const date = new Date(
//       dateString.endsWith("Z") ? dateString : dateString + "Z",
//     );
//     const now = new Date();
//     const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

//     let interval = seconds / 31536000;
//     if (interval > 1) {
//       return date.toLocaleDateString();
//     }
//     interval = seconds / 2592000;
//     if (interval > 1) {
//       return `${Math.floor(interval)} months ago`;
//     }
//     interval = seconds / 86400;
//     if (interval > 1) {
//       return `${Math.floor(interval)} days ago`;
//     }
//     interval = seconds / 3600;
//     if (interval > 1) {
//       return `${Math.floor(interval)} hours ago`;
//     }
//     interval = seconds / 60;
//     if (interval > 1) {
//       return `${Math.floor(interval)} minutes ago`;
//     }
//     if (seconds < 60) {
//       return "Just now";
//     }
//     return "Just now";
//   };

//   const handlePersonalDriveClick = () => {
//     setIsDropdownOpen(false);
//     navigate("/crm/drive");
//   };

//   const handleCommonDriveClick = () => {
//     setIsDropdownOpen(false);
//     navigate("/crm/common-drive");
//   };

//   const handleRefresh = () => {
//      console.log("Refresh clicked");
//     window.dispatchEvent(new CustomEvent("app-refresh"));
//   };

//   return (
//     <>
//       <header className="bg-white border-b border-[#2eacb3] shadow-sm px-5 py-1 flex justify-between items-center sticky top-0 z-50 h-15">
//         {/* Left Section */}
//         <div className="flex items-center space-x-3">
//           <button
//             onClick={toggleSidebar}
//             className="p-1 rounded-md hover:bg-gray-100 focus:outline-none"
//           >
//             <Menu className="h-6 w-6 text-gray-700" />
//           </button>
//         </div>

//         {/* Right Section */}
//         <div className="flex items-center space-x-6">
//           <button
//             onClick={handleRefresh}
//             className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
//           >
//             <RefreshCw size={20} />
//           </button>
//           <div className="relative" ref={notificationRef}>
//             <button
//               onClick={() => setIsNotificationOpen(!isNotificationOpen)}
//               className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
//             >
//               <Bell size={22} fill="currentColor" /> {/* Solid color look */}
//               {/* {unreadCount > 0 && (
//                 <span className="absolute top-1 right-1 h-2 w-2 bg-red-600 rounded-full border-2 border-white"></span>
//               )} */}
//               {unreadCount > 0 && (
//                 <span
//                   className="
//       absolute 
//       -top-1 
//       -right-1
//       min-w-[18px]
//       h-[18px]
//       px-1
//       flex
//       items-center
//       justify-center
//       text-[10px]
//       font-bold
//       text-white
//       bg-red-600
//       rounded-full
//       border-2
//       border-white
//     "
//                 >
//                   {unreadCount > 99 ? "99+" : unreadCount}
//                 </span>
//               )}
//             </button>
//             {isNotificationOpen && (
//               <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-md shadow-lg z-10">
//                 <div className="p-3 flex justify-between items-center border-b">
//                   <h3 className="font-semibold text-gray-800">Notifications</h3>
//                   {unreadCount > 0 && (
//                     <button
//                       onClick={handleMarkAllRead}
//                       className="text-sm text-blue-600 hover:underline"
//                     >
//                       Mark all as read
//                     </button>
//                   )}
//                 </div>
//                 <ul className="py-1 text-sm text-gray-700 max-h-80 overflow-y-auto">
//                   {notifications.length > 0 ? (
//                     notifications.map((notif) => (
//                       <li
//                         key={notif.id}
//                         onClick={() => handleNotificationClick(notif)}
//                         className="border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
//                       >
//                         <div className="px-4 py-3 flex items-start space-x-3">
//                           <div className="shrink-0 pt-1">
//                             {!notif.isRead && (
//                               <span className="block w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
//                             )}
//                           </div>

//                           <div className="flex-1">
//                             <p
//                               className={`text-gray-800 ${!notif.isRead ? "font-semibold" : "font-normal"}`}
//                             >
//                               {notif.message}
//                             </p>
//                             <span className="text-xs text-gray-400 mt-1 block">
//                               {formatTimeAgo(notif.createdAt)}
//                             </span>
//                           </div>
//                         </div>
//                       </li>
//                     ))
//                   ) : (
//                     <li className="px-4 py-5 text-center text-gray-500">
//                       No new notifications
//                     </li>
//                   )}
//                 </ul>
//               </div>
//             )}
//           </div>

//           <button
//             onClick={handleCommonDriveClick}
//             className="flex items-center gap-2 px-4 mr-2 py-1.5 border border-blue-500 rounded-full text-blue-900 font-semibold text-sm hover:bg-blue-50 transition-all shadow-sm"
//           >
//             <Database size={16} className="text-blue-700" />
//             Drive
//           </button>

//           {/* User Dropdown */}
//           <div className="relative" ref={dropdownRef}>
//             <button
//               onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//               className="flex items-center gap-2 px-4 py-1.5 border border-blue-500 rounded-full text-blue-900 font-bold text-sm hover:bg-blue-50 transition-all shadow-sm"
//             >
//               <User size={16} className="text-blue-700" />
//               {user?.role || "SuperAdmin"}
//             </button>

//             {/* Redesigned Dropdown Menu */}
//             {isDropdownOpen && (
//               <div className="absolute right-0 mt-2 w-56 bg-white border border-blue-600 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in duration-150">
//                 <div className="py-2">
//                   <div className="px-4 py-2 flex items-center gap-3 text-[#111c44] hover:bg-blue-50 cursor-pointer transition-colors">
//                     <User size={18} className="text-blue-600" />
//                     <span className="text-sm font-medium">
//                       {user
//                         ? `${user.firstName} ${user.lastName}`
//                         : "User Profile"}
//                     </span>
//                   </div>

//                   <div
//                     onClick={openChangePasswordModal}
//                     className="px-4 py-2 flex items-center gap-3 text-[#111c44] hover:bg-blue-50 cursor-pointer transition-colors"
//                   >
//                     <Key size={18} className="text-blue-600" />
//                     <span className="text-sm font-medium">Change Password</span>
//                   </div>

//                   <div
//                     onClick={handlePersonalDriveClick}
//                     className="px-4 py-2 flex items-center gap-3 text-[#111c44] hover:bg-blue-50 cursor-pointer transition-colors"
//                   >
//                     <Folder size={18} className="text-yellow-500" />
//                     <span className="text-sm font-medium">My Drive</span>
//                   </div>

//                   <hr className="my-1 border-gray-100" />

//                   <div
//                     onClick={handleLogout}
//                     className="px-4 py-2 flex items-center gap-3 text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
//                   >
//                     <LogOut size={18} />
//                     <span className="text-sm font-medium">Logout</span>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </header>
//       <ChangePasswordModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//       />
//     </>
//   );
// };

// export default Navbar;




import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  Database,
  Folder,
  Key,
  LogOut,
  Menu,
  RefreshCw,
  User,
} from "lucide-react";
import ChangePasswordModal from "./ChangePasswordModal";
import { useAuth } from "../hooks/useAuth";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { toast } from "sonner";

import {
  type Notification,
  markAllAsRead,
  markOneNotificationRead,
  fetchNotifications,
} from "../features/Notifications/notificationSlice";
import { markAllNotificationsAsRead } from "../Modules/HRMS/Services/notificationService";
import { useNavigate } from "react-router-dom";
import {
  startSignalRConnection,
  stopSignalRConnection,
} from "../Modules/HRMS/Services/signalRService";

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    if (user?.employeeId) {
      // Fetch old notifications from DB
      dispatch(fetchNotifications());

      // Start realtime SignalR
      startSignalRConnection(dispatch);
    }

    return () => {
      stopSignalRConnection();
    };
  }, [dispatch, user?.employeeId]);

  const { notifications, unreadCount } = useSelector(
    (state: RootState) => state.notifications,
  );

  useEffect(() => {
    if (user?.employeeId) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, user?.employeeId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isNotificationOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotificationOpen]);

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    try {
      await markAllNotificationsAsRead();
      dispatch(markAllAsRead());
      toast.success("All notifications marked as read.");
    } catch {
      toast.error("Failed to mark notifications as read.");
    }
  };

  const openChangePasswordModal = () => {
    setIsModalOpen(true);
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
  };

  // const getInitials = () => {
  //   if (user?.firstName && user?.lastName) {
  //     return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  //   }
  //   return <User className="h-5 w-5 text-blue-700" />;
  // };

  const handleNotificationClick = (notification: Notification) => {
    console.log("Clicked on notification:", notification);

    if (!notification.isRead) {
      console.log(
        "Dispatching action to mark as read for ID:",
        notification.id,
      );
      dispatch(markOneNotificationRead(notification.id));
    } else {
      console.log("Notification is already read. No action dispatched.");
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(
      dateString.endsWith("Z") ? dateString : dateString + "Z",
    );
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) {
      return date.toLocaleDateString();
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return `${Math.floor(interval)} months ago`;
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return `${Math.floor(interval)} days ago`;
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return `${Math.floor(interval)} hours ago`;
    }
    interval = seconds / 60;
    if (interval > 1) {
      return `${Math.floor(interval)} minutes ago`;
    }
    if (seconds < 60) {
      return "Just now";
    }
    return "Just now";
  };

  const handlePersonalDriveClick = () => {
    setIsDropdownOpen(false);
    navigate("/crm/drive");
  };

  const handleCommonDriveClick = () => {
    setIsDropdownOpen(false);
    navigate("/crm/common-drive");
  };

  const handleRefresh = () => {
     console.log("Refresh clicked");
    window.dispatchEvent(new CustomEvent("app-refresh"));
  };

  return (
    <>
      <header className="sticky top-0 z-50 flex h-[60px] items-center justify-between border-b border-[#f07837]/20 bg-white px-4 py-1 shadow-sm sm:px-5">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Toggle sidebar"
            onClick={toggleSidebar}
            className="rounded-xl p-2 text-[#343331] transition hover:bg-[#fff0e7] hover:text-[#a64a1d] focus:outline-none focus:ring-2 focus:ring-[#f07837]/30"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden sm:block">
            <p className="text-xs font-extrabold uppercase tracking-[.15em] text-[#252a2e]">LGM Sports</p>
            <p className="text-[10px] font-medium text-[#8a8984]">Sports Operations</p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            aria-label="Refresh dashboard"
            onClick={handleRefresh}
            className="rounded-xl p-2 text-[#77766f] transition-colors hover:bg-[#fff0e7] hover:text-[#a64a1d]"
          >
            <RefreshCw size={20} />
          </button>
          <div className="relative" ref={notificationRef}>
            <button
              type="button"
              aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
              aria-expanded={isNotificationOpen}
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative rounded-xl p-2 text-[#f07837] transition-colors hover:bg-[#fff0e7]"
            >
              <Bell size={22} fill="currentColor" /> {/* Solid color look */}
              {/* {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-600 rounded-full border-2 border-white"></span>
              )} */}
              {unreadCount > 0 && (
                <span
                  className="
      absolute 
      -top-1 
      -right-1
      min-w-[18px]
      h-[18px]
      px-1
      flex
      items-center
      justify-center
      text-[10px]
      font-bold
      text-white
      bg-[#f07837]
      rounded-full
      border-2
      border-white
    "
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
            {isNotificationOpen && (
              <div className="absolute right-0 z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xl">
                <div className="p-3 flex justify-between items-center border-b">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-sm font-semibold text-[#c65b27] hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <ul className="py-1 text-sm text-gray-700 max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <li
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className="cursor-pointer border-b border-black/[.05] last:border-b-0 hover:bg-[#fff7f1]"
                      >
                        <div className="px-4 py-3 flex items-start space-x-3">
                          <div className="shrink-0 pt-1">
                            {!notif.isRead && (
                              <span className="block h-2.5 w-2.5 rounded-full bg-[#f07837]"></span>
                            )}
                          </div>

                          <div className="flex-1">
                            <p
                              className={`text-gray-800 ${!notif.isRead ? "font-semibold" : "font-normal"}`}
                            >
                              {notif.message}
                            </p>
                            <span className="text-xs text-gray-400 mt-1 block">
                              {formatTimeAgo(notif.createdAt)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-5 text-center text-gray-500">
                      No new notifications
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          <button
            onClick={handleCommonDriveClick}
            className="flex items-center gap-2 rounded-full border border-[#f07837]/35 px-3 py-2 text-sm font-semibold text-[#343331] shadow-sm transition-all hover:bg-[#fff0e7] sm:mr-1 sm:px-4"
          >
            <Database size={16} className="text-[#f07837]" />
            <span className="hidden sm:inline">Drive</span>
          </button>

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              aria-expanded={isDropdownOpen}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 rounded-full border border-[#f07837]/35 px-3 py-2 text-sm font-bold text-[#343331] shadow-sm transition-all hover:bg-[#fff0e7] sm:px-4"
            >
              <User size={16} className="text-blue-700" />
              {user?.role || "SuperAdmin"}
            </button>

            {/* Redesigned Dropdown Menu */}
            {isDropdownOpen && (
              <div className="animate-in fade-in zoom-in absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-[#f07837]/20 bg-white shadow-xl duration-150">
                <div className="py-2">
                  <div className="flex cursor-pointer items-center gap-3 px-4 py-2 text-[#343331] transition-colors hover:bg-[#fff7f1]">
                    <User size={18} className="text-[#f07837]" />
                    <span className="text-sm font-medium">
                      {user
                        ? `${user.firstName} ${user.lastName}`
                        : "User Profile"}
                    </span>
                  </div>

                  <div
                    onClick={openChangePasswordModal}
                    className="flex cursor-pointer items-center gap-3 px-4 py-2 text-[#343331] transition-colors hover:bg-[#fff7f1]"
                  >
                    <Key size={18} className="text-[#f07837]" />
                    <span className="text-sm font-medium">Change Password</span>
                  </div>

                  <div
                    onClick={handlePersonalDriveClick}
                    className="flex cursor-pointer items-center gap-3 px-4 py-2 text-[#343331] transition-colors hover:bg-[#fff7f1]"
                  >
                    <Folder size={18} className="text-[#f07837]" />
                    <span className="text-sm font-medium">My Drive</span>
                  </div>

                  <hr className="my-1 border-black/[.06]" />

                  <div
                    onClick={handleLogout}
                    className="px-4 py-2 flex items-center gap-3 text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                  >
                    <LogOut size={18} />
                    <span className="text-sm font-medium">Logout</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      <ChangePasswordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
