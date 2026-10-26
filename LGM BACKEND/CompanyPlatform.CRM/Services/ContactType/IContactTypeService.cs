using System.Collections.Generic;
using System.Threading.Tasks;
using CompanyPlatform.CRM.DTO.ContactTypes;
using CompanyPlatform.CRM.DTO.ContactTypes;

namespace CompanyPlatform.CRM.Services.ContactType
{
    public interface IContactTypeService
    {
        Task<IEnumerable<ContactTypeDto>> GetAllContactTypesAsync();

        Task<ContactTypeDto> GetContactTypeByIdAsync(int id);

        Task<ContactTypeDto> CreateContactTypeAsync(ContactTypeDto dto);

        Task<bool> UpdateContactTypeAsync(int id, ContactTypeDto dto);

        Task<bool> DeleteContactTypeAsync(int id);
    }
}