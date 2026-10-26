using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

public class AdvanceRepaymentViewDto
{
    public decimal RepaymentAmount { get; set; }
    public string RepaymentDate { get; set; }
    public string Notes { get; set; }
    public string CreatedByName { get; set; }
}

public class AdvanceHistoryDto
{
    public int AdvanceId { get; set; }
    public string EmployeeName { get; set; }
    public decimal OriginalAmount { get; set; }
    public string RequestDate { get; set; }
    public decimal TotalRepaid { get; set; }
    public decimal Balance { get; set; }
  
    public string Reason { get; set; }
    public List<AdvanceRepaymentViewDto> Repayments { get; set; }
}