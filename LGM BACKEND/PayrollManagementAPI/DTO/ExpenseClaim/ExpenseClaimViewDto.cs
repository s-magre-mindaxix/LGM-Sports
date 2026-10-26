namespace PayrollManagementAPI.DTO.ExpenseClaim
{
    public class ExpenseClaimViewDto
    {
        public int Id { get; set; }
        public int EmployeeID { get; set; }
        public string EmployeeName { get; set; }
        public string EmployeeCode { get; set; }
        public int ExpenseTypeID { get; set; }
        public string ExpenseTypeName { get; set; }
        public decimal Amount { get; set; }
        public decimal? ApprovedAmount { get; set; }
        public DateTime ClaimDate { get; set; }
        public DateTime AppliedDate { get; set; }
        public string? Description { get; set; }
        public string Status { get; set; }
        public int? ApproverID { get; set; }
        public string? ApproverName { get; set; }
        public DateTime? ApprovalDate { get; set; }
        public string? ManagerRemarks { get; set; }
        public string? ReceiptFilePath { get; set; }
    }
}
