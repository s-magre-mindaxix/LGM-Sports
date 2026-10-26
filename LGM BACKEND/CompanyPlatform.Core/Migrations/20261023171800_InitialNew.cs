using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CompanyPlatform.Core.Migrations
{
    /// <inheritdoc />
    public partial class InitialNew : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "bde_user",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_bde_user", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Brand",
                columns: table => new
                {
                    BrandId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BrandCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    BrandName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Brand", x => x.BrandId);
                });

            migrationBuilder.CreateTable(
                name: "Bundles",
                columns: table => new
                {
                    BundleId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    ParentProductId = table.Column<int>(type: "int", nullable: false),
                    PackagePrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TaxMode = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    EffectiveFrom = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EffectiveTo = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bundles", x => x.BundleId);
                });

            migrationBuilder.CreateTable(
                name: "Category",
                columns: table => new
                {
                    CategoryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CategoryName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    ParentCategoryId = table.Column<int>(type: "int", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Category", x => x.CategoryId);
                    table.ForeignKey(
                        name: "FK_Category_Category_ParentCategoryId",
                        column: x => x.ParentCategoryId,
                        principalTable: "Category",
                        principalColumn: "CategoryId");
                });

            migrationBuilder.CreateTable(
                name: "PaymentMethods",
                columns: table => new
                {
                    PaymentMethodId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentMethods", x => x.PaymentMethodId);
                });

            migrationBuilder.CreateTable(
                name: "ProductAccessoryPrices",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PriceListId = table.Column<int>(type: "int", nullable: false),
                    ItemId = table.Column<int>(type: "int", nullable: false),
                    ItemType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    PriceType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MinQty = table.Column<int>(type: "int", nullable: false),
                    EffectiveFrom = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EffectiveTo = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductAccessoryPrices", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Reasons",
                columns: table => new
                {
                    ReasonId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    ReasonType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reasons", x => x.ReasonId);
                });

            migrationBuilder.CreateTable(
                name: "SalarySettingPercentage",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ComponentName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Percentage = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    FixedAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    CalculationBase = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsApplicable = table.Column<bool>(type: "bit", nullable: false),
                    EffectiveFrom = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EffectiveTo = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalarySettingPercentage", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "sales_user_manager",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sales_user_manager", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Tax",
                columns: table => new
                {
                    TaxId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TaxCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TaxName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Rate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TaxType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    EffectiveFrom = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EffectiveTo = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tax", x => x.TaxId);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_AccessoryLogs",
                columns: table => new
                {
                    LogId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AccessoryId = table.Column<int>(type: "int", nullable: false),
                    ActionType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_AccessoryLogs", x => x.LogId);
                });

            migrationBuilder.CreateTable(
                name: "tbl_AddressType",
                columns: table => new
                {
                    AddressTypeId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AddressTypeName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AddressTypeCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_AddressType", x => x.AddressTypeId);
                });

            migrationBuilder.CreateTable(
                name: "tbl_AgencyType",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AgencyTypeName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_AgencyType", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tbl_ClientType",
                columns: table => new
                {
                    ClientTypeId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClientTypeName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ClientTypeCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_ClientType", x => x.ClientTypeId);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_Companies",
                columns: table => new
                {
                    CompanyId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CompanyName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    LegalName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CompanyShortName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    LogoPath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PAN = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TAN = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GSTIN = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CIN = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_Companies", x => x.CompanyId);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_CompanyGroups",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyGroupName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_CompanyGroups", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tbl_CompanyProfile",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PAN = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TAN = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CittdsAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SignatoryName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SignatoryDesignation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_CompanyProfile", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "tbl_ComplianceFilingStatus",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ComplianceType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Year = table.Column<int>(type: "int", nullable: false),
                    Month = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    DueDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FiledDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TransactionId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_ComplianceFilingStatus", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tbl_ContactType",
                columns: table => new
                {
                    ContactTypeId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Value = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_ContactType", x => x.ContactTypeId);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_Countries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CountryName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CountryCode = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_Countries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_CreditNote",
                columns: table => new
                {
                    CreditNoteId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreditNoteNo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreditNoteDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    InvoiceId = table.Column<int>(type: "int", nullable: false),
                    InvoiceNo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    InvoiceDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    InvoiceDueDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CustomerPo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CompanyPoDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ConsigneeNameAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SubTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    FreightCharges = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GrandTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AdvanceAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AdvanceReceived = table.Column<bool>(type: "bit", nullable: false),
                    BalanceAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ProductGroupId = table.Column<int>(type: "int", nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    VendorId = table.Column<int>(type: "int", nullable: false),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    CompanyGroupId = table.Column<int>(type: "int", nullable: false),
                    ResponsiblePersonId = table.Column<int>(type: "int", nullable: true),
                    CurrencyId = table.Column<int>(type: "int", nullable: false),
                    PlaceOfSupplyId = table.Column<int>(type: "int", nullable: false),
                    BankDetailId = table.Column<int>(type: "int", nullable: false),
                    ServiceId = table.Column<int>(type: "int", nullable: true),
                    ServiceReportId = table.Column<int>(type: "int", nullable: true),
                    TermsConditions = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CustomerNotes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FinalNote = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreditNoteAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    RemainingBalanceAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreditReason = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_CreditNote", x => x.CreditNoteId);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_Currencies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CurrencyName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CurrencySymbol = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CurrencyValue = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_Currencies", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_CurrencyHistory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CurrencyCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Rate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_CurrencyHistory", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_DebitNote",
                columns: table => new
                {
                    DebitNoteId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DebitNoteNo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DebitNoteDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    InvoiceId = table.Column<int>(type: "int", nullable: false),
                    InvoiceNo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    InvoiceDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    InvoiceDueDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CustomerPo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CompanyPoDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ConsigneeNameAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SubTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    FreightCharges = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GrandTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AdvanceAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AdvanceReceived = table.Column<bool>(type: "bit", nullable: false),
                    BalanceAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ProductGroupId = table.Column<int>(type: "int", nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    VendorId = table.Column<int>(type: "int", nullable: false),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    CompanyGroupId = table.Column<int>(type: "int", nullable: false),
                    ResponsiblePersonId = table.Column<int>(type: "int", nullable: true),
                    CurrencyId = table.Column<int>(type: "int", nullable: false),
                    PlaceOfSupplyId = table.Column<int>(type: "int", nullable: false),
                    BankDetailId = table.Column<int>(type: "int", nullable: false),
                    ServiceId = table.Column<int>(type: "int", nullable: true),
                    ServiceReportId = table.Column<int>(type: "int", nullable: true),
                    TermsConditions = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CustomerNotes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FinalNote = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DebitNoteAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AdjustAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    UpdatedBalanceAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DebitReason = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_DebitNote", x => x.DebitNoteId);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Department",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DepartmentName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Department", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Designation",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DesignationName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Designation", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_Dispatch",
                columns: table => new
                {
                    DispatchId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ShipmentInitiateId = table.Column<int>(type: "int", nullable: false),
                    ShipmentNo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CustomerId = table.Column<int>(type: "int", nullable: true),
                    CustomerName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DispatchDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    MaterialDispatch = table.Column<bool>(type: "bit", nullable: false),
                    DocketNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeliveredDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeliveredOnDate = table.Column<bool>(type: "bit", nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_Dispatch", x => x.DispatchId);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_DriveFolders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ParentFolderId = table.Column<int>(type: "int", nullable: true),
                    UserId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_DriveFolders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tbl_DriveFolders_Tbl_DriveFolders_ParentFolderId",
                        column: x => x.ParentFolderId,
                        principalTable: "Tbl_DriveFolders",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "tbl_ExpenseType",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExpenseTypeName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_ExpenseType", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Holiday",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Year = table.Column<int>(type: "int", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Holiday", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Industry",
                columns: table => new
                {
                    IndustryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IndustryName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IndustryCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Industry", x => x.IndustryId);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_InventoryTransactions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ItemType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ItemId = table.Column<int>(type: "int", nullable: false),
                    TransactionType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    PreviousStock = table.Column<int>(type: "int", nullable: false),
                    NewStock = table.Column<int>(type: "int", nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ShipmentInitiateId = table.Column<int>(type: "int", nullable: true),
                    ShipmentUnderTransitId = table.Column<int>(type: "int", nullable: true),
                    PurchaseOrderId = table.Column<int>(type: "int", nullable: true),
                    InvoiceId = table.Column<int>(type: "int", nullable: true),
                    DispatchId = table.Column<int>(type: "int", nullable: true),
                    ReferenceNo = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_InventoryTransactions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tbl_LeaveType",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LeaveTypeName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_LeaveType", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "tbl_LevelMasters",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LevelName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LevelOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_LevelMasters", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_LoanMasters",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LoanTypeName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_LoanMasters", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_Offers",
                columns: table => new
                {
                    OfferId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EnquiryId = table.Column<int>(type: "int", nullable: true),
                    OfferNo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EnquiryNo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OfferDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ProductGroupId = table.Column<int>(type: "int", nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    VendorId = table.Column<int>(type: "int", nullable: true),
                    CompanyGroupId = table.Column<int>(type: "int", nullable: false),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    ResponsiblePersonId = table.Column<int>(type: "int", nullable: false),
                    AssignedToEmployeeId = table.Column<int>(type: "int", nullable: false),
                    CurrencyId = table.Column<int>(type: "int", nullable: false),
                    PlaceOfSupplyId = table.Column<int>(type: "int", nullable: false),
                    BankDetailId = table.Column<int>(type: "int", nullable: false),
                    ServiceId = table.Column<int>(type: "int", nullable: true),
                    Subtotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    FreightCharges = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GrandTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GSTApplicable = table.Column<bool>(type: "bit", nullable: false),
                    TermsConditions = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CustomerNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    Source = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NextFollowUpDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FollowUpReminderSent = table.Column<bool>(type: "bit", nullable: true),
                    FinalNote = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_Offers", x => x.OfferId);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_OrderAcceptances",
                columns: table => new
                {
                    OrderAcceptanceId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GaxcePurchaseOrderNo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CustomerOrderNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CustomerOrderDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ServiceId = table.Column<int>(type: "int", nullable: true),
                    OrderDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    InvoiceNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    InvoiceDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    OfferCreateDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    OfferExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompanyCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    VendorCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CustomerId = table.Column<int>(type: "int", nullable: true),
                    VendorId = table.Column<int>(type: "int", nullable: true),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    ProductGroupId = table.Column<int>(type: "int", nullable: true),
                    CompanyGroupId = table.Column<int>(type: "int", nullable: true),
                    CurrencyId = table.Column<int>(type: "int", nullable: true),
                    PlaceOfSupplyId = table.Column<int>(type: "int", nullable: true),
                    BankDetailId = table.Column<int>(type: "int", nullable: true),
                    ResponsiblePersonId = table.Column<int>(type: "int", nullable: true),
                    AssignedToEmployeeId = table.Column<int>(type: "int", nullable: true),
                    Subtotal = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    FreightCharges = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    GrandTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TermsConditions = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CustomerNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GstApplicable = table.Column<bool>(type: "bit", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FinalNote = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_OrderAcceptances", x => x.OrderAcceptanceId);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_PartConditions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PartConditionName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_PartConditions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tbl_PaymentTerm",
                columns: table => new
                {
                    PaymentTermId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PaymentTermName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PaymentTermCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_PaymentTerm", x => x.PaymentTermId);
                });

            migrationBuilder.CreateTable(
                name: "tbl_PayrollRun",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Year = table.Column<int>(type: "int", nullable: false),
                    Month = table.Column<int>(type: "int", nullable: false),
                    ProcessedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProcessedByUserID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_PayrollRun", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_ProductGroups",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GroupName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_ProductGroups", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_ProductTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductTypeName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_ProductTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_ProductVersions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VersionName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_ProductVersions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tbl_ProfessionalTaxSlab",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    State = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Gender = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    MinGrossSalary = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MaxGrossSalary = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TaxAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_ProfessionalTaxSlab", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_PurchaseOrders",
                columns: table => new
                {
                    PurchaseOrderId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderAcceptanceId = table.Column<int>(type: "int", nullable: true),
                    PurchaseOrderNo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    GaxcePurchaseOrderNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CustomerOrderNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CustomerOrderDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PurchaseOrderDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    InvoiceNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    InvoiceDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    OfferCreateDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    OfferExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompanyCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    VendorCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CustomerId = table.Column<int>(type: "int", nullable: true),
                    VendorId = table.Column<int>(type: "int", nullable: true),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    ProductGroupId = table.Column<int>(type: "int", nullable: true),
                    CompanyGroupId = table.Column<int>(type: "int", nullable: true),
                    CurrencyId = table.Column<int>(type: "int", nullable: true),
                    PlaceOfSupplyId = table.Column<int>(type: "int", nullable: true),
                    BankDetailId = table.Column<int>(type: "int", nullable: true),
                    ResponsiblePersonId = table.Column<int>(type: "int", nullable: true),
                    AssignedToEmployeeId = table.Column<int>(type: "int", nullable: true),
                    Subtotal = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    FreightCharges = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    GrandTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    NextFollowUpDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TermsConditions = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CustomerNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FinalNote = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_PurchaseOrders", x => x.PurchaseOrderId);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_QualityAssurance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ItemType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ItemId = table.Column<int>(type: "int", nullable: false),
                    ItemName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ItemCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ShipmentInitiateId = table.Column<int>(type: "int", nullable: true),
                    ShipmentUnderTransitId = table.Column<int>(type: "int", nullable: true),
                    PurchaseOrderId = table.Column<int>(type: "int", nullable: true),
                    ShipmentNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PurchaseOrderNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ActionDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_QualityAssurance", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tbl_SalaryComponent",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ComponentName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ComponentType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsTaxable = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_SalaryComponent", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_ScrapItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ItemType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ItemId = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ScrapDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_ScrapItems", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_ServiceMaster",
                columns: table => new
                {
                    ServiceId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ServiceDescription = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ServicePartNo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ServicePrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SACCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_ServiceMaster", x => x.ServiceId);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Shift",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ShiftName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    StartTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    EndTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Shift", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tbl_ShipmentMode",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ModeName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ModeCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_ShipmentMode", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tbl_StatutorySetting",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SettingName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SettingValue = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EffectiveDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_StatutorySetting", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tbl_TaxSlabs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FinancialYear = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    TaxRegime = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CitizenType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FromAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ToAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    RatePercentage = table.Column<decimal>(type: "decimal(5,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_TaxSlabs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_UserNotes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    GradientClass = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AuthorRole = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_UserNotes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_Vendors",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VendorName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    VendorCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    VendorShortName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    VendorDivision = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    VendorLogo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    VendorPAN = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    VendorTAN = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    VATNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MSMENo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GSTIN = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CIN = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_Vendors", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tbl_WorkLocation",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LocationName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LocationCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    City = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    State = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Pincode = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_WorkLocation", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Unit",
                columns: table => new
                {
                    UnitId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UnitCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    UnitName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    DecimalAllowed = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Unit", x => x.UnitId);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_AccessControls",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    SystemName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    FormName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CanView = table.Column<bool>(type: "bit", nullable: false),
                    CanAdd = table.Column<bool>(type: "bit", nullable: false),
                    CanEdit = table.Column<bool>(type: "bit", nullable: false),
                    CanDelete = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_AccessControls", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tbl_AccessControls_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Agency",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AgencyName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AgencyCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AgencyTypeId = table.Column<int>(type: "int", nullable: false),
                    AgencyShortName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AgencyLogo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PANNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TANNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GSTIN = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CINNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IATACode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FMCCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LicenseNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Website = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Agency", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_Agency_tbl_AgencyType_AgencyTypeId",
                        column: x => x.AgencyTypeId,
                        principalTable: "tbl_AgencyType",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Branch",
                columns: table => new
                {
                    BranchId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    BranchCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    BranchName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    Contact = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Branch", x => x.BranchId);
                    table.ForeignKey(
                        name: "FK_Branch_Tbl_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Tbl_Companies",
                        principalColumn: "CompanyId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_CompanyAddresses",
                columns: table => new
                {
                    AddressId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    AddressType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FlatBlock = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Premises = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Road = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Area = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Town = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PinCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Country = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    State = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MobileNo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AltMobileNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AltEmail = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_CompanyAddresses", x => x.AddressId);
                    table.ForeignKey(
                        name: "FK_Tbl_CompanyAddresses_Tbl_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Tbl_Companies",
                        principalColumn: "CompanyId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_CompanyBankDetails",
                columns: table => new
                {
                    BankDetailId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    BankName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BankAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AccountNo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IFSC = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SwiftCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IBAN = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AccountHolderName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_CompanyBankDetails", x => x.BankDetailId);
                    table.ForeignKey(
                        name: "FK_Tbl_CompanyBankDetails_Tbl_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Tbl_Companies",
                        principalColumn: "CompanyId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_CompanyDirectors",
                columns: table => new
                {
                    DirectorId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    DirectorName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Designation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MobileNo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DocsAttachmentPath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PresentationPPTPath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Website = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_CompanyDirectors", x => x.DirectorId);
                    table.ForeignKey(
                        name: "FK_Tbl_CompanyDirectors_Tbl_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Tbl_Companies",
                        principalColumn: "CompanyId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Customer",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustomerName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    CustomerCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CustomerShortName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Branch = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PlantCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CompanyGroupId = table.Column<int>(type: "int", nullable: false),
                    VendorCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ForeignVendorCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CustomerPAN = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    CustomerTAN = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    GSTIN = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: true),
                    CIN = table.Column<string>(type: "nvarchar(25)", maxLength: 25, nullable: true),
                    MSMENo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CustomerMobile = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    CustomerEmail = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    BillingAddress = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ShippingAddress = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DocsAttachment = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Customer", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_Customer_Tbl_CompanyGroups_CompanyGroupId",
                        column: x => x.CompanyGroupId,
                        principalTable: "Tbl_CompanyGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_States",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StateName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CountryId = table.Column<int>(type: "int", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_States", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tbl_States_Tbl_Countries_CountryId",
                        column: x => x.CountryId,
                        principalTable: "Tbl_Countries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_CreditNoteItem",
                columns: table => new
                {
                    CreditNoteItemId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreditNoteId = table.Column<int>(type: "int", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: true),
                    AccessoryId = table.Column<int>(type: "int", nullable: true),
                    ItemType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HsnSacCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Quantity = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Rate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Discount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Total = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GstAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CgstAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SgstAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IgstAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TaxPercentage = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_CreditNoteItem", x => x.CreditNoteItemId);
                    table.ForeignKey(
                        name: "FK_Tbl_CreditNoteItem_Tbl_CreditNote_CreditNoteId",
                        column: x => x.CreditNoteId,
                        principalTable: "Tbl_CreditNote",
                        principalColumn: "CreditNoteId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PriceLists",
                columns: table => new
                {
                    PriceListId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    CustomerChannelType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Id = table.Column<int>(type: "int", nullable: false),
                    EffectiveFrom = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EffectiveTo = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PriceLists", x => x.PriceListId);
                    table.ForeignKey(
                        name: "FK_PriceLists_Tbl_Currencies_Id",
                        column: x => x.Id,
                        principalTable: "Tbl_Currencies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_DebitNoteItem",
                columns: table => new
                {
                    DebitNoteItemId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DebitNoteId = table.Column<int>(type: "int", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: true),
                    AccessoryId = table.Column<int>(type: "int", nullable: true),
                    ItemType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HsnSacCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Quantity = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Rate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Discount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Total = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GstAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CgstAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SgstAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IgstAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TaxPercentage = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_DebitNoteItem", x => x.DebitNoteItemId);
                    table.ForeignKey(
                        name: "FK_Tbl_DebitNoteItem_Tbl_DebitNote_DebitNoteId",
                        column: x => x.DebitNoteId,
                        principalTable: "Tbl_DebitNote",
                        principalColumn: "DebitNoteId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_DispatchDetails",
                columns: table => new
                {
                    DispatchDetailId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DispatchId = table.Column<int>(type: "int", nullable: false),
                    OrderAcceptanceId = table.Column<int>(type: "int", nullable: false),
                    DispatchNo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CustomerName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsSelected = table.Column<bool>(type: "bit", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_DispatchDetails", x => x.DispatchDetailId);
                    table.ForeignKey(
                        name: "FK_Tbl_DispatchDetails_Tbl_Dispatch_DispatchId",
                        column: x => x.DispatchId,
                        principalTable: "Tbl_Dispatch",
                        principalColumn: "DispatchId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_DispatchItems",
                columns: table => new
                {
                    DispatchItemId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DispatchId = table.Column<int>(type: "int", nullable: false),
                    BoxNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NetWeightKg = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GrossWeightKg = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    LengthCm = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    WidthCm = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    HeightCm = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CBM = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_DispatchItems", x => x.DispatchItemId);
                    table.ForeignKey(
                        name: "FK_Tbl_DispatchItems_Tbl_Dispatch_DispatchId",
                        column: x => x.DispatchId,
                        principalTable: "Tbl_Dispatch",
                        principalColumn: "DispatchId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_DispatchStockItems",
                columns: table => new
                {
                    DispatchStockItemId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DispatchId = table.Column<int>(type: "int", nullable: false),
                    ItemType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: true),
                    AccessoryId = table.Column<int>(type: "int", nullable: true),
                    ItemCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Qty = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_DispatchStockItems", x => x.DispatchStockItemId);
                    table.ForeignKey(
                        name: "FK_Tbl_DispatchStockItems_Tbl_Dispatch_DispatchId",
                        column: x => x.DispatchId,
                        principalTable: "Tbl_Dispatch",
                        principalColumn: "DispatchId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_DriveFiles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FileName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FilePath = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FileType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    FolderId = table.Column<int>(type: "int", nullable: true),
                    UserId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UploadedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DepartmentId = table.Column<int>(type: "int", nullable: true),
                    UploadedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_DriveFiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tbl_DriveFiles_Tbl_DriveFolders_FolderId",
                        column: x => x.FolderId,
                        principalTable: "Tbl_DriveFolders",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Tbl_OfferItems",
                columns: table => new
                {
                    OfferItemId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OfferId = table.Column<int>(type: "int", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: true),
                    AccessoryId = table.Column<int>(type: "int", nullable: true),
                    ServiceId = table.Column<int>(type: "int", nullable: true),
                    ServicePartNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ItemType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HsnSacCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Rate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    LiveConversionRate = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Discount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TaxPercentage = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Total = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GstAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CgstAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    SgstAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    IgstAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    FinalPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_OfferItems", x => x.OfferItemId);
                    table.ForeignKey(
                        name: "FK_Tbl_OfferItems_Tbl_Offers_OfferId",
                        column: x => x.OfferId,
                        principalTable: "Tbl_Offers",
                        principalColumn: "OfferId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_OfferNotes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OfferId = table.Column<int>(type: "int", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByEmployeeId = table.Column<int>(type: "int", nullable: false),
                    AuthorName = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_OfferNotes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tbl_OfferNotes_Tbl_Offers_OfferId",
                        column: x => x.OfferId,
                        principalTable: "Tbl_Offers",
                        principalColumn: "OfferId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_OfferVersions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OfferId = table.Column<int>(type: "int", nullable: false),
                    SnapshotDataJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    VersionNumber = table.Column<int>(type: "int", nullable: false),
                    SavedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SavedByEmployeeId = table.Column<int>(type: "int", nullable: false),
                    AuthorName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StatusAtMoment = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_OfferVersions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tbl_OfferVersions_Tbl_Offers_OfferId",
                        column: x => x.OfferId,
                        principalTable: "Tbl_Offers",
                        principalColumn: "OfferId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_OrderAcceptanceItems",
                columns: table => new
                {
                    OrderAcceptanceItemId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderAcceptanceId = table.Column<int>(type: "int", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: true),
                    AccessoryId = table.Column<int>(type: "int", nullable: true),
                    ServiceId = table.Column<int>(type: "int", nullable: true),
                    ServicePartNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ItemType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HsnSacCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Rate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Discount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TaxPercentage = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Total = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GstAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CgstAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    SgstAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    IgstAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    FinalPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_OrderAcceptanceItems", x => x.OrderAcceptanceItemId);
                    table.ForeignKey(
                        name: "FK_Tbl_OrderAcceptanceItems_Tbl_OrderAcceptances_OrderAcceptanceId",
                        column: x => x.OrderAcceptanceId,
                        principalTable: "Tbl_OrderAcceptances",
                        principalColumn: "OrderAcceptanceId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_OrderAcceptanceNotes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderAcceptanceId = table.Column<int>(type: "int", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByEmployeeId = table.Column<int>(type: "int", nullable: false),
                    AuthorName = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_OrderAcceptanceNotes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tbl_OrderAcceptanceNotes_Tbl_OrderAcceptances_OrderAcceptanceId",
                        column: x => x.OrderAcceptanceId,
                        principalTable: "Tbl_OrderAcceptances",
                        principalColumn: "OrderAcceptanceId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_OrderAcceptanceOffers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderAcceptanceId = table.Column<int>(type: "int", nullable: false),
                    OfferId = table.Column<int>(type: "int", nullable: false),
                    CustomerId = table.Column<int>(type: "int", nullable: true),
                    VendorId = table.Column<int>(type: "int", nullable: true),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    ProductGroupId = table.Column<int>(type: "int", nullable: true),
                    CompanyGroupId = table.Column<int>(type: "int", nullable: true),
                    CurrencyId = table.Column<int>(type: "int", nullable: true),
                    PlaceOfSupplyId = table.Column<int>(type: "int", nullable: true),
                    BankDetailId = table.Column<int>(type: "int", nullable: true),
                    ResponsiblePersonId = table.Column<int>(type: "int", nullable: true),
                    AssignedToEmployeeId = table.Column<int>(type: "int", nullable: true),
                    OfferCreateDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    OfferExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TermsConditions = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OrderDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompanyCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    VendorCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FreightCharges = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    CustomerNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ServiceId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_OrderAcceptanceOffers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tbl_OrderAcceptanceOffers_Tbl_Offers_OfferId",
                        column: x => x.OfferId,
                        principalTable: "Tbl_Offers",
                        principalColumn: "OfferId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Tbl_OrderAcceptanceOffers_Tbl_OrderAcceptances_OrderAcceptanceId",
                        column: x => x.OrderAcceptanceId,
                        principalTable: "Tbl_OrderAcceptances",
                        principalColumn: "OrderAcceptanceId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_PurchaseOrderItems",
                columns: table => new
                {
                    PurchaseOrderItemId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PurchaseOrderId = table.Column<int>(type: "int", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: true),
                    AccessoryId = table.Column<int>(type: "int", nullable: true),
                    ItemType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HsnSacCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Rate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Discount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TaxPercentage = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Total = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CgstAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    SgstAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    IgstAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    GstAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    FinalPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SourceOA = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ProductSource = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_PurchaseOrderItems", x => x.PurchaseOrderItemId);
                    table.ForeignKey(
                        name: "FK_Tbl_PurchaseOrderItems_Tbl_PurchaseOrders_PurchaseOrderId",
                        column: x => x.PurchaseOrderId,
                        principalTable: "Tbl_PurchaseOrders",
                        principalColumn: "PurchaseOrderId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_PurchaseOrderOffers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PurchaseOrderId = table.Column<int>(type: "int", nullable: false),
                    OfferId = table.Column<int>(type: "int", nullable: false),
                    CustomerId = table.Column<int>(type: "int", nullable: true),
                    VendorId = table.Column<int>(type: "int", nullable: true),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    ProductGroupId = table.Column<int>(type: "int", nullable: true),
                    CompanyGroupId = table.Column<int>(type: "int", nullable: true),
                    CurrencyId = table.Column<int>(type: "int", nullable: true),
                    PlaceOfSupplyId = table.Column<int>(type: "int", nullable: true),
                    BankDetailId = table.Column<int>(type: "int", nullable: true),
                    ResponsiblePersonId = table.Column<int>(type: "int", nullable: true),
                    AssignedToEmployeeId = table.Column<int>(type: "int", nullable: true),
                    OfferCreateDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    OfferExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompanyCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    VendorCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FreightCharges = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    CustomerNotes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    GaxcePurchaseOrderNo = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_PurchaseOrderOffers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tbl_PurchaseOrderOffers_Tbl_PurchaseOrders_PurchaseOrderId",
                        column: x => x.PurchaseOrderId,
                        principalTable: "Tbl_PurchaseOrders",
                        principalColumn: "PurchaseOrderId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_ShipmentInitiates",
                columns: table => new
                {
                    ShipmentInitiateId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ShipmentNo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SourceType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OrderAcceptanceId = table.Column<int>(type: "int", nullable: true),
                    PurchaseOrderId = table.Column<int>(type: "int", nullable: true),
                    SourceDocumentNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CustomerId = table.Column<int>(type: "int", nullable: true),
                    CustomerName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GSTNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConsigneeAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ShipperAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    InvoiceValue = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    CurrencyId = table.Column<int>(type: "int", nullable: true),
                    CurrencyName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ShipmentModeId = table.Column<int>(type: "int", nullable: false),
                    InvoiceNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    InvoiceDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ImportPackingList = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImportPackingDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ShipmentDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TotalNetWeightKg = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalGrossWeightKg = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalCBM = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_ShipmentInitiates", x => x.ShipmentInitiateId);
                    table.ForeignKey(
                        name: "FK_Tbl_ShipmentInitiates_tbl_ShipmentMode_ShipmentModeId",
                        column: x => x.ShipmentModeId,
                        principalTable: "tbl_ShipmentMode",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "tbl_ShipmentType",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ShipmentModeId = table.Column<int>(type: "int", nullable: false),
                    TypeName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TypeCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_ShipmentType", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_ShipmentType_tbl_ShipmentMode_ShipmentModeId",
                        column: x => x.ShipmentModeId,
                        principalTable: "tbl_ShipmentMode",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_VendorBankDetails",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VendorId = table.Column<int>(type: "int", nullable: false),
                    BankName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BankAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmailAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AccountNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IFSCCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AccountHolderName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SwiftCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IBANNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_VendorBankDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tbl_VendorBankDetails_Tbl_Vendors_VendorId",
                        column: x => x.VendorId,
                        principalTable: "Tbl_Vendors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_VendorContacts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VendorId = table.Column<int>(type: "int", nullable: false),
                    PersonName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Designation = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MobileNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmailAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DocsAttachment = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_VendorContacts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tbl_VendorContacts_Tbl_Vendors_VendorId",
                        column: x => x.VendorId,
                        principalTable: "Tbl_Vendors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Employee",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MiddleName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DateOfBirth = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Gender = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MobileNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EmailAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PresentAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DateOfJoining = table.Column<DateTime>(type: "datetime2", nullable: true),
                    WorkLocationID = table.Column<int>(type: "int", nullable: true),
                    DepartmentID = table.Column<int>(type: "int", nullable: true),
                    DesignationID = table.Column<int>(type: "int", nullable: true),
                    ReportingTo = table.Column<int>(type: "int", nullable: true),
                    LevelID = table.Column<int>(type: "int", nullable: true),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    PhotoPath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DateOfLeaving = table.Column<DateTime>(type: "datetime2", nullable: true),
                    GoogleCalendarId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Employee", x => x.ID);
                    table.ForeignKey(
                        name: "FK_tbl_Employee_Tbl_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Tbl_Companies",
                        principalColumn: "CompanyId");
                    table.ForeignKey(
                        name: "FK_tbl_Employee_tbl_Department_DepartmentID",
                        column: x => x.DepartmentID,
                        principalTable: "tbl_Department",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_Employee_tbl_Designation_DesignationID",
                        column: x => x.DesignationID,
                        principalTable: "tbl_Designation",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_Employee_tbl_Employee_ReportingTo",
                        column: x => x.ReportingTo,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_Employee_tbl_LevelMasters_LevelID",
                        column: x => x.LevelID,
                        principalTable: "tbl_LevelMasters",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_Employee_tbl_WorkLocation_WorkLocationID",
                        column: x => x.WorkLocationID,
                        principalTable: "tbl_WorkLocation",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "Tbl_Accessories",
                columns: table => new
                {
                    AccessoriesId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AccessoriesCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AccessorySKU = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    AccessoriesName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    AccessoriesImage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AccessoriesShortName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CompanyNameOfProduct = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    VendorId = table.Column<int>(type: "int", nullable: true),
                    ProductGroupId = table.Column<int>(type: "int", nullable: true),
                    CategoryId = table.Column<int>(type: "int", nullable: true),
                    BrandId = table.Column<int>(type: "int", nullable: true),
                    UnitId = table.Column<int>(type: "int", nullable: true),
                    TaxId = table.Column<int>(type: "int", nullable: true),
                    ProductTypeId = table.Column<int>(type: "int", nullable: true),
                    VersionId = table.Column<int>(type: "int", nullable: true),
                    CurrencyId = table.Column<int>(type: "int", nullable: true),
                    PartConditionId = table.Column<int>(type: "int", nullable: true),
                    AccessoriesDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Specification = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PartUnique = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PartNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ManufacturingDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    WarrantyPeriod = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HSNCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UOM = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PurchasePrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SalePrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TaxPreference = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TaxRateId = table.Column<int>(type: "int", nullable: true),
                    AvailableQuantity = table.Column<int>(type: "int", nullable: false),
                    OutOfStockWarning = table.Column<int>(type: "int", nullable: false),
                    MinStock = table.Column<int>(type: "int", nullable: false),
                    TrackStock = table.Column<bool>(type: "bit", nullable: false),
                    ProductSource = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BCD = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    SWS = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    IGST = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    IsCalibration = table.Column<bool>(type: "bit", nullable: false),
                    CalibrationFrequency = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Active = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_Accessories", x => x.AccessoriesId);
                    table.ForeignKey(
                        name: "FK_Tbl_Accessories_Brand_BrandId",
                        column: x => x.BrandId,
                        principalTable: "Brand",
                        principalColumn: "BrandId");
                    table.ForeignKey(
                        name: "FK_Tbl_Accessories_Category_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Category",
                        principalColumn: "CategoryId");
                    table.ForeignKey(
                        name: "FK_Tbl_Accessories_Tax_TaxId",
                        column: x => x.TaxId,
                        principalTable: "Tax",
                        principalColumn: "TaxId");
                    table.ForeignKey(
                        name: "FK_Tbl_Accessories_Tbl_Currencies_CurrencyId",
                        column: x => x.CurrencyId,
                        principalTable: "Tbl_Currencies",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Tbl_Accessories_Tbl_PartConditions_PartConditionId",
                        column: x => x.PartConditionId,
                        principalTable: "Tbl_PartConditions",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Tbl_Accessories_Tbl_ProductGroups_ProductGroupId",
                        column: x => x.ProductGroupId,
                        principalTable: "Tbl_ProductGroups",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Tbl_Accessories_Tbl_ProductTypes_ProductTypeId",
                        column: x => x.ProductTypeId,
                        principalTable: "Tbl_ProductTypes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Tbl_Accessories_Tbl_ProductVersions_VersionId",
                        column: x => x.VersionId,
                        principalTable: "Tbl_ProductVersions",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Tbl_Accessories_Tbl_Vendors_VendorId",
                        column: x => x.VendorId,
                        principalTable: "Tbl_Vendors",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Tbl_Accessories_Unit_UnitId",
                        column: x => x.UnitId,
                        principalTable: "Unit",
                        principalColumn: "UnitId");
                });

            migrationBuilder.CreateTable(
                name: "Tbl_Products",
                columns: table => new
                {
                    ProductId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ProductSKU = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ProductName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    ProductImage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ProductShortName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CompanyNameOfProduct = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ProductGroupId = table.Column<int>(type: "int", nullable: true),
                    CategoryId = table.Column<int>(type: "int", nullable: true),
                    BrandId = table.Column<int>(type: "int", nullable: true),
                    ProductTypeId = table.Column<int>(type: "int", nullable: true),
                    VersionId = table.Column<int>(type: "int", nullable: true),
                    CurrencyId = table.Column<int>(type: "int", nullable: true),
                    PartConditionId = table.Column<int>(type: "int", nullable: true),
                    UnitId = table.Column<int>(type: "int", nullable: true),
                    TaxId = table.Column<int>(type: "int", nullable: true),
                    TaxRateId = table.Column<int>(type: "int", nullable: true),
                    ProductDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Specification = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ManufacturingDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    WarrantyPeriod = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HSNCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    UOM = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HasAccessories = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MapAccessories = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PurchasePrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SalePrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MRP = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TaxPreference = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AvailableQuantity = table.Column<int>(type: "int", nullable: false),
                    OutOfStockWarning = table.Column<int>(type: "int", nullable: false),
                    MinStock = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ReorderLevel = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TrackStock = table.Column<bool>(type: "bit", nullable: false),
                    TrackSerial = table.Column<bool>(type: "bit", nullable: false),
                    TrackBatch = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsCalibration = table.Column<bool>(type: "bit", nullable: false),
                    CalibrationFrequency = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    ProductSource = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BCD = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    SWS = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    IGST = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    PartNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    VendorId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_Products", x => x.ProductId);
                    table.ForeignKey(
                        name: "FK_Tbl_Products_Brand_BrandId",
                        column: x => x.BrandId,
                        principalTable: "Brand",
                        principalColumn: "BrandId");
                    table.ForeignKey(
                        name: "FK_Tbl_Products_Category_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Category",
                        principalColumn: "CategoryId");
                    table.ForeignKey(
                        name: "FK_Tbl_Products_Tax_TaxId",
                        column: x => x.TaxId,
                        principalTable: "Tax",
                        principalColumn: "TaxId");
                    table.ForeignKey(
                        name: "FK_Tbl_Products_Tbl_Currencies_CurrencyId",
                        column: x => x.CurrencyId,
                        principalTable: "Tbl_Currencies",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Tbl_Products_Tbl_PartConditions_PartConditionId",
                        column: x => x.PartConditionId,
                        principalTable: "Tbl_PartConditions",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Tbl_Products_Tbl_ProductGroups_ProductGroupId",
                        column: x => x.ProductGroupId,
                        principalTable: "Tbl_ProductGroups",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Tbl_Products_Tbl_ProductTypes_ProductTypeId",
                        column: x => x.ProductTypeId,
                        principalTable: "Tbl_ProductTypes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Tbl_Products_Tbl_ProductVersions_VersionId",
                        column: x => x.VersionId,
                        principalTable: "Tbl_ProductVersions",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Tbl_Products_Tbl_Vendors_VendorId",
                        column: x => x.VendorId,
                        principalTable: "Tbl_Vendors",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Tbl_Products_Unit_UnitId",
                        column: x => x.UnitId,
                        principalTable: "Unit",
                        principalColumn: "UnitId");
                });

            migrationBuilder.CreateTable(
                name: "tbl_AgencyBankDetail",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AgencyId = table.Column<int>(type: "int", nullable: false),
                    BankName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BankAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AccountHolderName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AccountNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IFSCCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SwiftCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IBANNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmailAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_AgencyBankDetail", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_AgencyBankDetail_tbl_Agency_AgencyId",
                        column: x => x.AgencyId,
                        principalTable: "tbl_Agency",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_AgencyContact",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AgencyId = table.Column<int>(type: "int", nullable: false),
                    PersonName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Designation = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Department = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MobileNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AlternateMobileNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmailAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DocsAttachment = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_AgencyContact", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_AgencyContact_tbl_Agency_AgencyId",
                        column: x => x.AgencyId,
                        principalTable: "tbl_Agency",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DocumentSeries",
                columns: table => new
                {
                    DocumentSeriesId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DocumentType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Prefix = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    NextNumber = table.Column<int>(type: "int", nullable: false),
                    FinancialYear = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    BranchId = table.Column<int>(type: "int", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentSeries", x => x.DocumentSeriesId);
                    table.ForeignKey(
                        name: "FK_DocumentSeries_Branch_BranchId",
                        column: x => x.BranchId,
                        principalTable: "Branch",
                        principalColumn: "BranchId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Supplier",
                columns: table => new
                {
                    SupplierId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BranchId = table.Column<int>(type: "int", nullable: false),
                    SupplierCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SupplierName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    SupplierGSTIN = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: true),
                    SupplierContact = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    SupplierAddress = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    PaymentTerms = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Supplier", x => x.SupplierId);
                    table.ForeignKey(
                        name: "FK_Supplier_Branch_BranchId",
                        column: x => x.BranchId,
                        principalTable: "Branch",
                        principalColumn: "BranchId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Warehouse",
                columns: table => new
                {
                    WarehouseId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BranchId = table.Column<int>(type: "int", nullable: false),
                    WarehouseCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    WarehouseName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Warehouse", x => x.WarehouseId);
                    table.ForeignKey(
                        name: "FK_Warehouse_Branch_BranchId",
                        column: x => x.BranchId,
                        principalTable: "Branch",
                        principalColumn: "BranchId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_CustomerContact",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    ResPersonName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DepartmentName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Designation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MobileNo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AltMobileNo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EmailAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AltEmailAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_CustomerContact", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_CustomerContact_tbl_Customer_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "tbl_Customer",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_DummyInvoices",
                columns: table => new
                {
                    DummyInvoiceId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OriginalProformaInvoiceId = table.Column<int>(type: "int", nullable: false),
                    DummyInvoiceNo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DummyInvoiceDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    OrderAcceptanceId = table.Column<int>(type: "int", nullable: false),
                    ServiceReportId = table.Column<int>(type: "int", nullable: true),
                    GroupId = table.Column<int>(type: "int", nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    VendorId = table.Column<int>(type: "int", nullable: true),
                    CompanyGroupId = table.Column<int>(type: "int", nullable: false),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    ResponsiblePersonId = table.Column<int>(type: "int", nullable: true),
                    CurrencyId = table.Column<int>(type: "int", nullable: false),
                    PlaceOfSupplyId = table.Column<int>(type: "int", nullable: false),
                    BankDetailId = table.Column<int>(type: "int", nullable: false),
                    CustomerPO = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CustomerPODate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ConsigneeNameAndAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Subtotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Percentage = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PercentageAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PercentageTaxAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    BalanceAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    FreightOrCarrierInsurance = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalGstAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GrandTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TermsAndConditions = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CustomerNotes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_DummyInvoices", x => x.DummyInvoiceId);
                    table.ForeignKey(
                        name: "FK_Tbl_DummyInvoices_Tbl_Currencies_CurrencyId",
                        column: x => x.CurrencyId,
                        principalTable: "Tbl_Currencies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Tbl_DummyInvoices_tbl_Customer_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "tbl_Customer",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_Enquiries",
                columns: table => new
                {
                    EnquiryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EnquiryNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OfferDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ServiceId = table.Column<int>(type: "int", nullable: true),
                    ProductGroupId = table.Column<int>(type: "int", nullable: true),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    VendorId = table.Column<int>(type: "int", nullable: true),
                    CompanyGroupId = table.Column<int>(type: "int", nullable: true),
                    CustomerId = table.Column<int>(type: "int", nullable: true),
                    ResponsiblePersonId = table.Column<int>(type: "int", nullable: true),
                    CurrencyId = table.Column<int>(type: "int", nullable: true),
                    PlaceOfSupplyId = table.Column<int>(type: "int", nullable: true),
                    BankDetailId = table.Column<int>(type: "int", nullable: true),
                    Subtotal = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    FreightCharges = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    GrandTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    NextFollowUpDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    GSTApplicable = table.Column<bool>(type: "bit", nullable: false),
                    TermsConditions = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CustomerNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EntryType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AssignedToEmployeeId = table.Column<int>(type: "int", nullable: true),
                    FollowUpReminderSent = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_Enquiries", x => x.EnquiryId);
                    table.ForeignKey(
                        name: "FK_Tbl_Enquiries_tbl_Customer_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "tbl_Customer",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "tbl_FaultReport",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Device = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    SerialNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Firmware = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Software = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SoftwareVersion = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SpecialSoftware = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Configuration = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PowerSource = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CabelsConnected = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    ModulesConnected = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    ModulesFirmware = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Voltage = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    LED = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    InternalBattery = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    GpsBattery = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ColdStarted = table.Column<bool>(type: "bit", nullable: false),
                    DefaultReset = table.Column<bool>(type: "bit", nullable: false),
                    SettingChecked = table.Column<bool>(type: "bit", nullable: false),
                    FirmwareUpdated = table.Column<bool>(type: "bit", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Comments = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UploadedFiles = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ReportDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_FaultReport", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_FaultReport_tbl_Customer_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "tbl_Customer",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_InstallationReport",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    InstallationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ProductInformation = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    InspectionSummary = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    CustomerNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Place = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_InstallationReport", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_InstallationReport_Tbl_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Tbl_Companies",
                        principalColumn: "CompanyId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tbl_InstallationReport_tbl_Customer_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "tbl_Customer",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_AgencyAddress",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AgencyId = table.Column<int>(type: "int", nullable: false),
                    AddressType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FlatBlockNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Premises = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RoadStreetLane = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Area = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TownCity = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Pincode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CountryId = table.Column<int>(type: "int", nullable: false),
                    StateId = table.Column<int>(type: "int", nullable: false),
                    MobileNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AlternateMobileNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmailAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AlternateEmailAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_AgencyAddress", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_AgencyAddress_Tbl_Countries_CountryId",
                        column: x => x.CountryId,
                        principalTable: "Tbl_Countries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tbl_AgencyAddress_Tbl_States_StateId",
                        column: x => x.StateId,
                        principalTable: "Tbl_States",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tbl_AgencyAddress_tbl_Agency_AgencyId",
                        column: x => x.AgencyId,
                        principalTable: "tbl_Agency",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_CustomerAddress",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    AddressType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    FlatBlockNo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PremisesName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Road = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Area = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Town = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PinNo = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    CountryId = table.Column<int>(type: "int", nullable: false),
                    StateId = table.Column<int>(type: "int", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_CustomerAddress", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_CustomerAddress_Tbl_Countries_CountryId",
                        column: x => x.CountryId,
                        principalTable: "Tbl_Countries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tbl_CustomerAddress_Tbl_States_StateId",
                        column: x => x.StateId,
                        principalTable: "Tbl_States",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tbl_CustomerAddress_tbl_Customer_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "tbl_Customer",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_FinalDummyInvoices",
                columns: table => new
                {
                    FinalDummyInvoiceId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OriginalInvoiceId = table.Column<int>(type: "int", nullable: false),
                    FinalDummyInvoiceNo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FinalDummyInvoiceDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CustomerPo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CompanyPoDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ConsigneeNameAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SubTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    FreightCharges = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalGstAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GrandTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AdvanceReceived = table.Column<bool>(type: "bit", nullable: false),
                    AdvanceAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    BalanceAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ProductGroupId = table.Column<int>(type: "int", nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    VendorId = table.Column<int>(type: "int", nullable: true),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    CompanyGroupId = table.Column<int>(type: "int", nullable: false),
                    ResponsiblePersonId = table.Column<int>(type: "int", nullable: true),
                    CurrencyId = table.Column<int>(type: "int", nullable: false),
                    PlaceOfSupplyId = table.Column<int>(type: "int", nullable: false),
                    BankDetailId = table.Column<int>(type: "int", nullable: false),
                    TermsConditions = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CustomerNotes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_FinalDummyInvoices", x => x.FinalDummyInvoiceId);
                    table.ForeignKey(
                        name: "FK_Tbl_FinalDummyInvoices_Tbl_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Tbl_Companies",
                        principalColumn: "CompanyId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Tbl_FinalDummyInvoices_Tbl_Currencies_CurrencyId",
                        column: x => x.CurrencyId,
                        principalTable: "Tbl_Currencies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Tbl_FinalDummyInvoices_Tbl_States_PlaceOfSupplyId",
                        column: x => x.PlaceOfSupplyId,
                        principalTable: "Tbl_States",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Tbl_FinalDummyInvoices_Tbl_Vendors_VendorId",
                        column: x => x.VendorId,
                        principalTable: "Tbl_Vendors",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Tbl_FinalDummyInvoices_tbl_Customer_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "tbl_Customer",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_VendorAddresses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VendorId = table.Column<int>(type: "int", nullable: false),
                    AddressType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FlatBlockNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Premises = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RoadStrLane = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Area = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Town = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PinNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CountryId = table.Column<int>(type: "int", nullable: false),
                    StateId = table.Column<int>(type: "int", nullable: false),
                    MobileNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AltMobileNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmailAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AltEmailAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_VendorAddresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tbl_VendorAddresses_Tbl_Countries_CountryId",
                        column: x => x.CountryId,
                        principalTable: "Tbl_Countries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Tbl_VendorAddresses_Tbl_States_StateId",
                        column: x => x.StateId,
                        principalTable: "Tbl_States",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Tbl_VendorAddresses_Tbl_Vendors_VendorId",
                        column: x => x.VendorId,
                        principalTable: "Tbl_Vendors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_OfferItemAccessories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OfferItemId = table.Column<int>(type: "int", nullable: false),
                    AccessoryId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_OfferItemAccessories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tbl_OfferItemAccessories_Tbl_OfferItems_OfferItemId",
                        column: x => x.OfferItemId,
                        principalTable: "Tbl_OfferItems",
                        principalColumn: "OfferItemId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_OrderAcceptanceItemAccessories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderAcceptanceItemId = table.Column<int>(type: "int", nullable: false),
                    AccessoryId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_OrderAcceptanceItemAccessories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tbl_OrderAcceptanceItemAccessories_Tbl_OrderAcceptanceItems_OrderAcceptanceItemId",
                        column: x => x.OrderAcceptanceItemId,
                        principalTable: "Tbl_OrderAcceptanceItems",
                        principalColumn: "OrderAcceptanceItemId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_PurchaseOrderItemAccessories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PurchaseOrderItemId = table.Column<int>(type: "int", nullable: false),
                    AccessoryId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_PurchaseOrderItemAccessories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tbl_PurchaseOrderItemAccessories_Tbl_PurchaseOrderItems_PurchaseOrderItemId",
                        column: x => x.PurchaseOrderItemId,
                        principalTable: "Tbl_PurchaseOrderItems",
                        principalColumn: "PurchaseOrderItemId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_ShipmentAgencyAssignments",
                columns: table => new
                {
                    ShipmentAgencyAssignmentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ShipmentInitiateId = table.Column<int>(type: "int", nullable: false),
                    AgencyId = table.Column<int>(type: "int", nullable: false),
                    AssignedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PickerAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeliveryAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_ShipmentAgencyAssignments", x => x.ShipmentAgencyAssignmentId);
                    table.ForeignKey(
                        name: "FK_Tbl_ShipmentAgencyAssignments_Tbl_ShipmentInitiates_ShipmentInitiateId",
                        column: x => x.ShipmentInitiateId,
                        principalTable: "Tbl_ShipmentInitiates",
                        principalColumn: "ShipmentInitiateId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Tbl_ShipmentAgencyAssignments_tbl_Agency_AgencyId",
                        column: x => x.AgencyId,
                        principalTable: "tbl_Agency",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_ShipmentItems",
                columns: table => new
                {
                    ShipmentItemId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ShipmentInitiateId = table.Column<int>(type: "int", nullable: false),
                    BoxNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NetWeightKg = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GrossWeightKg = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    LengthCm = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    WidthCm = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    HeightCm = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CBM = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_ShipmentItems", x => x.ShipmentItemId);
                    table.ForeignKey(
                        name: "FK_Tbl_ShipmentItems_Tbl_ShipmentInitiates_ShipmentInitiateId",
                        column: x => x.ShipmentInitiateId,
                        principalTable: "Tbl_ShipmentInitiates",
                        principalColumn: "ShipmentInitiateId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_ShipmentSourceItems",
                columns: table => new
                {
                    ShipmentSourceItemId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ShipmentInitiateId = table.Column<int>(type: "int", nullable: false),
                    ItemType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: true),
                    AccessoryId = table.Column<int>(type: "int", nullable: true),
                    ItemCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PartNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ItemName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_ShipmentSourceItems", x => x.ShipmentSourceItemId);
                    table.ForeignKey(
                        name: "FK_Tbl_ShipmentSourceItems_Tbl_ShipmentInitiates_ShipmentInitiateId",
                        column: x => x.ShipmentInitiateId,
                        principalTable: "Tbl_ShipmentInitiates",
                        principalColumn: "ShipmentInitiateId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SecurityStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "bit", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "bit", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUsers_tbl_Employee_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Advance",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    RequestDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ProcessedByEmployeeId = table.Column<int>(type: "int", nullable: true),
                    StatusDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Advance", x => x.ID);
                    table.ForeignKey(
                        name: "FK_tbl_Advance_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tbl_Advance_tbl_Employee_ProcessedByEmployeeId",
                        column: x => x.ProcessedByEmployeeId,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "tbl_AssignLeaveType",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    LeaveTypeID = table.Column<int>(type: "int", nullable: false),
                    AllocatedDays = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    FinancialYear = table.Column<int>(type: "int", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_AssignLeaveType", x => x.ID);
                    table.ForeignKey(
                        name: "FK_tbl_AssignLeaveType_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tbl_AssignLeaveType_tbl_LeaveType_LeaveTypeID",
                        column: x => x.LeaveTypeID,
                        principalTable: "tbl_LeaveType",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_Attendance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    InTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    OutTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    InDeviceID = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OutDeviceID = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_Attendance", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tbl_Attendance_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_BonusRecords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    FinancialYear = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EligibleSalaryForCalculation = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TenureInDays = table.Column<int>(type: "int", nullable: false),
                    AppliedRule = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BonusAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CalculationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_BonusRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_BonusRecords_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_EmployeeAddress",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    AddressType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FlatNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PremisesName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RoadName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Locality = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TownDistrict = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PinNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CountryId = table.Column<int>(type: "int", nullable: true),
                    StateId = table.Column<int>(type: "int", nullable: true),
                    MobileNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AltMobileNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AltEmail = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_EmployeeAddress", x => x.ID);
                    table.ForeignKey(
                        name: "FK_tbl_EmployeeAddress_Tbl_Countries_CountryId",
                        column: x => x.CountryId,
                        principalTable: "Tbl_Countries",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_tbl_EmployeeAddress_Tbl_States_StateId",
                        column: x => x.StateId,
                        principalTable: "Tbl_States",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_tbl_EmployeeAddress_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_EmployeeBankDetails",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BankName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AccountNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IFSCCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    BankAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SortCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SwiftCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IBANNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AccountHolderName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_EmployeeBankDetails", x => x.ID);
                    table.ForeignKey(
                        name: "FK_tbl_EmployeeBankDetails_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_EmployeeDocument",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    DocumentName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FilePath = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UploadedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_EmployeeDocument", x => x.ID);
                    table.ForeignKey(
                        name: "FK_tbl_EmployeeDocument_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_EmployeeExperience",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    CompanyName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Designation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FromDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ToDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Location = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_EmployeeExperience", x => x.ID);
                    table.ForeignKey(
                        name: "FK_tbl_EmployeeExperience_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_EmployeePFDetails",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    PFDeductionPercentage = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    IsCappedAt15k = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_EmployeePFDetails", x => x.ID);
                    table.ForeignKey(
                        name: "FK_tbl_EmployeePFDetails_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_EmployeeQualification",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    Degree = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    University = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PassingYear = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Percentage = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_EmployeeQualification", x => x.ID);
                    table.ForeignKey(
                        name: "FK_tbl_EmployeeQualification_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_EmployeeSalarySummary",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    AnnualCTC = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MonthlyGrossSalary = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MonthlyTotalDeduction = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MonthlyNetSalary = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CalculationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EffectiveDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EmployerPF = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_EmployeeSalarySummary", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_EmployeeSalarySummary_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_EmployeeStatutoryDetails",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AadhaarNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PANNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PassportNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UANNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PFNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ESINo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_EmployeeStatutoryDetails", x => x.ID);
                    table.ForeignKey(
                        name: "FK_tbl_EmployeeStatutoryDetails_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_EmployeeTaxDeclaration",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    FinancialYear = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TaxRegime = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DeclarationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_EmployeeTaxDeclaration", x => x.ID);
                    table.ForeignKey(
                        name: "FK_tbl_EmployeeTaxDeclaration_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_EmployeeTDSDetails",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    TDSAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_EmployeeTDSDetails", x => x.ID);
                    table.ForeignKey(
                        name: "FK_tbl_EmployeeTDSDetails_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_ExpenseClaim",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    ExpenseTypeID = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ApprovedAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ClaimDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AppliedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ApproverID = table.Column<int>(type: "int", nullable: true),
                    ApprovalDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ManagerRemarks = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ReceiptFilePath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_ExpenseClaim", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_ExpenseClaim_tbl_Employee_ApproverID",
                        column: x => x.ApproverID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_ExpenseClaim_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tbl_ExpenseClaim_tbl_ExpenseType_ExpenseTypeID",
                        column: x => x.ExpenseTypeID,
                        principalTable: "tbl_ExpenseType",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_FnFSettlements",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    ResignationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastWorkingDay = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExitMonth = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TotalDaysInMonth = table.Column<int>(type: "int", nullable: false),
                    PaidDays = table.Column<int>(type: "int", nullable: false),
                    MonthlyGrossSalary = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SalaryPayable = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    EncashableLeaveBalance = table.Column<int>(type: "int", nullable: false),
                    LeaveEncashmentRate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    LeaveEncashmentAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    BonusAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    BonusRemarks = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    GratuityAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    NoticePeriodAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    NoticePeriodRemarks = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OtherDeductions = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DeductionRemarks = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NetPayableAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SettlementDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_FnFSettlements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_FnFSettlements_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Form16Status",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    FinancialYear = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    PartAStatus = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    PartBStatus = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FinalStatus = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CertificateNo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    PartAFilePath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GeneratedFormFilePath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastUpdated = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Form16Status", x => x.ID);
                    table.ForeignKey(
                        name: "FK_tbl_Form16Status_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Gratuity",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    YearsOfService = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    LastDrawnBasicSalary = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GratuityAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CalculationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Gratuity", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_Gratuity_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_LeaveEncashment",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    FinancialYear = table.Column<int>(type: "int", nullable: false),
                    GrossSalary = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    RateOfELEncashment = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalEarnedLeaves = table.Column<int>(type: "int", nullable: false),
                    LeavesTaken = table.Column<int>(type: "int", nullable: false),
                    RemainingLeavesForEncashment = table.Column<int>(type: "int", nullable: false),
                    TotalAmountOfELEncashment = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DateOfPayment = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_LeaveEncashment", x => x.ID);
                    table.ForeignKey(
                        name: "FK_tbl_LeaveEncashment_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_LeaveRequest",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    LeaveTypeID = table.Column<int>(type: "int", nullable: false),
                    FromDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ToDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Days = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ApprovedByEmployeeID = table.Column<int>(type: "int", nullable: true),
                    AppliedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsHalfDay = table.Column<bool>(type: "bit", nullable: false),
                    HalfDayPeriod = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_LeaveRequest", x => x.ID);
                    table.ForeignKey(
                        name: "FK_tbl_LeaveRequest_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tbl_LeaveRequest_tbl_LeaveType_LeaveTypeID",
                        column: x => x.LeaveTypeID,
                        principalTable: "tbl_LeaveType",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_LoanApplications",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    LoanTypeID = table.Column<int>(type: "int", nullable: false),
                    LoanAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TenureInMonths = table.Column<int>(type: "int", nullable: false),
                    MonthlyDeduction = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ApplicationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ApprovedByUserID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_LoanApplications", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Tbl_LoanApplications_Tbl_LoanMasters_LoanTypeID",
                        column: x => x.LoanTypeID,
                        principalTable: "Tbl_LoanMasters",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Tbl_LoanApplications_tbl_Employee_ApprovedByUserID",
                        column: x => x.ApprovedByUserID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_Tbl_LoanApplications_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_MonthlySalaryRecord",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PayrollRunID = table.Column<int>(type: "int", nullable: false),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    TotalDaysInMonth = table.Column<int>(type: "int", nullable: false),
                    PayableDays = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    LOPDays = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GrossEarnings = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalDeductions = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    NetSalary = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ReimbursableAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmployerPF = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PresentDays = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    WeeklyOffAndHolidays = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CasualLeaveDays = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_MonthlySalaryRecord", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_MonthlySalaryRecord_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tbl_MonthlySalaryRecord_tbl_PayrollRun_PayrollRunID",
                        column: x => x.PayrollRunID,
                        principalTable: "tbl_PayrollRun",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_Notifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReadAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_Notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tbl_Notifications_tbl_Employee_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_OutdoorDuty",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    FromDate = table.Column<DateTime>(type: "date", nullable: false),
                    ToDate = table.Column<DateTime>(type: "date", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    AppliedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ApproverID = table.Column<int>(type: "int", nullable: true),
                    ApprovalDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ManagerRemarks = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_OutdoorDuty", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_OutdoorDuty_tbl_Employee_ApproverID",
                        column: x => x.ApproverID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_tbl_OutdoorDuty_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Payslip",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PayrollRunID = table.Column<int>(type: "int", nullable: false),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    PdfFilePath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    EmailSent = table.Column<bool>(type: "bit", nullable: false),
                    Downloaded = table.Column<bool>(type: "bit", nullable: false),
                    GeneratedOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Payslip", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_Payslip_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tbl_Payslip_tbl_PayrollRun_PayrollRunID",
                        column: x => x.PayrollRunID,
                        principalTable: "tbl_PayrollRun",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_SalaryStructure",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    SalaryComponentID = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    EffectiveDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_SalaryStructure", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_SalaryStructure_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tbl_SalaryStructure_tbl_SalaryComponent_SalaryComponentID",
                        column: x => x.SalaryComponentID,
                        principalTable: "tbl_SalaryComponent",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AccessoryPrices",
                columns: table => new
                {
                    AccessoryPriceId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PriceListId = table.Column<int>(type: "int", nullable: false),
                    AccessoryId = table.Column<int>(type: "int", nullable: false),
                    AccessoriesId = table.Column<int>(type: "int", nullable: false),
                    PriceType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MinQty = table.Column<int>(type: "int", nullable: false),
                    EffectiveFrom = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EffectiveTo = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccessoryPrices", x => x.AccessoryPriceId);
                    table.ForeignKey(
                        name: "FK_AccessoryPrices_PriceLists_PriceListId",
                        column: x => x.PriceListId,
                        principalTable: "PriceLists",
                        principalColumn: "PriceListId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AccessoryPrices_Tbl_Accessories_AccessoriesId",
                        column: x => x.AccessoriesId,
                        principalTable: "Tbl_Accessories",
                        principalColumn: "AccessoriesId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_AccessoryCurrencyPrices",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AccessoriesId = table.Column<int>(type: "int", nullable: false),
                    CurrencyId = table.Column<int>(type: "int", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_AccessoryCurrencyPrices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tbl_AccessoryCurrencyPrices_Tbl_Accessories_AccessoriesId",
                        column: x => x.AccessoriesId,
                        principalTable: "Tbl_Accessories",
                        principalColumn: "AccessoriesId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Tbl_AccessoryCurrencyPrices_Tbl_Currencies_CurrencyId",
                        column: x => x.CurrencyId,
                        principalTable: "Tbl_Currencies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_CreditNoteItemAccessory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreditNoteItemId = table.Column<int>(type: "int", nullable: false),
                    AccessoryId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_CreditNoteItemAccessory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tbl_CreditNoteItemAccessory_Tbl_Accessories_AccessoryId",
                        column: x => x.AccessoryId,
                        principalTable: "Tbl_Accessories",
                        principalColumn: "AccessoriesId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Tbl_CreditNoteItemAccessory_Tbl_CreditNoteItem_CreditNoteItemId",
                        column: x => x.CreditNoteItemId,
                        principalTable: "Tbl_CreditNoteItem",
                        principalColumn: "CreditNoteItemId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_DebitNoteItemAccessory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DebitNoteItemId = table.Column<int>(type: "int", nullable: false),
                    AccessoryId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_DebitNoteItemAccessory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tbl_DebitNoteItemAccessory_Tbl_Accessories_AccessoryId",
                        column: x => x.AccessoryId,
                        principalTable: "Tbl_Accessories",
                        principalColumn: "AccessoriesId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Tbl_DebitNoteItemAccessory_Tbl_DebitNoteItem_DebitNoteItemId",
                        column: x => x.DebitNoteItemId,
                        principalTable: "Tbl_DebitNoteItem",
                        principalColumn: "DebitNoteItemId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductAccessoryRule",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    AccessoriesId = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    MandatoryOptional = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    PricingType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    DefaultPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    EffectiveFrom = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EffectiveTo = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Active = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductAccessoryRule", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductAccessoryRule_Tbl_Accessories_AccessoriesId",
                        column: x => x.AccessoriesId,
                        principalTable: "Tbl_Accessories",
                        principalColumn: "AccessoriesId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductAccessoryRule_Tbl_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Tbl_Products",
                        principalColumn: "ProductId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductPrices",
                columns: table => new
                {
                    ProductPriceId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PriceListId = table.Column<int>(type: "int", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    PriceType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MinQty = table.Column<int>(type: "int", nullable: false),
                    EffectiveFrom = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EffectiveTo = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductPrices", x => x.ProductPriceId);
                    table.ForeignKey(
                        name: "FK_ProductPrices_PriceLists_PriceListId",
                        column: x => x.PriceListId,
                        principalTable: "PriceLists",
                        principalColumn: "PriceListId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductPrices_Tbl_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Tbl_Products",
                        principalColumn: "ProductId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductVariant",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VariantName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    VariantCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Attributes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Active = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductVariant", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductVariant_Tbl_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Tbl_Products",
                        principalColumn: "ProductId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_ProductCurrencyPrices",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    CurrencyId = table.Column<int>(type: "int", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_ProductCurrencyPrices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tbl_ProductCurrencyPrices_Tbl_Currencies_CurrencyId",
                        column: x => x.CurrencyId,
                        principalTable: "Tbl_Currencies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Tbl_ProductCurrencyPrices_Tbl_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Tbl_Products",
                        principalColumn: "ProductId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_ServiceReport",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    OrderAcceptanceId = table.Column<int>(type: "int", nullable: true),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: true),
                    AccessoryId = table.Column<int>(type: "int", nullable: true),
                    SerialNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ReportNo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    InspectionSummary = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    SoftwareCheck = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    PortTesting = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    FirmwareCheck = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    PhysicalInspection = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    ICReplacement = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    FinalComments = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    CustomerReported = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UploadedFiles = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_ServiceReport", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_ServiceReport_Tbl_Accessories_AccessoryId",
                        column: x => x.AccessoryId,
                        principalTable: "Tbl_Accessories",
                        principalColumn: "AccessoriesId");
                    table.ForeignKey(
                        name: "FK_tbl_ServiceReport_Tbl_OrderAcceptances_OrderAcceptanceId",
                        column: x => x.OrderAcceptanceId,
                        principalTable: "Tbl_OrderAcceptances",
                        principalColumn: "OrderAcceptanceId");
                    table.ForeignKey(
                        name: "FK_tbl_ServiceReport_Tbl_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Tbl_Products",
                        principalColumn: "ProductId");
                    table.ForeignKey(
                        name: "FK_tbl_ServiceReport_tbl_Customer_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "tbl_Customer",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Location",
                columns: table => new
                {
                    LocationId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WarehouseId = table.Column<int>(type: "int", nullable: false),
                    LocationCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Zone = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Rack = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Shelf = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Bin = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Location", x => x.LocationId);
                    table.ForeignKey(
                        name: "FK_Location_Warehouse_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "Warehouse",
                        principalColumn: "WarehouseId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_DummyInvoiceItems",
                columns: table => new
                {
                    DummyInvoiceItemId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DummyInvoiceId = table.Column<int>(type: "int", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: true),
                    AccessoryId = table.Column<int>(type: "int", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Rate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Discount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Total = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GstTax = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TaxPercentage = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    HsnSacCode = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_DummyInvoiceItems", x => x.DummyInvoiceItemId);
                    table.ForeignKey(
                        name: "FK_Tbl_DummyInvoiceItems_Tbl_Accessories_AccessoryId",
                        column: x => x.AccessoryId,
                        principalTable: "Tbl_Accessories",
                        principalColumn: "AccessoriesId");
                    table.ForeignKey(
                        name: "FK_Tbl_DummyInvoiceItems_Tbl_DummyInvoices_DummyInvoiceId",
                        column: x => x.DummyInvoiceId,
                        principalTable: "Tbl_DummyInvoices",
                        principalColumn: "DummyInvoiceId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Tbl_DummyInvoiceItems_Tbl_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Tbl_Products",
                        principalColumn: "ProductId");
                });

            migrationBuilder.CreateTable(
                name: "Tbl_EnquiryItems",
                columns: table => new
                {
                    EnquiryItemId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EnquiryId = table.Column<int>(type: "int", nullable: false),
                    ItemType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: true),
                    AccessoryId = table.Column<int>(type: "int", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HsnSacCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Rate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    LiveConversionRate = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Discount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TaxPercentage = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Total = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CgstAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    SgstAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    IgstAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    GstAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    FinalPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ServiceId = table.Column<int>(type: "int", nullable: true),
                    ServicePartNo = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_EnquiryItems", x => x.EnquiryItemId);
                    table.ForeignKey(
                        name: "FK_Tbl_EnquiryItems_Tbl_Enquiries_EnquiryId",
                        column: x => x.EnquiryId,
                        principalTable: "Tbl_Enquiries",
                        principalColumn: "EnquiryId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_EnquiryNotes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EnquiryId = table.Column<int>(type: "int", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByEmployeeId = table.Column<int>(type: "int", nullable: false),
                    AuthorName = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_EnquiryNotes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tbl_EnquiryNotes_Tbl_Enquiries_EnquiryId",
                        column: x => x.EnquiryId,
                        principalTable: "Tbl_Enquiries",
                        principalColumn: "EnquiryId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_InstallationContact",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Designation = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    InstallationReportId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_InstallationContact", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_InstallationContact_tbl_InstallationReport_InstallationReportId",
                        column: x => x.InstallationReportId,
                        principalTable: "tbl_InstallationReport",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_FinalDummyInvoiceItems",
                columns: table => new
                {
                    FinalDummyInvoiceItemId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FinalDummyInvoiceId = table.Column<int>(type: "int", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: true),
                    AccessoryId = table.Column<int>(type: "int", nullable: true),
                    ItemType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Quantity = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Rate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Discount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Total = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GstAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TaxPercentage = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    HsnSacCode = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_FinalDummyInvoiceItems", x => x.FinalDummyInvoiceItemId);
                    table.ForeignKey(
                        name: "FK_Tbl_FinalDummyInvoiceItems_Tbl_Accessories_AccessoryId",
                        column: x => x.AccessoryId,
                        principalTable: "Tbl_Accessories",
                        principalColumn: "AccessoriesId");
                    table.ForeignKey(
                        name: "FK_Tbl_FinalDummyInvoiceItems_Tbl_FinalDummyInvoices_FinalDummyInvoiceId",
                        column: x => x.FinalDummyInvoiceId,
                        principalTable: "Tbl_FinalDummyInvoices",
                        principalColumn: "FinalDummyInvoiceId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Tbl_FinalDummyInvoiceItems_Tbl_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Tbl_Products",
                        principalColumn: "ProductId");
                });

            migrationBuilder.CreateTable(
                name: "Tbl_CHABills",
                columns: table => new
                {
                    CHABillId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ShipmentInitiateId = table.Column<int>(type: "int", nullable: false),
                    ShipmentAgencyAssignmentId = table.Column<int>(type: "int", nullable: false),
                    BillNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BillDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    BillAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GstAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ReceivingDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PaymentDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PaymentStatus = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_CHABills", x => x.CHABillId);
                    table.ForeignKey(
                        name: "FK_Tbl_CHABills_Tbl_ShipmentAgencyAssignments_ShipmentAgencyAssignmentId",
                        column: x => x.ShipmentAgencyAssignmentId,
                        principalTable: "Tbl_ShipmentAgencyAssignments",
                        principalColumn: "ShipmentAgencyAssignmentId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Tbl_CHABills_Tbl_ShipmentInitiates_ShipmentInitiateId",
                        column: x => x.ShipmentInitiateId,
                        principalTable: "Tbl_ShipmentInitiates",
                        principalColumn: "ShipmentInitiateId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_ForwarderBills",
                columns: table => new
                {
                    ForwarderBillId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ShipmentInitiateId = table.Column<int>(type: "int", nullable: false),
                    ShipmentAgencyAssignmentId = table.Column<int>(type: "int", nullable: false),
                    BillNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BillDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    BillAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GstAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ReceivingDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PaymentDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PaymentStatus = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_ForwarderBills", x => x.ForwarderBillId);
                    table.ForeignKey(
                        name: "FK_Tbl_ForwarderBills_Tbl_ShipmentAgencyAssignments_ShipmentAgencyAssignmentId",
                        column: x => x.ShipmentAgencyAssignmentId,
                        principalTable: "Tbl_ShipmentAgencyAssignments",
                        principalColumn: "ShipmentAgencyAssignmentId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Tbl_ForwarderBills_Tbl_ShipmentInitiates_ShipmentInitiateId",
                        column: x => x.ShipmentInitiateId,
                        principalTable: "Tbl_ShipmentInitiates",
                        principalColumn: "ShipmentInitiateId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_ShipmentUnderTransit",
                columns: table => new
                {
                    ShipmentUnderTransitId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ShipmentInitiateId = table.Column<int>(type: "int", nullable: false),
                    ShipmentAgencyAssignmentId = table.Column<int>(type: "int", nullable: true),
                    ContainerNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    VesselFlightNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MAWBNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HAWBNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MBLNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HBLNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BOENo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BOEDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ChecklistReceivingDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ChecklistApprovingDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ETDDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ETADate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DepartureDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExpectedArrivalDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DutyPaymentDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    OOCDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FinalDeliveryDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PortOfLoading = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PortOfDischarge = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Destination = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ChecklistExchangeRate = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ChecklistAssessableValue = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ChecklistTotalDuty = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ChecklistGST = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ChecklistTotalPayable = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    BOEExchangeRate = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    BOEAssessableValue = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    BOECustomDuty = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    BOEGST = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    BOETotalPayable = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    DutyPenalty = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    DutyInterest = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    IsChecklistApproved = table.Column<bool>(type: "bit", nullable: false),
                    IsBOEApproved = table.Column<bool>(type: "bit", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TransitRemarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDelivered = table.Column<bool>(type: "bit", nullable: false),
                    IsClosed = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_ShipmentUnderTransit", x => x.ShipmentUnderTransitId);
                    table.ForeignKey(
                        name: "FK_Tbl_ShipmentUnderTransit_Tbl_ShipmentAgencyAssignments_ShipmentAgencyAssignmentId",
                        column: x => x.ShipmentAgencyAssignmentId,
                        principalTable: "Tbl_ShipmentAgencyAssignments",
                        principalColumn: "ShipmentAgencyAssignmentId");
                    table.ForeignKey(
                        name: "FK_Tbl_ShipmentUnderTransit_Tbl_ShipmentInitiates_ShipmentInitiateId",
                        column: x => x.ShipmentInitiateId,
                        principalTable: "Tbl_ShipmentInitiates",
                        principalColumn: "ShipmentInitiateId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_TransporterBills",
                columns: table => new
                {
                    TransporterBillId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ShipmentInitiateId = table.Column<int>(type: "int", nullable: false),
                    ShipmentAgencyAssignmentId = table.Column<int>(type: "int", nullable: false),
                    BillNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BillDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    BillAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GstAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ReceivingDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PaymentDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PaymentStatus = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_TransporterBills", x => x.TransporterBillId);
                    table.ForeignKey(
                        name: "FK_Tbl_TransporterBills_Tbl_ShipmentAgencyAssignments_ShipmentAgencyAssignmentId",
                        column: x => x.ShipmentAgencyAssignmentId,
                        principalTable: "Tbl_ShipmentAgencyAssignments",
                        principalColumn: "ShipmentAgencyAssignmentId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Tbl_TransporterBills_Tbl_ShipmentInitiates_ShipmentInitiateId",
                        column: x => x.ShipmentInitiateId,
                        principalTable: "Tbl_ShipmentInitiates",
                        principalColumn: "ShipmentInitiateId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderKey = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_AdvanceRepayment",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AdvanceID = table.Column<int>(type: "int", nullable: false),
                    RepaymentAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    RepaymentDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedByEmployeeId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_AdvanceRepayment", x => x.ID);
                    table.ForeignKey(
                        name: "FK_tbl_AdvanceRepayment_tbl_Advance_AdvanceID",
                        column: x => x.AdvanceID,
                        principalTable: "tbl_Advance",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tbl_AdvanceRepayment_tbl_Employee_CreatedByEmployeeId",
                        column: x => x.CreatedByEmployeeId,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "tbl_EmployeeDeclarationDetail",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeTaxDeclarationID = table.Column<int>(type: "int", nullable: false),
                    Section = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DeclaredAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ApprovedAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ApprovalStatus = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_EmployeeDeclarationDetail", x => x.ID);
                    table.ForeignKey(
                        name: "FK_tbl_EmployeeDeclarationDetail_tbl_EmployeeTaxDeclaration_EmployeeTaxDeclarationID",
                        column: x => x.EmployeeTaxDeclarationID,
                        principalTable: "tbl_EmployeeTaxDeclaration",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_LeaveCreditLedger",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    LeaveTypeID = table.Column<int>(type: "int", nullable: false),
                    Credit = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    EarnedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LeaveRequestID = table.Column<int>(type: "int", nullable: true),
                    AttendanceID = table.Column<int>(type: "int", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_LeaveCreditLedger", x => x.ID);
                    table.ForeignKey(
                        name: "FK_tbl_LeaveCreditLedger_Tbl_Attendance_AttendanceID",
                        column: x => x.AttendanceID,
                        principalTable: "Tbl_Attendance",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_tbl_LeaveCreditLedger_tbl_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "tbl_Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tbl_LeaveCreditLedger_tbl_LeaveRequest_LeaveRequestID",
                        column: x => x.LeaveRequestID,
                        principalTable: "tbl_LeaveRequest",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_tbl_LeaveCreditLedger_tbl_LeaveType_LeaveTypeID",
                        column: x => x.LeaveTypeID,
                        principalTable: "tbl_LeaveType",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_LoanRepayments",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LoanApplicationID = table.Column<int>(type: "int", nullable: false),
                    AmountPaid = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PaymentDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PayrollPeriod = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_LoanRepayments", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Tbl_LoanRepayments_Tbl_LoanApplications_LoanApplicationID",
                        column: x => x.LoanApplicationID,
                        principalTable: "Tbl_LoanApplications",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_MonthlySalaryComponentDetail",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MonthlySalaryRecordID = table.Column<int>(type: "int", nullable: false),
                    ComponentName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ComponentType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_MonthlySalaryComponentDetail", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_MonthlySalaryComponentDetail_tbl_MonthlySalaryRecord_MonthlySalaryRecordID",
                        column: x => x.MonthlySalaryRecordID,
                        principalTable: "tbl_MonthlySalaryRecord",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BundleItems",
                columns: table => new
                {
                    BundleItemId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BundleId = table.Column<int>(type: "int", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: true),
                    VariantId = table.Column<int>(type: "int", nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    PricingType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    AllocatedPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsOptional = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    AccessoriesId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BundleItems", x => x.BundleItemId);
                    table.ForeignKey(
                        name: "FK_BundleItems_ProductVariant_VariantId",
                        column: x => x.VariantId,
                        principalTable: "ProductVariant",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_BundleItems_Tbl_Accessories_AccessoriesId",
                        column: x => x.AccessoriesId,
                        principalTable: "Tbl_Accessories",
                        principalColumn: "AccessoriesId");
                    table.ForeignKey(
                        name: "FK_BundleItems_Tbl_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Tbl_Products",
                        principalColumn: "ProductId");
                });

            migrationBuilder.CreateTable(
                name: "ProductBarcode",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Barcode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    BarcodeType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: true),
                    VariantId = table.Column<int>(type: "int", nullable: true),
                    AccessoryId = table.Column<int>(type: "int", nullable: true),
                    IsPrimary = table.Column<bool>(type: "bit", nullable: false),
                    Active = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductBarcode", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductBarcode_ProductVariant_VariantId",
                        column: x => x.VariantId,
                        principalTable: "ProductVariant",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProductBarcode_Tbl_Accessories_AccessoryId",
                        column: x => x.AccessoryId,
                        principalTable: "Tbl_Accessories",
                        principalColumn: "AccessoriesId");
                    table.ForeignKey(
                        name: "FK_ProductBarcode_Tbl_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Tbl_Products",
                        principalColumn: "ProductId");
                });

            migrationBuilder.CreateTable(
                name: "Tbl_Invoice",
                columns: table => new
                {
                    InvoiceId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderAcceptanceId = table.Column<int>(type: "int", nullable: true),
                    InvoiceNo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    InvoiceDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    InvoiceDueDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CustomerPo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CompanyPoDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ConsigneeNameAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SubTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    FreightCharges = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GrandTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AdvanceAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AdvanceReceived = table.Column<bool>(type: "bit", nullable: false),
                    BalanceAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ProductGroupId = table.Column<int>(type: "int", nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    VendorId = table.Column<int>(type: "int", nullable: false),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    CompanyGroupId = table.Column<int>(type: "int", nullable: false),
                    ResponsiblePersonId = table.Column<int>(type: "int", nullable: true),
                    CurrencyId = table.Column<int>(type: "int", nullable: false),
                    PlaceOfSupplyId = table.Column<int>(type: "int", nullable: false),
                    BankDetailId = table.Column<int>(type: "int", nullable: false),
                    ServiceId = table.Column<int>(type: "int", nullable: true),
                    ServiceReportId = table.Column<int>(type: "int", nullable: true),
                    TermsConditions = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CustomerNotes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FinalNote = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_Invoice", x => x.InvoiceId);
                    table.ForeignKey(
                        name: "FK_Tbl_Invoice_Tbl_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Tbl_Companies",
                        principalColumn: "CompanyId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Tbl_Invoice_Tbl_CompanyBankDetails_BankDetailId",
                        column: x => x.BankDetailId,
                        principalTable: "Tbl_CompanyBankDetails",
                        principalColumn: "BankDetailId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Tbl_Invoice_Tbl_CompanyGroups_CompanyGroupId",
                        column: x => x.CompanyGroupId,
                        principalTable: "Tbl_CompanyGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Tbl_Invoice_Tbl_Currencies_CurrencyId",
                        column: x => x.CurrencyId,
                        principalTable: "Tbl_Currencies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Tbl_Invoice_Tbl_ProductGroups_ProductGroupId",
                        column: x => x.ProductGroupId,
                        principalTable: "Tbl_ProductGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Tbl_Invoice_Tbl_ServiceMaster_ServiceId",
                        column: x => x.ServiceId,
                        principalTable: "Tbl_ServiceMaster",
                        principalColumn: "ServiceId");
                    table.ForeignKey(
                        name: "FK_Tbl_Invoice_Tbl_States_PlaceOfSupplyId",
                        column: x => x.PlaceOfSupplyId,
                        principalTable: "Tbl_States",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Tbl_Invoice_Tbl_Vendors_VendorId",
                        column: x => x.VendorId,
                        principalTable: "Tbl_Vendors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Tbl_Invoice_tbl_CustomerContact_ResponsiblePersonId",
                        column: x => x.ResponsiblePersonId,
                        principalTable: "tbl_CustomerContact",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Tbl_Invoice_tbl_Customer_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "tbl_Customer",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Tbl_Invoice_tbl_ServiceReport_ServiceReportId",
                        column: x => x.ServiceReportId,
                        principalTable: "tbl_ServiceReport",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Tbl_ProformaInvoices",
                columns: table => new
                {
                    ProformaInvoiceId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProformaInvoiceNo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProformaInvoiceDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ProformaInvoiceExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FinalNote = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OrderAcceptanceId = table.Column<int>(type: "int", nullable: false),
                    ServiceReportId = table.Column<int>(type: "int", nullable: true),
                    GroupId = table.Column<int>(type: "int", nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    VendorId = table.Column<int>(type: "int", nullable: true),
                    CompanyGroupId = table.Column<int>(type: "int", nullable: false),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    ResponsiblePersonId = table.Column<int>(type: "int", nullable: true),
                    CurrencyId = table.Column<int>(type: "int", nullable: false),
                    PlaceOfSupplyId = table.Column<int>(type: "int", nullable: false),
                    BankDetailId = table.Column<int>(type: "int", nullable: false),
                    CustomerPO = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CustomerPODate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ConsigneeNameAndAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Subtotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Percentage = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PercentageAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PercentageTaxAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    BalanceAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    FreightOrCarrierInsurance = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalGstAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GrandTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TermsAndConditions = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CustomerNotes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_ProformaInvoices", x => x.ProformaInvoiceId);
                    table.ForeignKey(
                        name: "FK_Tbl_ProformaInvoices_Tbl_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Tbl_Companies",
                        principalColumn: "CompanyId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Tbl_ProformaInvoices_Tbl_CompanyGroups_CompanyGroupId",
                        column: x => x.CompanyGroupId,
                        principalTable: "Tbl_CompanyGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Tbl_ProformaInvoices_Tbl_Currencies_CurrencyId",
                        column: x => x.CurrencyId,
                        principalTable: "Tbl_Currencies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Tbl_ProformaInvoices_Tbl_OrderAcceptances_OrderAcceptanceId",
                        column: x => x.OrderAcceptanceId,
                        principalTable: "Tbl_OrderAcceptances",
                        principalColumn: "OrderAcceptanceId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Tbl_ProformaInvoices_Tbl_ProductGroups_GroupId",
                        column: x => x.GroupId,
                        principalTable: "Tbl_ProductGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Tbl_ProformaInvoices_Tbl_States_PlaceOfSupplyId",
                        column: x => x.PlaceOfSupplyId,
                        principalTable: "Tbl_States",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Tbl_ProformaInvoices_Tbl_Vendors_VendorId",
                        column: x => x.VendorId,
                        principalTable: "Tbl_Vendors",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Tbl_ProformaInvoices_tbl_CustomerContact_ResponsiblePersonId",
                        column: x => x.ResponsiblePersonId,
                        principalTable: "tbl_CustomerContact",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Tbl_ProformaInvoices_tbl_Customer_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "tbl_Customer",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Tbl_ProformaInvoices_tbl_ServiceReport_ServiceReportId",
                        column: x => x.ServiceReportId,
                        principalTable: "tbl_ServiceReport",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "tbl_ServiceReportItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ServiceReportId = table.Column<int>(type: "int", nullable: false),
                    ItemType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: true),
                    AccessoryId = table.Column<int>(type: "int", nullable: true),
                    ServiceId = table.Column<int>(type: "int", nullable: true),
                    ServicePartNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Rate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Discount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TaxPercentage = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GstTax = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    FinalPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    HsnSacCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_ServiceReportItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_ServiceReportItems_tbl_ServiceReport_ServiceReportId",
                        column: x => x.ServiceReportId,
                        principalTable: "tbl_ServiceReport",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_DummyInvoiceItemAccessories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DummyInvoiceItemId = table.Column<int>(type: "int", nullable: false),
                    AccessoryId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_DummyInvoiceItemAccessories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tbl_DummyInvoiceItemAccessories_Tbl_DummyInvoiceItems_DummyInvoiceItemId",
                        column: x => x.DummyInvoiceItemId,
                        principalTable: "Tbl_DummyInvoiceItems",
                        principalColumn: "DummyInvoiceItemId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_EnquiryItemAccessories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EnquiryItemId = table.Column<int>(type: "int", nullable: false),
                    AccessoryId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_EnquiryItemAccessories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tbl_EnquiryItemAccessories_Tbl_EnquiryItems_EnquiryItemId",
                        column: x => x.EnquiryItemId,
                        principalTable: "Tbl_EnquiryItems",
                        principalColumn: "EnquiryItemId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_ShipmentPayments",
                columns: table => new
                {
                    ShipmentPaymentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ShipmentUnderTransitId = table.Column<int>(type: "int", nullable: false),
                    DeliveredDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PendingDays = table.Column<int>(type: "int", nullable: false),
                    PaymentCompleted = table.Column<bool>(type: "bit", nullable: false),
                    PaymentCompletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FinanceRemarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_ShipmentPayments", x => x.ShipmentPaymentId);
                    table.ForeignKey(
                        name: "FK_Tbl_ShipmentPayments_Tbl_ShipmentUnderTransit_ShipmentUnderTransitId",
                        column: x => x.ShipmentUnderTransitId,
                        principalTable: "Tbl_ShipmentUnderTransit",
                        principalColumn: "ShipmentUnderTransitId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tbl_EmployeeDeclarationDocument",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeDeclarationDetailID = table.Column<int>(type: "int", nullable: false),
                    FileName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StoredFileName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FilePath = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ContentType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UploadedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_EmployeeDeclarationDocument", x => x.ID);
                    table.ForeignKey(
                        name: "FK_tbl_EmployeeDeclarationDocument_tbl_EmployeeDeclarationDetail_EmployeeDeclarationDetailID",
                        column: x => x.EmployeeDeclarationDetailID,
                        principalTable: "tbl_EmployeeDeclarationDetail",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_InvoiceItem",
                columns: table => new
                {
                    InvoiceItemId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InvoiceId = table.Column<int>(type: "int", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: true),
                    AccessoryId = table.Column<int>(type: "int", nullable: true),
                    ItemType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HsnSacCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Quantity = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Rate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Discount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Total = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GstAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CgstAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SgstAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IgstAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TaxPercentage = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_InvoiceItem", x => x.InvoiceItemId);
                    table.ForeignKey(
                        name: "FK_Tbl_InvoiceItem_Tbl_Invoice_InvoiceId",
                        column: x => x.InvoiceId,
                        principalTable: "Tbl_Invoice",
                        principalColumn: "InvoiceId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Tbl_InvoiceItem_Tbl_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Tbl_Products",
                        principalColumn: "ProductId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_ProformaInvoiceItems",
                columns: table => new
                {
                    ProformaInvoiceItemId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProformaInvoiceId = table.Column<int>(type: "int", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: true),
                    AccessoryId = table.Column<int>(type: "int", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Rate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Discount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Total = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GstTax = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TaxPercentage = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    HsnSacCode = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_ProformaInvoiceItems", x => x.ProformaInvoiceItemId);
                    table.ForeignKey(
                        name: "FK_Tbl_ProformaInvoiceItems_Tbl_Accessories_AccessoryId",
                        column: x => x.AccessoryId,
                        principalTable: "Tbl_Accessories",
                        principalColumn: "AccessoriesId");
                    table.ForeignKey(
                        name: "FK_Tbl_ProformaInvoiceItems_Tbl_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Tbl_Products",
                        principalColumn: "ProductId");
                    table.ForeignKey(
                        name: "FK_Tbl_ProformaInvoiceItems_Tbl_ProformaInvoices_ProformaInvoiceId",
                        column: x => x.ProformaInvoiceId,
                        principalTable: "Tbl_ProformaInvoices",
                        principalColumn: "ProformaInvoiceId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_InvoiceItemAccessory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InvoiceItemId = table.Column<int>(type: "int", nullable: false),
                    AccessoryId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_InvoiceItemAccessory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tbl_InvoiceItemAccessory_Tbl_Accessories_AccessoryId",
                        column: x => x.AccessoryId,
                        principalTable: "Tbl_Accessories",
                        principalColumn: "AccessoriesId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Tbl_InvoiceItemAccessory_Tbl_InvoiceItem_InvoiceItemId",
                        column: x => x.InvoiceItemId,
                        principalTable: "Tbl_InvoiceItem",
                        principalColumn: "InvoiceItemId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tbl_ProformaInvoiceItemAccessories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProformaInvoiceItemId = table.Column<int>(type: "int", nullable: false),
                    AccessoryId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl_ProformaInvoiceItemAccessories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tbl_ProformaInvoiceItemAccessories_Tbl_ProformaInvoiceItems_ProformaInvoiceItemId",
                        column: x => x.ProformaInvoiceItemId,
                        principalTable: "Tbl_ProformaInvoiceItems",
                        principalColumn: "ProformaInvoiceItemId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AccessoryPrices_AccessoriesId",
                table: "AccessoryPrices",
                column: "AccessoriesId");

            migrationBuilder.CreateIndex(
                name: "IX_AccessoryPrices_PriceListId",
                table: "AccessoryPrices",
                column: "PriceListId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true,
                filter: "[NormalizedName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "AspNetUsers",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_EmployeeId",
                table: "AspNetUsers",
                column: "EmployeeId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "NormalizedUserName",
                unique: true,
                filter: "[NormalizedUserName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Branch_CompanyId",
                table: "Branch",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_BundleItems_AccessoriesId",
                table: "BundleItems",
                column: "AccessoriesId");

            migrationBuilder.CreateIndex(
                name: "IX_BundleItems_ProductId",
                table: "BundleItems",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_BundleItems_VariantId",
                table: "BundleItems",
                column: "VariantId");

            migrationBuilder.CreateIndex(
                name: "IX_Category_ParentCategoryId",
                table: "Category",
                column: "ParentCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentSeries_BranchId",
                table: "DocumentSeries",
                column: "BranchId");

            migrationBuilder.CreateIndex(
                name: "IX_Location_WarehouseId",
                table: "Location",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_PriceLists_Id",
                table: "PriceLists",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_ProductAccessoryRule_AccessoriesId",
                table: "ProductAccessoryRule",
                column: "AccessoriesId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductAccessoryRule_ProductId",
                table: "ProductAccessoryRule",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductBarcode_AccessoryId",
                table: "ProductBarcode",
                column: "AccessoryId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductBarcode_ProductId",
                table: "ProductBarcode",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductBarcode_VariantId",
                table: "ProductBarcode",
                column: "VariantId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductPrices_PriceListId",
                table: "ProductPrices",
                column: "PriceListId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductPrices_ProductId",
                table: "ProductPrices",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductVariant_ProductId",
                table: "ProductVariant",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Supplier_BranchId",
                table: "Supplier",
                column: "BranchId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_AccessControls_RoleId",
                table: "Tbl_AccessControls",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_Accessories_BrandId",
                table: "Tbl_Accessories",
                column: "BrandId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_Accessories_CategoryId",
                table: "Tbl_Accessories",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_Accessories_CurrencyId",
                table: "Tbl_Accessories",
                column: "CurrencyId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_Accessories_PartConditionId",
                table: "Tbl_Accessories",
                column: "PartConditionId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_Accessories_ProductGroupId",
                table: "Tbl_Accessories",
                column: "ProductGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_Accessories_ProductTypeId",
                table: "Tbl_Accessories",
                column: "ProductTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_Accessories_TaxId",
                table: "Tbl_Accessories",
                column: "TaxId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_Accessories_UnitId",
                table: "Tbl_Accessories",
                column: "UnitId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_Accessories_VendorId",
                table: "Tbl_Accessories",
                column: "VendorId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_Accessories_VersionId",
                table: "Tbl_Accessories",
                column: "VersionId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_AccessoryCurrencyPrices_AccessoriesId",
                table: "Tbl_AccessoryCurrencyPrices",
                column: "AccessoriesId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_AccessoryCurrencyPrices_CurrencyId",
                table: "Tbl_AccessoryCurrencyPrices",
                column: "CurrencyId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Advance_EmployeeID",
                table: "tbl_Advance",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Advance_ProcessedByEmployeeId",
                table: "tbl_Advance",
                column: "ProcessedByEmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_AdvanceRepayment_AdvanceID",
                table: "tbl_AdvanceRepayment",
                column: "AdvanceID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_AdvanceRepayment_CreatedByEmployeeId",
                table: "tbl_AdvanceRepayment",
                column: "CreatedByEmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Agency_AgencyTypeId",
                table: "tbl_Agency",
                column: "AgencyTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_AgencyAddress_AgencyId",
                table: "tbl_AgencyAddress",
                column: "AgencyId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_AgencyAddress_CountryId",
                table: "tbl_AgencyAddress",
                column: "CountryId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_AgencyAddress_StateId",
                table: "tbl_AgencyAddress",
                column: "StateId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_AgencyBankDetail_AgencyId",
                table: "tbl_AgencyBankDetail",
                column: "AgencyId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_AgencyContact_AgencyId",
                table: "tbl_AgencyContact",
                column: "AgencyId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_AssignLeaveType_EmployeeID",
                table: "tbl_AssignLeaveType",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_AssignLeaveType_LeaveTypeID",
                table: "tbl_AssignLeaveType",
                column: "LeaveTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_Attendance_EmployeeID_Date",
                table: "Tbl_Attendance",
                columns: new[] { "EmployeeID", "Date" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_tbl_BonusRecords_EmployeeID",
                table: "tbl_BonusRecords",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_CHABills_ShipmentAgencyAssignmentId",
                table: "Tbl_CHABills",
                column: "ShipmentAgencyAssignmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_CHABills_ShipmentInitiateId",
                table: "Tbl_CHABills",
                column: "ShipmentInitiateId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_CompanyAddresses_CompanyId",
                table: "Tbl_CompanyAddresses",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_CompanyBankDetails_CompanyId",
                table: "Tbl_CompanyBankDetails",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_CompanyDirectors_CompanyId",
                table: "Tbl_CompanyDirectors",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_CreditNoteItem_CreditNoteId",
                table: "Tbl_CreditNoteItem",
                column: "CreditNoteId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_CreditNoteItemAccessory_AccessoryId",
                table: "Tbl_CreditNoteItemAccessory",
                column: "AccessoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_CreditNoteItemAccessory_CreditNoteItemId",
                table: "Tbl_CreditNoteItemAccessory",
                column: "CreditNoteItemId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Customer_CompanyGroupId",
                table: "tbl_Customer",
                column: "CompanyGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_CustomerAddress_CountryId",
                table: "tbl_CustomerAddress",
                column: "CountryId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_CustomerAddress_CustomerId",
                table: "tbl_CustomerAddress",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_CustomerAddress_StateId",
                table: "tbl_CustomerAddress",
                column: "StateId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_CustomerContact_CustomerId",
                table: "tbl_CustomerContact",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_DebitNoteItem_DebitNoteId",
                table: "Tbl_DebitNoteItem",
                column: "DebitNoteId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_DebitNoteItemAccessory_AccessoryId",
                table: "Tbl_DebitNoteItemAccessory",
                column: "AccessoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_DebitNoteItemAccessory_DebitNoteItemId",
                table: "Tbl_DebitNoteItemAccessory",
                column: "DebitNoteItemId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_DispatchDetails_DispatchId",
                table: "Tbl_DispatchDetails",
                column: "DispatchId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_DispatchItems_DispatchId",
                table: "Tbl_DispatchItems",
                column: "DispatchId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_DispatchStockItems_DispatchId",
                table: "Tbl_DispatchStockItems",
                column: "DispatchId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_DriveFiles_FolderId",
                table: "Tbl_DriveFiles",
                column: "FolderId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_DriveFolders_ParentFolderId",
                table: "Tbl_DriveFolders",
                column: "ParentFolderId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_DummyInvoiceItemAccessories_DummyInvoiceItemId",
                table: "Tbl_DummyInvoiceItemAccessories",
                column: "DummyInvoiceItemId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_DummyInvoiceItems_AccessoryId",
                table: "Tbl_DummyInvoiceItems",
                column: "AccessoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_DummyInvoiceItems_DummyInvoiceId",
                table: "Tbl_DummyInvoiceItems",
                column: "DummyInvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_DummyInvoiceItems_ProductId",
                table: "Tbl_DummyInvoiceItems",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_DummyInvoices_CurrencyId",
                table: "Tbl_DummyInvoices",
                column: "CurrencyId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_DummyInvoices_CustomerId",
                table: "Tbl_DummyInvoices",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Employee_CompanyId",
                table: "tbl_Employee",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Employee_DepartmentID",
                table: "tbl_Employee",
                column: "DepartmentID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Employee_DesignationID",
                table: "tbl_Employee",
                column: "DesignationID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Employee_LevelID",
                table: "tbl_Employee",
                column: "LevelID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Employee_ReportingTo",
                table: "tbl_Employee",
                column: "ReportingTo");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Employee_WorkLocationID",
                table: "tbl_Employee",
                column: "WorkLocationID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_EmployeeAddress_CountryId",
                table: "tbl_EmployeeAddress",
                column: "CountryId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_EmployeeAddress_EmployeeID",
                table: "tbl_EmployeeAddress",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_EmployeeAddress_StateId",
                table: "tbl_EmployeeAddress",
                column: "StateId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_EmployeeBankDetails_EmployeeID",
                table: "tbl_EmployeeBankDetails",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_EmployeeDeclarationDetail_EmployeeTaxDeclarationID",
                table: "tbl_EmployeeDeclarationDetail",
                column: "EmployeeTaxDeclarationID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_EmployeeDeclarationDocument_EmployeeDeclarationDetailID",
                table: "tbl_EmployeeDeclarationDocument",
                column: "EmployeeDeclarationDetailID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_EmployeeDocument_EmployeeID",
                table: "tbl_EmployeeDocument",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_EmployeeExperience_EmployeeID",
                table: "tbl_EmployeeExperience",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_EmployeePFDetails_EmployeeID",
                table: "tbl_EmployeePFDetails",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_EmployeeQualification_EmployeeID",
                table: "tbl_EmployeeQualification",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_EmployeeSalarySummary_EmployeeID",
                table: "tbl_EmployeeSalarySummary",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_EmployeeStatutoryDetails_EmployeeID",
                table: "tbl_EmployeeStatutoryDetails",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_EmployeeTaxDeclaration_EmployeeID",
                table: "tbl_EmployeeTaxDeclaration",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_EmployeeTDSDetails_EmployeeID",
                table: "tbl_EmployeeTDSDetails",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_Enquiries_CustomerId",
                table: "Tbl_Enquiries",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_EnquiryItemAccessories_EnquiryItemId",
                table: "Tbl_EnquiryItemAccessories",
                column: "EnquiryItemId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_EnquiryItems_EnquiryId",
                table: "Tbl_EnquiryItems",
                column: "EnquiryId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_EnquiryNotes_EnquiryId",
                table: "Tbl_EnquiryNotes",
                column: "EnquiryId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_ExpenseClaim_ApproverID",
                table: "tbl_ExpenseClaim",
                column: "ApproverID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_ExpenseClaim_EmployeeID",
                table: "tbl_ExpenseClaim",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_ExpenseClaim_ExpenseTypeID",
                table: "tbl_ExpenseClaim",
                column: "ExpenseTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_FaultReport_CustomerId",
                table: "tbl_FaultReport",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_FinalDummyInvoiceItems_AccessoryId",
                table: "Tbl_FinalDummyInvoiceItems",
                column: "AccessoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_FinalDummyInvoiceItems_FinalDummyInvoiceId",
                table: "Tbl_FinalDummyInvoiceItems",
                column: "FinalDummyInvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_FinalDummyInvoiceItems_ProductId",
                table: "Tbl_FinalDummyInvoiceItems",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_FinalDummyInvoices_CompanyId",
                table: "Tbl_FinalDummyInvoices",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_FinalDummyInvoices_CurrencyId",
                table: "Tbl_FinalDummyInvoices",
                column: "CurrencyId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_FinalDummyInvoices_CustomerId",
                table: "Tbl_FinalDummyInvoices",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_FinalDummyInvoices_PlaceOfSupplyId",
                table: "Tbl_FinalDummyInvoices",
                column: "PlaceOfSupplyId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_FinalDummyInvoices_VendorId",
                table: "Tbl_FinalDummyInvoices",
                column: "VendorId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_FnFSettlements_EmployeeID",
                table: "tbl_FnFSettlements",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Form16Status_EmployeeID",
                table: "tbl_Form16Status",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_ForwarderBills_ShipmentAgencyAssignmentId",
                table: "Tbl_ForwarderBills",
                column: "ShipmentAgencyAssignmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_ForwarderBills_ShipmentInitiateId",
                table: "Tbl_ForwarderBills",
                column: "ShipmentInitiateId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Gratuity_EmployeeID",
                table: "tbl_Gratuity",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_InstallationContact_InstallationReportId",
                table: "tbl_InstallationContact",
                column: "InstallationReportId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_InstallationReport_CompanyId",
                table: "tbl_InstallationReport",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_InstallationReport_CustomerId",
                table: "tbl_InstallationReport",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_Invoice_BankDetailId",
                table: "Tbl_Invoice",
                column: "BankDetailId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_Invoice_CompanyGroupId",
                table: "Tbl_Invoice",
                column: "CompanyGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_Invoice_CompanyId",
                table: "Tbl_Invoice",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_Invoice_CurrencyId",
                table: "Tbl_Invoice",
                column: "CurrencyId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_Invoice_CustomerId",
                table: "Tbl_Invoice",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_Invoice_PlaceOfSupplyId",
                table: "Tbl_Invoice",
                column: "PlaceOfSupplyId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_Invoice_ProductGroupId",
                table: "Tbl_Invoice",
                column: "ProductGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_Invoice_ResponsiblePersonId",
                table: "Tbl_Invoice",
                column: "ResponsiblePersonId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_Invoice_ServiceId",
                table: "Tbl_Invoice",
                column: "ServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_Invoice_ServiceReportId",
                table: "Tbl_Invoice",
                column: "ServiceReportId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_Invoice_VendorId",
                table: "Tbl_Invoice",
                column: "VendorId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_InvoiceItem_InvoiceId",
                table: "Tbl_InvoiceItem",
                column: "InvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_InvoiceItem_ProductId",
                table: "Tbl_InvoiceItem",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_InvoiceItemAccessory_AccessoryId",
                table: "Tbl_InvoiceItemAccessory",
                column: "AccessoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_InvoiceItemAccessory_InvoiceItemId",
                table: "Tbl_InvoiceItemAccessory",
                column: "InvoiceItemId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_LeaveCreditLedger_AttendanceID",
                table: "tbl_LeaveCreditLedger",
                column: "AttendanceID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_LeaveCreditLedger_EmployeeID",
                table: "tbl_LeaveCreditLedger",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_LeaveCreditLedger_LeaveRequestID",
                table: "tbl_LeaveCreditLedger",
                column: "LeaveRequestID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_LeaveCreditLedger_LeaveTypeID",
                table: "tbl_LeaveCreditLedger",
                column: "LeaveTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_LeaveEncashment_EmployeeID",
                table: "tbl_LeaveEncashment",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_LeaveRequest_EmployeeID",
                table: "tbl_LeaveRequest",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_LeaveRequest_LeaveTypeID",
                table: "tbl_LeaveRequest",
                column: "LeaveTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_LoanApplications_ApprovedByUserID",
                table: "Tbl_LoanApplications",
                column: "ApprovedByUserID");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_LoanApplications_EmployeeID",
                table: "Tbl_LoanApplications",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_LoanApplications_LoanTypeID",
                table: "Tbl_LoanApplications",
                column: "LoanTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_LoanRepayments_LoanApplicationID",
                table: "Tbl_LoanRepayments",
                column: "LoanApplicationID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_MonthlySalaryComponentDetail_MonthlySalaryRecordID",
                table: "tbl_MonthlySalaryComponentDetail",
                column: "MonthlySalaryRecordID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_MonthlySalaryRecord_EmployeeID",
                table: "tbl_MonthlySalaryRecord",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_MonthlySalaryRecord_PayrollRunID",
                table: "tbl_MonthlySalaryRecord",
                column: "PayrollRunID");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_Notifications_EmployeeId",
                table: "Tbl_Notifications",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_OfferItemAccessories_OfferItemId",
                table: "Tbl_OfferItemAccessories",
                column: "OfferItemId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_OfferItems_OfferId",
                table: "Tbl_OfferItems",
                column: "OfferId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_OfferNotes_OfferId",
                table: "Tbl_OfferNotes",
                column: "OfferId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_OfferVersions_OfferId",
                table: "Tbl_OfferVersions",
                column: "OfferId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_OrderAcceptanceItemAccessories_OrderAcceptanceItemId",
                table: "Tbl_OrderAcceptanceItemAccessories",
                column: "OrderAcceptanceItemId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_OrderAcceptanceItems_OrderAcceptanceId",
                table: "Tbl_OrderAcceptanceItems",
                column: "OrderAcceptanceId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_OrderAcceptanceNotes_OrderAcceptanceId",
                table: "Tbl_OrderAcceptanceNotes",
                column: "OrderAcceptanceId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_OrderAcceptanceOffers_OfferId",
                table: "Tbl_OrderAcceptanceOffers",
                column: "OfferId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_OrderAcceptanceOffers_OrderAcceptanceId",
                table: "Tbl_OrderAcceptanceOffers",
                column: "OrderAcceptanceId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_OutdoorDuty_ApproverID",
                table: "tbl_OutdoorDuty",
                column: "ApproverID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_OutdoorDuty_EmployeeID",
                table: "tbl_OutdoorDuty",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Payslip_EmployeeID",
                table: "tbl_Payslip",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Payslip_PayrollRunID",
                table: "tbl_Payslip",
                column: "PayrollRunID");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_ProductCurrencyPrices_CurrencyId",
                table: "Tbl_ProductCurrencyPrices",
                column: "CurrencyId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_ProductCurrencyPrices_ProductId",
                table: "Tbl_ProductCurrencyPrices",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_Products_BrandId",
                table: "Tbl_Products",
                column: "BrandId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_Products_CategoryId",
                table: "Tbl_Products",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_Products_CurrencyId",
                table: "Tbl_Products",
                column: "CurrencyId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_Products_PartConditionId",
                table: "Tbl_Products",
                column: "PartConditionId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_Products_ProductGroupId",
                table: "Tbl_Products",
                column: "ProductGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_Products_ProductTypeId",
                table: "Tbl_Products",
                column: "ProductTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_Products_TaxId",
                table: "Tbl_Products",
                column: "TaxId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_Products_UnitId",
                table: "Tbl_Products",
                column: "UnitId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_Products_VendorId",
                table: "Tbl_Products",
                column: "VendorId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_Products_VersionId",
                table: "Tbl_Products",
                column: "VersionId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_ProformaInvoiceItemAccessories_ProformaInvoiceItemId",
                table: "Tbl_ProformaInvoiceItemAccessories",
                column: "ProformaInvoiceItemId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_ProformaInvoiceItems_AccessoryId",
                table: "Tbl_ProformaInvoiceItems",
                column: "AccessoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_ProformaInvoiceItems_ProductId",
                table: "Tbl_ProformaInvoiceItems",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_ProformaInvoiceItems_ProformaInvoiceId",
                table: "Tbl_ProformaInvoiceItems",
                column: "ProformaInvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_ProformaInvoices_CompanyGroupId",
                table: "Tbl_ProformaInvoices",
                column: "CompanyGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_ProformaInvoices_CompanyId",
                table: "Tbl_ProformaInvoices",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_ProformaInvoices_CurrencyId",
                table: "Tbl_ProformaInvoices",
                column: "CurrencyId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_ProformaInvoices_CustomerId",
                table: "Tbl_ProformaInvoices",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_ProformaInvoices_GroupId",
                table: "Tbl_ProformaInvoices",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_ProformaInvoices_OrderAcceptanceId",
                table: "Tbl_ProformaInvoices",
                column: "OrderAcceptanceId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_ProformaInvoices_PlaceOfSupplyId",
                table: "Tbl_ProformaInvoices",
                column: "PlaceOfSupplyId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_ProformaInvoices_ResponsiblePersonId",
                table: "Tbl_ProformaInvoices",
                column: "ResponsiblePersonId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_ProformaInvoices_ServiceReportId",
                table: "Tbl_ProformaInvoices",
                column: "ServiceReportId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_ProformaInvoices_VendorId",
                table: "Tbl_ProformaInvoices",
                column: "VendorId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_PurchaseOrderItemAccessories_PurchaseOrderItemId",
                table: "Tbl_PurchaseOrderItemAccessories",
                column: "PurchaseOrderItemId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_PurchaseOrderItems_PurchaseOrderId",
                table: "Tbl_PurchaseOrderItems",
                column: "PurchaseOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_PurchaseOrderOffers_PurchaseOrderId",
                table: "Tbl_PurchaseOrderOffers",
                column: "PurchaseOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_SalaryStructure_EmployeeID",
                table: "tbl_SalaryStructure",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_SalaryStructure_SalaryComponentID",
                table: "tbl_SalaryStructure",
                column: "SalaryComponentID");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_ServiceReport_AccessoryId",
                table: "tbl_ServiceReport",
                column: "AccessoryId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_ServiceReport_CustomerId",
                table: "tbl_ServiceReport",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_ServiceReport_OrderAcceptanceId",
                table: "tbl_ServiceReport",
                column: "OrderAcceptanceId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_ServiceReport_ProductId",
                table: "tbl_ServiceReport",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_ServiceReportItems_ServiceReportId",
                table: "tbl_ServiceReportItems",
                column: "ServiceReportId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_ShipmentAgencyAssignments_AgencyId",
                table: "Tbl_ShipmentAgencyAssignments",
                column: "AgencyId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_ShipmentAgencyAssignments_ShipmentInitiateId",
                table: "Tbl_ShipmentAgencyAssignments",
                column: "ShipmentInitiateId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_ShipmentInitiates_ShipmentModeId",
                table: "Tbl_ShipmentInitiates",
                column: "ShipmentModeId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_ShipmentItems_ShipmentInitiateId",
                table: "Tbl_ShipmentItems",
                column: "ShipmentInitiateId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_ShipmentPayments_ShipmentUnderTransitId",
                table: "Tbl_ShipmentPayments",
                column: "ShipmentUnderTransitId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_ShipmentSourceItems_ShipmentInitiateId",
                table: "Tbl_ShipmentSourceItems",
                column: "ShipmentInitiateId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_ShipmentType_ShipmentModeId",
                table: "tbl_ShipmentType",
                column: "ShipmentModeId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_ShipmentUnderTransit_ShipmentAgencyAssignmentId",
                table: "Tbl_ShipmentUnderTransit",
                column: "ShipmentAgencyAssignmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_ShipmentUnderTransit_ShipmentInitiateId",
                table: "Tbl_ShipmentUnderTransit",
                column: "ShipmentInitiateId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_States_CountryId",
                table: "Tbl_States",
                column: "CountryId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_TransporterBills_ShipmentAgencyAssignmentId",
                table: "Tbl_TransporterBills",
                column: "ShipmentAgencyAssignmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_TransporterBills_ShipmentInitiateId",
                table: "Tbl_TransporterBills",
                column: "ShipmentInitiateId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_VendorAddresses_CountryId",
                table: "Tbl_VendorAddresses",
                column: "CountryId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_VendorAddresses_StateId",
                table: "Tbl_VendorAddresses",
                column: "StateId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_VendorAddresses_VendorId",
                table: "Tbl_VendorAddresses",
                column: "VendorId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_VendorBankDetails_VendorId",
                table: "Tbl_VendorBankDetails",
                column: "VendorId");

            migrationBuilder.CreateIndex(
                name: "IX_Tbl_VendorContacts_VendorId",
                table: "Tbl_VendorContacts",
                column: "VendorId");

            migrationBuilder.CreateIndex(
                name: "IX_Warehouse_BranchId",
                table: "Warehouse",
                column: "BranchId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AccessoryPrices");

            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "bde_user");

            migrationBuilder.DropTable(
                name: "BundleItems");

            migrationBuilder.DropTable(
                name: "Bundles");

            migrationBuilder.DropTable(
                name: "DocumentSeries");

            migrationBuilder.DropTable(
                name: "Location");

            migrationBuilder.DropTable(
                name: "PaymentMethods");

            migrationBuilder.DropTable(
                name: "ProductAccessoryPrices");

            migrationBuilder.DropTable(
                name: "ProductAccessoryRule");

            migrationBuilder.DropTable(
                name: "ProductBarcode");

            migrationBuilder.DropTable(
                name: "ProductPrices");

            migrationBuilder.DropTable(
                name: "Reasons");

            migrationBuilder.DropTable(
                name: "SalarySettingPercentage");

            migrationBuilder.DropTable(
                name: "sales_user_manager");

            migrationBuilder.DropTable(
                name: "Supplier");

            migrationBuilder.DropTable(
                name: "Tbl_AccessControls");

            migrationBuilder.DropTable(
                name: "Tbl_AccessoryCurrencyPrices");

            migrationBuilder.DropTable(
                name: "Tbl_AccessoryLogs");

            migrationBuilder.DropTable(
                name: "tbl_AddressType");

            migrationBuilder.DropTable(
                name: "tbl_AdvanceRepayment");

            migrationBuilder.DropTable(
                name: "tbl_AgencyAddress");

            migrationBuilder.DropTable(
                name: "tbl_AgencyBankDetail");

            migrationBuilder.DropTable(
                name: "tbl_AgencyContact");

            migrationBuilder.DropTable(
                name: "tbl_AssignLeaveType");

            migrationBuilder.DropTable(
                name: "tbl_BonusRecords");

            migrationBuilder.DropTable(
                name: "Tbl_CHABills");

            migrationBuilder.DropTable(
                name: "tbl_ClientType");

            migrationBuilder.DropTable(
                name: "Tbl_CompanyAddresses");

            migrationBuilder.DropTable(
                name: "Tbl_CompanyDirectors");

            migrationBuilder.DropTable(
                name: "tbl_CompanyProfile");

            migrationBuilder.DropTable(
                name: "tbl_ComplianceFilingStatus");

            migrationBuilder.DropTable(
                name: "tbl_ContactType");

            migrationBuilder.DropTable(
                name: "Tbl_CreditNoteItemAccessory");

            migrationBuilder.DropTable(
                name: "Tbl_CurrencyHistory");

            migrationBuilder.DropTable(
                name: "tbl_CustomerAddress");

            migrationBuilder.DropTable(
                name: "Tbl_DebitNoteItemAccessory");

            migrationBuilder.DropTable(
                name: "Tbl_DispatchDetails");

            migrationBuilder.DropTable(
                name: "Tbl_DispatchItems");

            migrationBuilder.DropTable(
                name: "Tbl_DispatchStockItems");

            migrationBuilder.DropTable(
                name: "Tbl_DriveFiles");

            migrationBuilder.DropTable(
                name: "Tbl_DummyInvoiceItemAccessories");

            migrationBuilder.DropTable(
                name: "tbl_EmployeeAddress");

            migrationBuilder.DropTable(
                name: "tbl_EmployeeBankDetails");

            migrationBuilder.DropTable(
                name: "tbl_EmployeeDeclarationDocument");

            migrationBuilder.DropTable(
                name: "tbl_EmployeeDocument");

            migrationBuilder.DropTable(
                name: "tbl_EmployeeExperience");

            migrationBuilder.DropTable(
                name: "tbl_EmployeePFDetails");

            migrationBuilder.DropTable(
                name: "tbl_EmployeeQualification");

            migrationBuilder.DropTable(
                name: "tbl_EmployeeSalarySummary");

            migrationBuilder.DropTable(
                name: "tbl_EmployeeStatutoryDetails");

            migrationBuilder.DropTable(
                name: "tbl_EmployeeTDSDetails");

            migrationBuilder.DropTable(
                name: "Tbl_EnquiryItemAccessories");

            migrationBuilder.DropTable(
                name: "Tbl_EnquiryNotes");

            migrationBuilder.DropTable(
                name: "tbl_ExpenseClaim");

            migrationBuilder.DropTable(
                name: "tbl_FaultReport");

            migrationBuilder.DropTable(
                name: "Tbl_FinalDummyInvoiceItems");

            migrationBuilder.DropTable(
                name: "tbl_FnFSettlements");

            migrationBuilder.DropTable(
                name: "tbl_Form16Status");

            migrationBuilder.DropTable(
                name: "Tbl_ForwarderBills");

            migrationBuilder.DropTable(
                name: "tbl_Gratuity");

            migrationBuilder.DropTable(
                name: "tbl_Holiday");

            migrationBuilder.DropTable(
                name: "tbl_Industry");

            migrationBuilder.DropTable(
                name: "tbl_InstallationContact");

            migrationBuilder.DropTable(
                name: "Tbl_InventoryTransactions");

            migrationBuilder.DropTable(
                name: "Tbl_InvoiceItemAccessory");

            migrationBuilder.DropTable(
                name: "tbl_LeaveCreditLedger");

            migrationBuilder.DropTable(
                name: "tbl_LeaveEncashment");

            migrationBuilder.DropTable(
                name: "Tbl_LoanRepayments");

            migrationBuilder.DropTable(
                name: "tbl_MonthlySalaryComponentDetail");

            migrationBuilder.DropTable(
                name: "Tbl_Notifications");

            migrationBuilder.DropTable(
                name: "Tbl_OfferItemAccessories");

            migrationBuilder.DropTable(
                name: "Tbl_OfferNotes");

            migrationBuilder.DropTable(
                name: "Tbl_OfferVersions");

            migrationBuilder.DropTable(
                name: "Tbl_OrderAcceptanceItemAccessories");

            migrationBuilder.DropTable(
                name: "Tbl_OrderAcceptanceNotes");

            migrationBuilder.DropTable(
                name: "Tbl_OrderAcceptanceOffers");

            migrationBuilder.DropTable(
                name: "tbl_OutdoorDuty");

            migrationBuilder.DropTable(
                name: "tbl_PaymentTerm");

            migrationBuilder.DropTable(
                name: "tbl_Payslip");

            migrationBuilder.DropTable(
                name: "Tbl_ProductCurrencyPrices");

            migrationBuilder.DropTable(
                name: "tbl_ProfessionalTaxSlab");

            migrationBuilder.DropTable(
                name: "Tbl_ProformaInvoiceItemAccessories");

            migrationBuilder.DropTable(
                name: "Tbl_PurchaseOrderItemAccessories");

            migrationBuilder.DropTable(
                name: "Tbl_PurchaseOrderOffers");

            migrationBuilder.DropTable(
                name: "Tbl_QualityAssurance");

            migrationBuilder.DropTable(
                name: "tbl_SalaryStructure");

            migrationBuilder.DropTable(
                name: "Tbl_ScrapItems");

            migrationBuilder.DropTable(
                name: "tbl_ServiceReportItems");

            migrationBuilder.DropTable(
                name: "tbl_Shift");

            migrationBuilder.DropTable(
                name: "Tbl_ShipmentItems");

            migrationBuilder.DropTable(
                name: "Tbl_ShipmentPayments");

            migrationBuilder.DropTable(
                name: "Tbl_ShipmentSourceItems");

            migrationBuilder.DropTable(
                name: "tbl_ShipmentType");

            migrationBuilder.DropTable(
                name: "tbl_StatutorySetting");

            migrationBuilder.DropTable(
                name: "tbl_TaxSlabs");

            migrationBuilder.DropTable(
                name: "Tbl_TransporterBills");

            migrationBuilder.DropTable(
                name: "Tbl_UserNotes");

            migrationBuilder.DropTable(
                name: "Tbl_VendorAddresses");

            migrationBuilder.DropTable(
                name: "Tbl_VendorBankDetails");

            migrationBuilder.DropTable(
                name: "Tbl_VendorContacts");

            migrationBuilder.DropTable(
                name: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "Warehouse");

            migrationBuilder.DropTable(
                name: "ProductVariant");

            migrationBuilder.DropTable(
                name: "PriceLists");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "tbl_Advance");

            migrationBuilder.DropTable(
                name: "Tbl_CreditNoteItem");

            migrationBuilder.DropTable(
                name: "Tbl_DebitNoteItem");

            migrationBuilder.DropTable(
                name: "Tbl_Dispatch");

            migrationBuilder.DropTable(
                name: "Tbl_DriveFolders");

            migrationBuilder.DropTable(
                name: "Tbl_DummyInvoiceItems");

            migrationBuilder.DropTable(
                name: "tbl_EmployeeDeclarationDetail");

            migrationBuilder.DropTable(
                name: "Tbl_EnquiryItems");

            migrationBuilder.DropTable(
                name: "tbl_ExpenseType");

            migrationBuilder.DropTable(
                name: "Tbl_FinalDummyInvoices");

            migrationBuilder.DropTable(
                name: "tbl_InstallationReport");

            migrationBuilder.DropTable(
                name: "Tbl_InvoiceItem");

            migrationBuilder.DropTable(
                name: "Tbl_Attendance");

            migrationBuilder.DropTable(
                name: "tbl_LeaveRequest");

            migrationBuilder.DropTable(
                name: "Tbl_LoanApplications");

            migrationBuilder.DropTable(
                name: "tbl_MonthlySalaryRecord");

            migrationBuilder.DropTable(
                name: "Tbl_OfferItems");

            migrationBuilder.DropTable(
                name: "Tbl_OrderAcceptanceItems");

            migrationBuilder.DropTable(
                name: "Tbl_ProformaInvoiceItems");

            migrationBuilder.DropTable(
                name: "Tbl_PurchaseOrderItems");

            migrationBuilder.DropTable(
                name: "tbl_SalaryComponent");

            migrationBuilder.DropTable(
                name: "Tbl_ShipmentUnderTransit");

            migrationBuilder.DropTable(
                name: "Branch");

            migrationBuilder.DropTable(
                name: "Tbl_CreditNote");

            migrationBuilder.DropTable(
                name: "Tbl_DebitNote");

            migrationBuilder.DropTable(
                name: "Tbl_DummyInvoices");

            migrationBuilder.DropTable(
                name: "tbl_EmployeeTaxDeclaration");

            migrationBuilder.DropTable(
                name: "Tbl_Enquiries");

            migrationBuilder.DropTable(
                name: "Tbl_Invoice");

            migrationBuilder.DropTable(
                name: "tbl_LeaveType");

            migrationBuilder.DropTable(
                name: "Tbl_LoanMasters");

            migrationBuilder.DropTable(
                name: "tbl_PayrollRun");

            migrationBuilder.DropTable(
                name: "Tbl_Offers");

            migrationBuilder.DropTable(
                name: "Tbl_ProformaInvoices");

            migrationBuilder.DropTable(
                name: "Tbl_PurchaseOrders");

            migrationBuilder.DropTable(
                name: "Tbl_ShipmentAgencyAssignments");

            migrationBuilder.DropTable(
                name: "tbl_Employee");

            migrationBuilder.DropTable(
                name: "Tbl_CompanyBankDetails");

            migrationBuilder.DropTable(
                name: "Tbl_ServiceMaster");

            migrationBuilder.DropTable(
                name: "Tbl_States");

            migrationBuilder.DropTable(
                name: "tbl_CustomerContact");

            migrationBuilder.DropTable(
                name: "tbl_ServiceReport");

            migrationBuilder.DropTable(
                name: "Tbl_ShipmentInitiates");

            migrationBuilder.DropTable(
                name: "tbl_Agency");

            migrationBuilder.DropTable(
                name: "tbl_Department");

            migrationBuilder.DropTable(
                name: "tbl_Designation");

            migrationBuilder.DropTable(
                name: "tbl_LevelMasters");

            migrationBuilder.DropTable(
                name: "tbl_WorkLocation");

            migrationBuilder.DropTable(
                name: "Tbl_Companies");

            migrationBuilder.DropTable(
                name: "Tbl_Countries");

            migrationBuilder.DropTable(
                name: "Tbl_Accessories");

            migrationBuilder.DropTable(
                name: "Tbl_OrderAcceptances");

            migrationBuilder.DropTable(
                name: "Tbl_Products");

            migrationBuilder.DropTable(
                name: "tbl_Customer");

            migrationBuilder.DropTable(
                name: "tbl_ShipmentMode");

            migrationBuilder.DropTable(
                name: "tbl_AgencyType");

            migrationBuilder.DropTable(
                name: "Brand");

            migrationBuilder.DropTable(
                name: "Category");

            migrationBuilder.DropTable(
                name: "Tax");

            migrationBuilder.DropTable(
                name: "Tbl_Currencies");

            migrationBuilder.DropTable(
                name: "Tbl_PartConditions");

            migrationBuilder.DropTable(
                name: "Tbl_ProductGroups");

            migrationBuilder.DropTable(
                name: "Tbl_ProductTypes");

            migrationBuilder.DropTable(
                name: "Tbl_ProductVersions");

            migrationBuilder.DropTable(
                name: "Tbl_Vendors");

            migrationBuilder.DropTable(
                name: "Unit");

            migrationBuilder.DropTable(
                name: "Tbl_CompanyGroups");
        }
    }
}
