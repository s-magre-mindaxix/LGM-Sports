namespace CompanyPlatform.CRM.DTO.AddressType
{
    public class AddressTypeDto
    {
        public int AddressTypeId { get; set; }

        public string AddressTypeName { get; set; }

        public string AddressTypeCode { get; set; }

        public bool IsActive { get; set; }

        public bool IsDeleted { get; set; }
    }
}