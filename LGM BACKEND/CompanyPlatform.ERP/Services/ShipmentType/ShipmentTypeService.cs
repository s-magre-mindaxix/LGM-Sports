using CompanyPlatform.Core.Data;
using CompanyPlatform.ERP.DTO.ShipmentTypeDTO;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.Services.ShipmentType
{
    public class ShipmentTypeService : IShipmentTypeService
    {
        private readonly ApplicationDBContext _context;

        public ShipmentTypeService(ApplicationDBContext context)
        {
            _context = context;
        }

        // GET ALL
        public async Task<List<ShipmentTypeDto>> GetAllAsync()
        {
            return await _context.Tbl_ShipmentTypes
                .Include(x => x.ShipmentMode)
                .Where(x => !x.IsDeleted)
                .OrderByDescending(x => x.Id)
                .Select(x => new ShipmentTypeDto
                {
                    Id = x.Id,
                    ShipmentModeId = x.ShipmentModeId,
                    ShipmentModeName = x.ShipmentMode.ModeName,
                    TypeName = x.TypeName,
                    TypeCode = x.TypeCode
                })
                .ToListAsync();
        }

        // GET BY ID
        public async Task<ShipmentTypeDto?> GetByIdAsync(int id)
        {
            var data = await _context.Tbl_ShipmentTypes
                .Include(x => x.ShipmentMode)
                .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

            if (data == null)
                return null;

            return new ShipmentTypeDto
            {
                Id = data.Id,
                ShipmentModeId = data.ShipmentModeId,
                ShipmentModeName = data.ShipmentMode.ModeName,
                TypeName = data.TypeName,
                TypeCode = data.TypeCode
            };
        }

        // CREATE
        public async Task<string> CreateAsync(CreateShipmentTypeDto dto)
        {
            var shipmentModeExists = await _context.Tbl_ShipmentModes
                .AnyAsync(x => x.Id == dto.ShipmentModeId && !x.IsDeleted);

            if (!shipmentModeExists)
                return "Shipment Mode not found.";

            var exists = await _context.Tbl_ShipmentTypes
                .AnyAsync(x =>
                    x.TypeName == dto.TypeName &&
                    x.ShipmentModeId == dto.ShipmentModeId &&
                    !x.IsDeleted);

            if (exists)
                return "Shipment Type already exists.";

            var shipmentType = new Core.Models.ERP.ShipmentType
            {
                ShipmentModeId = dto.ShipmentModeId,
                TypeName = dto.TypeName,
                TypeCode = dto.TypeCode
            };

            _context.Tbl_ShipmentTypes.Add(shipmentType);

            await _context.SaveChangesAsync();

            return "Shipment Type created successfully.";
        }

        // UPDATE
        public async Task<string> UpdateAsync(UpdateShipmentTypeDto dto)
        {
            var data = await _context.Tbl_ShipmentTypes
                .FirstOrDefaultAsync(x => x.Id == dto.Id && !x.IsDeleted);

            if (data == null)
                return "Shipment Type not found.";

            var exists = await _context.Tbl_ShipmentTypes
                .AnyAsync(x =>
                    x.TypeName == dto.TypeName &&
                    x.ShipmentModeId == dto.ShipmentModeId &&
                    x.Id != dto.Id &&
                    !x.IsDeleted);

            if (exists)
                return "Shipment Type already exists.";

            data.ShipmentModeId = dto.ShipmentModeId;
            data.TypeName = dto.TypeName;
            data.TypeCode = dto.TypeCode;

            await _context.SaveChangesAsync();

            return "Shipment Type updated successfully.";
        }

        // DELETE
        public async Task<string> DeleteAsync(int id)
        {
            var data = await _context.Tbl_ShipmentTypes
                .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

            if (data == null)
                return "Shipment Type not found.";

            data.IsDeleted = true;

            await _context.SaveChangesAsync();

            return "Shipment Type deleted successfully.";
        }
    }
}
