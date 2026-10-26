using Microsoft.EntityFrameworkCore;
using CompanyPlatform.Core.Data;
using PayrollManagementAPI.DTO;
using CompanyPlatform.Core.DTO.Department;
using PayrollManagementAPI.DTO.ExpenseType;
using CompanyPlatform.Core.Repository;

namespace PayrollManagementAPI.Services.ExpenseType
{
    public class ExpenseTypeService:IExpenseTypeService
    {
        private readonly IRepositories<CompanyPlatform.Core.Models.ExpenseType> _repository;
        private readonly ApplicationDBContext _context;

        public ExpenseTypeService(IRepositories<CompanyPlatform.Core.Models.ExpenseType> repository, ApplicationDBContext context)
        {
            _repository = repository;
            _context = context;
        }

        public async Task<IEnumerable<ExpenseTypeDto>> GetAllExpenseTypesAsync()
        {
            var query = from sa in _context.Tb_ExpenseType

                        select new ExpenseTypeDto
                        {
                            Id = sa.Id,
                            ExpenseTypeName = sa.ExpenseTypeName,
                            IsDeleted = sa.IsDeleted,

                        };
            return await query.Where(e => e.IsDeleted == false).ToListAsync();

        }


        public async Task<ExpenseTypeDto> GetExpenseTypeByIdAsync(int id)
        {
            var query = from sa in _context.Tb_ExpenseType
                        where sa.Id == id
                        select new ExpenseTypeDto
                        {
                            Id = sa.Id,
                            ExpenseTypeName= sa.ExpenseTypeName,
                            IsDeleted = sa.IsDeleted,
                        };

            return await query.Where(e => e.IsDeleted == false).FirstOrDefaultAsync();

        }


        public async Task<ExpenseTypeDto> CreateExpenseTypeAsync(ExpenseTypeDto dto)
        {
            var entity = new CompanyPlatform.Core.Models.ExpenseType
            {
                ExpenseTypeName = dto.ExpenseTypeName,
                IsDeleted = dto.IsDeleted
            };

            await _repository.Add(entity);

            dto.Id = entity.Id;
            return dto;
        }

        public async Task<bool> UpdateExpenseTypeAsync(int id, ExpenseTypeDto dto)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null)
                return false;

            entity.ExpenseTypeName = dto.ExpenseTypeName;
            entity.IsDeleted = dto.IsDeleted;

            await _repository.Update(entity);
            return true;
        }


        public async Task DeleteExpenseTypeAsync(int id)
        {
            var sa = await _context.Tb_ExpenseType.FindAsync(id);
            if (sa != null)
            {
                sa.IsDeleted = true;
                _context.Tb_ExpenseType.Update(sa);
                await _context.SaveChangesAsync();
                await _repository.SoftDelete(sa);
            }
        }

    }
}
