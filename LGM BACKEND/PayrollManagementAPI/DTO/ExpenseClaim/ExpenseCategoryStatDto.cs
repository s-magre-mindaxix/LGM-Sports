namespace PayrollManagementAPI.DTO.ExpenseClaim
{
    public class ExpenseCategoryStatDto
    {
        public string CategoryName { get; set; }
        public int ClaimCount { get; set; }
        public decimal TotalAmount { get; set; }
    }
}
