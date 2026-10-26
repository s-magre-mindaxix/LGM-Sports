
using CompanyPlatform.Core.Data;
using CompanyPlatform.CRM.DTO.PaymentMethod;
using Microsoft.EntityFrameworkCore;

namespace CompanyPlatform.CRM.Services.PaymentMethod
{
    public class PaymentMethodService : IPaymentMethodService
    {
        private readonly ApplicationDBContext _context;

        public PaymentMethodService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PaymentMethodDto>> GetAllAsync()
        {
            return await _context.Tbl_PaymentMethods
                .AsNoTracking()
                .Select(x => new PaymentMethodDto
                {
                    PaymentMethodId = x.PaymentMethodId,
                    Code = x.Code,
                    Name = x.Name,
                    IsActive = x.IsActive
                })
                .ToListAsync();
        }

        public async Task<PaymentMethodDto?> GetByIdAsync(int id)
        {
            var x = await _context.Tbl_PaymentMethods
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.PaymentMethodId == id);

            if (x == null)
                return null;

            return new PaymentMethodDto
            {
                PaymentMethodId = x.PaymentMethodId,
                Code = x.Code,
                Name = x.Name,
                IsActive = x.IsActive
            };
        }

        public async Task<PaymentMethodDto> CreateAsync(
            PaymentMethodDto dto)
        {
            string code = dto.Code.Trim();

            bool codeExists = await _context.Tbl_PaymentMethods
                .AnyAsync(x => x.Code == code);

            if (codeExists)
                throw new ArgumentException(
                    "Payment Method code already exists.");

            var item = new CompanyPlatform.Core.Models.CRM.PaymentMethod
            {
                Code = code,
                Name = dto.Name.Trim(),
                IsActive = dto.IsActive
            };

            _context.Tbl_PaymentMethods.Add(item);
            await _context.SaveChangesAsync();

            dto.PaymentMethodId = item.PaymentMethodId;
            dto.Code = item.Code;
            dto.Name = item.Name;

            return dto;
        }

        public async Task<bool> UpdateAsync(
            int id, PaymentMethodDto dto)
        {
            var item = await _context.Tbl_PaymentMethods
                .FirstOrDefaultAsync(x => x.PaymentMethodId == id);

            if (item == null)
                return false;

            string code = dto.Code.Trim();

            bool codeExists = await _context.Tbl_PaymentMethods
                .AnyAsync(x => x.Code == code &&
                               x.PaymentMethodId != id);

            if (codeExists)
                throw new ArgumentException(
                    "Payment Method code already exists.");

            item.Code = code;
            item.Name = dto.Name.Trim();
            item.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var item = await _context.Tbl_PaymentMethods
                .FirstOrDefaultAsync(x => x.PaymentMethodId == id);

            if (item == null)
                return false;

            _context.Tbl_PaymentMethods.Remove(item);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
