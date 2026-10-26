    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Logging;
    using CompanyPlatform.Core.Data;
    using CompanyPlatform.Core.DTO.AccessControl;

    namespace CompanyPlatform.Core.Services.AccessControl
    {
        public class AccessControlService : IAccessControlService
        {
            private readonly ApplicationDBContext _context;

            private static readonly Dictionary<string, List<string>> SystemForms =
        new Dictionary<string, List<string>>(StringComparer.OrdinalIgnoreCase)
        {
            ["CRM"] = new List<string>
        {
            "Dashboard",
            "Company",            
            "Vendor",
            "Customer",
            "Product",
            "ServiceMaster",
            "Accessories",
            "QAMaster",
            "Inventory",
            "Enquiry",
            "Offers",
            "OrderAcceptance",
            "PurchaseOrder",
            "ProformaInvoice",
            "Invoice",
            "InstallationReport",
            "ServiceReport",
            "FaultReport",
            "Currency",
            "OfferReport",
            "OrderAcceptanceReport",
            "PurchaseOrderReport",
            "ProformaInvoiceReport",
            "InvoiceReport",
            "CreditNote",
            "DebitNote",
        },

            ["HRMS"] = new List<string>
        {
            "Dashboard","Employee","LevelMaster","Attendance","LeaveManagement","OutDoorDuty",
            "AccessControl","BasicMasters","CountryMaster","StateMaster","Category",
            "ProductGroup","ProductType","ProductVariant","ProductVersion", "PartCondition",
            "LeaveMasters","LeaveAdmin","ExpenseType","LoanTypeMaster",
            "SalaryComponent","StatutorySetting","ProfessionalTaxSlab","Holiday",
            "CompanyProfile","SalarySetting","IncomeTaxSlab",
            "SalaryStructure","PayrollProcess","LeaveEncashment","Gratuity","InvestmentDeclaration","TaxCompliance","Payslip",
            "Bonuse","Advance Management","ExpenseClaims","Form16","FnFManager","MultiLocation","Report"
        },

            ["ERP"] = new List<string>
        {
            "Dashboard","ShipmentMode","AgencyType", "Agency","ShipmentInitiate","ShipmentAgencyAssignment","ShipmentUnderTransit",
            "ForwarderBill","CHABill","TransporterBill", "ShipmentPayment", "ShipmentInitiateReport","ShipmentTransitStatusReport","ShipmentLandedCostReport",
            "Dispatch",
        }
        };



            private readonly ILogger<AccessControlService> _logger;

            public AccessControlService(ApplicationDBContext context, ILogger<AccessControlService> logger)
            {
                _context = context;
                _logger = logger;
            }

       

            public async Task<List<AccessControlDto>> GetPermissionsByRoleAndSystemAsync(string roleId, string systemName)
            {
                var forms = SystemForms.ContainsKey(systemName)
                    ? SystemForms[systemName]
                    : new List<string>();

                var existingPermissions = await _context.Tbl_AccessControls
                    .Where(p => p.RoleId == roleId &&
                                p.SystemName.ToLower() == systemName.ToLower() &&
                                p.IsDeleted == false)
                    .ToListAsync();

                var result = new List<AccessControlDto>();

                foreach (var formName in forms)
                {
                    var permission = existingPermissions
                        .FirstOrDefault(p => p.FormName.ToLower() == formName.ToLower());

                    result.Add(new AccessControlDto
                    {
                        SystemName = systemName,
                        FormName = formName,
                        CanView = permission?.CanView ?? false,
                        CanAdd = permission?.CanAdd ?? false,
                        CanEdit = permission?.CanEdit ?? false,
                        CanDelete = permission?.CanDelete ?? false
                    });
                }

                return result;
            }


            public async Task<List<AccessControlDto>> GetAllPermissionsByRoleAsync(string roleId)
            {
                _logger.LogInformation("Fetching all permissions for RoleId: {RoleId}", roleId);

                return await _context.Tbl_AccessControls
                    .Where(ac => ac.RoleId == roleId)
                    .Select(ac => new AccessControlDto
                    {
                        SystemName = ac.SystemName,
                        FormName = ac.FormName,
                        CanView = ac.CanView,
                        CanAdd = ac.CanAdd,
                        CanEdit = ac.CanEdit,
                        CanDelete = ac.CanDelete
                    })
                    .ToListAsync();
            }

       
            public async Task UpdatePermissionsAsync(string roleId, string systemName, List<AccessControlDto> permissions)
            {
                var existingPermissions = await _context.Tbl_AccessControls
                    .Where(ac => ac.RoleId == roleId && ac.SystemName == systemName)
                    .ToListAsync();

                foreach (var dto in permissions)
                {
                    var existing = existingPermissions
                        .FirstOrDefault(p => p.FormName.ToLower() == dto.FormName.ToLower());

                    if (existing != null)
                    {
                        existing.CanView = dto.CanView;
                        existing.CanAdd = dto.CanAdd;
                        existing.CanEdit = dto.CanEdit;
                        existing.CanDelete = dto.CanDelete;
                        existing.IsDeleted = false; // 🔥 restore if previously deleted
                    }
                    else
                    {
                        await _context.Tbl_AccessControls.AddAsync(new Models.AccessControl
                        {
                            RoleId = roleId,
                            SystemName = systemName,
                            FormName = dto.FormName,
                            CanView = dto.CanView,
                            CanAdd = dto.CanAdd,
                            CanEdit = dto.CanEdit,
                            CanDelete = dto.CanDelete,
                            IsDeleted = false
                        });
                    }
                }

                await _context.SaveChangesAsync();
            }

            public async Task DeletePermissionAsync(string roleId, string systemName, string formName)
            {
                var permission = await _context.Tbl_AccessControls
                    .FirstOrDefaultAsync(p =>
                        p.RoleId == roleId &&
                        p.SystemName.ToLower() == systemName.ToLower() &&
                        p.FormName.ToLower() == formName.ToLower());

                if (permission != null)
                {
                    permission.IsDeleted = true;
                    await _context.SaveChangesAsync();
                }
            }


        }
    }