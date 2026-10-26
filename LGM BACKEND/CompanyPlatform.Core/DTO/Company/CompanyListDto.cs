

    namespace CompanyPlatform.Core.DTO.Company
    {
        public class CompanyListDto
        {
            public int CompanyId { get; set; }

            public string CompanyName { get; set; } = string.Empty;

            public string? LegalName { get; set; }

            public bool IsActive { get; set; } = true;

            public bool IsDeleted { get; set; } = false;

            public string? DirectorName { get; set; }

            public string? Designation { get; set; }

            public string? Address { get; set; }

            public string? MobileNo { get; set; }

            public string? Email { get; set; }

            public int? StateId { get; set; }

            public string? StateName { get; set; }
        }
    }


