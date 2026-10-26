namespace PayrollManagementAPI.DTO.PaySlip
{
    public class PayslipEmployeeDtos
    {
        public string CurrentPeriod { get; set; } // e.g., "March 2024"
        public string Status { get; set; } // e.g., "Generated", "Not Generated", "Pending"
        public bool IsDownloaded { get; set; }
        public bool CanGenerateOrDownload { get; set; } // Can the "Generate My Payslip" button be clicked?
        public int? PayslipId { get; set; } // The ID from tbl_Payslip if it exists
    }
}
