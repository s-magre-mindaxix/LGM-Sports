using System.ComponentModel;

namespace PayrollManagementAPI.DTO
{
    public class CompanyProfileDTO
    {
        public int ID { get; set; }
        public string CompanyName { get; set; } 
        public string Address { get; set; } 
        public string PAN { get; set; } 
        public string TAN { get; set; } 
        public string CittdsAddress { get; set; } 

        // Add fields for authorized signatory
        public string SignatoryName { get; set; } 
        public string SignatoryDesignation { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}
