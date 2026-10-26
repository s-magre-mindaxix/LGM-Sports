namespace PayrollManagementAPI.DTO.TaxAndCompliance
{
    public class ComplianceStatusDto
    {
        public int Id { get; set; }
        public string Label { get; set; }
        public string Status { get; set; } // "Pending", "Filed", "Due"
        public string? DueDateInfo { get; set; }
    }
}
