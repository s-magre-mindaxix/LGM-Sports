using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.CRM.DTO.Customer;
using Microsoft.EntityFrameworkCore;

namespace CompanyPlatform.Core.Services.CRM
{
    public class CustomerService : ICustomerService
    {
        private readonly ApplicationDBContext _context;

        public CustomerService(ApplicationDBContext context)
        {
            _context = context;
        }

        private static CustomerResponseDto Map(Customer c)
        {
            return new CustomerResponseDto
            {
                Id = c.Id,
                CustomerCode = c.CustomerCode,
                CustomerName = c.CustomerName,
                CustomerShortName = c.CustomerShortName,
                Branch = c.Branch,
                PlantCode = c.PlantCode,
                CompanyGroupId = c.CompanyGroupId,
                VendorCode = c.VendorCode,
                ForeignVendorCode = c.ForeignVendorCode,
                CustomerPAN = c.CustomerPAN,
                CustomerTAN = c.CustomerTAN,
                GSTIN = c.GSTIN,
                CIN = c.CIN,
                MSMENo = c.MSMENo,
                CustomerMobile = c.CustomerMobile,
                CustomerEmail = c.CustomerEmail,
                BillingAddress = c.BillingAddress,
                ShippingAddress = c.ShippingAddress,
                DocsAttachment = c.DocsAttachment,
                IsActive = c.IsActive,
                IsDeleted = c.IsDeleted
            };
        }

        public async Task<IEnumerable<CustomerResponseDto>> GetAllAsync()
        {
            var customers = await _context.Tbl_Customers
                .AsNoTracking()
                .Where(c => !c.IsDeleted)
                .ToListAsync();

            return customers.Select(Map);
        }

        public async Task<CustomerResponseDto?> GetByIdAsync(int id)
        {
            var customer = await _context.Tbl_Customers
                .AsNoTracking()
                .FirstOrDefaultAsync(c =>
                    c.Id == id && !c.IsDeleted);

            return customer == null ? null : Map(customer);
        }

        public async Task<CustomerResponseDto> CreateAsync(
            CreateCustomerDto dto)
        {
            var groupExists = await _context.Tbl_CompanyGroups
                .AnyAsync(g => g.Id == dto.CompanyGroupId);

            if (!groupExists)
                throw new ArgumentException(
                    "The specified CompanyGroupId does not exist.");

            var customer = new Customer
            {
                CustomerCode = dto.CustomerCode,
                CustomerName = dto.CustomerName,
                CustomerShortName = dto.CustomerShortName,
                Branch = dto.Branch,
                PlantCode = dto.PlantCode,
                CompanyGroupId = dto.CompanyGroupId,
                VendorCode = dto.VendorCode,
                ForeignVendorCode = dto.ForeignVendorCode,
                CustomerPAN = dto.CustomerPAN,
                CustomerTAN = dto.CustomerTAN,
                GSTIN = dto.GSTIN,
                CIN = dto.CIN,
                MSMENo = dto.MSMENo,
                CustomerMobile = dto.CustomerMobile,
                CustomerEmail = dto.CustomerEmail,
                BillingAddress = dto.BillingAddress,
                ShippingAddress = dto.ShippingAddress,
                DocsAttachment = dto.DocsAttachment,
                IsActive = dto.IsActive,
                IsDeleted = false
            };

            _context.Tbl_Customers.Add(customer);
            await _context.SaveChangesAsync();

            return Map(customer);
        }

        public async Task<bool> UpdateAsync(
            int id, UpdateCustomerDto dto)
        {
            var customer = await _context.Tbl_Customers
                .FirstOrDefaultAsync(c =>
                    c.Id == id && !c.IsDeleted);

            if (customer == null)
                return false;

            var groupExists = await _context.Tbl_CompanyGroups
                .AnyAsync(g => g.Id == dto.CompanyGroupId);

            if (!groupExists)
                throw new ArgumentException(
                    "The specified CompanyGroupId does not exist.");

            customer.CustomerCode = dto.CustomerCode;
            customer.CustomerName = dto.CustomerName;
            customer.CustomerShortName = dto.CustomerShortName;
            customer.Branch = dto.Branch;
            customer.PlantCode = dto.PlantCode;
            customer.CompanyGroupId = dto.CompanyGroupId;
            customer.VendorCode = dto.VendorCode;
            customer.ForeignVendorCode = dto.ForeignVendorCode;
            customer.CustomerPAN = dto.CustomerPAN;
            customer.CustomerTAN = dto.CustomerTAN;
            customer.GSTIN = dto.GSTIN;
            customer.CIN = dto.CIN;
            customer.MSMENo = dto.MSMENo;
            customer.CustomerMobile = dto.CustomerMobile;
            customer.CustomerEmail = dto.CustomerEmail;
            customer.BillingAddress = dto.BillingAddress;
            customer.ShippingAddress = dto.ShippingAddress;
            customer.DocsAttachment = dto.DocsAttachment;
            customer.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var customer = await _context.Tbl_Customers
                .FirstOrDefaultAsync(c =>
                    c.Id == id && !c.IsDeleted);

            if (customer == null)
                return false;

            // Preserve the record and its existing relationships.
            customer.IsDeleted = true;

            await _context.SaveChangesAsync();

            return true;
        }
        public async Task<string> GenerateCustomerCodeAsync()
        {
            var existingCodes = await _context.Tbl_Customers
                .AsNoTracking()
                .Where(c => c.CustomerCode != null)
                .Select(c => c.CustomerCode)
                .ToListAsync();

            var highestNumber = existingCodes
                .Where(code =>
                    code.StartsWith("LGM-CUST", StringComparison.OrdinalIgnoreCase))
                .Select(code =>
                {
                    var numberPart = code.Substring(3);

                    return int.TryParse(numberPart, out var number)
                        ? number
                        : 0;
                })
                .DefaultIfEmpty(0)
                .Max();

            return $"LGM-CUST{highestNumber + 1:D4}";
        }
    }
}


