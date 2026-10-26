using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models
{
    public class CompanyBankDetail
    {
        [Key]
        public int BankDetailId { get; set; }
        public int CompanyId { get; set; }
        public string BankName { get; set; }
        public string? BankAddress { get; set; }
        public string AccountNo { get; set; }
        public string IFSC { get; set; }
        public string? SwiftCode { get; set; }
        public string? IBAN { get; set; }
        public string AccountHolderName { get; set; }
        public bool IsDeleted { get; set; } = false;

        [ForeignKey(nameof(CompanyId))]
        public Company Company { get; set; }
    }
}