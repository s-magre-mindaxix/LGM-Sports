using System.ComponentModel;

namespace CompanyPlatform.Core.Models
{
    public class LoanMaster
    {
        public int ID { get; set; }
        public string LoanTypeName { get; set; }  
        public string Description { get; set; }
      
        [DefaultValue(false)]
        public bool IsDeleted { get; set; }

    }
}
