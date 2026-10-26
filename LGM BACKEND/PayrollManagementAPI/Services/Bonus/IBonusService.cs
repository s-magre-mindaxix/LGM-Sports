
using CompanyPlatform.Core.Models;
namespace PayrollManagementAPI.Services.Bonus
{
    public interface IBonusService
    {
        Task<List<BonusRecord>> GetBonusRecordsForYear(string financialYear);
        Task<bool> ProcessAnnualBonus(string financialYear);

        Task<BonusRecord> GetMyBonusRecordForYear(int employeeId, string financialYear);

        Task<bool> ProcessDiwaliBonus(string financialYear);
    }
}
