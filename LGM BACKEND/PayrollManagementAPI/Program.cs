using System.Text;
using AnonymityAPI.Services;
using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Hubs;
using CompanyPlatform.Core.Interfaces.Inventory;
using CompanyPlatform.Core.Models;
using CompanyPlatform.Core.Models.CRM.Dashboards;
using CompanyPlatform.Core.Models.CRM.Employee;
using CompanyPlatform.Core.Repository;
using CompanyPlatform.Core.Services;
using CompanyPlatform.Core.Services.AccessControl;
using CompanyPlatform.Core.Services.Auth;
using CompanyPlatform.Core.Services.Common;
using CompanyPlatform.Core.Services.Commonmaster;
using CompanyPlatform.Core.Services.Company;
using CompanyPlatform.Core.Services.CompanyGroup;
using CompanyPlatform.Core.Services.Country;
using CompanyPlatform.Core.Services.CRM;
using CompanyPlatform.Core.Services.Department;
using CompanyPlatform.Core.Services.Designation;
using CompanyPlatform.Core.Services.Email;
using CompanyPlatform.Core.Services.Employee;
using CompanyPlatform.Core.Services.EmployeePFDetails;
using CompanyPlatform.Core.Services.EmployeeStatutoryDetails;
using CompanyPlatform.Core.Services.EmployeeTDSDetails;
using CompanyPlatform.Core.Services.FaultReport;
using CompanyPlatform.Core.Services.InstallationReport;
using CompanyPlatform.Core.Services.Inventory;
using CompanyPlatform.Core.Services.Notification;
using CompanyPlatform.Core.Services.PartCondition;
using CompanyPlatform.Core.Services.ProductBarcode;
using CompanyPlatform.Core.Services.ProductGroup;
using CompanyPlatform.Core.Services.ProductType;
using CompanyPlatform.Core.Services.ProductVariant;
using CompanyPlatform.Core.Services.ProductVersion;
using CompanyPlatform.Core.Services.ProformaInvoice;
using CompanyPlatform.Core.Services.ServiceReport;
using CompanyPlatform.Core.Services.State;
using CompanyPlatform.Core.Services.Vendor;
using CompanyPlatform.CRM;
using CompanyPlatform.CRM.Controllers;
using CompanyPlatform.CRM.Services;
using CompanyPlatform.CRM.Services.Accessories;
using CompanyPlatform.CRM.Services.AccessoryPrice;
//using CompanyPlatform.CRM.Services.Accessoryrice;
using CompanyPlatform.CRM.Services.AddressType;
using CompanyPlatform.CRM.Services.BDEUser;
using CompanyPlatform.CRM.Services.Bundle;
using CompanyPlatform.CRM.Services.BundleItem;
using CompanyPlatform.CRM.Services.ClientType;
using CompanyPlatform.CRM.Services.ContactType;
using CompanyPlatform.CRM.Services.CreditNote;
using CompanyPlatform.CRM.Services.Dashboards.Currency;
using CompanyPlatform.CRM.Services.Dashboards.Dashboard;
using CompanyPlatform.CRM.Services.Dashboards.Drive;
using CompanyPlatform.CRM.Services.Dashboards.UserNote;
using CompanyPlatform.CRM.Services.DebitNote;
using CompanyPlatform.CRM.Services.DocumentSeries;
using CompanyPlatform.CRM.Services.Enquiry;
using CompanyPlatform.CRM.Services.Industry;
using CompanyPlatform.CRM.Services.Inventory;
using CompanyPlatform.CRM.Services.Invoice;
using CompanyPlatform.CRM.Services.Offer;
using CompanyPlatform.CRM.Services.OrderAcceptance;
using CompanyPlatform.CRM.Services.PaymentMethod;
using CompanyPlatform.CRM.Services.PaymentTerm;
using CompanyPlatform.CRM.Services.PriceList;
using CompanyPlatform.CRM.Services.Product;
using CompanyPlatform.CRM.Services.ProductAccessoryPrice;
using CompanyPlatform.CRM.Services.ProductAccessoryRule;
using CompanyPlatform.CRM.Services.ProformaInvoice;
using CompanyPlatform.CRM.Services.PurchaseOrder;
using CompanyPlatform.CRM.Services.Reason;
using CompanyPlatform.CRM.Services.Reports;
using CompanyPlatform.CRM.Services.SalesUserManager;
using CompanyPlatform.CRM.Services.ServiceMaster;
using CompanyPlatform.ERP;
using CompanyPlatform.ERP.Services.Agency;
using CompanyPlatform.ERP.Services.AgencyType;
using CompanyPlatform.ERP.Services.CHABill;
using CompanyPlatform.ERP.Services.Dispatch;
using CompanyPlatform.ERP.Services.Email;
using CompanyPlatform.ERP.Services.Finance.CHABill;
using CompanyPlatform.ERP.Services.ForwarderBill;
using CompanyPlatform.ERP.Services.Reports;
using CompanyPlatform.ERP.Services.ShipmentAgencyAssignment;
using CompanyPlatform.ERP.Services.ShipmentInitiate;
using CompanyPlatform.ERP.Services.ShipmentMode;
using CompanyPlatform.ERP.Services.ShipmentPayment;
using CompanyPlatform.ERP.Services.ShipmentType;
using CompanyPlatform.ERP.Services.ShipmentUnderTransit;
using CompanyPlatform.ERP.Services.TransporterBill;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using OfficeOpenXml;
using PayrollManagementAPI.Services;
using PayrollManagementAPI.Services.Advance;
using PayrollManagementAPI.Services.Attendance;
using PayrollManagementAPI.Services.Bonus;
using PayrollManagementAPI.Services.CompanyProfile;
using PayrollManagementAPI.Services.ComplianceReports;
using PayrollManagementAPI.Services.Department;
using PayrollManagementAPI.Services.Designation;
using PayrollManagementAPI.Services.Email;
using PayrollManagementAPI.Services.EmployeeBankDetails;
using PayrollManagementAPI.Services.EmployeeDocument;
using PayrollManagementAPI.Services.EmployeeDocuments;
using PayrollManagementAPI.Services.EmployeeReport;
using PayrollManagementAPI.Services.EmployeeStatutoryDetails;
using PayrollManagementAPI.Services.ExpenseClaim;
using PayrollManagementAPI.Services.ExpenseType;
using PayrollManagementAPI.Services.Form16;
using PayrollManagementAPI.Services.FullandFinal;
using PayrollManagementAPI.Services.Gratuity;
using PayrollManagementAPI.Services.Holiday;
using PayrollManagementAPI.Services.Leave;
using PayrollManagementAPI.Services.LeaveEncashment;
using PayrollManagementAPI.Services.LeaveManagement;
using PayrollManagementAPI.Services.LeaveType;
using PayrollManagementAPI.Services.Level;
using PayrollManagementAPI.Services.Loan;
using PayrollManagementAPI.Services.LoanApplication;
using PayrollManagementAPI.Services.LoanMaster;
using PayrollManagementAPI.Services.Notification;
using PayrollManagementAPI.Services.OutdoorDuty;
using PayrollManagementAPI.Services.PayrollProcessing;
using PayrollManagementAPI.Services.PaySlip;
using PayrollManagementAPI.Services.ProfessionalTaxSlab;
using PayrollManagementAPI.Services.Role;
using PayrollManagementAPI.Services.SalaryComponent;
using PayrollManagementAPI.Services.SalarySetting;
using PayrollManagementAPI.Services.SalaryStructure;
using PayrollManagementAPI.Services.Shift;
using PayrollManagementAPI.Services.StatutorySetting;
using PayrollManagementAPI.Services.Tax;
using PayrollManagementAPI.Services.TaxAndCompliance;
using PayrollManagementAPI.Services.TaxCalculation;
using PayrollManagementAPI.Services.TaxDeclarationService;
using PayrollManagementAPI.Services.Worklocation;
using PayrollManagementAPI.Services.WorkLocation;
using Swashbuckle.AspNetCore.Filters;

var builder = WebApplication.CreateBuilder(args);
ExcelPackage.License.SetNonCommercialOrganization("Gaxce Sensors");


builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 268435456;
});

builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.MaxRequestBodySize = 268435456;
});

builder.Services.Configure<IISServerOptions>(options =>
{
    options.MaxRequestBodySize = 268435456;
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHttpContextAccessor();
builder.Services.AddCRMModule();
builder.Services.AddERPModule();




builder.Services.AddDbContext<ApplicationDBContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.User.RequireUniqueEmail = true;
    options.Password.RequiredLength = 6;
    options.Password.RequireDigit = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireLowercase = false;
})
    .AddEntityFrameworkStores<ApplicationDBContext>()
    .AddDefaultTokenProviders();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];

            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) &&
                (path.StartsWithSegments("/notificationHub")))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("oauth2", new OpenApiSecurityScheme
    {
        Description = "Standard Authorization header using the Bearer scheme (\"bearer {token}\")",
        In = ParameterLocation.Header,
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey
    });
    options.OperationFilter<SecurityRequirementsOperationFilter>();
});




builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://gaxce.com", "https://gaxce.com", "https://www.gaxce.com", "http://www.gaxce.com")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.Configure<WiseSettings>(
    builder.Configuration.GetSection("Wise")
);

//builder.Services.Configure<SmtpSettings>(builder.Configuration.GetSection("SmtpSettings"));
//builder.Services.AddScoped<IEmailService, EmailService>();

builder.Services.Configure<SmtpSettings>(builder.Configuration.GetSection("SmtpSettings"));
builder.Services.AddTransient<IEmailService, EmailService>();


builder.Services.AddScoped(typeof(IRepositories<>), typeof(Repositories<>));
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddScoped<IWorkLocationService, WorkLocationService>();
builder.Services.AddScoped<IDepartmentService, DepartmentService>();
builder.Services.AddScoped<IDesignationService, DesignationService>();
builder.Services.AddScoped<IEmployeeBankDetailsService, EmployeeBankDetailsService>();
builder.Services.AddScoped<IEmployeePFDetailsService, EmployeePFDetailsService>();
builder.Services.AddScoped<IEmployeeTDSService, EmployeeTDSService>();
builder.Services.AddScoped<ILeaveService, LeaveService>();
builder.Services.AddScoped<ILeaveTypeService, LeaveTypeService>();
builder.Services.AddScoped<ILeaveManagementService, LeaveManagementService>();
builder.Services.AddScoped<IExpenseTypeService, ExpenseTypeService>();
builder.Services.AddScoped<IEmployeeStatutoryDetailsService, EmployeeStatutoryDetailsService>();
builder.Services.AddScoped<IEmployeeDocumentService, EmployeeDocumentService>();
builder.Services.AddScoped<IShiftService, ShiftService>();
builder.Services.AddScoped<ISalaryComponentService, SalaryComponentService>();
builder.Services.AddScoped<IStatutorySettingService, StatutorySettingService>();
builder.Services.AddScoped<ISalaryStructureService, SalaryStructureService>();
builder.Services.AddScoped<IAccessControlService, AccessControlService>();
builder.Services.AddScoped<ILoanApplicationService, LoanApplicationService>();
builder.Services.AddScoped<ILoanMasterService, LoanMasterService>();
builder.Services.AddScoped<IAttendanceService, AttendanceService>();
builder.Services.AddHostedService<AttendanceBackgroundWorker>();
builder.Services.AddScoped<ITaxAndComplianceService, TaxAndComplianceService>();
builder.Services.AddScoped<IProfessionalTaxSlabService, ProfessionalTaxSlabService>();
builder.Services.AddScoped<IExpenseClaimService, ExpenseClaimService>();
builder.Services.AddScoped<IOutdoorDutyService, OutdoorDutyService>();
builder.Services.AddScoped<IPayrollProcessingService, PayrollProcessingService>();
builder.Services.AddScoped<IAdvanceService, AdvanceService>();
builder.Services.AddScoped<IPayslipService, PayslipService>();

builder.Services.AddSignalR();
builder.Services.AddSingleton<IUserConnectionService, UserConnectionService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddHostedService<NotificationCleanupService>();
builder.Services.AddScoped<INotificationHelper, NotificationHelper>();
builder.Services.AddScoped<IHolidayService, HolidayService>();
builder.Services.AddScoped<ICompanyProfileService, CompanyProfileService>();
builder.Services.AddScoped<ITaxDeclarationService, TaxDeclarationService>();
builder.Services.AddScoped<ISalarySettingService, SalarySettingService>();
builder.Services.AddScoped<IComplianceReportService, ComplianceReportService>();
builder.Services.AddScoped<IBonusService, BonusService>();
builder.Services.AddScoped<IEmployeeReportService, EmployeeReportService>();
builder.Services.AddScoped<IForm16Service, Form16Service>();
builder.Services.AddScoped<ITaxCalculationService, TaxCalculationService>();
builder.Services.AddScoped<ICountryService, CountryService>();
builder.Services.AddScoped<IStateService, StateService>();
builder.Services.AddScoped<IVendorService, VendorService>();
builder.Services.AddScoped<IFileService, FileService>();

builder.Services.AddScoped<ICompanyService, CompanyService>();
builder.Services.AddScoped<IFileService, FileService>();

builder.Services.AddScoped<IDriveService, DriveService>();
builder.Services.AddScoped<IUserNoteService, UserNoteService>();
builder.Services.AddScoped<ICurrencyService, CurrencyService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IProductGroupService, ProductGroupService>();
builder.Services.AddScoped<IProductTypeService, ProductTypeService>();
builder.Services.AddScoped<IProductVariantService, ProductVariantService>();
builder.Services.AddScoped<IProductVersionService, ProductVersionService>();
builder.Services.AddScoped<IPartConditionService, PartConditionService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ICompanyGroupService, CompanyGroupService>();

builder.Services.AddScoped<IAccessoriesService, AccessoriesService>();
builder.Services.AddScoped<ICustomerService, CustomerService>();
builder.Services.AddScoped<IEnquiryService, EnquiryService>();
builder.Services.AddScoped<IInventoryService, InventoryService>();
builder.Services.AddScoped<IInstallationReportService, InstallationReportService>();
builder.Services.AddScoped<IQualityAssuranceService, QualityAssuranceService>();
builder.Services.AddScoped<IServiceReportService, ServiceReportService>();
builder.Services.AddScoped<IFaultReportService, FaultReportService>();
builder.Services.AddScoped<IOfferService, OfferService>();
builder.Services.AddScoped<IProformaInvoiceService, ProformaInvoiceService>();
builder.Services.AddScoped<IOrderAcceptanceService, OrderAcceptanceService>();
builder.Services.AddScoped<IPurchaseOrderService, PurchaseOrderService>();
builder.Services.AddScoped<IServiceMasterService, ServiceMasterService>();
builder.Services.AddScoped<ICrmDashboardService, CrmDashboardService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<IInvoiceService, InvoiceService>();
builder.Services.AddScoped<InvoiceExcelService>();
builder.Services.AddScoped<ProformaInvoiceExcelService>();
builder.Services.AddScoped<ICreditNoteService, CreditNoteService>();
builder.Services.AddScoped<CreditNoteExcelService>();
builder.Services.AddScoped<IDebitNoteService, DebitNoteService>();
builder.Services.AddScoped<DebitNoteExcelService>();
builder.Services.AddScoped<IOfferFollowUpReminderService, OfferFollowUpReminderService>();
builder.Services.AddHostedService<OfferFollowUpReminderHostedService>();

//HRMS
builder.Services.AddScoped<ILevelService, LevelService>();
builder.Services.AddScoped<ILeaveEncashmentService, LeaveEncashmentService>();
builder.Services.AddScoped<IGratuityService, GratuityService>();
builder.Services.AddScoped<IFnFService, FnFService>();
builder.Services.AddHttpClient<IWiseRateService, WiseRateService>();

//ERP
builder.Services.AddScoped<IShipmentModeService, ShipmentModeService>();
builder.Services.AddScoped<IShipmentTypeService, ShipmentTypeService>();
builder.Services.AddScoped<IAgencyTypeService, AgencyTypeService>();
builder.Services.AddScoped<IAgencyService, AgencyService>();
builder.Services.AddScoped<IShipmentInitiateService, ShipmentInitiateService>();
builder.Services.AddScoped<IShipmentAgencyAssignmentService, ShipmentAgencyAssignmentService>();
builder.Services.AddScoped<IShipmentEmailService, ShipmentEmailService>();
builder.Services.AddScoped<IShipmentUnderTransitService, ShipmentUnderTransitService>();
builder.Services.AddScoped<IForwarderBillService, ForwarderBillService>();
builder.Services.AddScoped<ICHABillService, CHABillService>();
builder.Services.AddScoped<ITransporterBillService, TransporterBillService>();
builder.Services.AddScoped<IShipmentReportService, ShipmentReportService>();
builder.Services.AddHostedService<ShipmentEtaNotificationService>();
builder.Services.AddScoped<IShipmentPaymentService, ShipmentPaymentService>();
builder.Services.AddScoped<IDispatchService, DispatchService>();


//inventory 
builder.Services.AddScoped<IProductAccessoryRuleService, ProductAccessoryRuleService>();
builder.Services.AddScoped<IProductBarcodeService, ProductBarcodeService>();
builder.Services.AddScoped<ISupplierService, SupplierService>();
builder.Services.AddScoped<ITaxService, TaxService>();
builder.Services.AddScoped<IUnitService, UnitService>();
builder.Services.AddScoped<IBrandService, BrandService>();
builder.Services.AddScoped<ILocationService, LocationService>();
builder.Services.AddScoped<IBranchService, BranchService>();
builder.Services.AddScoped<IWarehouseService, WarehouseService>();
builder.Services.AddScoped<IWarehouseService, WarehouseService>();
builder.Services.AddScoped<ICustomerService, CustomerService>();



//sm
builder.Services.AddScoped<IClientTypeService, ClientTypeService>();
builder.Services.AddScoped<IContactTypeService, ContactTypeService>();
builder.Services.AddScoped<IBDEUserService, BDEUserService>();
builder.Services.AddScoped<ISalesUserManagerService, SalesUserManagerService>();
builder.Services.AddScoped<IAddressTypeService, AddressTypeService>();
builder.Services.AddScoped<IPaymentTermService, PaymentTermService>();
builder.Services.AddScoped<IIndustryService, IndustryService>();
builder.Services.AddScoped<IPriceListService, PriceListService>();
builder.Services.AddScoped<IProductAccessoryPriceService, ProductAccessoryPriceService>();
builder.Services.AddScoped<IBundleService, BundleService>();
builder.Services.AddScoped<IBundleItemService, BundleItemService>();
builder.Services.AddScoped<IPaymentMethodService, PaymentMethodService>();
builder.Services.AddScoped<IReasonService, ReasonService>();
builder.Services.AddScoped<IDocumentSeriesService, DocumentSeriesService>();
builder.Services.AddScoped<IProductPriceService, ProductPriceService>();
builder.Services.AddScoped<IAccessoryPriceService, AccessoryPriceService>();

builder.Services.Configure<HostOptions>(options =>
{
    options.BackgroundServiceExceptionBehavior =
        BackgroundServiceExceptionBehavior.Ignore;
});

var app = builder.Build();


using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

    string[] roleNames = { "Admin", "HR", "Employee" };
    foreach (var roleName in roleNames)
    {
        if (!await roleManager.RoleExistsAsync(roleName))
        {
            await roleManager.CreateAsync(new IdentityRole(roleName));
        }
    }
    var adminEmail = "admin@lgmsports.com";
    if (await userManager.FindByEmailAsync(adminEmail) == null)
    {
        var adminEmployee = new Employees
        {
            EmployeeCode = "SYS",
            FirstName = "System",
            LastName = "Admin",
            EmailAddress = adminEmail,
            MobileNumber = "0000000000",
            DateOfJoining = DateTime.UtcNow,
            IsActive = true

        };

        var adminUser = new ApplicationUser
        {
            UserName = adminEmail,
            Email = adminEmail,
            EmailConfirmed = true,
            Employee = adminEmployee
        };

        var result = await userManager.CreateAsync(adminUser, "Password@123");

        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(adminUser, "Admin");
        }
    }
}

app.UseSwagger();
app.UseSwaggerUI();

// ✅ FIRST

app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers["Access-Control-Allow-Origin"] = "*";
        ctx.Context.Response.Headers["Access-Control-Allow-Headers"] = "*";
        ctx.Context.Response.Headers["Access-Control-Allow-Methods"] = "*";
    }
});

app.UseWhen(context =>
    context.Request.Path.StartsWithSegments("/iclock"),
    appBuilder => { }
);

app.UseRouting();

app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();


app.MapControllers();

app.MapHub<NotificationHub>("/notificationHub");

app.Run();
