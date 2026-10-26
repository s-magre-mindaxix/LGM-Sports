using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace PayrollManagementAPI.DTO.ExpenseType
{
    public class ExpenseTypeDto
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string ExpenseTypeName { get; set; }


        [DefaultValue(false)]
        public bool IsDeleted { get; set; }


    }
}
