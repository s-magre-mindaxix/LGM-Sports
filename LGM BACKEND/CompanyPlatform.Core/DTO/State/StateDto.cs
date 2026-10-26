using Microsoft.AspNetCore.Mvc.ModelBinding;

public class StateDto
{
    public int Id { get; set; }
    public string StateName { get; set; }
    public int CountryId { get; set; }
    public string? CountryName { get; set; }
}

