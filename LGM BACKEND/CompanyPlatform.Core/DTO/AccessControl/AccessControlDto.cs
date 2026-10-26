namespace CompanyPlatform.Core.DTO.AccessControl
{
    public class AccessControlDto
    {

        public int Id { get; set; }
        public string RoleId { get; set; }
        public string SystemName { get; set; }
        public string FormName { get; set; }
        public bool CanView { get; set; }
        public bool CanAdd { get; set; }
        public bool CanEdit { get; set; }
        public bool CanDelete { get; set; }
    }
}
