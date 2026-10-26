using CompanyPlatform.Core.Models;
using CompanyPlatform.Core.Models.Commonmaster;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.Core.Models.CRM.AddressType;
using CompanyPlatform.Core.Models.CRM.Company;
using CompanyPlatform.Core.Models.CRM.CreditNote;
using CompanyPlatform.Core.Models.CRM.Dashboards;
using CompanyPlatform.Core.Models.CRM.DebitNote;
using CompanyPlatform.Core.Models.CRM.DummyInvoice;
using CompanyPlatform.Core.Models.CRM.Employee;
using CompanyPlatform.Core.Models.CRM.FinalDummyInvoice;
using CompanyPlatform.Core.Models.CRM.Invoice;
using CompanyPlatform.Core.Models.CRM.PaymentTerm;
using CompanyPlatform.Core.Models.ERP;
using CompanyPlatform.Core.Models.ERP.Finance;
using CompanyPlatform.Core.Models.ERP.Shipment;
using CompanyPlatform.Core.Models.HRMS;
using CompanyPlatform.Core.Models.Inventory;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;


namespace CompanyPlatform.Core.Data
{

    public class ApplicationDBContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDBContext(DbContextOptions<ApplicationDBContext> options) : base(options)
        { }
        
        public DbSet<Employees> Employees { get; set; }
        public DbSet<WorkLocation> WorkLocations { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<Designation> Designations { get; set; }
        public DbSet<EmployeeBankDetails> EmployeeBankDetails { get; set; }
        public DbSet<EmployeePFDetails> EmployeePFDetails { get; set; }
        public DbSet<EmployeeTDSDetails> EmployeeTDSDetails { get; set; }
        public DbSet<LeaveType> Tb_LeaveTypes { get; set; }
        public DbSet<AssignLeaveType> Tb_AssignLeaveTypes { get; set; }
        public DbSet<LeaveRequest> Tb_LeaveRequests { get; set; }
        public DbSet<EmployeeStatutoryDetails> Tb_EmployeeStatutoryDetails { get; set; }
        public DbSet<EmployeeDocument> Tb_EmployeeDocuments { get; set; }
        public DbSet<ExpenseType> Tb_ExpenseType { get; set; }
        public DbSet<Shift> Tb_Shifts { get; set; }
        public DbSet<SalaryComponent> Tb_SalaryComponents {  get; set; }
        public DbSet<StatutorySetting> Tb_StatutorySettings { get; set; }
        public DbSet<SalaryStructure> Tb_SalaryStructures {  get; set; }    
        public DbSet<AccessControl> Tbl_AccessControls { get; set; }
        public DbSet<LoanApplication> Tbl_LoanApplications { get; set; }
        public DbSet<LoanMaster> Tbl_LoanMasters { get; set; }
        public DbSet<Attendance> Tbl_Attendance { get; set; }
        public DbSet<ProfessionalTaxSlab> Tb_ProfessionalTaxSlabs { get; set; }
        public DbSet<ComplianceFilingStatus> Tb_ComplianceFilingStatuses { get; set; }
        public DbSet<ExpenseClaim> Tbl_ExpenseClaims { get; set; }
        public DbSet<EmployeeSalarySummary> Tb_EmployeeSalarySummaries { get; set; }
        public DbSet<LoanRepayment> Tbl_LoanRepayments { get; set; }
        public DbSet<PayrollRun> Tb_PayrollRuns { get; set; }
        public DbSet<MonthlySalaryRecord> Tb_MonthlySalaryRecords { get; set; }
        public DbSet<MonthlySalaryComponentDetail> Tb_MonthlySalaryComponentDetails { get; set; }
        public DbSet<OutdoorDuty> Tbl_OutdoorDuties { get; set; }
        public DbSet<Advance> Tbl_Advances { get; set; }
        public DbSet<AdvanceRepayment> Tbl_AdvanceRepayments { get; set; }
        public DbSet<LeaveCreditLedger> Tb_LeaveCreditLedgers { get; set; }
        public DbSet<Notifications> Tbl_Notifications { get; set; }

        public DbSet<Payslip> Tbl_Payslips { get; set; }

        public DbSet<Holiday> Tbl_Holidays {  get; set; }

        public DbSet<CompanyProfile> Tbl_CompanyProfiles {  get; set; }

        public DbSet<EmployeeTaxDeclaration> Tbl_EmployeeTaxDeclarations { get; set; }

        public DbSet<EmployeeDeclarationDetail> EmployeeDeclarationDetails { get; set; }

        public DbSet<SalarySettingPercentage> Tbl_SalarySettingPercentages {  get; set; }

        public DbSet<BonusRecord> Tbl_BonusRecords { get; set; }

        public DbSet<Form16Status> Tbl_Form16Status { get; set; }

        public DbSet<TaxSlab> Tbl_TaxSlabs { get; set; }
        public DbSet<Company> Tbl_Companies { get; set; }
        public DbSet<CompanyAddress> Tbl_CompanyAddresses { get; set; }
        public DbSet<CompanyDirector> Tbl_CompanyDirectors { get; set; }
        public DbSet<CompanyBankDetail> Tbl_CompanyBankDetails { get; set; }
        public DbSet<EmployeeDeclarationDocument> Tbl_EmployeeDeclarationDocuments {  get; set; }
        public DbSet<Country> Tbl_Countries { get; set; }
        public DbSet<State> Tbl_States { get; set; }

        public DbSet<Vendor> Tbl_Vendors { get; set; }

        public DbSet<VendorAddress> Tbl_VendorAddresses {  get; set; }

        public DbSet<VendorContact> Tbl_VendorContacts {  get; set; }

        public DbSet<VendorBankDetail> Tbl_VendorBankDetails { get; set; }

        public DbSet<DriveFolder> Tbl_DriveFolders { get; set; }
        public DbSet<DriveFile> Tbl_DriveFiles { get; set; }
        public DbSet<UserNotes> Tbl_UserNotes { get; set; }
        public DbSet<CurrencyHistory> Tbl_CurrencyHistory { get; set; }
        public DbSet<CompanyGroup> Tbl_CompanyGroups { get; set; }
      

        public DbSet<Customer> Tbl_Customers {  get; set; }

        public DbSet<CustomerAddress> Tbl_CustomerAddress { get; set; }

        public DbSet<CustomerContact> Tbl_CustomerContacts {  get; set; }
        public DbSet<ProductGroup> Tbl_ProductGroups { get; set; }
        public DbSet<ProductVariant> ProductVariant { get; set; }
        public DbSet<ProductVersion> Tbl_ProductVersions { get; set; }
        public DbSet<ProductType> Tbl_ProductTypes { get; set; }
        public DbSet<ProductVariant> Tbl_ProductVariants { get; set; }
        //public DbSet<ProductVersion> Tbl_ProductVersions { get; set; }
        public DbSet<PartCondition> Tbl_PartConditions { get; set; }
        public DbSet<Currency> Tbl_Currencies { get; set; }
        public DbSet<Product> Tbl_Products { get; set; }
        public DbSet<Accessories> Tbl_Accessories { get; set; }
        public DbSet<AccessoryLog> Tbl_AccessoryLogs { get; set; }
        public DbSet<Enquiry> Tbl_Enquiries { get; set; }
        public DbSet<EnquiryItem> Tbl_EnquiryItems { get; set; }
        public DbSet<ProductCurrencyPrice> Tbl_ProductCurrencyPrices { get; set; }

        public DbSet<AccessoryCurrencyPrice> Tbl_AccessoryCurrencyPrices { get; set; }
        public DbSet<InventoryTransaction> Tbl_InventoryTransactions { get; set; }
        public DbSet<ScrapItem> Tbl_ScrapItems { get; set; }
        public DbSet<InstallationReport> Tbl_InstallationReports {  get; set; }

        public DbSet<InstallationContact> Tbl_InstallationContacts {  get; set; }
        public DbSet<EmployeeQualification> Tbl_EmployeeQualifications { get; set; }
        public DbSet<EmployeeExperience> Tbl_EmployeeExperiences { get; set; }
        public DbSet<EmployeeAddress> Tbl_EmployeeAddresses { get; set; }
        public DbSet<QualityAssurance> Tbl_QualityAssurance { get; set; }
        public DbSet<EnquiryNote> Tbl_EnquiryNotes { get; set; }
        public DbSet<Offer> Tbl_Offers { get; set; }
        public DbSet<OfferItem> Tbl_OfferItems { get; set; }
        public DbSet<OfferItemAccessory> Tbl_OfferItemAccessories { get; set; }
        public DbSet<ServiceReport> Tbl_ServiceReports { get; set; }

        public DbSet<ServiceReportItem> Tbl_ServiceReportItems { get; set; }    
        public DbSet<OfferVersion> Tbl_OfferVersions { get; set; }
        public DbSet<FaultReport> Tbl_FaultReports { get; set; }

        public DbSet<ProformaInvoice> Tbl_ProformaInvoices { get; set; }

        public DbSet<ProformaInvoiceItem> Tbl_ProformaInvoiceItems { get; set; }

        public DbSet<Invoice> Tbl_Invoices { get; set; }

        public DbSet<InvoiceItem> Tbl_InvoiceItems { get; set; }

        public DbSet<InvoiceItemAccessory> Tbl_InvoiceItemAccessories { get; set; }
        public DbSet<OrderAcceptance> Tbl_OrderAcceptances { get; set; }
        public DbSet<OrderAcceptanceItem> Tbl_OrderAcceptanceItems { get; set; }
        public DbSet<OrderAcceptanceItemAccessory> Tbl_OrderAcceptanceItemAccessories { get; set; }

        public DbSet<OrderAcceptanceOffer> Tbl_OrderAcceptanceOffers { get; set; }  
        public DbSet<PurchaseOrder> Tbl_PurchaseOrders { get; set; }
        public DbSet<PurchaseOrderItem> Tbl_PurchaseOrderItems { get; set; }
        public DbSet<PurchaseOrderItemAccessory> Tbl_PurchaseOrderItemAccessories { get; set; }
        public DbSet<ServiceMaster> Tbl_ServiceMaster { get; set; }
        public DbSet<PurchaseOrderOffer> Tbl_PurchaseOrderOffers { get; set; }

        public DbSet<LevelMaster> Tbl_LevelMasters { get; set; }

        public DbSet<LeaveEncashment> Tbl_LeaveEncashments { get; set; }

        public DbSet<Gratuity> Tbl_Gratuitys { get; set; }

        public DbSet<FnFSettlement> Tbl_FnFSettlements { get; set; }

        public DbSet<DummyInvoice> Tbl_DummyInvoices { get; set; }

        public DbSet<DummyInvoiceItem> Tbl_DummyInvoiceItem { get; set; }

        public DbSet<DummyInvoiceItemAccessory> TbL_DummyInvoiceItemAccessories { get; set; }

        public DbSet<FinalDummyInvoice> Tbl_FinalDummyInvoices { get; set; }
        public DbSet<FinalDummyInvoiceItem> Tbl_FinalDummyInvoiceItems { get; set; }

        //ERP 

        public DbSet<ShipmentMode> Tbl_ShipmentModes { get; set; }
        public DbSet<ShipmentType> Tbl_ShipmentTypes { get; set; }
        public DbSet<AgencyType> Tbl_AgencyTypes { get; set; }
        public DbSet<Agency> Tbl_Agencies { get; set; }

        public DbSet<AgencyAddress> Tbl_AgencyAddresses { get; set; }

        public DbSet<AgencyContact> Tbl_AgencyContacts { get; set; }

        public DbSet<AgencyBankDetail> TbL_AgencyBankDetails { get; set; }

        public DbSet<ShipmentInitiate> Tbl_ShipmentInitiates { get; set; }

        public DbSet<ShipmentItem> Tbl_ShipmentItems { get; set; }

        public DbSet<ShipmentAgencyAssignment> Tbl_ShipmentAgencyAssignments { get; set; }

        public DbSet<ShipmentUnderTransit> Tbl_ShipmentUnderTransits { get; set; }

        public DbSet<ForwarderBill> Tbl_ForwarderBills { get; set; }

        public DbSet<CHABill> Tbl_CHABills { get; set; }

        public DbSet<TransporterBill> Tbl_TransporterBills { get; set; }

        public DbSet<ShipmentPayment> Tbl_ShipmentPayments { get; set; }

        public DbSet<Dispatch> Tbl_Dispatchs { get; set; }

        public DbSet<DispatchDetail> Tbl_DispatchDetails { get; set; }

        public DbSet<DispatchItem> Tbl_DispatchItems { get; set; }

        public DbSet<DispatchStockItem> Tbl_DispatchStockItems { get; set; }

        //CRM

        public DbSet<OfferNote> Tbl_OfferNotes { get; set; }

        public DbSet<OrderAcceptanceNote> Tbl_OrderAcceptanceNotes { get; set; }

        public DbSet<CreditNote> Tbl_CreditNotes { get; set; }

        public DbSet<CreditNoteItem> Tbl_CreditNoteItems { get; set;}

        public DbSet<CreditNoteItemAccessory> Tbl_CreditNoteItemAccessorys { get; set; }

        public DbSet<DebitNote> Tbl_DebitNotes { get; set; }

        public DbSet<DebitNoteItem> Tbl_DebitNoteItems { get; set; }

        public DbSet<DebitNoteItemAccessory> Tbl_DebitNoteItemAccessorys { get; set; }

        public DbSet<ShipmentSourceItem> Tbl_ShipmentSourceItems { get; set; }

        //sm
        public DbSet<ClientType> ClientTypes { get; set; }

        public DbSet<ContactType> ContactTypes { get; set; }

        public DbSet<BDEUser> BDEUsers { get; set; }
        public DbSet<SalesUserManager> SalesUserManagers { get; set; }
        public DbSet<AddressType> AddressTypes { get; set; }

        public DbSet<PaymentTerm> PaymentTerms { get; set; }
        public DbSet<Industry> Industries { get; set; }
        public DbSet<PriceList> Tbl_PriceLists { get; set; }
        public DbSet<ProductAccessoryPrice> Tbl_ProductAccessoryPrices { get; set; }
        public DbSet<Bundle> Tbl_Bundles { get; set; }
        public DbSet<BundleItem> Tbl_BundleItems { get; set; }
        public DbSet<PaymentMethod> Tbl_PaymentMethods { get; set; }
        public DbSet<Reason> Tbl_Reasons { get; set; }
        public DbSet<DocumentSeries> Tbl_DocumentSeries { get; set; }
        public DbSet<ProductPrice> ProductPrices { get; set; }
        public DbSet<AccessoryPrice> AccessoryPrices { get; set; }

        //inventory rc
        public DbSet<Category> Tbl_Categories { get; set; }
        public DbSet<Branch> Branches { get; set; }
        public DbSet<Warehouse> Warehouses { get; set; }
        public DbSet<Location> Locations { get; set; }
        public DbSet<Brand> Brands { get; set; }
        public DbSet<Unit> Units { get; set; }
        public DbSet<Supplier> Suppliers { get; set; }
        public DbSet<Tax> Taxes { get; set; }
        
        public DbSet<ProductAccessoryRule> Tbl_ProductAccessoryRules { get; set; }
        public DbSet<ProductBarcode> Tbl_ProductBarcodes { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            //builder.Entity<Company>().ToTable("Company");

            builder.Entity<Company>().ToTable("Tbl_Companies");
            builder.Entity<Branch>().ToTable("Branch");
            builder.Entity<Warehouse>().ToTable("Warehouse");
            builder.Entity<Employees>().ToTable("tbl_Employee");

            builder.Entity<Employees>()
                .HasOne(e => e.Company)
                .WithMany(c => c.Employees)
                .HasForeignKey(e => e.CompanyId)
                .IsRequired(false);

            builder.Entity<Employees>()
                .HasOne(e => e.Level)
                .WithMany()
                .HasForeignKey(e => e.LevelID)
                .IsRequired(false);

            builder.Entity<ApplicationUser>()
                .HasOne(a => a.Employee)
                .WithOne(e => e.ApplicationUser)
                .HasForeignKey<ApplicationUser>(a => a.EmployeeId)
                .IsRequired();


            builder.Entity<EmployeeStatutoryDetails>()
               .HasOne(s => s.Employee)
               .WithMany()
               .HasForeignKey(s => s.EmployeeID)
               .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Notifications>()
               .HasIndex(n => n.EmployeeId);

            builder.Entity<AssignLeaveType>(entity =>
            {

                entity.Property(e => e.AllocatedDays).HasPrecision(5, 2);

                entity.HasOne(a => a.Employee)
                    .WithMany()
                    .HasForeignKey(a => a.EmployeeID)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            builder.Entity<LeaveRequest>()
                .HasOne(lr => lr.Employee)
                .WithMany()
                .HasForeignKey(lr => lr.EmployeeID)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Attendance>()
                .HasOne(a => a.Employee)
                .WithMany()
                .HasForeignKey(a => a.EmployeeID)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Attendance>()
                .HasIndex(a => new { a.EmployeeID, a.Date }).IsUnique();


            builder.Entity<Advance>(entity =>
            {
                entity.HasOne(a => a.Employee)
                      .WithMany()
                      .HasForeignKey(a => a.EmployeeID)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(a => a.ProcessedByEmployee)
                      .WithMany()
                      .HasForeignKey(a => a.ProcessedByEmployeeId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            builder.Entity<AdvanceRepayment>(entity =>
            {
                entity.HasOne(ar => ar.Advance)
                      .WithMany()
                      .HasForeignKey(ar => ar.AdvanceID)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ar => ar.CreatedByEmployee)
                      .WithMany()
                      .HasForeignKey(ar => ar.CreatedByEmployeeId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            builder.Entity<LeaveCreditLedger>(entity =>
            {
                entity.HasOne(l => l.Employee)
                      .WithMany()
                      .HasForeignKey(l => l.EmployeeID)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(l => l.LeaveType)
                      .WithMany()
                      .HasForeignKey(l => l.LeaveTypeID)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(l => l.LeaveRequest)
                      .WithMany()
                      .HasForeignKey(l => l.LeaveRequestID)
                      .OnDelete(DeleteBehavior.SetNull); 

                entity.HasOne(l => l.Attendance)
                      .WithMany()
                      .HasForeignKey(l => l.AttendanceID)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            builder.Entity<VendorAddress>(entity =>
            {
                // Fix for Multiple Cascade Paths: Country -> VendorAddress
                entity.HasOne(a => a.Country)
                      .WithMany()
                      .HasForeignKey(a => a.CountryId)
                      .OnDelete(DeleteBehavior.Restrict); // Changed to Restrict

                // Fix for Multiple Cascade Paths: State -> VendorAddress
                entity.HasOne(a => a.State)
                      .WithMany()
                      .HasForeignKey(a => a.StateId)
                      .OnDelete(DeleteBehavior.Restrict); // Changed to Restrict

                // Vendor -> Address (Cascade is fine here)
                entity.HasOne(a => a.Vendor)
                      .WithMany(v => v.Addresses)
                      .HasForeignKey(a => a.VendorId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<VendorContact>(entity =>
            {
                entity.HasOne(c => c.Vendor)
                      .WithMany(v => v.PrincipalContacts)
                      .HasForeignKey(c => c.VendorId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<VendorBankDetail>(entity =>
            {
                entity.HasOne(b => b.Vendor)
                      .WithMany(v => v.BankDetails)
                      .HasForeignKey(b => b.VendorId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<VendorContact>(entity =>
            {
                entity.HasOne(c => c.Vendor)
                      .WithMany(v => v.PrincipalContacts)
                      .HasForeignKey(c => c.VendorId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<VendorBankDetail>(entity =>
            {
                entity.HasOne(b => b.Vendor)
                      .WithMany(v => v.BankDetails)
                      .HasForeignKey(b => b.VendorId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<CustomerAddress>(entity =>
            {
                // Fix for Multiple Cascade Paths: Country -> CustomerAddress
                entity.HasOne(a => a.Country)
                      .WithMany()
                      .HasForeignKey(a => a.CountryId)
                      .OnDelete(DeleteBehavior.Restrict);

                // Fix for Multiple Cascade Paths: State -> CustomerAddress
                entity.HasOne(a => a.State)
                      .WithMany()
                      .HasForeignKey(a => a.StateId)
                      .OnDelete(DeleteBehavior.Restrict);

                // Customer -> Address (Cascade is fine: Delete Customer -> Delete Address)
                entity.HasOne(a => a.Customer)
                      .WithMany(c => c.Addresses)
                      .HasForeignKey(a => a.CustomerId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<CustomerContact>(entity =>
            {
                // Fix for Cascade Path: Department -> CustomerContact
                //entity.HasOne(c => c.Department)
                //      .WithMany()
                //      .HasForeignKey(c => c.DepartmentId)
                //      .OnDelete(DeleteBehavior.Restrict);

                // Customer -> Contact (Cascade is fine: Delete Customer -> Delete Contact)
                entity.HasOne(c => c.Customer)
                      .WithMany(cust => cust.Contacts)
                      .HasForeignKey(c => c.CustomerId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<ProformaInvoice>()
               .HasOne(pi => pi.Customer)
               .WithMany() // Assuming a Customer can have many ProformaInvoices
               .HasForeignKey(pi => pi.CustomerId)
               .OnDelete(DeleteBehavior.Restrict); // PREVENTS CASCADE DELETE

            // Configure the relationship between ProformaInvoice and CustomerContact
            builder.Entity<ProformaInvoice>()
                .HasOne(pi => pi.CustomerContact)
                .WithMany() // Assuming a Contact can be on many Invoices
                .HasForeignKey(pi => pi.ResponsiblePersonId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Invoice>()
               .HasOne(i => i.Customer)
               .WithMany()
               .HasForeignKey(i => i.CustomerId)
               .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Invoice>()
              .HasOne(i => i.ResponsiblePerson)
              .WithMany()
              .HasForeignKey(i => i.ResponsiblePersonId)
              .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<InvoiceItem>()
                .HasOne(i => i.Invoice)
                .WithMany(i => i.Items)
                .HasForeignKey(i => i.InvoiceId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<InvoiceItemAccessory>()
                .HasOne(a => a.InvoiceItem)
                .WithMany(i => i.Accessories)
                .HasForeignKey(a => a.InvoiceItemId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Invoice>()
            .HasOne(i => i.Company)
            .WithMany()
            .HasForeignKey(i => i.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Invoice>()
                .HasOne(i => i.Vendor)
                .WithMany()
                .HasForeignKey(i => i.VendorId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Invoice>()
                .HasOne(i => i.Currency)
                .WithMany()
                .HasForeignKey(i => i.CurrencyId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<InvoiceItem>()
                .HasOne(i => i.Product)
                .WithMany()
                .HasForeignKey(i => i.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<InvoiceItemAccessory>()
                .HasOne(a => a.Accessory)
                .WithMany()
                .HasForeignKey(a => a.AccessoryId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<AgencyAddress>(entity =>
            {
                // Country -> AgencyAddress
                entity.HasOne(a => a.Country)
                      .WithMany()
                      .HasForeignKey(a => a.CountryId)
                      .OnDelete(DeleteBehavior.Restrict);

                // State -> AgencyAddress
                entity.HasOne(a => a.State)
                      .WithMany()
                      .HasForeignKey(a => a.StateId)
                      .OnDelete(DeleteBehavior.Restrict);

                // Agency -> AgencyAddress
                entity.HasOne(a => a.Agency)
                      .WithMany(v => v.Addresses)
                      .HasForeignKey(a => a.AgencyId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<AgencyContact>(entity =>
            {
                entity.HasOne(c => c.Agency)
                      .WithMany(v => v.Contacts)
                      .HasForeignKey(c => c.AgencyId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<AgencyBankDetail>(entity =>
            {
                entity.HasOne(b => b.Agency)
                      .WithMany(v => v.BankDetails)
                      .HasForeignKey(b => b.AgencyId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<ShipmentInitiate>()
            .HasOne(s => s.ShipmentMode)
            .WithMany()
            .HasForeignKey(s => s.ShipmentModeId)
            .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<ForwarderBill>()
            .HasOne(f => f.ShipmentInitiate)
            .WithMany()
            .HasForeignKey(f => f.ShipmentInitiateId)
            .OnDelete(DeleteBehavior.Restrict);

            // ForwarderBill -> ShipmentAgencyAssignment
            builder.Entity<ForwarderBill>()
                .HasOne(f => f.ShipmentAgencyAssignment)
                .WithMany()
                .HasForeignKey(f => f.ShipmentAgencyAssignmentId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<CHABill>()
            .HasOne(x => x.ShipmentInitiate)
            .WithMany()
            .HasForeignKey(x => x.ShipmentInitiateId)
            .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<CHABill>()
                .HasOne(x => x.ShipmentAgencyAssignment)
                .WithMany()
                .HasForeignKey(x => x.ShipmentAgencyAssignmentId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<TransporterBill>()
            .HasOne(x => x.ShipmentInitiate)
            .WithMany()
            .HasForeignKey(x => x.ShipmentInitiateId)
            .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<TransporterBill>()
                .HasOne(x => x.ShipmentAgencyAssignment)
                .WithMany()
                .HasForeignKey(x => x.ShipmentAgencyAssignmentId)
                .OnDelete(DeleteBehavior.Restrict);

            // Set CBM precision to 4 or 5 decimal places
            builder.Entity<ShipmentItem>()
                .Property(p => p.CBM)
                .HasPrecision(18, 4);

            builder.Entity<ShipmentInitiate>()
                .Property(p => p.TotalCBM)
                .HasPrecision(18, 4);

        }
    }

}