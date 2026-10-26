using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.DTO.Inventory
{
    namespace CompanyPlatform.CRM.DTO.Inventory
    {
        public class InventorySummaryDto
        {
            public int ItemId { get; set; }
            public string ItemType { get; set; } // "Product" or "Accessory"
            public string Name { get; set; }
            public string Code { get; set; }
            public string? Description { get; set; }
            public int CurrentStock { get; set; }
            public int WarningLimit { get; set; }
            public string? GroupName { get; set; } // Optional, can be joined in service
        }

        // DTO for requesting a stock adjustment (add/subtract)
        public class StockAdjustmentDto
        {
            [Required]
            public string ItemType { get; set; } // "Product" or "Accessory"
            [Required]
            public int ItemId { get; set; }
            [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1.")]
            public int Quantity { get; set; }
            [Required]
            public string Action { get; set; } // "Add" or "Subtract"
            public string? Remarks { get; set; }
        }

        // DTO for requesting to move an item to scrap
        public class ScrapRequestDto
        {
            [Required]
            public string ItemType { get; set; } // "Product" or "Accessory"
            [Required]
            public int ItemId { get; set; }
            [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1.")]
            public int Quantity { get; set; }
            [Required]
            public string Reason { get; set; } // e.g., Damaged, Expired, Lost
        }
    }
}
