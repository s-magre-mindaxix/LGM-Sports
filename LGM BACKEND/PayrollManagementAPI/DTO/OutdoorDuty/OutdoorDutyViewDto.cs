namespace PayrollManagementAPI.DTO.OutdoorDuty
{
    public class OutdoorDutyViewDto
    {
        public int Id { get; set; }
        public int EmployeeID { get; set; }
        public string EmployeeName { get; set; }
        public string EmployeeCode { get; set; }
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public int TotalDays { get; set; }
        public string Description { get; set; }
        public DateTime AppliedDate { get; set; }
        public string Status { get; set; }
        public int? ApproverID { get; set; }
        public string ApproverName { get; set; }
        public DateTime? ApprovalDate { get; set; }
        public string? ManagerRemarks { get; set; }
    }
}
