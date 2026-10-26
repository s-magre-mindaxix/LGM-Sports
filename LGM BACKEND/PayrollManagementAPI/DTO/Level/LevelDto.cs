namespace PayrollManagementAPI.DTO.Level
{

    public class CreateLevelDto
    {
        public string LevelName { get; set; }
        public int LevelOrder { get; set; }
        public bool IsActive { get; set; }
    }

    public class UpdateLevelDto
    {
        public string LevelName { get; set; }
        public int LevelOrder { get; set; }
        public bool IsActive { get; set; }
    }
    public class LevelDto
    {
        public int ID { get; set; }
        public string LevelName { get; set; }
        public int LevelOrder { get; set; }
        public bool IsActive { get; set; }
    }
}
