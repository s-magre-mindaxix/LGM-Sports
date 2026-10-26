

    namespace CompanyPlatform.Core.DTO.Company
    {
        public class CompanyGetDto
        {
            public int CompanyId { get; set; }

            public string CompanyCode { get; set; } = string.Empty;

            public string CompanyName { get; set; } = string.Empty;

            public string? LegalName { get; set; }

            public string? CompanyShortName { get; set; }

            public string? LogoPath { get; set; }

            public string? PAN { get; set; }

            public string? TAN { get; set; }

            public string? GSTIN { get; set; }

            public string? CIN { get; set; }

            public bool IsActive { get; set; } = true;

            public bool IsDeleted { get; set; } = false;

            public List<CompanyAddressDto> Addresses { get; set; } = new();

            public List<CompanyDirectorDto> Directors { get; set; } = new();

            public List<CompanyBankDetailDto> BankDetails { get; set; } = new();
        }
    }
