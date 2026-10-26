using CompanyPlatform.CRM.DTO.ClientType;

namespace CompanyPlatform.CRM.Services.ClientType
{
    public interface IClientTypeService
    {
        Task<IEnumerable<ClientTypeDto>>
            GetAllClientTypesAsync();

        Task<ClientTypeDto?>
            GetClientTypeByIdAsync(int id);

        Task<ClientTypeDto>
            CreateClientTypeAsync(
                ClientTypeDto dto);

        Task<bool>
            UpdateClientTypeAsync(
                int id,
                ClientTypeDto dto);

        Task<bool>
            DeleteClientTypeAsync(int id);
    }
}





//using CompanyPlatform.CRM.DTO.ClientType;

//namespace CompanyPlatform.CRM.Services.ClientType
//{
//    public interface IClientTypeService
//    {
//        Task<IEnumerable<ClientTypeDto>> GetAllClientTypesAsync();

//        Task<ClientTypeDto> GetClientTypeByIdAsync(int id);

//        Task<ClientTypeDto> CreateClientTypeAsync(ClientTypeDto dto);

//        Task<bool> UpdateClientTypeAsync(int id, ClientTypeDto dto);

//        Task<bool> DeleteClientTypeAsync(int id);
//    }
//}