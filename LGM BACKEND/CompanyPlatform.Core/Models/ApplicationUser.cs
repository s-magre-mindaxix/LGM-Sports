using CompanyPlatform.Core.Models.CRM.Employee;
using Microsoft.AspNetCore.Identity; // <<< IMPORTANT: This using statement is required
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models
{
    // This class MUST inherit from IdentityUser
    public class ApplicationUser : IdentityUser
    {
        // This is the Foreign Key that links the Identity user to your specific Employee details table.
        [ForeignKey("Employee")]
        public int EmployeeId { get; set; }

        // This is the Navigation Property to establish the one-to-one relationship.
        public virtual Employees Employee { get; set; }
    }
}