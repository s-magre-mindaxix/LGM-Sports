

using CompanyPlatform.Core.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
public class CompanyDirector
{
    [Key]
    public int DirectorId { get; set; }
    public int CompanyId { get; set; }

    public string DirectorName { get; set; }
    public string Designation { get; set; }
    public string MobileNo { get; set; }
    public string Email { get; set; }
    public string? DocsAttachmentPath { get; set; }
    public string? PresentationPPTPath { get; set; }
    public string? Website { get; set; } 

    public bool IsDeleted { get; set; } = false;

    [ForeignKey(nameof(CompanyId))]
    public Company Company { get; set; }
}