



import React, { useState } from "react";
import {
  Home,
  Users,
  Clock,
  CalendarCheck,
  DollarSign,
  CreditCard,
  FileText,
  Settings,
  Database,
  ChevronDown,
  UserCog,
  CalendarDays,
  Wallet,
  ShieldCheck,
  ReceiptText,
  Landmark,
  Gavel,
  Route,
  CalendarCog,
  LocationEditIcon,
  Receipt,
  FileBox,
  BarChart3,
  Layers,
  Network,
  CircleDollarSign,
  ToolCase,
  FileSignature,
  Box,
  Package,
  UserCircle,
  Truck,
  Building,
  SettingsIcon,
  LayoutDashboard,
  Boxes,
  Award,
  ClipboardList,
  Plane,
  BriefcaseBusiness,
  Building2,Warehouse,MapPin,Tag,Ruler,Percent,Files,Barcode,Link2,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import MainLogo from "../assets/LGMLogo.png";
import { usePermissions } from "../hooks/usePermissions";
import { FaBoxes, FaChartBar, FaClipboardList, FaFileInvoice, FaFileInvoiceDollar, FaHandshake, FaMoneyCheckAlt, FaShippingFast, FaTruck, FaTruckMoving } from "react-icons/fa";
interface SidebarProps {
  isOpen: boolean;
}

interface MenuItem {
  label: string;
  to?: string;
  icon: React.ReactElement;
  formName?: string;
  color?: string;
  isHeader?: boolean;
  subMenu?: MenuItem[];
}

interface SidebarItemProps {
  item: MenuItem;
  isOpen: boolean;
  level?: number;
  isExpanded?: boolean;
  onToggle?: () => void;
}

const mainMenuLinks = [
  { icon: <Home />, label: "Dashboard", to: "/", formName: "Dashboard" },

  {
    icon: <Building />,
    label: "Hierarchy",
    to: "/level-master",
    formName: "LevelMaster",
    color: "text-purple-500",
  },

  {
    icon: <Users />,
    label: "EMPLOYEE",
    to: "/master/employee",
    formName: "Employee",
  },

  {
    icon: <Clock />,
    label: "Attendance",
    to: "/attendance",
    formName: "Attendance",
  },
  {
    icon: <CalendarCheck />,
    label: "Leave Management",
    to: "/leave",
    formName: "LeaveManagement",
  },
  {
    icon: <Route />,
    label: "Out Door Duty",
    to: "/outdoor",
    formName: "OutDoorDuty",
  },
];

const masterMenu: MenuItem = {
  icon: <Database />,
  label: "Master",
  subMenu: [
    {
      icon: <ShieldCheck />,
      label: "Access Control",
      to: "/access-control",
      formName: "AccessControl",
    },
    {
      icon: <UserCog />,
      label: "Basic Masters",
      to: "/basimasters",
      formName: "BasicMasters",
    },
    {
      icon: <UserCog />,
      label: "Country Master",
      to: "/country-master",
      formName: "CountryMaster",
    },
    {
      icon: <UserCog />,
      label: "State Master",
      to: "/state-master",
      formName: "StateMaster",
    },
    {
      icon: <Layers />,
      label: "CATEGORY",
      to: "/category",
      formName: "Category",
    },
    {
      icon: <Network />,
      label: "PRODUCT GROUP",
      to: "/product-group",
      formName: "ProductGroup",
    },
    {
      icon: <Package />,
      label: "PRODUCT TYPE",
      to: "/product-type",
      formName: "ProductType",
    },
    {
      icon: <Layers />,
      label: "PRODUCT VARIANT",
      to: "/product-variant",
      formName: "ProductVariant",
    },
    {
      icon: <ShieldCheck />,
      label: "PRODUCT VERSION",
      to: "/product-version",
      formName: "ProductVersion",
    },
    {
      icon: <Settings />,
      label: "PART CONDITION",
      to: "/part-condition",
      formName: "PartCondition",
    },

    {
      icon: <CalendarDays />,
      label: "Leave Masters",
      to: "/leavemasters",
      formName: "LeaveMasters",
    },
    {
      icon: <CalendarCog />,
      label: "Leave Admin",
      to: "/leave-admin",
      formName: "LeaveAdmin",
    },
    {
      icon: <Wallet />,
      label: "Expense Type",
      to: "/expenseyype",
      formName: "ExpenseType",
    },
    {
      icon: <Landmark />,
      label: "Loan Type",
      to: "/loanmasters",
      formName: "LoanTypeMaster",
    },
    {
      icon: <Wallet />,
      label: "Salary Component",
      to: "/salarycomponent",
      formName: "SalaryComponent",
    },
    {
      icon: <Landmark />,
      label: "Statutory Settings",
      to: "/statutory-settings",
      formName: "StatutorySetting",
    },
    {
      icon: <Gavel />,
      label: "Professional Tax Slabs",
      to: "/professional-tax-slabs",
      formName: "ProfessionalTaxSlab",
    },
    {
      icon: <CalendarDays />,
      label: "Holiday",
      to: "/holiday",
      formName: "Holiday",
    },
    {
      icon: <FileText />,
      label: "CompanyProfile",
      to: "/companyprofile",
      formName: "CompanyProfile",
    },
    {
      icon: <FileText />,
      label: "SalarySetting",
      to: "/salarysetting",
      formName: "SalarySetting",
    },
    {
      icon: <Landmark />,
      label: "Income Tax Slabs",
      to: "/tax-slabs",
      formName: "IncomeTaxSlab",
    },
  ],
};

const payrollLinks = [
  {
    icon: <DollarSign />,
    label: "Salary Structure",
    to: "/salary-structure",
    formName: "SalaryStructure",
  },
  {
    icon: <CreditCard />,
    label: "Payroll Processing",
    to: "/payroll",
    formName: "PayrollProcess",
  },
  {
    icon: <Wallet />,
    label: "Leave Encashment",
    to: "/leave-encashment",
    formName: "LeaveEncashment",
  },
  {
    icon: <Award />,
    label: "Gratuity",
    to: "/gratuity",
    formName: "Gratuity",
    color: "text-orange-500",
  },
  {
    icon: <ShieldCheck />,
    label: "Investment Declaration",
    to: "/investment-declaration",
    formName: "InvestmentDeclaration",
  },
  {
    icon: <FileText />,
    label: "Tax & Compliance",
    to: "/tax-compliance",
    formName: "TaxCompliance",
  },
  {
    icon: <FileText />,
    label: "Payslips",
    to: "/payslips",
    formName: "Payslip",
  },
  {
    icon: <FileText />,
    label: "bonus",
    to: "/bonuses",
    formName: "Bonuse",
  },
  {
    icon: <FileText />,
    label: "Advance Management",
    to: "/advance-managements",
    formName: "Advance management",
  },
  {
    icon: <ClipboardList />,
    label: "Expense Claims",
    to: "/expenses",
    formName: "ExpenseClaims",
    color: "text-cyan-500",
  },
  {
    icon: <ReceiptText />,
    label: "Form 16",
    to: "/form-16",
    formName: "Form16",
  },
  {
    icon: <Users />,
    label: "Exit Management",
    to: "/fnf",
    formName: "FnFManager",
    color: "text-red-500",
  },
  {
    icon: <LocationEditIcon />,
    label: "Locations",
    to: "/locations",
    formName: "MultiLocation",
  },
  {
    icon: <LocationEditIcon />,
    label: "Reports",
    to: "/Reports",
    formName: "Report",
  },
];

const crmMenuConfig: MenuItem[] = [
  {
    icon: <LayoutDashboard />,
    label: "DASHBOARD",
    to: "/crm",
    formName: "Dashboard",
    isHeader: true,
  },
  {
    label: "MASTERS",
    icon: <Database />,
    subMenu: [
      {
        icon: <Building />,
        label: "COMPANY",
        to: "/crm/master/company",
        formName: "Company",
      },

       {
  icon: <Building />,
  label: "BRANCH",
  to: "/crm/master/branch",
  formName: "Branch",
},
{
  icon: <Warehouse />,
  label: "WAREHOUSE",
  to: "/crm/master/warehouse",
  formName: "Warehouse",
},
{
  icon: <MapPin />,
  label: "LOCATION",
  to: "/crm/master/location",
  formName: "Location",
},
{
  icon: <Layers />,
  label: "CATEGORY",
  to: "/crm/master/category",
  formName: "Category",
},

{
  icon: <Tag />,
  label: "BRAND",
  to: "/crm/master/brand",
  formName: "Brand",
},


{
  icon: <Ruler />,
  label: "UNIT",
  to: "/crm/master/unit",
  formName: "Unit",
},

{
  icon: <Percent />,
  label: "TAX",
  to: "/crm/master/tax",
  formName: "Tax",
},

{
  icon: <Truck />,
  label: "SUPPLIER",
  to: "/crm/master/supplier",
  formName: "Supplier",
},
      {
        icon: <Truck />,
        label: "VENDOR",
        to: "/crm/master/vendor",
        formName: "Vendor",
      },
      {
        icon: <UserCircle />,
        label: "CUSTOMER",
        to: "/crm/master/customer",
        formName: "Customer",
      },

      {
        icon: <Package />,
        label: "PRODUCT",
        to: "/crm/master/product",
        formName: "Product",
      },
         {
      icon: <Layers />,
      label: "PRODUCT VARIANT",
       to: "/crm/master/productvariant",
      formName: "ProductVariant",
    },

      {
  icon: <Barcode />,
  label: "PRODUCT BARCODE",
  to: "/crm/master/product-barcode",
  formName: "ProductBarcode",
},

{
  icon: <Link2 />,
  label: "PRODUCT ACCESSORY RULE",
  to: "/crm/master/product-accessory-rule",
  formName: "ProductAccessoryRule",
},
      {
        icon: <Package />,
        label: "Service Master",
        to: "/crm/masters/service-master",
        formName: "ServiceMaster",
      },

      {
        icon: <Box />,
        label: "ACCESSORIES",
        to: "/crm/master/accessories",
        formName: "Accessories",
      },
    ],
  },

  {
    label: "INVENTORY",
    icon: <Boxes />,
    subMenu: [
      {
        icon: <ShieldCheck />,
        label: "QA MASTER",
        to: "/crm/master/qa",
        formName: "QAMaster",
      },
      {
        icon: <FaBoxes />,
        label: "INVENTORY",
        to: "/crm/master/inventory",
        formName: "Inventory",
      },
      {
        icon: <FileText />,
        label: "PRICE LISTS",
        to: "/crm/master/price-lists",
        formName: "PriceList",
      },
      {
        icon: <FileText />,
        label: "PRODUCT PRICES",
        to: "/crm/master/product-prices",
        formName: "ProductPrice",
      },
      {
        icon: <CircleDollarSign />,
        label: "ACCESSORY PRICES",
        to: "/crm/master/accessory-prices",
        formName: "AccessoryPrice",
      },
      {
        icon: <Box />,
        label: "BUNDLES",
        to: "/crm/master/bundles",
        formName: "Bundle",
      },
      {
        icon: <Box />,
        label: "BUNDLE ITEMS",
        to: "/crm/master/bundle-items",
        formName: "BundleItem",
      },
      {
        icon: <Box />,
        label: "PAYMENT METHODS",
        to: "/crm/master/payment-methods",
        formName: "PaymentMethod",
      },

      {
        icon: <FileText />,
        label: "REASONS",
        to: "/crm/master/reasons",
        formName: "Reason",
      },
      {
        icon: <Files />,
        label: "DOCUMENT SERIES",
        to: "/crm/master/document-series",
        formName: "DocumentSeries",
      },
    ],
  },
  {
    label: "SALES",
    icon: <FileSignature />,
    subMenu: [
      {
        icon: <FileText />,
        label: "ENQUIRY",
        to: "/crm/sales/enquiry",
        formName: "Enquiry",
      },
      {
        icon: <FileText />,
        label: "OFFER CREATION",
        to: "/crm/sales/offer",
        formName: "Offers",
      },
      {
        icon: <FileText />,
        label: "ORDER ACCEPTANCE",
        to: "/crm/sales/order-acceptance",
        formName: "OrderAcceptance",
      },
      {
        icon: <FileText />,
        label: "PURCHASE ORDER",
        to: "/crm/sales/purchase-order",
        formName: "PurchaseOrder",
      },
    ],
  },
  {
    label: "ACCOUNTS",
    icon: <Receipt />,
    subMenu: [
      {
        label: "INVOICE",
        icon: <Box />,
        subMenu: [
          {
            icon: <FileText />,
            label: "PROFORMA INVOICE",
            to: "/crm/accounts/proforma",
            formName: "ProformaInvoice",
          },
          {
            icon: <FileText />,
            label: "INVOICE",
            to: "/crm/accounts/invoice",
            formName: "Invoice",
          },
           {
            icon: <FileText />,
            label: "CREDIT NOTE",
            to: "/crm/accounts/credit",
            formName: "CreditNote",
          },
           {
            icon: <FileText />,
            label: "DEBIT NOTE",
            to: "/crm/accounts/debit",
            formName: "DebitNote",
          },
        ],
      },
    ],
  },
  {
    label: "SUPPORTS",
    icon: <ToolCase />,
    subMenu: [
      {
        icon: <FileText />,
        label: "INSTALLATION REPORT",
        to: "/crm/support/installation",
        formName: "InstallationReport",
      },
      {
        icon: <FileText />,
        label: "SERVICE REPORT",
        to: "/crm/support/service",
        formName: "ServiceReport",
      },
      {
        icon: <FileText />,
        label: "FAULT REPORT",
        to: "/crm/support/fault",
        formName: "FaultReport",
      },
    ],
  },
  {
    label: "SETTINGS",
    icon: <SettingsIcon />,
    subMenu: [
      {
        icon: <CircleDollarSign />,
        label: "ADD CURRENCY",
        to: "/crm/settings/currency",
        formName: "Currency",
      },
      {
        icon: <FileText />,
        label: "ADD COMPANYGROUP",
        to: "/crm/settings/companyGroup",
        formName: "CompanyGroup",
      },
    ],
  },
  {
    label: "REPORTS",
    icon: <BarChart3 />,
    subMenu: [
      {
        icon: <FileBox />,
        label: "OFFER REPORTS",
        to: "/crm/reports/offer",
        formName: "OfferReport",
      },
      {
        icon: <FileBox />,
        label: "ORDER ACCEPTANCE REPORTS",
        to: "/crm/reports/order-acceptance-reports",
        formName: "OrderAcceptanceReport",
      },
      {
        icon: <FileText />,
        label: "PURCHASE REPORTS",
        to: "/crm/reports/purchase-order-reports",
        formName: "PurchaseOrderReport",
      },
      {
        icon: <FileText />,
        label: "PROFORMA REPORTS",
        to: "/crm/reports/proforma-invoice-reports",
        formName: "ProformaInvoiceReport",
      },
      {
        icon: <FileText />,
        label: "INVOICE REPORTS",
        to: "/crm/reports/invoice-reports",
        formName: "InvoiceReport",
      },
    ],
  },
];

const erpMenuConfig: MenuItem[] = [
  {
    icon: <LayoutDashboard />,
    label: "DASHBOARD",
    to: "/erp",
    formName: "Dashboard",
    isHeader: true,
  },
  {
    label: "MASTERS",
    icon: <Database />,
    subMenu: [
      {
        icon: <Plane size={18} />,
        label: "ShipmentMode",
        to: "/erp/master/shipmentMode",
        formName: "ShipmentMode",
      },
      // {
      //   icon: <Ship size={18} />,
      //   label: "ShipmentType",
      //   to: "/erp/master/shipmentType",
      //   formName: "ShipmentType",
      // },
      {
        icon: <BriefcaseBusiness size={18} />,
        label: "AgencyType",
        to: "/erp/master/agencyType",
        formName: "AgencyType",
      },
      {
        icon: <Building2 size={18} />,
        label: "Agency",
        to: "/erp/master/agency",
        formName: "Agency",
      },
    ],
  },
 {
    label: "SHIPMENT",
    icon: <FaTruck />,
    subMenu: [
    {
    icon: <FileText />,
    label: "SHIPMENT INITIATE",
    to: "/erp/shipmentinitiate",
    formName: "ShipmentInitiate",
     },
       {
            icon: <FaHandshake />, // New Icon
            label: "AGENCY ASSIGNMENT",
            to: "/erp/agencyassignment",
            formName: "ShipmentAgencyAssignment",
        },
         {
            icon: <FaTruckMoving />, // New Icon
            label: "Shipment UnderTransit",
            to: "/erp/shipmentundertransit",
            formName: "ShipmentUnderTransit",
        },
    ],
  },
  {
  label: "FINANCE",
  icon: <FaMoneyCheckAlt />,
  subMenu: [
    {
      icon: <FaFileInvoiceDollar />,
      label: "FORWARDER BILL",
      to: "/erp/forwarderbill",
      formName: "ForwarderBill",
    },
    {
      icon: <FaFileInvoice />,
      label: "CHA BILL",
      to: "/erp/chabill",
      formName: "CHABill",
    },
    {
      icon: <FaTruck />,
      label: "TRANSPORTER BILL",
      to: "/erp/transporterbill",
      formName: "TransporterBill",
    },
     {
      icon: <FaMoneyCheckAlt />,
      label: "SHIPMENT PAYMENT",
      to: "/erp/shipmentpayment",
      formName: "ShipmentPayment",
    },
  ],
},

{
  label: "DISPATCH",
  icon: <FaTruck />, // or <FaShippingFast />
  subMenu: [
    {
      icon: <FaShippingFast />,
      label: "DISPATCH",
      to: "/erp/dispatch",
      formName: "Dispatch",
    },
  ],
},

{
  label: "REPORTS",
  icon: <FaChartBar />,
  subMenu: [
   
    {
      icon: <FaClipboardList />,
      label: "SHIPMENT INITIATE",
      to: "/erp/shipmentinitiatereport",
      formName: "ShipmentInitiateReport",
    },
     {
      icon: <FaShippingFast />,
      label: "SHIPMENT UNDERTRANSIT",
      to: "/erp/reports/shipmentundertransit",
      formName: "ShipmentTransitStatusReport",
    },
     {
      icon: <FaFileInvoiceDollar />,
      label: "SHIPMENT LANDED COST",
      to: "/erp/shipmentlandedcost",
      formName: "ShipmentLandedCostReport",
    },
  ],
},
  // {
  //   icon: <Box />,
  //   label: "ORDER",
  //   to: "/erp/order",
  //   formName: "Order",
  // },
  // {
  //   icon: <Truck />,
  //   label: "DISPATCH",
  //   to: "/erp/dispatch",
  //   formName: "Dispatch",
  // },
  // {
  //   icon: <BarChart3 />,
  //   label: "REPORTS",
  //   to: "/erp/reports",
  //   formName: "Reports",
  // },
];

const SidebarSection = ({
  title,
  children,
  isOpen,
}: {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
}) => (
  <div className="mt-3">
    {isOpen && (
      <p className="text-xs font-semibold text-white/40 px-4 mb-2 uppercase tracking-[.18em]">
        {title}
      </p>
    )}
    <ul className="space-y-1">{children}</ul>
  </div>
);

const SidebarItem: React.FC<SidebarItemProps> = ({
  item,
  isOpen,
  level = 0,
  isExpanded,
  onToggle,
}) => {
  const location = useLocation();
  const [internalExpanded, setInternalExpanded] = useState(false);

  const isActive =
    item.to &&
    (location.pathname === item.to ||
      location.pathname.startsWith(item.to + "/"));
  const hasSub = !!item.subMenu && item.subMenu.length > 0;
  const isCurrentActive = isActive || item.isHeader;

  const showChildren = level === 0 ? isExpanded : internalExpanded;
  const toggleHandler =
    level === 0 ? onToggle : () => setInternalExpanded(!internalExpanded);

  const verticalPadding = level === 0 ? "py-1.5" : "py-0.5";

  return (
    <div className="w-full">
      {item.to ? (
        <NavLink
          to={item.to}
          className={`flex items-center gap-3 px-4 ${verticalPadding}  mx-2 rounded-lg transition-all duration-200 group ${
            isCurrentActive
              ? "bg-[#f07837] text-white font-semibold shadow-sm shadow-black/15"
              : "text-white/75 hover:bg-white/10 hover:text-white"
          } ${item.isHeader ? "mb-4 mt-2" : ""}`}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
        >
          <span
            className={`flex items-center justify-center shrink-0 w-8 h-8 transition-all ${
              isCurrentActive
                ? "text-white"
                : "text-white/65 group-hover:text-[#ffb27f] group-hover:scale-110"
            }`}
          >
            {React.cloneElement(
              item.icon as React.ReactElement<{ size: number }>,
              { size: 20 },
            )}
          </span>
          {isOpen && (
            <span className="text-[13px] font-normal tracking-wide uppercase leading-none">
              {item.label}
            </span>
          )}
        </NavLink>
      ) : (
        <button
          onClick={toggleHandler}
          className={`w-full flex items-center justify-between gap-3 px-4 ${verticalPadding} pr-6 transition-all duration-200 group text-white/75 hover:bg-white/10 hover:text-white`}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center shrink-0 w-8 h-8 text-white/65 group-hover:text-[#ffb27f] group-hover:scale-110 transition-all">
              {React.cloneElement(
                item.icon as React.ReactElement<{ size: number }>,
                { size: 20 },
              )}
            </span>
            {isOpen && (
              <span className="text-[13px] font-normal tracking-wide uppercase leading-none">
                {item.label}
              </span>
            )}
          </div>
          {isOpen && hasSub && (
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${showChildren ? "rotate-180" : ""} group-hover:text-[#ffb27f]`}
            />
          )}
        </button>
      )}

      {showChildren && isOpen && hasSub && (
        <div className="flex flex-col gap-0 mt-0">
          {item.subMenu?.map((sub) => (
            <SidebarItem
              key={sub.label}
              item={sub}
              isOpen={isOpen}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar = ({ isOpen }: SidebarProps) => {
  const location = useLocation();
  const { hasPermission } = usePermissions();

  const [openMenuLabel, setOpenMenuLabel] = useState<string | null>(null);
  const handleToggle = (label: string) => {
    setOpenMenuLabel((prev) => (prev === label ? null : label));
  };

  const getVisibleMenu = (menuItems: MenuItem[]): MenuItem[] => {
    return menuItems
      .map((item) => {
        if (item.subMenu && item.subMenu.length > 0) {
          const filteredSubMenu = getVisibleMenu(item.subMenu);

          if (filteredSubMenu.length > 0) {
            return { ...item, subMenu: filteredSubMenu };
          }
          return null;
        }

        if (item.formName) {
          return hasPermission(item.formName, "CanView") ? item : null;
        }

        return item;
      })
      .filter((item): item is MenuItem => item !== null);
  };

  const isHRMS = location.pathname.startsWith("/hrms");
  const isCRM = location.pathname.startsWith("/crm");
  const isERP = location.pathname.startsWith("/erp");

  const visibleMainMenu = mainMenuLinks.filter(
    (l) => !l.formName || hasPermission(l.formName, "CanView"),
  );
  const visiblePayroll = payrollLinks.filter(
    (l) => !l.formName || hasPermission(l.formName, "CanView"),
  );
  const visibleMasterSub =
    masterMenu.subMenu?.filter(
      (l) => !l.formName || hasPermission(l.formName, "CanView"),
    ) || [];

  // const visibleErpMenu = erpMenuConfig.filter(
  //   (l) => !l.formName || hasPermission(l.formName, "CanView"),
  // );

  const visibleErpMenu = getVisibleMenu(erpMenuConfig);

  return (
    <div
      className={`${isOpen ? "w-64" : "w-20"} h-screen bg-[#20252a] flex flex-col transition-all duration-300 shadow-xl shadow-black/15`}
    >
      {/* Logo Section */}
      <div
        className={`flex items-center gap-3 border-b border-[#f07837]/20 bg-white px-4 py-3 h-[72px] shrink-0 transition-all duration-300`}
      >
        <img src={MainLogo} alt="LGM Sports logo" className="h-11 w-11 shrink-0 object-contain" />
        {isOpen && (
          <div>
            <p className="font-extrabold text-[#252a2e] leading-tight tracking-tight">
              LGM Sports
            </p>
            <p className="text-[10px] font-medium text-[#8a8984]">Sports Operations</p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
        {/* --- HRMS MENU --- */}
        {isHRMS && (
          <>
            <SidebarSection title="Operations" isOpen={isOpen}>
              {visibleMainMenu.map((link) => (
                <SidebarItem
                  key={link.label}
                  item={{
                    ...link,
                    to: `/hrms${link.to === "/" ? "" : link.to}`,
                  }}
                  isOpen={isOpen}
                  isExpanded={openMenuLabel === masterMenu.label}
                  onToggle={() => handleToggle(masterMenu.label)}
                />
              ))}
            </SidebarSection>
            {visibleMasterSub.length > 0 && (
              <SidebarSection title="Configuration" isOpen={isOpen}>
                <SidebarItem
                  item={{
                    ...masterMenu,
                    subMenu: visibleMasterSub.map((s) => ({
                      ...s,
                      to: `/hrms${s.to}`,
                    })),
                  }}
                  isOpen={isOpen}
                  isExpanded={openMenuLabel === masterMenu.label}
                  onToggle={() => handleToggle(masterMenu.label)}
                />
              </SidebarSection>
            )}
            <SidebarSection title="Payroll" isOpen={isOpen}>
              {visiblePayroll.map((link) => (
                <SidebarItem
                  key={link.label}
                  item={{ ...link, to: `/hrms${link.to}` }}
                  isOpen={isOpen}
                  isExpanded={openMenuLabel === masterMenu.label}
                  onToggle={() => handleToggle(masterMenu.label)}
                />
              ))}
            </SidebarSection>
          </>
        )}

        {/* --- CRM MENU --- */}
        {isCRM && (
          <div className="flex flex-col gap-1 mt-2">
            {getVisibleMenu(crmMenuConfig).map((item) => (
              <SidebarItem
                key={item.label}
                item={item}
                isOpen={isOpen}
                isExpanded={openMenuLabel === item.label}
                onToggle={() => handleToggle(item.label)}
              />
            ))}
          </div>
        )}

        {/* --- ERP MENU --- */}
        {isERP && (
          <div className="flex flex-col gap-1 mt-2">
            {visibleErpMenu.map((item) => (
              <SidebarItem
                key={item.label}
                item={item}
                isOpen={isOpen}
                isExpanded={openMenuLabel === item.label}
                onToggle={() => handleToggle(item.label)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer Switcher & Settings */}
      <div className="mt-auto border-t border-white/10 p-1">
        <SidebarItem
          item={{ icon: <Home />, label: "Switch Module", to: "/" }}
          isOpen={isOpen}
        />
        <SidebarItem
          item={{ icon: <Settings />, label: "Settings", to: "/settings" }}
          isOpen={isOpen}
        />
      </div>
    </div>
  );
};

export default Sidebar;
