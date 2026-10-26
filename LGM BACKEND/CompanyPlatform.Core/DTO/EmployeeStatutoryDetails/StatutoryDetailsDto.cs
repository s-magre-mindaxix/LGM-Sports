using System.ComponentModel;

namespace CompanyPlatform.Core.DTO.EmployeeStatutoryDetails
{
    public class StatutoryDetailsDto
    {
        public int ID { get; set; }
        public string AadhaarNumber { get; set; }
        public string PANNumber { get; set; }
        public string? UANNo { get; set; }
        public string? PFNo { get; set; }
        public string? ESINo { get; set; }
        public int EmployeeID { get; set; }
        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
        //public bool IsActive { get; set; }
    }
}
