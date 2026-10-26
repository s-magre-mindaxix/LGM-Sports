namespace CompanyPlatform.Core.DTO.EmployeeDocuments
{
    public class DocumentResponseDto
    {
        public int ID { get; set; }
        public int EmployeeID { get; set; }
        public string DocumentName { get; set; }
        public string FilePath { get; set; }
        public DateTime UploadedDate { get; set; }
    }
}
