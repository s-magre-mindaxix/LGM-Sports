using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.Core.Models.CRM.Dashboards;
using CompanyPlatform.CRM.DTO.Dashboard;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.Dashboards.UserNote
{
    public class UserNoteService : IUserNoteService
    {
        private readonly ApplicationDBContext _context;

        public UserNoteService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<List<UserNoteResponse>> GetUserNotesAsync(string userId)
        {
            return await _context.Tbl_UserNotes
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.UpdatedAt)
                .Select(n => new UserNoteResponse
                {
                    Id = n.Id,
                    Content = n.Content,
                    GradientClass = n.GradientClass,
                    AuthorRole = n.AuthorRole,
                    UpdatedAt = n.UpdatedAt
                }).ToListAsync();
        }

        public async Task<UserNoteResponse> CreateNoteAsync(string userId, CreateNoteRequest request)
        {
            var note = new UserNotes
            {
                UserId = userId,
                Content = request.Content,
                GradientClass = request.GradientClass,
                AuthorRole = request.AuthorRole,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Tbl_UserNotes.Add(note);
            await _context.SaveChangesAsync();

            return new UserNoteResponse
            {
                Id = note.Id,
                Content = note.Content,
                GradientClass = note.GradientClass,
                AuthorRole = note.AuthorRole,
                UpdatedAt = note.UpdatedAt
            };
        }

        public async Task<bool> DeleteNoteAsync(string userId, int noteId)
        {
            var note = await _context.Tbl_UserNotes
                .FirstOrDefaultAsync(n => n.Id == noteId && n.UserId == userId);

            if (note == null) return false;

            _context.Tbl_UserNotes.Remove(note);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
