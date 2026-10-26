using System.Linq.Expressions;

namespace CompanyPlatform.Core.Repository
{
    public interface IRepositories<T> where T : class
    {
        Task<IEnumerable<T>> GetAll();
        Task<IEnumerable<T>> FindByCondition(Expression<Func<T, bool>> expression);
        Task<T> GetById(int id);
        Task Add(T entity);
        Task Update(T entity);

        Task SoftDelete(T entity);
        Task AddAsync(T entity);
        Task AddRangeAsync(IEnumerable<T> entities);
        Task SaveChangesAsync();

        Task<IEnumerable<T>> GetByConditionAsync(Expression<Func<T, bool>> expression);
        Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);
        Task<T> GetByIdAsync(int id);

        Task UpdateAsync(T entity);
        Task Create(T entity);
        Task Delete(T entity);
    }
}
