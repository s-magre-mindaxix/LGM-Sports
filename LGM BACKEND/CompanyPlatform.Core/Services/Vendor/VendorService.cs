using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.DTO.Vendor;
using CompanyPlatform.Core.Models;
using CompanyPlatform.Core.Services.Common;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Services.Vendor
{
    public class VendorService : IVendorService
    {
        private readonly ApplicationDBContext _context;
        private readonly IFileService _fileService;

        public VendorService(ApplicationDBContext context, IFileService fileService)
        {
            _context = context;
            _fileService = fileService;
        }

        public async Task<List<VendorDto>> GetAllAsync()
        {
            return await _context.Tbl_Vendors
                .Where(v => !v.IsDeleted) // Only get vendors not soft-deleted
                .Select(v => new VendorDto
                {
                    Id = v.Id,
                    VendorName = v.VendorName,
                    VendorCode = v.VendorCode,
                    VendorShortName = v.VendorShortName,
                    VendorDivision = v.VendorDivision,
                    VendorLogo = v.VendorLogo,
                    VendorPAN = v.VendorPAN,
                    VendorTAN = v.VendorTAN,
                    VATNo = v.VATNo,
                    MSMENo = v.MSMENo,
                    GSTIN = v.GSTIN,
                    CIN = v.CIN,

                    // Mapping Addresses with all requested fields
                    Addresses = v.Addresses.Where(a => !a.IsDeleted).Select(a => new VendorAddressDto
                    {
                        Id = a.Id,
                        FlatBlockNo = a.FlatBlockNo,
                        Premises = a.Premises,
                        RoadStrLane = a.RoadStrLane,
                        Area = a.Area,
                        Town = a.Town,
                        PinNo = a.PinNo,
                        CountryId = a.CountryId,
                        StateId = a.StateId,
                        MobileNo = a.MobileNo,
                        AltMobileNo = a.AltMobileNo,
                        EmailAddress = a.EmailAddress,
                        AltEmailAddress = a.AltEmailAddress
                    }).ToList(),

                    // Mapping Principal Contacts with all requested fields
                    PrincipalContacts = v.PrincipalContacts.Where(c => !c.IsDeleted).Select(c => new VendorContactDto
                    {
                        Id = c.Id,
                        PersonName = c.PersonName,
                        Designation = c.Designation,
                        MobileNo = c.MobileNo,
                        EmailAddress = c.EmailAddress,
                        DocsAttachment = c.DocsAttachment
                    }).ToList(),

                    // Mapping Bank Details with all requested fields
                    BankDetails = v.BankDetails.Where(b => !b.IsDeleted).Select(b => new VendorBankDetailDto
                    {
                        Id = b.Id,
                        BankName = b.BankName,
                        BankAddress = b.BankAddress,
                        EmailAddress = b.EmailAddress,
                        AccountNo = b.AccountNo,
                        IFSCCode = b.IFSCCode,
                        AccountHolderName = b.AccountHolderName,
                        SwiftCode = b.SwiftCode,
                        IBANNo = b.IBANNo
                    }).ToList()
                })
                .ToListAsync();
        }

        public async Task<VendorDto> GetByIdAsync(int id)
        {
            return await _context.Tbl_Vendors
                    .Include(v => v.Addresses).ThenInclude(a => a.Country)
                    .Include(v => v.Addresses).ThenInclude(a => a.State)
                .Where(v => v.Id == id && !v.IsDeleted) // Filter by ID and Soft Delete
                .Select(v => new VendorDto
                {
                    Id = v.Id,
                    VendorName = v.VendorName,
                    VendorCode = v.VendorCode,
                    VendorShortName = v.VendorShortName,
                    VendorDivision = v.VendorDivision,
                    VendorLogo = v.VendorLogo,
                    VendorPAN = v.VendorPAN,
                    VendorTAN = v.VendorTAN,
                    VATNo = v.VATNo,
                    MSMENo = v.MSMENo,
                    GSTIN = v.GSTIN,
                    CIN = v.CIN,

                    // Map Addresses list
                    Addresses = v.Addresses.Where(a => !a.IsDeleted).Select(a => new VendorAddressDto
                    {
                        Id = a.Id,
                        AddressType = a.AddressType,
                        FlatBlockNo = a.FlatBlockNo,
                        Premises = a.Premises,
                        RoadStrLane = a.RoadStrLane,
                        Area = a.Area,
                        Town = a.Town,
                        PinNo = a.PinNo,
                        CountryId = a.CountryId,
                        CountryName = a.Country.CountryName,
                        StateId = a.StateId,
                        StateName = a.State.StateName,
                        MobileNo = a.MobileNo,
                        AltMobileNo = a.AltMobileNo,
                        EmailAddress = a.EmailAddress,
                        AltEmailAddress = a.AltEmailAddress
                    }).ToList(),

                    // Map Contacts list
                    PrincipalContacts = v.PrincipalContacts.Where(c => !c.IsDeleted).Select(c => new VendorContactDto
                    {
                        Id = c.Id,
                        PersonName = c.PersonName,
                        Designation = c.Designation,
                        MobileNo = c.MobileNo,
                        EmailAddress = c.EmailAddress,
                        DocsAttachment = c.DocsAttachment
                    }).ToList(),

                    // Map Bank details list
                    BankDetails = v.BankDetails.Where(b => !b.IsDeleted).Select(b => new VendorBankDetailDto
                    {
                        Id = b.Id,
                        BankName = b.BankName,
                        BankAddress = b.BankAddress,
                        EmailAddress = b.EmailAddress,
                        AccountNo = b.AccountNo,
                        IFSCCode = b.IFSCCode,
                        AccountHolderName = b.AccountHolderName,
                        SwiftCode = b.SwiftCode,
                        IBANNo = b.IBANNo
                    }).ToList()
                })
                .FirstOrDefaultAsync();
        }
        public async Task<VendorDto> CreateAsync(VendorDto dto)
        {
            var folderName = SanitizeFolderName(dto.VendorName);
            string generatedCode = await GenerateUniqueVendorCodeAsync();
            // 1. Handle Logo Upload
            string? logoPath = null;
            if (dto.LogoFile != null)
            {
                logoPath = await _fileService.SaveFileAsync(dto.LogoFile, folderName);
            }

            var contacts = new List<VendorContact>();
            if (dto.PrincipalContacts != null)
            {
                foreach (var cDto in dto.PrincipalContacts
                    .Where(c => !string.IsNullOrWhiteSpace(c.PersonName)))
                {
                    string? contactDocPath = null;

                    if (cDto.ContactFile != null)
                    {
                        contactDocPath = await _fileService.SaveFileAsync(cDto.ContactFile, folderName);
                    }

                    contacts.Add(new VendorContact
                    {
                        PersonName = cDto.PersonName,
                        Designation = string.IsNullOrWhiteSpace(cDto.Designation) ? null : cDto.Designation,
                        MobileNo = cDto.MobileNo,
                        EmailAddress = cDto.EmailAddress,
                        DocsAttachment = contactDocPath,
                    });
                }
            }


            var vendor = new Models.Vendor
            {
                VendorName = dto.VendorName,
                VendorCode = generatedCode,
                VendorShortName = dto.VendorShortName,
                VendorDivision = dto.VendorDivision ?? string.Empty,
                VendorLogo = logoPath ?? string.Empty,
                VendorPAN = dto.VendorPAN ?? string.Empty,
                VendorTAN = dto.VendorTAN ?? string.Empty,
                VATNo = dto.VATNo ?? string.Empty,
                MSMENo = dto.MSMENo ?? string.Empty,
                GSTIN = dto.GSTIN ?? string.Empty,
                CIN = dto.CIN ?? string.Empty,

                Addresses = (dto.Addresses ?? new List<VendorAddressDto>())
                    .Where(a =>
                        !string.IsNullOrWhiteSpace(a.Area) ||
                        !string.IsNullOrWhiteSpace(a.Town) ||
                        !string.IsNullOrWhiteSpace(a.MobileNo)
                    )
                    .Select(a => new VendorAddress
                    {
                    AddressType = a.AddressType,
                    FlatBlockNo = string.IsNullOrWhiteSpace(a.FlatBlockNo) ? null : a.FlatBlockNo,
                    Premises = string.IsNullOrWhiteSpace(a.Premises) ? null : a.Premises,
                    RoadStrLane = string.IsNullOrWhiteSpace(a.RoadStrLane) ? null : a.RoadStrLane,
                    Area = a.Area,
                    Town = a.Town,
                    PinNo = a.PinNo,
                    CountryId = a.CountryId,
                    StateId = a.StateId,
                    MobileNo = a.MobileNo,
                    AltMobileNo = string.IsNullOrWhiteSpace(a.AltMobileNo) ? null : a.AltMobileNo,
                    EmailAddress = string.IsNullOrWhiteSpace(a.EmailAddress) ? null : a.EmailAddress,
                    AltEmailAddress = string.IsNullOrWhiteSpace(a.AltEmailAddress) ? null : a.AltEmailAddress,
                }).ToList(),

                PrincipalContacts = contacts,
                BankDetails = (dto.BankDetails ?? new List<VendorBankDetailDto>())
                            .Where(b => !string.IsNullOrWhiteSpace(b.BankName))
                            .Select(b => new VendorBankDetail
                            {
                                BankName = b.BankName,
                                BankAddress = string.IsNullOrWhiteSpace(b.BankAddress) ? null : b.BankAddress,
                                EmailAddress = string.IsNullOrWhiteSpace(b.EmailAddress) ? null : b.EmailAddress,
                                AccountNo = b.AccountNo,
                                IFSCCode = b.IFSCCode,
                                AccountHolderName = b.AccountHolderName,
                                SwiftCode = string.IsNullOrWhiteSpace(b.SwiftCode) ? null : b.SwiftCode,
                                IBANNo = string.IsNullOrWhiteSpace(b.IBANNo) ? null : b.IBANNo,
                            }).ToList()
            };

            _context.Tbl_Vendors.Add(vendor);
            await _context.SaveChangesAsync();

            dto.Id = vendor.Id;
            dto.VendorCode = generatedCode;
            dto.VendorLogo = logoPath;
            return dto;
        }

        private string SanitizeFolderName(string name)
        {
            if (string.IsNullOrEmpty(name)) return "default_vendor";
            var trimmedName = name.Trim();
            return string.Join("_", trimmedName.Split(Path.GetInvalidFileNameChars()));
        }

        public async Task<string> GenerateUniqueVendorCodeAsync()
        {
            string prefix = "GAX-V-";

            // Get last vendor code
            var lastVendorCode = await _context.Tbl_Vendors
                .Where(v => v.VendorCode.StartsWith(prefix))
                .OrderByDescending(v => v.Id)
                .Select(v => v.VendorCode)
                .FirstOrDefaultAsync();

            int nextNumber = 1;

            if (!string.IsNullOrEmpty(lastVendorCode))
            {
                var numericPart = lastVendorCode.Replace(prefix, "");

                if (int.TryParse(numericPart, out int lastNumber))
                {
                    nextNumber = lastNumber + 1;
                }
            }

            return $"{prefix}{nextNumber:D4}";
        }
        public async Task<bool> UpdateAsync(VendorDto dto)
        {
            var existingVendor = await _context.Tbl_Vendors
                .Include(v => v.Addresses)
                .Include(v => v.PrincipalContacts)
                .Include(v => v.BankDetails)
                .FirstOrDefaultAsync(v => v.Id == dto.Id);

            if (existingVendor == null) return false;

            var folderName = SanitizeFolderName(dto.VendorName);

            // 1. Update Basic Details
            if (dto.LogoFile != null)
                existingVendor.VendorLogo = await _fileService.SaveFileAsync(dto.LogoFile, folderName);

            existingVendor.VendorName = dto.VendorName;
            existingVendor.VendorCode = dto.VendorCode;
            existingVendor.VendorShortName = dto.VendorShortName;
            existingVendor.VendorDivision = dto.VendorDivision;
            existingVendor.VendorPAN = dto.VendorPAN;
            existingVendor.VendorTAN = dto.VendorTAN;
            existingVendor.VATNo = dto.VATNo;
            existingVendor.MSMENo = dto.MSMENo;
            existingVendor.GSTIN = dto.GSTIN;
            existingVendor.CIN = dto.CIN;

            // 2. Clear and Re-add Addresses
            _context.Tbl_VendorAddresses.RemoveRange(existingVendor.Addresses);
            existingVendor.Addresses = dto.Addresses.Select(a => new VendorAddress
            {
                AddressType = a.AddressType,
                FlatBlockNo = a.FlatBlockNo,
                Premises = a.Premises,
                RoadStrLane = a.RoadStrLane,
                Area = a.Area,
                Town = a.Town,
                PinNo = a.PinNo,
                CountryId = a.CountryId,
                StateId = a.StateId,
                MobileNo = a.MobileNo,
                AltMobileNo = a.AltMobileNo,
                EmailAddress = a.EmailAddress,
                AltEmailAddress = a.AltEmailAddress
            }).ToList();

            // 3. Clear and Re-add Contacts (Handling Files)
            _context.Tbl_VendorContacts.RemoveRange(existingVendor.PrincipalContacts);
            foreach (var cDto in dto.PrincipalContacts)
            {
                string? path = cDto.DocsAttachment;
                if (cDto.ContactFile != null)
                    path = await _fileService.SaveFileAsync(cDto.ContactFile, folderName);

                existingVendor.PrincipalContacts.Add(new VendorContact
                {
                    PersonName = cDto.PersonName,
                    Designation = cDto.Designation,
                    MobileNo = cDto.MobileNo,
                    EmailAddress = cDto.EmailAddress,
                    DocsAttachment = path ?? ""
                });
            }

            // 4. Clear and Re-add Bank Details
            _context.Tbl_VendorBankDetails.RemoveRange(existingVendor.BankDetails);
            existingVendor.BankDetails = dto.BankDetails.Select(b => new VendorBankDetail
            {
                BankName = b.BankName,
                BankAddress = b.BankAddress,
                EmailAddress = b.EmailAddress,
                AccountNo = b.AccountNo,
                IFSCCode = b.IFSCCode,
                AccountHolderName = b.AccountHolderName,
                SwiftCode = b.SwiftCode,
                IBANNo = b.IBANNo
            }).ToList();

            await _context.SaveChangesAsync();
            return true;
        }


        public async Task<bool> DeleteAsync(int id)
        {
            // Fetch the vendor along with its child records
            var vendor = await _context.Tbl_Vendors
                .Include(v => v.Addresses)
                .Include(v => v.PrincipalContacts)
                .Include(v => v.BankDetails)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (vendor == null) return false;

            vendor.IsDeleted = true;

            // 2. Soft Delete all related child records as well
            if (vendor.Addresses != null)
            {
                foreach (var addr in vendor.Addresses)
                {
                    addr.IsDeleted = true;
                }
            }

            if (vendor.PrincipalContacts != null)
            {
                foreach (var contact in vendor.PrincipalContacts)
                {
                    contact.IsDeleted = true;
                }
            }

            if (vendor.BankDetails != null)
            {
                foreach (var bank in vendor.BankDetails)
                {
                    bank.IsDeleted = true;
                }
            }

            // Save changes to the database
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
