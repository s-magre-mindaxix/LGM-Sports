using System.ComponentModel;

namespace PayrollManagementAPI.DTO.LoanMaster
{
    public class LoanMasterViewDto
    {
        public int ID { get; set; }
        public string LoanTypeName { get; set; }
        public string Description { get; set; }
        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}
