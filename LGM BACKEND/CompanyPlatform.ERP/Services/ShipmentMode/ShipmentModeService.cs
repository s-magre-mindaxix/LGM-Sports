using CompanyPlatform.Core.Data;
using CompanyPlatform.ERP.DTO.ShipmentModeDTO;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.Services.ShipmentMode
{
    public class ShipmentModeService : IShipmentModeService
    {
        private readonly ApplicationDBContext _context;

        public ShipmentModeService(ApplicationDBContext context)
        {
            _context = context;
        }

        // GET ALL
        public async Task<List<ShipmentModeDto>> GetAllAsync()
        {
            return await _context.Tbl_ShipmentModes
                .Where(x => !x.IsDeleted)
                .OrderByDescending(x => x.Id)
                .Select(x => new ShipmentModeDto
                {
                    Id = x.Id,
                    ModeName = x.ModeName,
                    ModeCode = x.ModeCode
                })
                .ToListAsync();
        }

        // GET BY ID
        public async Task<ShipmentModeDto?> GetByIdAsync(int id)
        {
            var data = await _context.Tbl_ShipmentModes
                .Where(x => x.Id == id && !x.IsDeleted)
                .FirstOrDefaultAsync();

            if (data == null)
                return null;

            return new ShipmentModeDto
            {
                Id = data.Id,
                ModeName = data.ModeName,
                ModeCode = data.ModeCode
            };
        }

        // CREATE
        public async Task<string> CreateAsync(CreateShipmentModeDto dto)
        {
            var exists = await _context.Tbl_ShipmentModes
                .AnyAsync(x => x.ModeName == dto.ModeName && !x.IsDeleted);

            if (exists)
                return "Shipment Mode already exists.";

            var shipmentMode = new CompanyPlatform.Core.Models.ERP.ShipmentMode
            {
                ModeName = dto.ModeName,
                ModeCode = dto.ModeCode
            };

            _context.Tbl_ShipmentModes.Add(shipmentMode);
            await _context.SaveChangesAsync();

            return "Shipment Mode created successfully.";
        }

        // UPDATE
        public async Task<string> UpdateAsync(UpdateShipmentModeDto dto)
        {
            var data = await _context.Tbl_ShipmentModes
                .FirstOrDefaultAsync(x => x.Id == dto.Id && !x.IsDeleted);

            if (data == null)
                return "Shipment Mode not found.";

            var exists = await _context.Tbl_ShipmentModes
                .AnyAsync(x => x.ModeName == dto.ModeName
                            && x.Id != dto.Id
                            && !x.IsDeleted);

            if (exists)
                return "Shipment Mode already exists.";

            data.ModeName = dto.ModeName;
            data.ModeCode = dto.ModeCode;

            await _context.SaveChangesAsync();

            return "Shipment Mode updated successfully.";
        }

        // DELETE (SOFT DELETE)
        public async Task<string> DeleteAsync(int id)
        {
            var data = await _context.Tbl_ShipmentModes
                .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

            if (data == null)
                return "Shipment Mode not found.";

            data.IsDeleted = true;

            await _context.SaveChangesAsync();

            return "Shipment Mode deleted successfully.";
        }
    }
}

