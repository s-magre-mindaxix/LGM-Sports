using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace PayrollManagementAPI.DTO
{
    public class SalaryComponentDto
    {
        public int Id { get; set; }
        public string ComponentName { get; set; }
        public string ComponentType { get; set; }
        public bool IsTaxable { get; set; }
    }
}
