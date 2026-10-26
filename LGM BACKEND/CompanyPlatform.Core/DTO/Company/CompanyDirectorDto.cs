using Microsoft.AspNetCore.Http; 

public class CompanyDirectorDto
{
    public int CompanyId { get; set; }
    public string DirectorName { get; set; }
    public string Designation { get; set; }
    public string MobileNo { get; set; }
    public string Email { get; set; }
    public string? Website { get; set; }

  

    public string? DocsAttachmentPath { get; set; }
    public string? PresentationPPTPath { get; set; }
    public IFormFile? DocsAttachment { get; set; }
    public IFormFile? PresentationPPT { get; set; }
}