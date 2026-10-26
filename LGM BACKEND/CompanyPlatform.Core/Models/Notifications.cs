using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using CompanyPlatform.Core.Models.CRM.Employee;

namespace CompanyPlatform.Core.Models
{
    public class Notifications
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int EmployeeId { get; set; } 
        [ForeignKey("EmployeeId")]
        public Employees Employee { get; set; }

        [Required]
        public string Message { get; set; }

        public bool IsRead { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? ReadAt { get; set; }
    }
}
