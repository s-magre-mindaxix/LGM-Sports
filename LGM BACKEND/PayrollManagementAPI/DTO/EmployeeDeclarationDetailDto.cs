using System.ComponentModel.DataAnnotations;

namespace PayrollManagementAPI.DTO
{
    public class EmployeeDeclarationDetailDto
    {
        public int? ID { get; set; } // Nullable for new entries
        public string Section { get; set; }
        public decimal DeclaredAmount { get; set; }

        public decimal? ApprovedAmount { get; set; }
        public string ApprovalStatus { get; set; }
        public string Remarks { get; set; }

        public List<DocumentDto> Documents { get; set; } = new();
    }

    public class DocumentDto
    {
        public int ID { get; set; }
        public string FileName { get; set; }
        public string FilePath { get; set; }
    }

    public class DocumentUploadDto
    {
        [Required]
        public int EmployeeDeclarationDetailID { get; set; }

        [Required]
        public IFormFile File { get; set; }
    }
    public class TaxDeclarationDto
    {
        public int? ID { get; set; }
        public int EmployeeID { get; set; }
        public string FinancialYear { get; set; }
        public string TaxRegime { get; set; }
        public string Status { get; set; } // e.g., "Draft", "Submitted"
        public List<EmployeeDeclarationDetailDto> DeclarationDetails { get; set; }
    }

    public class DeclarationApprovalDto
    {
        [Required]
        public int DetailId { get; set; } // The ID of the tbl_EmployeeDeclarationDetail row
        [Required]
        public decimal ApprovedAmount { get; set; }
        [Required]
        public string ApprovalStatus { get; set; } // "Approved" or "Rejected"
        public string Remarks { get; set; }
    }
}
