using CompanyPlatform.CRM.DTO.AddressType;

namespace CompanyPlatform.CRM.Services.AddressType
{
    public interface IAddressTypeService
    {
        Task<IEnumerable<AddressTypeDto>> GetAllAddressTypesAsync();

        Task<AddressTypeDto> GetAddressTypeByIdAsync(int id);

        Task<AddressTypeDto> CreateAddressTypeAsync(AddressTypeDto addressTypeDto);

        Task<bool> UpdateAddressTypeAsync(int id, AddressTypeDto addressTypeDto);

        Task<bool> DeleteAddressTypeAsync(int id);
    }
}