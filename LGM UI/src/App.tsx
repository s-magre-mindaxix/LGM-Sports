// Inside App.tsx

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./Modules/HRMS/Pages/Auth/Login";
import ProtectedRoute from "./Modules/HRMS/Pages/Auth/ProtectedRoute";
import HomeHub from "./Pages/HomeHub";
import Dashboard from "./Modules/HRMS/Pages/Dashboard/Dashboard";
import Home from "./Modules/HRMS/Pages/Dashboard/Home";
import AttendanceManagement from "./Modules/HRMS/Pages/AttendanceManagement/AttendanceManagement";
import LeaveManagement from "./Modules/HRMS/Pages/LeaveManagement/LeaveManagement";
import Role from "./Modules/HRMS/Pages/Masters/Role/Role";
import AccessControlManagement from "./Modules/HRMS/Pages/Masters/AccessControl/AccessControlManagement";
import Designation from "./Modules/HRMS/Pages/Masters/Designation/Designation";
import Expensetype from "./Modules/HRMS/Pages/Masters/ExpenseType/Expensetype";
import SalaryStructure from "./Modules/HRMS/Pages/SalaryStructure/SalaryStructure";
import PayrollProcessing from "./Modules/HRMS/Pages/PayrollProcessing/PayrollProcessing";
import TaxAndCompliance from "./Modules/HRMS/Pages/TaxAndCompliance/TaxAndCompliance";
import Payslips from "./Modules/HRMS/Pages/Payslips/Payslips";
import LoansAndAdvances from "./Modules/HRMS/Pages/LoansAndAdvances/LoansAndAdvances";
import ExpenseClaims from "./Modules/HRMS/Pages/Expense/ExpenseClaims";
import BonusAndOvertime from "./Modules/HRMS/Pages/BonusAndOvertime/BonusAndOvertime";
import Records from "./Modules/HRMS/Pages/Records/Records";
import Reports from "./Modules/HRMS/Pages/Reports/Reports";
import Departments from "./Modules/HRMS/Pages/Masters/Department/Departments";
import LeaveTypes from "./Modules/HRMS/Pages/Masters/LeaveType/LeaveTypes";
import MultiLocation from "./Modules/HRMS/Pages/Location/MultiLocation";
import LeavePolicies from "./Modules/HRMS/Pages/Masters/LeavePolicy/LeavePolicies";
import LeaveAllocation from "./Modules/HRMS/Pages/Masters/LeaveAllocation/LeaveAllocation";
import LeaveAdmin from "./Modules/HRMS/Pages/Masters/LeaveAdmin/LeaveAdmin";

import LeaveManagementPage from "./Modules/HRMS/Pages/Masters/LeaveAllocation/LeaveManagementPage";
import OutdoorDuty from "./Modules/HRMS/Pages/OutdoorDuty/OutdoorDuty";
import LoanMasterPage from "./Modules/HRMS/Pages/Masters/LoanMaster/LoanMasterPage";
import BasicMasters from "./Modules/HRMS/Pages/Masters/BasicMasters/BasicMastersPage";
import SalaryComponentPage from "./Modules/HRMS/Pages/Masters/SalaryComponent/SalaryComponentPage";
import HolidayPage from "./Modules/HRMS/Pages/Masters/Holiday/HolidayPage";
import CompanyProfilePage from "./Modules/HRMS/Pages/Masters/CompanyProfile/CompanyProfilePage";
import SalarySettingPage from "./Modules/HRMS/Pages/Masters/SalarySetting/SalarySettingPage";
import StatutorySettingPage from "./Modules/HRMS/Pages/Masters/TaxAndCompliance/StatutorySetting";
import ProfessionalTaxSlabPage from "./Modules/HRMS/Pages/Masters/TaxAndCompliance/ProfessionalTaxSlab";
import AdvancePage from "./Modules/HRMS/Pages/Advance/AdvancePage";
import TaxDeclarationPage from "./Modules/HRMS/Pages/TaxCompliance/TaxDeclarationPage";
import TaxSlabManagement from "./Modules/HRMS/Pages/Masters/TaxSlabs/TaxSlabManagement";
import LeaveEncashmentPage from "./Modules/HRMS/Pages/LeaveEncashment/LeaveEncashmentPage";
import Form16Page from "./Modules/HRMS/Pages/Form16/Form16Page";
import NotFoundPage from "./Modules/HRMS/Pages/Error/NotFoundPage";
import ResetPassword from "./Modules/HRMS/Pages/Auth/ResetPassword";
import ForgotPassword from "./Modules/HRMS/Pages/Auth/ForgotPassword";
import ErrorPage from "./Modules/HRMS/Pages/Error/ErrorPage";
import CountryMaster from "./Modules/HRMS/Pages/Masters/Country/CountryMaster";
import StateMaster from "./Modules/HRMS/Pages/Masters/State/StateMaster";
import CRMHome from "./Modules/CRM/Pages/Dashboard/Home";
import CompanyPage from "./Modules/CRM/Pages/Company/CompanyPage";
import VendorPage from "./Modules/CRM/Pages/Vendor/VendorPage";
import MyDrive from "./Modules/CRM/Pages/Drive/MyDrive";
import CommonDrive from "./Modules/CRM/Pages/Drive/CommonDrive";
import CurrencyHistory from "./Modules/CRM/Pages/Dashboard/CurrencyHistory";
import EmployeeMaster from "./Modules/CRM/Pages/Employee/EmployeeMaster";
// import CategoryPage from "./Modules/HRMS/Pages/Masters/Category/CategoryPage";
import CustomerPage from "./Modules/CRM/Pages/Customer/CustomerPage";
import ProductGroupPage from "./Modules/HRMS/Pages/Masters/ProductGroup/ProductGroupPage";
import ProductTypePage from "./Modules/HRMS/Pages/Masters/ProductTypes/ProductTypePage";

import ProductVersionPage from "./Modules/HRMS/Pages/Masters/ProductVersion/ProductVersionPage";
import PartConditionPage from "./Modules/HRMS/Pages/Masters/PartCondition/PartConditionPage";
import CurrencyPage from "./Modules/CRM/Pages/Currency/CurrencyPage";
import CompanyGroupPage from "./Modules/CRM/Pages/CompanyGroup/CompanyGroupPage";
import ProductPage from "./Modules/CRM/Pages/Product/ProductPage";
import AccessoriesPage from "./Modules/CRM/Pages/Accessories/AccessoriesPage";
import EnquiryPage from "./Modules/CRM/Pages/Enquiry/EnquiryPage";
import InventoryPage from "./Modules/CRM/Pages/Inventory/InventoryPage";

import InstallationReportPage from "./Modules/CRM/Pages/InstallationReport/InstallationReportPage";
import QualityAssurancePage from "./Modules/CRM/Pages/Inventory/QA/QualityAssurancePage";
import ServiceReportPage from "./Modules/CRM/Pages/ServiceReport/ServiceReportPage";
import FaultReportPage from "./Modules/CRM/Pages/FaultReport/FaultReportPage";
import OfferPage from "./Modules/CRM/Pages/Offer/OfferPage";
import ProformaInvoicePage from "./Modules/CRM/Pages/ProformaInvoice/ProformaInvoicePage";
import OrderAcceptancePage from "./Modules/CRM/Pages/OrderAcceptance/OrderAcceptancePage";
import PurchaseOrderPage from "./Modules/CRM/Pages/PurchaseOrder/PurchaseOrderPage";
import ServiceMasterPage from "./Modules/CRM/Pages/ServiceMaster/ServiceMasterPage";
import CreditNotePage from "./Modules/CRM/Pages/CreditNote/CreditNotePage";
import DebitNotePage from "./Modules/CRM/Pages/DebitNote/DebitNotePage";

import OfferReport from "./Modules/CRM/Pages/Reports/OfferReport";
import PurchaseOrderReports from "./Modules/CRM/Pages/Reports/PurchaseOrderReports";
import ProformaInvoiceReports from "./Modules/CRM/Pages/Reports/ProformaInvoiceReports";
import InvoiceReports from "./Modules/CRM/Pages/Reports/InvoiceReports";
import OrderAcceptanceReports from "./Modules/CRM/Pages/Reports/OrderAcceptanceReports";
import InvoicePage from "./Modules/CRM/Pages/Invoice/InvoicePage";
import ERPHome from "./Modules/ERP/Pages/Dashboard/ERPHome";
import Orders from "./Modules/ERP/Pages/Orders/Orders";
// import Dispatch from "./Modules/ERP/Pages/Dispatch/Dispatch";
import PermissionProtectedRoute from "./Modules/HRMS/Pages/Auth/PermissionProtectedRoute";
import LevelMaster from "./Modules/HRMS/Pages/Hierarchy/LevelMaster";
import GratuityPage from "./Modules/HRMS/Pages/Gratuity/GratuityPage";
// import FnFManager from "./Pages/FnF/FnFManager";
import FnFManager from "./Modules/HRMS/Pages/FnF/FnFManager";
import ShipmentModePage from "./Modules/ERP/Pages/ShipmentMode/ShipmentModePage";
import ShipmentTypePage from "./Modules/ERP/Pages/ShipmentType/ShipmentTypePage"; // Add this import
import AgencyTypePage from "./Modules/ERP/Pages/AgencyType/AgencyTypePage";
import AgencyPage from "./Modules/ERP/Pages/Agency/AgencyPage";
import ShipmentPage from "./Modules/ERP/Pages/ShipmentInitiate/ShipmentPage";
import AgencyAssignmentPage from "./Modules/ERP/Pages/ShipmentAgency/AgencyAssignmentPage";
import ShipmentUnderTransitPage from "./Modules/ERP/Pages/ShipmentUnderTransit/ShipmentUnderTransitPage";
import ForwarderBillPage from "./Modules/ERP/Pages/ForwarderBill/ForwarderBillPage";
import CHABillPage from "./Modules/ERP/Pages/CHABill/CHABillPage";
import TransporterBillPage from "./Modules/ERP/Pages/TransporterBill/TransporterBillPage";
import ShipmentLandedCostPage from "./Modules/ERP/Pages/Reports/ShipmentLandedCost/ShipmentLandedCostPage";
import ShipmentInitiatePage from "./Modules/ERP/Pages/Reports/ShipmentInitiateReport/ShipmentInitiatePage";
import ShipmentTransitStatusPage from "./Modules/ERP/Pages/Reports/ShipmentUnderTransit/ShipmentTransitStatusPage";
import ShipmentPaymentPage from "./Modules/ERP/Pages/ShipmentPayment/ShipmentPaymentPage";
import DispatchPage from "./Modules/ERP/Pages/Dispatch/DispatchPage";
import { Component } from "react";
import BranchPage from "./Modules/CRM/Pages/Branch/BranchPage";

import WarehousePage from "./Modules/CRM/Pages/Warehouse/WarehousePage";
import LocationPage from "./Modules/CRM/Pages/Location/LocationPage";
import BrandPage from "./Modules/CRM/Pages/Brand/BrandPage";
import UnitPage from "./Modules/CRM/Pages/Unit/UnitPage";
import TaxPage from "./Modules/CRM/Pages/Tax/TaxPage";
import SupplierPage from "./Modules/CRM/Pages/Supplier/SupplierPage";

import AccessoryPricePage from "./Modules/CRM/Pages/Inventory/AccessoryPrices/AccessoryPricePage";
import BundlePage from "./Modules/CRM/Pages/Inventory/Bundle/BundlePage";
import ProductPricePage from "./Modules/CRM/Pages/Inventory/ProductPrices/ProductPricePage";
import BundleItemPage from "./Modules/CRM/Pages/Inventory/BundleItems/BundleItemPage";
import PaymentMethodPage from "./Modules/CRM/Pages/Inventory/PaymentMethods/PaymentMethodPage";
import ReasonPage from "./Modules/CRM/Pages/Inventory/Reason/ReasonPage";
import DocumentSeriesPage from "./Modules/CRM/Pages/Inventory/DocumentSeries/DocumentSeriesPage";
import PriceListPage from "./Modules/CRM/Pages/Inventory/PriceLists/PriceListPage";

import ProductAccessoryRulePage from "./Modules/CRM/Pages/ProductAccessoryRule/ProductAccessoryRulePage";
import ProductBarcodePage from "./Modules/CRM/Pages/ProductBarcode/ProductBarcodePage";
import CategoryPage from "./Modules/CRM/Pages/Category/CategoryPage";
import ProductVariantPage from "./Modules/CRM/Pages/ProductVariant/ProductVariantPage";


const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
    errorElement: <ErrorPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <HomeHub />
      </ProtectedRoute>
    ),
  },
  {
    path: "/crm",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    children: [
      { path: "", element: <CRMHome /> },
      { path: "drive", element: <MyDrive /> },
      { path: "common-drive", element: <CommonDrive /> },
      { path: "currency-history", element: <CurrencyHistory /> },
      {
        path: "master/company",
        element: (
          <PermissionProtectedRoute formName="Company">
            <CompanyPage />
          </PermissionProtectedRoute>
        ),
      },

      {
        path: "master/branch",
        element: (
          <PermissionProtectedRoute formName="Branch">
            <BranchPage/>
          </PermissionProtectedRoute>
        ),
      },

         {
        path: "master/warehouse",
        element: (
          <PermissionProtectedRoute formName="Warehouse">
            <WarehousePage/>
          </PermissionProtectedRoute>
        ),
      },
{
  path: "master/location",
  element: (
    <PermissionProtectedRoute formName="Location">
      <LocationPage/>
    </PermissionProtectedRoute>
  ),
},
{
  path: "master/category",
  element: (
    <PermissionProtectedRoute formName="Category">
      <CategoryPage/>
    </PermissionProtectedRoute>
  ),
},

{
  path: "master/brand",
  element: (
    <PermissionProtectedRoute formName="Brand">
      <BrandPage/>
    </PermissionProtectedRoute>
  ),
},


{
  path: "master/unit",
  element: (
    <PermissionProtectedRoute formName="Unit">
      <UnitPage/>
    </PermissionProtectedRoute>
  ),
},

{
  path: "master/tax",
  element: (
    <PermissionProtectedRoute formName="Tax">
      <TaxPage/>
    </PermissionProtectedRoute>
  ),
},
{
  path: "master/supplier",
  element: (
    <PermissionProtectedRoute formName="Supplier">
      <SupplierPage/>
    </PermissionProtectedRoute>
  ),
},


      {
        path: "master/vendor",
        element: (
          <PermissionProtectedRoute formName="Vendor">
            <VendorPage />
          </PermissionProtectedRoute>
        ),
      },
 {
        path: "master/productvariant",
        element: (
          <PermissionProtectedRoute formName="ProductVariant">
            <ProductVariantPage/>
          </PermissionProtectedRoute>
        ),
      },
 
      {
        path: "master/product",
        element: (
          <PermissionProtectedRoute formName="Product">
            <ProductPage />
          </PermissionProtectedRoute>
        ),
      },
{
  path: "master/product-barcode",
  element: (
    <PermissionProtectedRoute formName="ProductBarcode">
   <ProductBarcodePage/>
    </PermissionProtectedRoute>
  ),
},
{
  path: "master/product-accessory-rule",
  element: (
    <PermissionProtectedRoute formName="ProductAccessoryRule">
      <ProductAccessoryRulePage/>
    </PermissionProtectedRoute>
  ),
},
      
      {
        path: "masters/service-master",
        element: (
          <PermissionProtectedRoute formName="ServiceMaster">
            <ServiceMasterPage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "master/accessories",
        element: (
          <PermissionProtectedRoute formName="Accessories">
            <AccessoriesPage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "settings/currency",
        element: (
          <PermissionProtectedRoute formName="Currency">
            <CurrencyPage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "settings/companyGroup",
        element: (
          <PermissionProtectedRoute formName="CompanyGroup">
            <CompanyGroupPage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "master/customer",
        element: (
          <PermissionProtectedRoute formName="Customer">
            <CustomerPage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "master/inventory",
        element: (
          <PermissionProtectedRoute formName="Inventory">
            <InventoryPage />
          </PermissionProtectedRoute>
        ),
      },
        {
        path: "master/price-lists",
        element: (
          <PermissionProtectedRoute formName="PriceList">
            <PriceListPage/>
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "master/product-prices",
        element: (
          <PermissionProtectedRoute formName="ProductPrice">
            <ProductPricePage/>
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "master/accessory-prices",
        element: (
          <PermissionProtectedRoute formName="AccessoryPrice">
            <AccessoryPricePage/>
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "master/bundles",
        element: (
          <PermissionProtectedRoute formName="Bundle">
            <BundlePage/>
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "master/bundle-items",
        element: (
          <PermissionProtectedRoute formName="BundleItem">
            <BundleItemPage/>
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "master/payment-methods",
        element: (
          <PermissionProtectedRoute formName="PaymentMethod">
            <PaymentMethodPage/>
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "master/reasons",
        element: (
          <PermissionProtectedRoute formName="Reason">
            <ReasonPage/>
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "master/document-series",
        element: (
          <PermissionProtectedRoute formName="DocumentSeries">
            <DocumentSeriesPage/>
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "master/qa",
        element: (
          <PermissionProtectedRoute formName="QAMaster">
            <QualityAssurancePage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "master/qa",
        element: (
          <PermissionProtectedRoute formName="QAMaster">
            <QualityAssurancePage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "sales/enquiry",
        element: (
          <PermissionProtectedRoute formName="Enquiry">
            {" "}
            <EnquiryPage />{" "}
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "sales/offer",
        element: (
          <PermissionProtectedRoute formName="Offers">
            <OfferPage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "sales/order-acceptance",
        element: (
          <PermissionProtectedRoute formName="OrderAcceptance">
            <OrderAcceptancePage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "sales/purchase-order",
        element: (
          <PermissionProtectedRoute formName="PurchaseOrder">
            <PurchaseOrderPage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "support/installation",
        element: (
          <PermissionProtectedRoute formName="InstallationReport">
            <InstallationReportPage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "support/service",
        element: (
          <PermissionProtectedRoute formName="ServiceReport">
            <ServiceReportPage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "support/fault",
        element: (
          <PermissionProtectedRoute formName="FaultReport">
            <FaultReportPage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "accounts/proforma",
        element: (
          <PermissionProtectedRoute formName="ProformaInvoice">
            {" "}
            <ProformaInvoicePage />{" "}
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "accounts/invoice",
        element: (
          <PermissionProtectedRoute formName="Invoice">
            <InvoicePage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "accounts/credit",
        element: (
          <PermissionProtectedRoute formName="CreditNote">
            <CreditNotePage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "accounts/debit",
        element: (
          <PermissionProtectedRoute formName="DebitNote">
            <DebitNotePage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "reports/offer",
        element: (
          <PermissionProtectedRoute formName="OfferReport">
            <OfferReport />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "reports/order-acceptance-reports",
        element: (
          <PermissionProtectedRoute formName="OrderAcceptanceReport">
            <OrderAcceptanceReports />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "reports/purchase-order-reports",
        element: (
          <PermissionProtectedRoute formName="PurchaseOrderReport">
            <PurchaseOrderReports />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "reports/proforma-invoice-reports",
        element: (
          <PermissionProtectedRoute formName="ProformaInvoiceReport">
            <ProformaInvoiceReports />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "reports/invoice-reports",
        element: (
          <PermissionProtectedRoute formName="InvoiceReport">
            <InvoiceReports />
          </PermissionProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/erp",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    children: [
      { path: "", element: <ERPHome /> },
      {
        path: "order",
        element: (
          <PermissionProtectedRoute formName="Order">
            <Orders />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "master/shipmentMode",
        element: (
          <PermissionProtectedRoute formName="ShipmentMode">
            <ShipmentModePage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "master/shipmentType",
        element: (
          <PermissionProtectedRoute formName="ShipmentType">
            <ShipmentTypePage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "master/agencyType",
        element: (
          <PermissionProtectedRoute formName="AgencyType">
            <AgencyTypePage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "master/agency",
        element: (
          <PermissionProtectedRoute formName="Agency">
            <AgencyPage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "shipmentinitiate",
        element: (
          <PermissionProtectedRoute formName="ShipmentInitiate">
            <ShipmentPage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "agencyassignment",
        element: (
          <PermissionProtectedRoute formName="ShipmentAgencyAssignment">
            <AgencyAssignmentPage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "shipmentundertransit",
        element: (
          <PermissionProtectedRoute formName="ShipmentUnderTransit">
            <ShipmentUnderTransitPage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "forwarderbill",
        element: (
          <PermissionProtectedRoute formName="ForwarderBill">
            <ForwarderBillPage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "chabill",
        element: (
          <PermissionProtectedRoute formName="ChaBill">
            <CHABillPage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "transporterbill",
        element: (
          <PermissionProtectedRoute formName="TransporterBill">
            <TransporterBillPage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "shipmentpayment",
        element: (
          <PermissionProtectedRoute formName="ShipmentPayment">
            <ShipmentPaymentPage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "shipmentlandedcost",
        element: (
          <PermissionProtectedRoute formName="ShipmentLandedCostReport">
            <ShipmentLandedCostPage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "shipmentinitiatereport",
        element: (
          <PermissionProtectedRoute formName="ShipmentInitiateReport">
            <ShipmentInitiatePage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "reports/shipmentundertransit",
        element: (
          <PermissionProtectedRoute formName="ShipmentTransitStatusReport">
            <ShipmentTransitStatusPage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "dispatch",
        element: (
          <PermissionProtectedRoute formName="Dispatch">
            <DispatchPage />
          </PermissionProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/hrms",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    children: [
      { path: "", element: <Home /> },
      {
        path: "attendance",
        element: (
          <PermissionProtectedRoute formName="Attendance">
            <AttendanceManagement />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "leave",
        element: (
          <PermissionProtectedRoute formName="LeaveManagement">
            <LeaveManagement />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "outdoor",
        element: (
          <PermissionProtectedRoute formName="OutDoorDuty">
            <OutdoorDuty />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "access-control",
        element: (
          <PermissionProtectedRoute formName="AccessControl">
            <AccessControlManagement />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "basimasters",
        element: (
          <PermissionProtectedRoute formName="BasicMasters">
            <BasicMasters />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "country-master",
        element: (
          <PermissionProtectedRoute formName="CountryMaster">
            <CountryMaster />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "state-master",
        element: (
          <PermissionProtectedRoute formName="StateMaster">
            <StateMaster />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "category",
        element: (
          <PermissionProtectedRoute formName="Category">
            <CategoryPage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "product-group",
        element: (
          <PermissionProtectedRoute formName="ProductGroup">
            <ProductGroupPage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "product-type",
        element: (
          <PermissionProtectedRoute formName="ProductType">
            <ProductTypePage />
          </PermissionProtectedRoute>
        ),
      },
      // {
      //   path: "product-variant",
      //   element: (
      //     <PermissionProtectedRoute formName="ProductVariant">
      //       <ProductVariantPage />
      //     </PermissionProtectedRoute>
      //   ),
      // },
      {
        path: "product-version",
        element: (
          <PermissionProtectedRoute formName="ProductVersion">
            <ProductVersionPage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "part-condition",
        element: (
          <PermissionProtectedRoute formName="PartCondition">
            <PartConditionPage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "leavemasters",
        element: (
          <PermissionProtectedRoute formName="LeaveMasters">
            <LeaveManagementPage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "leave-admin",
        element: (
          <PermissionProtectedRoute formName="LeaveAdmin">
            <LeaveAdmin />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "expenseyype",
        element: (
          <PermissionProtectedRoute formName="ExpenseType">
            <Expensetype />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "loanmasters",
        element: (
          <PermissionProtectedRoute formName="LoanTypeMaster">
            <LoanMasterPage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "salarycomponent",
        element: (
          <PermissionProtectedRoute formName="SalaryComponent">
            <SalaryComponentPage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "statutory-settings",
        element: (
          <PermissionProtectedRoute formName="StatutorySetting">
            <StatutorySettingPage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "professional-tax-slabs",
        element: (
          <PermissionProtectedRoute formName="ProfessionalTaxSlab">
            <ProfessionalTaxSlabPage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "holiday",
        element: (
          <PermissionProtectedRoute formName="Holiday">
            <HolidayPage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "companyprofile",
        element: (
          <PermissionProtectedRoute formName="CompanyProfile">
            <CompanyProfilePage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "salarysetting",
        element: (
          <PermissionProtectedRoute formName="SalarySetting">
            <SalarySettingPage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "tax-slabs",
        element: (
          <PermissionProtectedRoute formName="IncomeTaxSlab">
            <TaxSlabManagement />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "salary-structure",
        element: (
          <PermissionProtectedRoute formName="SalaryStructure">
            <SalaryStructure />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "payroll",
        element: (
          <PermissionProtectedRoute formName="PayrollProcess">
            <PayrollProcessing />
          </PermissionProtectedRoute>
        )
      },
      {
        path: "leave-encashment",
        element: (
          <PermissionProtectedRoute formName="LeaveEncashment">
            <LeaveEncashmentPage />
          </PermissionProtectedRoute>
        ),
      },
      { path: "gratuity", element: <GratuityPage /> },
      { path: "fnf", element: <FnFManager /> },
      {
        path: "investment-declaration",
        element: (
          <PermissionProtectedRoute formName="InvestmentDeclaration">
            <TaxDeclarationPage />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "tax-compliance",
        element: (
          <PermissionProtectedRoute formName="TaxCompliance">
            <TaxAndCompliance />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "payslips",
        element: (
          <PermissionProtectedRoute formName="Payslip">
            <Payslips />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "form-16",
        element: (
          <PermissionProtectedRoute formName="Form16">
            <Form16Page />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "locations",
        element: (
          <PermissionProtectedRoute formName="MultiLocation">
            <MultiLocation />
          </PermissionProtectedRoute>
        ),
      },
      {
        path: "level-master",
        element: (
          <PermissionProtectedRoute formName="LevelMaster">
            <LevelMaster />
          </PermissionProtectedRoute>
        ),
      },

      //rc

      {
        path: "master/inventory/company/components",
        element: (
          <PermissionProtectedRoute formName="Inventory">
            <Component/>
          </PermissionProtectedRoute>
        ),
      },
      
    
      {
        path: "master/employee",
        element: (
          <PermissionProtectedRoute formName="Employee">
            <EmployeeMaster />
          </PermissionProtectedRoute>
        ),
      },
      { path: "role", element: <Role /> },
      { path: "department", element: <Departments /> },
      { path: "designation", element: <Designation /> },
      { path: "leavetype", element: <LeaveTypes /> },
      { path: "leavepolicy", element: <LeavePolicies /> },
      { path: "leaveallocation", element: <LeaveAllocation /> },
      { path: "advance-managements", element: <AdvancePage /> },
      { path: "reports", element: <Reports /> },
      { path: "records", element: <Records /> },
      { path: "bonuses", element: <BonusAndOvertime /> },
      { path: "expenses", element: <ExpenseClaims /> },
      { path: "loans", element: <LoansAndAdvances /> },
    ],
  },
]);

const App: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default App;
