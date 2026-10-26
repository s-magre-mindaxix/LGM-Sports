namespace PayrollManagementAPI.DTO.SalaryComponent
{
    public class SalaryComponentDtos
    {
        public int Id { get; set; }
        public string ComponentName { get; set; }
        public string ComponentType { get; set; }
        public bool IsTaxable { get; set; }
    }
}
