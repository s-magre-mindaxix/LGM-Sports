using System.ComponentModel.DataAnnotations;

namespace PayrollManagementAPI.DTO.ExpenseClaim
{
    public class BulkActionDto
    {
        [Required]
        public List<int> ClaimIds { get; set; }
    }
}
