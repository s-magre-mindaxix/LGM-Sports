namespace CompanyPlatform.Core.DTO.EmployeeTDSDetails
{
    public class ViewTDSDetailsDto
    {
        public int ID { get; set; }
        public int EmployeeID { get; set; }
        public decimal TDSAmount { get; set; }
    }

    public class UpsertTDSDetailsDto
    {
        public int EmployeeID { get; set; }
        public decimal TDSAmount { get; set; }
    }
}