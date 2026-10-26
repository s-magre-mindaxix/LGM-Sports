using System.ComponentModel;

namespace PayrollManagementAPI.DTO.LoanMaster
{
    public class LoanMasterUpdateDto
    {
        public string LoanTypeName { get; set; }
        public string Description { get; set; }
      
        public bool IsDeleted { get; set; }

    }
}
