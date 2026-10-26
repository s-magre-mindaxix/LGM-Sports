using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models.ERP;
using CompanyPlatform.Core.Services.Common;
using CompanyPlatform.ERP.DTO.AgencyDTO;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.Services.Agency
{
    public class AgencyService : IAgencyService
    {
        private readonly ApplicationDBContext _context;
        private readonly IFileService _fileService;

        public AgencyService(
            ApplicationDBContext context,
            IFileService fileService)
        {
            _context = context;
            _fileService = fileService;
        }

        public async Task<List<AgencyDto>> GetAllAsync()
        {
            return await _context.Tbl_Agencies
                .Where(x => !x.IsDeleted)
                .Include(x => x.AgencyType)
                .Select(x => new AgencyDto
                {
                    Id = x.Id,
                    AgencyName = x.AgencyName,
                    AgencyCode = x.AgencyCode,
                    AgencyTypeId = x.AgencyTypeId,
                    AgencyTypeName = x.AgencyType.AgencyTypeName,
                    AgencyShortName = x.AgencyShortName,
                    AgencyLogo = x.AgencyLogo,
                    PANNo = x.PANNo,
                    TANNo = x.TANNo,
                    GSTIN = x.GSTIN,
                    CINNo = x.CINNo,
                    IATACode = x.IATACode,
                    FMCCode = x.FMCCode,
                    LicenseNo = x.LicenseNo,
                    Website = x.Website,

                    Addresses = x.Addresses
                        .Where(a => !a.IsDeleted)
                        .Select(a => new AgencyAddressDto
                        {
                            Id = a.Id,
                            AddressType = a.AddressType,
                            FlatBlockNo = a.FlatBlockNo,
                            Premises = a.Premises,
                            RoadStreetLane = a.RoadStreetLane,
                            Area = a.Area,
                            TownCity = a.TownCity,
                            Pincode = a.Pincode,
                            CountryId = a.CountryId,
                            StateId = a.StateId,
                            MobileNo = a.MobileNo,
                            AlternateMobileNo = a.AlternateMobileNo,
                            EmailAddress = a.EmailAddress,
                            AlternateEmailAddress = a.AlternateEmailAddress
                        }).ToList(),

                    Contacts = x.Contacts
                        .Where(c => !c.IsDeleted)
                        .Select(c => new AgencyContactDto
                        {
                            Id = c.Id,
                            PersonName = c.PersonName,
                            Designation = c.Designation,
                            Department = c.Department,
                            MobileNo = c.MobileNo,
                            AlternateMobileNo = c.AlternateMobileNo,
                            EmailAddress = c.EmailAddress,
                            DocsAttachment = c.DocsAttachment
                        }).ToList(),

                    BankDetails = x.BankDetails
                        .Where(b => !b.IsDeleted)
                        .Select(b => new AgencyBankDetailDto
                        {
                            Id = b.Id,
                            BankName = b.BankName,
                            BankAddress = b.BankAddress,
                            AccountHolderName = b.AccountHolderName,
                            AccountNo = b.AccountNo,
                            IFSCCode = b.IFSCCode,
                            SwiftCode = b.SwiftCode,
                            IBANNo = b.IBANNo,
                            EmailAddress = b.EmailAddress
                        }).ToList()
                })
                .ToListAsync();
        }

        public async Task<AgencyDto> GetByIdAsync(int id)
        {
            return await _context.Tbl_Agencies
                .Include(x => x.AgencyType)
                .Include(x => x.Addresses)
                    .ThenInclude(a => a.Country)
                .Include(x => x.Addresses)
                    .ThenInclude(a => a.State)
                .Where(x => x.Id == id && !x.IsDeleted)
                .Select(x => new AgencyDto
                {
                    Id = x.Id,
                    AgencyName = x.AgencyName,
                    AgencyCode = x.AgencyCode,
                    AgencyTypeId = x.AgencyTypeId,
                    AgencyTypeName = x.AgencyType.AgencyTypeName,
                    AgencyShortName = x.AgencyShortName,
                    AgencyLogo = x.AgencyLogo,
                    PANNo = x.PANNo,
                    TANNo = x.TANNo,
                    GSTIN = x.GSTIN,
                    CINNo = x.CINNo,
                    IATACode = x.IATACode,
                    FMCCode = x.FMCCode,
                    LicenseNo = x.LicenseNo,
                    Website = x.Website,

                    Addresses = x.Addresses
                        .Where(a => !a.IsDeleted)
                        .Select(a => new AgencyAddressDto
                        {
                            Id = a.Id,
                            AddressType = a.AddressType,
                            FlatBlockNo = a.FlatBlockNo,
                            Premises = a.Premises,
                            RoadStreetLane = a.RoadStreetLane,
                            Area = a.Area,
                            TownCity = a.TownCity,
                            Pincode = a.Pincode,
                            CountryId = a.CountryId,
                            CountryName = a.Country.CountryName,
                            StateId = a.StateId,
                            StateName = a.State.StateName,
                            MobileNo = a.MobileNo,
                            AlternateMobileNo = a.AlternateMobileNo,
                            EmailAddress = a.EmailAddress,
                            AlternateEmailAddress = a.AlternateEmailAddress
                        }).ToList(),

                    Contacts = x.Contacts
                        .Where(c => !c.IsDeleted)
                        .Select(c => new AgencyContactDto
                        {
                            Id = c.Id,
                            PersonName = c.PersonName,
                            Designation = c.Designation,
                            Department = c.Department,
                            MobileNo = c.MobileNo,
                            AlternateMobileNo = c.AlternateMobileNo,
                            EmailAddress = c.EmailAddress,
                            DocsAttachment = c.DocsAttachment
                        }).ToList(),

                    BankDetails = x.BankDetails
                        .Where(b => !b.IsDeleted)
                        .Select(b => new AgencyBankDetailDto
                        {
                            Id = b.Id,
                            BankName = b.BankName,
                            BankAddress = b.BankAddress,
                            AccountHolderName = b.AccountHolderName,
                            AccountNo = b.AccountNo,
                            IFSCCode = b.IFSCCode,
                            SwiftCode = b.SwiftCode,
                            IBANNo = b.IBANNo,
                            EmailAddress = b.EmailAddress
                        }).ToList()
                })
                .FirstOrDefaultAsync();
        }

        public async Task<AgencyDto> CreateAsync(AgencyDto dto)
        {
            var folderName = dto.AgencyName.Replace(" ", "_");

            string? logoPath = null;

            if (dto.LogoFile != null)
            {
                logoPath = await _fileService
                    .SaveFileAsync(dto.LogoFile, folderName);
            }

            var contacts = new List<AgencyContact>();

            if (dto.Contacts != null)
            {
                foreach (var c in dto.Contacts)
                {
                    string? docPath = null;

                    if (c.ContactFile != null)
                    {
                        docPath = await _fileService
                            .SaveFileAsync(c.ContactFile, folderName);
                    }

                    contacts.Add(new AgencyContact
                    {
                        PersonName = c.PersonName,
                        Designation = c.Designation,
                        Department = c.Department,
                        MobileNo = c.MobileNo,
                        AlternateMobileNo = c.AlternateMobileNo,
                        EmailAddress = c.EmailAddress,
                        DocsAttachment = docPath
                    });
                }
            }

            var agency = new Core.Models.ERP.Agency
            {
                AgencyName = dto.AgencyName,
                AgencyCode = dto.AgencyCode,
                AgencyTypeId = dto.AgencyTypeId,
                AgencyShortName = dto.AgencyShortName,
                AgencyLogo = logoPath,
                PANNo = dto.PANNo,
                TANNo = dto.TANNo,
                GSTIN = dto.GSTIN,
                CINNo = dto.CINNo,
                IATACode = dto.IATACode,
                FMCCode = dto.FMCCode,
                LicenseNo = dto.LicenseNo,
                Website = dto.Website,

                Addresses = dto.Addresses.Select(a => new AgencyAddress
                {
                    AddressType = a.AddressType,
                    FlatBlockNo = a.FlatBlockNo,
                    Premises = a.Premises,
                    RoadStreetLane = a.RoadStreetLane,
                    Area = a.Area,
                    TownCity = a.TownCity,
                    Pincode = a.Pincode,
                    CountryId = a.CountryId,
                    StateId = a.StateId,
                    MobileNo = a.MobileNo,
                    AlternateMobileNo = a.AlternateMobileNo,
                    EmailAddress = a.EmailAddress,
                    AlternateEmailAddress = a.AlternateEmailAddress
                }).ToList(),

                Contacts = contacts,

                BankDetails = dto.BankDetails.Select(b => new AgencyBankDetail
                {
                    BankName = b.BankName,
                    BankAddress = b.BankAddress,
                    AccountHolderName = b.AccountHolderName,
                    AccountNo = b.AccountNo,
                    IFSCCode = b.IFSCCode,
                    SwiftCode = b.SwiftCode,
                    IBANNo = b.IBANNo,
                    EmailAddress = b.EmailAddress
                }).ToList()
            };

            _context.Tbl_Agencies.Add(agency);

            await _context.SaveChangesAsync();

            dto.Id = agency.Id;
            dto.AgencyLogo = logoPath;

            return dto;
        }

        public async Task<bool> UpdateAsync(AgencyDto dto)
        {
            var existingAgency = await _context.Tbl_Agencies
                .Include(x => x.Addresses)
                .Include(x => x.Contacts)
                .Include(x => x.BankDetails)
                .FirstOrDefaultAsync(x => x.Id == dto.Id);

            if (existingAgency == null)
                return false;

            var folderName = dto.AgencyName.Replace(" ", "_");

            if (dto.LogoFile != null)
            {
                existingAgency.AgencyLogo = await _fileService
                    .SaveFileAsync(dto.LogoFile, folderName);
            }

            existingAgency.AgencyName = dto.AgencyName;
            existingAgency.AgencyCode = dto.AgencyCode;
            existingAgency.AgencyTypeId = dto.AgencyTypeId;
            existingAgency.AgencyShortName = dto.AgencyShortName;
            existingAgency.PANNo = dto.PANNo;
            existingAgency.TANNo = dto.TANNo;
            existingAgency.GSTIN = dto.GSTIN;
            existingAgency.CINNo = dto.CINNo;
            existingAgency.IATACode = dto.IATACode;
            existingAgency.FMCCode = dto.FMCCode;
            existingAgency.LicenseNo = dto.LicenseNo;
            existingAgency.Website = dto.Website;

            // Remove old child records
            _context.Tbl_AgencyAddresses.RemoveRange(existingAgency.Addresses);
            _context.Tbl_AgencyContacts.RemoveRange(existingAgency.Contacts);
            _context.TbL_AgencyBankDetails.RemoveRange(existingAgency.BankDetails);

            // Add Addresses
            existingAgency.Addresses = dto.Addresses.Select(a => new AgencyAddress
            {
                AddressType = a.AddressType,
                FlatBlockNo = a.FlatBlockNo,
                Premises = a.Premises,
                RoadStreetLane = a.RoadStreetLane,
                Area = a.Area,
                TownCity = a.TownCity,
                Pincode = a.Pincode,
                CountryId = a.CountryId,
                StateId = a.StateId,
                MobileNo = a.MobileNo,
                AlternateMobileNo = a.AlternateMobileNo,
                EmailAddress = a.EmailAddress,
                AlternateEmailAddress = a.AlternateEmailAddress
            }).ToList();

            // Add Contacts
            foreach (var c in dto.Contacts)
            {
                string? docPath = c.DocsAttachment;

                if (c.ContactFile != null)
                {
                    docPath = await _fileService
                        .SaveFileAsync(c.ContactFile, folderName);
                }

                existingAgency.Contacts.Add(new AgencyContact
                {
                    PersonName = c.PersonName,
                    Designation = c.Designation,
                    Department = c.Department,
                    MobileNo = c.MobileNo,
                    AlternateMobileNo = c.AlternateMobileNo,
                    EmailAddress = c.EmailAddress,
                    DocsAttachment = docPath
                });
            }

            // Add Bank Details
            existingAgency.BankDetails = dto.BankDetails.Select(b => new AgencyBankDetail
            {
                BankName = b.BankName,
                BankAddress = b.BankAddress,
                AccountHolderName = b.AccountHolderName,
                AccountNo = b.AccountNo,
                IFSCCode = b.IFSCCode,
                SwiftCode = b.SwiftCode,
                IBANNo = b.IBANNo,
                EmailAddress = b.EmailAddress
            }).ToList();

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var agency = await _context.Tbl_Agencies
                .Include(x => x.Addresses)
                .Include(x => x.Contacts)
                .Include(x => x.BankDetails)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (agency == null)
                return false;

            agency.IsDeleted = true;

            foreach (var a in agency.Addresses)
            {
                a.IsDeleted = true;
            }

            foreach (var c in agency.Contacts)
            {
                c.IsDeleted = true;
            }

            foreach (var b in agency.BankDetails)
            {
                b.IsDeleted = true;
            }

            await _context.SaveChangesAsync();

            return true;
        }
    }
}
