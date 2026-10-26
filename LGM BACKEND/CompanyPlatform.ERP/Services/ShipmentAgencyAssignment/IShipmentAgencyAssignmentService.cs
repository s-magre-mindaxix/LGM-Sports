using CompanyPlatform.ERP.DTO.ShipmentItem;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.Services.ShipmentAgencyAssignment
{
    public interface IShipmentAgencyAssignmentService
    {
        Task<ShipmentAgencyAssignmentDetailsDto> CreateAsync(CreateShipmentAgencyAssignmentDto dto);
        Task<List<ShipmentAgencyAssignmentResponseDto>> GetAllAsync();

        Task<List<ShipmentAgencyAssignmentResponseDto>>GetByShipmentIdAsync(int shipmentId);

        Task<ShipmentAgencyAssignmentResponseDto>UpdateAsync(UpdateShipmentAgencyAssignmentDto dto);

        Task<bool> DeleteAsync(int id);

        Task<List<ShipmentDropdownDtos>> GetShipmentDropdownAsync();

        Task<ShipmentDetailsDto> GetShipmentDetailsAsync(int shipmentInitiateId);

        Task<object> GetAgencyDetailsAsync(int agencyId);

        Task<bool> SendAgencyDocumentAsync(int agencyId, int shipmentInitiateId, List<IFormFile> documents);




    }
}
