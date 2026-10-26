using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;

namespace PayrollManagementAPI.DTO.SalaryStructure
{
    public class SalaryStructureViewDto
    {
        public int EmployeeID { get; set; }
        public string EmployeeCode { get; set; }
        public string EmployeeName { get; set; }
        public string Department { get; set; }
        // Earning Components
        public decimal BasicPay { get; set; }
        public decimal HRA { get; set; }
        public decimal ConveyanceAllowance { get; set; }
        public decimal ProductionIncentive { get; set; }

        // Deduction Components
        public decimal Esic { get; set; } 
        public decimal Pf { get; set; } 
        public decimal Pt { get; set; } 
        public decimal Tds { get; set; }
        public decimal GrossSalary { get; set; }

        public decimal TotalDeduction { get; set; }

        public decimal NetSalary { get; set; }
        public string Status { get; set; }
    }

    public class SalaryStructureDetailDto
    {
        public int EmployeeID { get; set; }
        public string EmployeeName { get; set; }
        public DateTime? EffectiveDate { get; set; }
        public string Status { get; set; }
        public List<ComponentDetailItemDto> Components { get; set; }
    }
    public class ComponentDetailItemDto
    {
        public int SalaryComponentID { get; set; }
        public string ComponentName { get; set; }
        public decimal Amount { get; set; }
    }

    public class SalaryStructureViewDtos
    {
        public int EmployeeID { get; set; }
        public string EmployeeCode { get; set; }
        public string EmployeeName { get; set; }
        public string Department { get; set; }
        public decimal BasicPay { get; set; }
        public decimal HRA { get; set; }
        public decimal ConveyanceAllowance { get; set; }
        public decimal Esic { get; set; }
        public decimal Pf { get; set; }
        public decimal Pt { get; set; }
        public decimal Tds { get; set; }

        public decimal ProductionIncentive { get; set; }
        public decimal GrossSalary { get; set; }
        public decimal TotalDeduction { get; set; }
        public decimal NetSalary { get; set; }
        public string Status { get; set; }
        public decimal AnnualCTC { get; set; }
    }
}
