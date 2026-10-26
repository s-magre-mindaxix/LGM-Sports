using CompanyPlatform.CRM.DTO.Dashboard;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.Dashboards.UserNote
{
    public interface IUserNoteService
    {
        Task<List<UserNoteResponse>> GetUserNotesAsync(string userId);
        Task<UserNoteResponse> CreateNoteAsync(string userId, CreateNoteRequest request);
        Task<bool> DeleteNoteAsync(string userId, int noteId);
    }
}
