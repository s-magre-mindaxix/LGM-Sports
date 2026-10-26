using System.ComponentModel;

namespace PayrollManagementAPI.DTO.WorkLocation
{
    public class WorkLocationDto
    {
        public int ID { get; set; }
        public string LocationName { get; set; }
        public string? LocationCode { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string Pincode { get; set; }
        [DefaultValue(true)]
        public bool IsActive { get; set; }
        [DefaultValue(false)]
        public bool IsDeleted { get; set; }

    }
}
