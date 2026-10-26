
using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.DTO.Company;
using CompanyPlatform.Core.Models;
using CompanyPlatform.Core.Services.Common;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Services.Company
{
    public class CompanyService : ICompanyService
    {
        private readonly ApplicationDBContext _context;
        private readonly IFileService _fileService;

        public CompanyService(
            ApplicationDBContext context,
            IFileService fileService)
        {
            _context = context;
            _fileService = fileService;
        }

        // CREATE COMPANY
        public async Task<CompanyDto> CreateCompanyAsync(CompanyDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            if (string.IsNullOrWhiteSpace(dto.CompanyName))
                throw new ArgumentException("Company name is required.");

            var folderName = SanitizeFolderName(dto.CompanyName);
            var generatedCode =
                await GenerateUniqueCompanyCodeAsync(dto.CompanyName);

            string? logoPath = null;

            if (dto.CompanyLogo != null)
            {
                logoPath = await _fileService.SaveFileAsync(
                    dto.CompanyLogo,
                    folderName);
            }

            // Map directors and save their attachments
            var directors = new List<CompanyDirector>();

            foreach (var d in dto.Directors ?? new List<CompanyDirectorDto>())
            {
                string? docPath = d.DocsAttachmentPath;
                string? pptPath = d.PresentationPPTPath;

                if (d.DocsAttachment != null)
                {
                    docPath = await _fileService.SaveFileAsync(
                        d.DocsAttachment, folderName);
                }

                if (d.PresentationPPT != null)
                {
                    pptPath = await _fileService.SaveFileAsync(
                        d.PresentationPPT, folderName);
                }

                directors.Add(new CompanyDirector
                {
                    DirectorName = d.DirectorName,
                    Designation = d.Designation,
                    MobileNo = d.MobileNo,
                    Email = d.Email,
                    Website = d.Website,
                    DocsAttachmentPath = docPath ?? string.Empty,
                    PresentationPPTPath = pptPath ?? string.Empty
                });
            }

            // Map addresses
            var addresses = (dto.Addresses ?? new List<CompanyAddressDto>())
                .Select(a => new CompanyAddress
                {
                    AddressType = a.AddressType,
                    FlatBlock = a.FlatBlock,
                    Premises = a.Premises,
                    Road = a.Road,
                    Area = a.Area,
                    Town = a.Town,
                    PinCode = a.PinCode,
                    Country = a.Country,
                    State = a.State,
                    MobileNo = a.MobileNo,
                    AltMobileNo = a.AltMobileNo,
                    Email = a.Email,
                    AltEmail = a.AltEmail
                })
                .ToList();

            // Map bank details
            var bankDetails =
                (dto.BankDetails ?? new List<CompanyBankDetailDto>())
                .Select(b => new CompanyBankDetail
                {
                    BankName = b.BankName,
                    BankAddress = b.BankAddress,
                    AccountNo = b.AccountNo,
                    IFSC = b.IFSC,
                    SwiftCode = b.SwiftCode,
                    IBAN = b.IBAN,
                    AccountHolderName = b.AccountHolderName
                })
                .ToList();

            var company = new CompanyPlatform.Core.Models.Company
            {
                CompanyCode = generatedCode,
                CompanyName = dto.CompanyName.Trim(),
                LegalName = dto.LegalName?.Trim(),
                CompanyShortName = dto.CompanyShortName?.Trim(),
                LogoPath = logoPath,
                PAN = dto.PAN,
                TAN = dto.TAN,
                GSTIN = dto.GSTIN,
                CIN = dto.CIN,

                IsActive = dto.IsActive,
                IsDeleted = false,

                Addresses = addresses,
                Directors = directors,
                BankDetails = bankDetails
            };

            _context.Tbl_Companies.Add(company);
            await _context.SaveChangesAsync();

            dto.CompanyId = company.CompanyId;
            dto.CompanyCode = company.CompanyCode;
            dto.LegalName = company.LegalName;
            dto.LogoPath = company.LogoPath;
            dto.IsActive = company.IsActive;
            dto.IsDeleted = company.IsDeleted;

            return dto;
        }

        // UPDATE COMPANY
        public async Task<bool> UpdateCompanyAsync(CompanyDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            if (string.IsNullOrWhiteSpace(dto.CompanyName))
                throw new ArgumentException("Company name is required.");

            var company = await _context.Tbl_Companies
                .Include(c => c.Addresses)
                .Include(c => c.Directors)
                .Include(c => c.BankDetails)
                .FirstOrDefaultAsync(c =>
                    c.CompanyId == dto.CompanyId &&
                    !c.IsDeleted);

            if (company == null)
                return false;

            var folderName = SanitizeFolderName(dto.CompanyName);

            var addresses =
                dto.Addresses ?? new List<CompanyAddressDto>();

            var directors =
                dto.Directors ?? new List<CompanyDirectorDto>();

            var bankDetails =
                dto.BankDetails ?? new List<CompanyBankDetailDto>();

            // Replace logo only when a new file is supplied
            if (dto.CompanyLogo != null)
            {
                company.LogoPath = await _fileService.SaveFileAsync(
                    dto.CompanyLogo, folderName);
            }

            // Update company fields
            company.CompanyName = dto.CompanyName.Trim();
            company.LegalName = dto.LegalName?.Trim();
            company.CompanyShortName = dto.CompanyShortName?.Trim();
            company.PAN = dto.PAN;
            company.TAN = dto.TAN;
            company.GSTIN = dto.GSTIN;
            company.CIN = dto.CIN;
            company.IsActive = dto.IsActive;

            // Do not accept IsDeleted from the ordinary update payload.
            // Soft deletion is handled by SoftDeleteCompanyAsync.

            // Replace addresses
            _context.Tbl_CompanyAddresses.RemoveRange(company.Addresses);

            company.Addresses = addresses.Select(a => new CompanyAddress
            {
                CompanyId = company.CompanyId,
                AddressType = a.AddressType,
                FlatBlock = a.FlatBlock,
                Premises = a.Premises,
                Road = a.Road,
                Area = a.Area,
                Town = a.Town,
                PinCode = a.PinCode,
                Country = a.Country,
                State = a.State,
                MobileNo = a.MobileNo,
                AltMobileNo = a.AltMobileNo,
                Email = a.Email,
                AltEmail = a.AltEmail
            }).ToList();

            // Replace directors and preserve/re-upload attachments
            _context.Tbl_CompanyDirectors.RemoveRange(company.Directors);

            var updatedDirectors = new List<CompanyDirector>();

            foreach (var d in directors)
            {
                string? docPath = d.DocsAttachmentPath;
                string? pptPath = d.PresentationPPTPath;

                if (d.DocsAttachment != null)
                {
                    docPath = await _fileService.SaveFileAsync(
                        d.DocsAttachment, folderName);
                }

                if (d.PresentationPPT != null)
                {
                    pptPath = await _fileService.SaveFileAsync(
                        d.PresentationPPT, folderName);
                }

                updatedDirectors.Add(new CompanyDirector
                {
                    CompanyId = company.CompanyId,
                    DirectorName = d.DirectorName,
                    Designation = d.Designation,
                    MobileNo = d.MobileNo,
                    Email = d.Email,
                    Website = d.Website,
                    DocsAttachmentPath =
                        docPath ?? string.Empty,
                    PresentationPPTPath =
                        pptPath ?? string.Empty
                });
            }

            company.Directors = updatedDirectors;

            // Replace bank details
            _context.Tbl_CompanyBankDetails.RemoveRange(company.BankDetails);

            company.BankDetails = bankDetails.Select(b => new CompanyBankDetail
            {
                CompanyId = company.CompanyId,
                BankName = b.BankName,
                BankAddress = b.BankAddress,
                AccountNo = b.AccountNo,
                IFSC = b.IFSC,
                SwiftCode = b.SwiftCode,
                IBAN = b.IBAN,
                AccountHolderName = b.AccountHolderName
            }).ToList();

            await _context.SaveChangesAsync();
            return true;
        }

        // GET ALL COMPANIES
        public async Task<IEnumerable<CompanyListDto>> GetCompaniesAsync()
        {
            return await _context.Tbl_Companies
                .AsNoTracking()
                .Where(c => !c.IsDeleted)
                .OrderByDescending(c => c.CompanyId)
                .Select(c => new CompanyListDto
                {
                    CompanyId = c.CompanyId,
                    CompanyName = c.CompanyName,

                    // Add these properties to CompanyListDto
                    LegalName = c.LegalName,
                    IsActive = c.IsActive,
                    IsDeleted = c.IsDeleted,

                    DirectorName = c.Directors
                        .Select(d => d.DirectorName)
                        .FirstOrDefault(),

                    Designation = c.Directors
                        .Select(d => d.Designation)
                        .FirstOrDefault(),

                    Address = c.Addresses
                        .Where(a => a.AddressType == "Correspondence")
                        .Select(a =>
                            (a.FlatBlock ?? "") + ", " +
                            (a.Area ?? "") + ", " +
                            (a.Town ?? ""))
                        .FirstOrDefault(),

                    MobileNo = c.Addresses
                        .Where(a => a.AddressType == "Correspondence")
                        .Select(a => a.MobileNo)
                        .FirstOrDefault(),

                    Email = c.Addresses
                        .Where(a => a.AddressType == "Correspondence")
                        .Select(a => a.Email)
                        .FirstOrDefault(),

                    StateName = c.Addresses
                        .Where(a => a.AddressType == "Correspondence")
                        .Select(a => a.State)
                        .FirstOrDefault()
                })
                .ToListAsync();
        }

        // GET COMPANY BY ID
        public async Task<CompanyGetDto> GetCompanyAsync(int id)
        {
            return await _context.Tbl_Companies
                .AsNoTracking()
                .Where(c => c.CompanyId == id && !c.IsDeleted)
                .Select(c => new CompanyGetDto
                {
                    CompanyId = c.CompanyId,
                    CompanyCode = c.CompanyCode,
                    CompanyName = c.CompanyName,
                    LegalName = c.LegalName,
                    CompanyShortName = c.CompanyShortName,
                    LogoPath = c.LogoPath,
                    PAN = c.PAN,
                    TAN = c.TAN,
                    GSTIN = c.GSTIN,
                    CIN = c.CIN,
                    IsActive = c.IsActive,
                    IsDeleted = c.IsDeleted,

                    Addresses = c.Addresses.Select(a => new CompanyAddressDto
                    {
                        AddressId = a.AddressId,
                        CompanyId = a.CompanyId,
                        AddressType = a.AddressType,
                        FlatBlock = a.FlatBlock,
                        Premises = a.Premises,
                        Road = a.Road,
                        Area = a.Area,
                        Town = a.Town,
                        PinCode = a.PinCode,
                        Country = a.Country,
                        State = a.State,
                        MobileNo = a.MobileNo,
                        AltMobileNo = a.AltMobileNo,
                        Email = a.Email,
                        AltEmail = a.AltEmail
                    }).ToList(),

                    Directors = c.Directors.Select(d => new CompanyDirectorDto
                    {
                        DirectorName = d.DirectorName,
                        Designation = d.Designation,
                        MobileNo = d.MobileNo,
                        Email = d.Email,
                        Website = d.Website,
                        DocsAttachmentPath = d.DocsAttachmentPath,
                        PresentationPPTPath = d.PresentationPPTPath
                    }).ToList(),

                    BankDetails = c.BankDetails.Select(b => new CompanyBankDetailDto
                    {
                        BankDetailId = b.BankDetailId,
                        CompanyId = b.CompanyId,
                        BankName = b.BankName,
                        BankAddress = b.BankAddress,
                        AccountNo = b.AccountNo,
                        IFSC = b.IFSC,
                        SwiftCode = b.SwiftCode,
                        IBAN = b.IBAN,
                        AccountHolderName = b.AccountHolderName
                    }).ToList()
                })
                .FirstOrDefaultAsync();
        }

        // SOFT DELETE COMPANY
        public async Task SoftDeleteCompanyAsync(int id)
        {
            var company = await _context.Tbl_Companies
                .FirstOrDefaultAsync(c => c.CompanyId == id);

            if (company == null)
                return;

            company.IsDeleted = true;
            await _context.SaveChangesAsync();
        }

        // ADD ADDRESS
        public async Task AddAddressAsync(CompanyAddressDto dto)
        {
            var companyExists = await _context.Tbl_Companies.AnyAsync(c =>
                c.CompanyId == dto.CompanyId && !c.IsDeleted);

            if (!companyExists)
                throw new Exception("Company not found.");

            var address = new CompanyAddress
            {
                CompanyId = dto.CompanyId,
                AddressType = dto.AddressType,
                FlatBlock = dto.FlatBlock,
                Premises = dto.Premises,
                Road = dto.Road,
                Area = dto.Area,
                Town = dto.Town,
                PinCode = dto.PinCode,
                Country = dto.Country,
                State = dto.State,
                MobileNo = dto.MobileNo,
                AltMobileNo = dto.AltMobileNo,
                Email = dto.Email,
                AltEmail = dto.AltEmail
            };

            _context.Tbl_CompanyAddresses.Add(address);
            await _context.SaveChangesAsync();
        }

        // ADD DIRECTOR
        public async Task AddDirectorAsync(CompanyDirectorDto dto)
        {
            var company = await _context.Tbl_Companies
                .FirstOrDefaultAsync(c =>
                    c.CompanyId == dto.CompanyId && !c.IsDeleted);

            if (company == null)
                throw new Exception("Company not found.");

            var folderName = SanitizeFolderName(company.CompanyName);

            string? docPath = null;
            string? pptPath = null;

            if (dto.DocsAttachment != null)
            {
                docPath = await _fileService.SaveFileAsync(
                    dto.DocsAttachment, folderName);
            }

            if (dto.PresentationPPT != null)
            {
                pptPath = await _fileService.SaveFileAsync(
                    dto.PresentationPPT, folderName);
            }

            var director = new CompanyDirector
            {
                CompanyId = dto.CompanyId,
                DirectorName = dto.DirectorName,
                Designation = dto.Designation,
                MobileNo = dto.MobileNo,
                Email = dto.Email,
                Website = dto.Website,
                DocsAttachmentPath =
                    docPath ?? dto.DocsAttachmentPath ?? string.Empty,
                PresentationPPTPath =
                    pptPath ?? dto.PresentationPPTPath ?? string.Empty
            };

            _context.Tbl_CompanyDirectors.Add(director);
            await _context.SaveChangesAsync();
        }

        // ADD BANK DETAIL
        public async Task AddBankAsync(CompanyBankDetailDto dto)
        {
            var companyExists = await _context.Tbl_Companies.AnyAsync(c =>
                c.CompanyId == dto.CompanyId && !c.IsDeleted);

            if (!companyExists)
                throw new Exception("Company not found.");

            var bank = new CompanyBankDetail
            {
                CompanyId = dto.CompanyId,
                BankName = dto.BankName,
                BankAddress = dto.BankAddress,
                AccountNo = dto.AccountNo,
                IFSC = dto.IFSC,
                SwiftCode = dto.SwiftCode,
                IBAN = dto.IBAN,
                AccountHolderName = dto.AccountHolderName
            };

            _context.Tbl_CompanyBankDetails.Add(bank);
            await _context.SaveChangesAsync();
        }

        // GET BANKS BY COMPANY
        public async Task<List<CompanyBankDetailDto>>
            GetBankDetailsByCompanyIdAsync(int companyId)
        {
            return await _context.Tbl_CompanyBankDetails
                .AsNoTracking()
                .Where(b => b.CompanyId == companyId)
                .Select(b => new CompanyBankDetailDto
                {
                    BankDetailId = b.BankDetailId,
                    CompanyId = b.CompanyId,
                    BankName = b.BankName,
                    BankAddress = b.BankAddress,
                    AccountNo = b.AccountNo,
                    IFSC = b.IFSC,
                    SwiftCode = b.SwiftCode,
                    IBAN = b.IBAN,
                    AccountHolderName = b.AccountHolderName
                })
                .ToListAsync();
        }

        // GET ALL BANK DETAILS
        public async Task<List<CompanyBankDetailDto>> GetAllBankDetailsAsync()
        {
            return await _context.Tbl_CompanyBankDetails
                .AsNoTracking()
                .Select(b => new CompanyBankDetailDto
                {
                    BankDetailId = b.BankDetailId,
                    CompanyId = b.CompanyId,
                    BankName = b.BankName,
                    BankAddress = b.BankAddress,
                    AccountNo = b.AccountNo,
                    IFSC = b.IFSC,
                    SwiftCode = b.SwiftCode,
                    IBAN = b.IBAN,
                    AccountHolderName = b.AccountHolderName
                })
                .ToListAsync();
        }

        // GENERATE UNIQUE COMPANY CODE
        public async Task<string> GenerateUniqueCompanyCodeAsync(
            string companyName)
        {
            if (string.IsNullOrWhiteSpace(companyName))
                throw new ArgumentException("Company name is required.",
                    nameof(companyName));

            var prefix = new string(
                companyName.ToUpperInvariant()
                    .Where(char.IsLetter)
                    .Take(3)
                    .ToArray());

            if (prefix.Length < 3)
                prefix = prefix.PadRight(3, 'X');

            var existingCodes = await _context.Tbl_Companies
                .Where(c => c.CompanyCode.StartsWith(prefix))
                .Select(c => c.CompanyCode)
                .ToListAsync();

            var highestNumber = existingCodes
                .Select(code =>
                {
                    var numericPart = code.Substring(prefix.Length);
                    return int.TryParse(numericPart, out var number)
                        ? number
                        : 0;
                })
                .DefaultIfEmpty(0)
                .Max();

            return $"{prefix}{highestNumber + 1:D4}";
        }

        private static string SanitizeFolderName(string? name)
        {
            if (string.IsNullOrWhiteSpace(name))
                return "default_company";

            var invalidChars = Path.GetInvalidFileNameChars();

            var sanitized = new string(
                name.Trim()
                    .Select(c => invalidChars.Contains(c) ? '_' : c)
                    .ToArray());

            return string.IsNullOrWhiteSpace(sanitized)
                ? "default_company"
                : sanitized;
        }
    }
}
