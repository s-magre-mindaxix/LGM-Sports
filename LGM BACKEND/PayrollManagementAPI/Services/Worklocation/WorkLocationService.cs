using Microsoft.Extensions.Logging;
using PayrollManagementAPI.DTO.WorkLocation;
using CompanyPlatform.Core.Repository;
using PayrollManagementAPI.Services.Worklocation;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PayrollManagementAPI.Services.WorkLocation
{
    public class WorkLocationService : IWorkLocationService
    {
        private readonly IRepositories<CompanyPlatform.Core.Models.WorkLocation> _repository;
        private readonly ILogger<WorkLocationService> _logger;

        public WorkLocationService(IRepositories<CompanyPlatform.Core.Models.WorkLocation> repository, ILogger<WorkLocationService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<WorkLocationDto>> GetAllLocationsAsync()
        {
            _logger.LogInformation("Fetching all active work locations.");
            var locations = await _repository.GetAll();

            return locations
                .Where(loc => loc.IsDeleted ==false)
                .Select(loc => new WorkLocationDto
                {
                    ID = loc.ID,
                    LocationName = loc.LocationName,
                    LocationCode = loc.LocationCode,
                    Address = loc.Address,
                    City = loc.City,
                    Pincode = loc.Pincode,
                    State = loc.State,
                    IsActive = loc.IsActive,
                    IsDeleted  = loc.IsDeleted 
                });
        }

        public async Task<WorkLocationDto> GetLocationByIdAsync(int id)
        {
            _logger.LogInformation("Fetching work location by ID: {LocationId}", id);
            var location = await _repository.GetByIdAsync(id);

            if (location == null || !location.IsDeleted ==false)
            {
                _logger.LogWarning("Work location with ID: {LocationId} not found or is inactive.", id);
                return null;
            }

            return new WorkLocationDto
            {
                ID = location.ID,
                LocationName = location.LocationName,
                LocationCode = location.LocationCode,
                Address = location.Address,
                City = location.City,
                Pincode = location.Pincode,
                IsActive = location.IsActive,
                State = location.State,
                IsDeleted = location.IsDeleted
            };
        }

        public async Task<WorkLocationDto> CreateLocationAsync(WorkLocationDto locationDto)
        {
            _logger.LogInformation("Creating a new work location with name: {LocationName}", locationDto.LocationName);
            var newLocation = new CompanyPlatform.Core.Models.WorkLocation
            {
                LocationName = locationDto.LocationName,
                LocationCode = locationDto.LocationCode,
                State = locationDto.State,
                City = locationDto.City,
                Pincode = locationDto.Pincode,
                Address = locationDto.Address,
                IsActive = locationDto.IsActive,
                IsDeleted  = false
            };

            await _repository.Create(newLocation);

            locationDto.ID = newLocation.ID;
            locationDto.IsDeleted = newLocation.IsDeleted;

            _logger.LogInformation("Successfully created work location with ID: {LocationId}", newLocation.ID);
            return locationDto;
        }

        public async Task<bool> UpdateLocationAsync(int id, WorkLocationDto locationDto)
        {
            _logger.LogInformation("Attempting to update work location with ID: {LocationId}", id);
            var locationToUpdate = await _repository.GetByIdAsync(id);

            if (locationToUpdate == null)
            {
                _logger.LogWarning("Update failed. Work location with ID: {LocationId} not found.", id);
                return false;
            }

            locationToUpdate.LocationName = locationDto.LocationName;
            locationToUpdate.LocationCode = locationDto.LocationCode; 
            locationToUpdate.Address = locationDto.Address;           
            locationToUpdate.City = locationDto.City;                 
            locationToUpdate.State = locationDto.State;               
            locationToUpdate.Pincode = locationDto.Pincode;           
            locationToUpdate.IsActive = locationDto.IsActive;

            await _repository.Update(locationToUpdate);

            _logger.LogInformation("Successfully updated work location with ID: {LocationId}", id);
            return true;
        }

        public async Task<bool> DeleteLocationAsync(int id)
        {
            _logger.LogInformation("Attempting to deactivate work location with ID: {LocationId}", id);
            var locationToDelete = await _repository.GetByIdAsync(id);

            if (locationToDelete == null)
            {
                _logger.LogWarning("Deactivation failed. Work location with ID: {LocationId} not found.", id);
                return false;
            }

            locationToDelete.IsDeleted  = true;
            await _repository.Update(locationToDelete);

            _logger.LogInformation("Successfully deactivated work location with ID: {LocationId}", id);
            return true;
        }
    }
}