using CompanyPlatform.Core.Data;
using CompanyPlatform.CRM.DTO.ServiceMaster;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.ServiceMaster
{
    public class ServiceMasterService : IServiceMasterService
    {
        private readonly ApplicationDBContext _context;
        public ServiceMasterService(ApplicationDBContext context) => _context = context;

        private async Task<string> GenerateServicePartNoAsync()
        {
            // 1. Define the new prefix
            string prefix = "GX-SER-";

            // Get the most recently added service part number
            var lastService = await _context.Tbl_ServiceMaster
                .OrderByDescending(x => x.ServiceId)
                .Select(x => x.ServicePartNo)
                .FirstOrDefaultAsync();

            int nextSeq = 1;

            // 2. Check if the last record exists and matches the new prefix
            if (lastService != null && lastService.StartsWith(prefix))
            {
                // Because the prefix has hyphens, we get the index of the last hyphen 
                // to find where the number starts
                int lastHyphenIndex = lastService.LastIndexOf('-');
                string numberPart = lastService.Substring(lastHyphenIndex + 1);

                if (int.TryParse(numberPart, out int lastSeq))
                {
                    nextSeq = lastSeq + 1;
                }
            }

            // 3. Use :D4 for a 4-digit sequence (0001)
            return $"{prefix}{nextSeq:D4}";
        }

        public async Task<int> CreateAsync(ServiceMasterDto dto)
        {
            var service = new Core.Models.CRM.ServiceMaster
            {
                ServiceDescription = dto.ServiceDescription,
                ServicePrice = dto.ServicePrice,
                SACCode = dto.SACCode,
                ServicePartNo = await GenerateServicePartNoAsync()
            };

            _context.Tbl_ServiceMaster.Add(service);
            await _context.SaveChangesAsync();
            return service.ServiceId;
        }

        public async Task<List<ServiceMasterDto>> GetAllAsync()
        {
            return await _context.Tbl_ServiceMaster
                .Where(x => !x.IsDeleted)
                .Select(s => new ServiceMasterDto
                {
                    ServiceId = s.ServiceId,
                    ServiceDescription = s.ServiceDescription,
                    ServicePartNo = s.ServicePartNo,
                    ServicePrice = s.ServicePrice,
                    SACCode = s.SACCode,
                }).ToListAsync();
        }

        public async Task<ServiceMasterDto> GetByIdAsync(int id)
        {
            var s = await _context.Tbl_ServiceMaster.FindAsync(id);
            if (s == null || s.IsDeleted) return null;

            return new ServiceMasterDto
            {
                ServiceId = s.ServiceId,
                ServiceDescription = s.ServiceDescription,
                ServicePartNo = s.ServicePartNo,
                ServicePrice = s.ServicePrice,
                SACCode = s.SACCode,
            };
        }

        public async Task<bool> UpdateAsync(ServiceMasterDto dto)
        {
            var existing = await _context.Tbl_ServiceMaster.FindAsync(dto.ServiceId);
            if (existing == null) return false;

            existing.ServiceDescription = dto.ServiceDescription;
            existing.ServicePrice = dto.ServicePrice;
            existing.SACCode = dto.SACCode;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var s = await _context.Tbl_ServiceMaster.FindAsync(id);
            if (s == null) return false;

            s.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
