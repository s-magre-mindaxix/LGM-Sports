using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel;

namespace CompanyPlatform.Core.Models
{
    [Table("tbl_CompanyProfile")]
    public class CompanyProfile
    {
        [Key]
        public int ID { get; set; }
        public string CompanyName { get; set; } // "EMINENCE EQUIPMENTS PRIVATE LIMITED"
        public string Address { get; set; } // "PLOT NO.C-22/1,, PHASE-II,MIDC..."
        public string PAN { get; set; } // "AABCE4649K" (PAN of the Deductor)
        public string TAN { get; set; } // "PNEE01810E" (TAN of the Deductor)
        public string CittdsAddress { get; set; } // "The Commissioner of Income Tax (TDS)..."
                                                    
        // Add fields for authorized signatory
        public string SignatoryName { get; set; } // "MAKARAND SAJJAN SAVAGAONKAR"
        public string SignatoryDesignation { get; set; } // "DIRECTOR"

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}
