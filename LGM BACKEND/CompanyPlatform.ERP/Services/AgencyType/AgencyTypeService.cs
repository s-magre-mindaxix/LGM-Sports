using CompanyPlatform.Core.Data;
using CompanyPlatform.ERP.DTO.AgencyTypeDTO;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.Services.AgencyType
{
    public class AgencyTypeService : IAgencyTypeService
    {
        private readonly ApplicationDBContext _context;

        public AgencyTypeService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<List<AgencyTypeDto>> GetAllAsync()
        {
            return await _context.Tbl_AgencyTypes
                .Where(x => !x.IsDeleted)
                .Select(x => new AgencyTypeDto
                {
                    Id = x.Id,
                    AgencyTypeName = x.AgencyTypeName,
                    IsDeleted = x.IsDeleted
                })
                .ToListAsync();
        }

        public async Task<AgencyTypeDto?> GetByIdAsync(int id)
        {
            var data = await _context.Tbl_AgencyTypes
                .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

            if (data == null)
                return null;

            return new AgencyTypeDto
            {
                Id = data.Id,
                AgencyTypeName = data.AgencyTypeName,
                IsDeleted = data.IsDeleted
            };
        }

        public async Task<AgencyTypeDto> CreateAsync(CreateAgencyTypeDto dto)
        {
            var entity = new Core.Models.ERP.AgencyType
            {
                AgencyTypeName = dto.AgencyTypeName
            };

            _context.Tbl_AgencyTypes.Add(entity);
            await _context.SaveChangesAsync();

            return new AgencyTypeDto
            {
                Id = entity.Id,
                AgencyTypeName = entity.AgencyTypeName,
                IsDeleted = entity.IsDeleted
            };
        }

        public async Task<bool> UpdateAsync(UpdateAgencyTypeDto dto)
        {
            var entity = await _context.Tbl_AgencyTypes
                .FirstOrDefaultAsync(x => x.Id == dto.Id && !x.IsDeleted);

            if (entity == null)
                return false;

            entity.AgencyTypeName = dto.AgencyTypeName;

            _context.Tbl_AgencyTypes.Update(entity);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.Tbl_AgencyTypes
                .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

            if (entity == null)
                return false;

            entity.IsDeleted = true;

            _context.Tbl_AgencyTypes.Update(entity);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
