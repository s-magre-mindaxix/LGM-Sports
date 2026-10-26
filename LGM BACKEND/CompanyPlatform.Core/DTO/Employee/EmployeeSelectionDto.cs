namespace CompanyPlatform.Core.DTO.Employee
{
    public class EmployeeSelectionDto
    {
        public int Id { get; set; }
        public string FullName { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string EmployeeCode { get; set; } 
        public string Designation { get; set; }
        public string Gender { get; set; }

        public decimal PFDeductionPercentage { get; set; }

        public string State { get; set; }

        public bool IsCappedAt15k { get; set; }

        public decimal TDSAmount { get; set; }

        public int? LevelID { get; set; }
        public string? LevelName { get; set; }

        public int? LevelOrder { get; set; }

    }
}
