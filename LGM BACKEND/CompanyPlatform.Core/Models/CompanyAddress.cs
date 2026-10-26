using CompanyPlatform.Core.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class CompanyAddress
{
    [Key]
    public int AddressId { get; set; }
    public int CompanyId { get; set; }
    public string AddressType { get; set; }
    public string? FlatBlock { get; set; }
    public string? Premises { get; set; }
    public string? Road { get; set; }
    public string? Area { get; set; }
    public string? Town { get; set; }
    public string? PinCode { get; set; }
    public string? Country { get; set; }
    public string? State { get; set; }
    public string MobileNo { get; set; } 
    public string? AltMobileNo { get; set; }
    public string Email { get; set; } 
    public string? AltEmail { get; set; }
    public bool IsDeleted { get; set; } = false;

    [ForeignKey(nameof(CompanyId))]
    public Company Company { get; set; }
}