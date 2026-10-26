
using CompanyPlatform.Core.Models;
using CompanyPlatform.Core.Models.HRMS;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM.Employee

{

    [Table("tbl_Employee")]
    public class Employees
    {
        [Key]
        public int ID { get; set; }
        [Required]
        public string EmployeeCode { get; set; }

        public string FirstName { get; set; }

        public string? MiddleName { get; set; }

        public string LastName { get; set; }

        public DateTime? DateOfBirth { get; set; }

        public string? Gender { get; set; }

        public string MobileNumber { get; set; }
        [Required]
        public string EmailAddress { get; set; }
        public string? PresentAddress { get; set; }

        public DateTime? DateOfJoining { get; set; }

        public int? WorkLocationID { get; set; }

        public int? DepartmentID { get; set; }

        public int? DesignationID { get; set; }
        public int? ReportingTo { get; set; }

        public int? LevelID { get; set; }

        public int? CompanyId { get; set; }
        public string? PhotoPath { get; set; }
        [ForeignKey("CompanyId")]
        public virtual CompanyPlatform.Core.Models.Company? Company { get; set; }

        public virtual WorkLocation WorkLocation { get; set; }
        public virtual Department Department { get; set; }
        public virtual Designation Designation { get; set; }

        [ForeignKey("ReportingTo")]
        public virtual Employees ReportingToManager { get; set; }

        [ForeignKey("LevelID")]
        public virtual LevelMaster Level { get; set; }

        public DateTime? DateOfLeaving { get; set; }

        public string? GoogleCalendarId { get; set; }

        public bool IsActive { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }

        public virtual ApplicationUser? ApplicationUser { get; set; }

        public virtual ICollection<SalaryStructure> SalaryStructures { get; set; }
        public virtual ICollection<EmployeeAddress> Addresses { get; set; } = new List<EmployeeAddress>();
        public virtual ICollection<EmployeeQualification> Qualifications { get; set; } = new List<EmployeeQualification>();
        public virtual ICollection<EmployeeExperience> Experiences { get; set; } = new List<EmployeeExperience>();
    }
}