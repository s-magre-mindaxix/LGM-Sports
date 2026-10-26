using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.DocumentSeries
{
    public class DocumentSeriesDto
    {
        public int DocumentSeriesId { get; set; }

        [Required]
        [MaxLength(50)]
        public string DocumentType { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Prefix { get; set; } = string.Empty;

        [Range(1, int.MaxValue)]
        public int NextNumber { get; set; } = 1;

        [Required]
        [MaxLength(20)]
        public string FinancialYear { get; set; } = string.Empty;

        [Range(1, int.MaxValue)]
        public int BranchId { get; set; }

        public bool IsDeleted { get; set; } = false;
    }
}