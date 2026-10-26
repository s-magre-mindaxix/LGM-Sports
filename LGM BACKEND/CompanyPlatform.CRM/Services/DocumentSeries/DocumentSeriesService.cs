using CompanyPlatform.Core.Data;
using CompanyPlatform.CRM.DTO.DocumentSeries;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.DocumentSeries
{
    public class DocumentSeriesService : IDocumentSeriesService
    {
        private readonly ApplicationDBContext _context;

        public DocumentSeriesService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<DocumentSeriesDto>> GetAllAsync()
        {
            return await _context.Tbl_DocumentSeries
                .Select(d => new DocumentSeriesDto
                {
                    DocumentSeriesId = d.DocumentSeriesId,
                    DocumentType = d.DocumentType,
                    Prefix = d.Prefix,
                    NextNumber = d.NextNumber,
                    FinancialYear = d.FinancialYear,
                    BranchId = d.BranchId
                })
                .ToListAsync();
        }

        public async Task<DocumentSeriesDto?> GetByIdAsync(int id)
        {
            var d = await _context.Tbl_DocumentSeries.FindAsync(id);

            if (d == null)
                return null;

            return new DocumentSeriesDto
            {
                DocumentSeriesId = d.DocumentSeriesId,
                DocumentType = d.DocumentType,
                Prefix = d.Prefix,
                NextNumber = d.NextNumber,
                FinancialYear = d.FinancialYear,
                BranchId = d.BranchId
            };
        }

        public async Task<DocumentSeriesDto> CreateAsync(
            DocumentSeriesDto dto)
        {
            var duplicate = await _context.Tbl_DocumentSeries.AnyAsync(d =>
                d.DocumentType == dto.DocumentType &&
                d.FinancialYear == dto.FinancialYear &&
                d.BranchId == dto.BranchId);

            if (duplicate)
                throw new System.InvalidOperationException(
                    "A document series already exists for this document type, financial year, and branch.");

            var entity = new CompanyPlatform.Core.Models.CRM.DocumentSeries
            {
                DocumentType = dto.DocumentType,
                Prefix = dto.Prefix,
                NextNumber = dto.NextNumber,
                FinancialYear = dto.FinancialYear,
                BranchId = dto.BranchId
            };

            _context.Tbl_DocumentSeries.Add(entity);
            await _context.SaveChangesAsync();

            dto.DocumentSeriesId = entity.DocumentSeriesId;
            return dto;
        }

        public async Task<bool> UpdateAsync(int id, DocumentSeriesDto dto)
        {
            var entity = await _context.Tbl_DocumentSeries.FindAsync(id);

            if (entity == null)
                return false;

            var duplicate = await _context.Tbl_DocumentSeries.AnyAsync(d =>
                d.DocumentType == dto.DocumentType &&
                d.FinancialYear == dto.FinancialYear &&
                d.BranchId == dto.BranchId &&
                d.DocumentSeriesId != id);

            if (duplicate)
                throw new System.InvalidOperationException(
                    "Another document series already exists for this document type, financial year, and branch.");

            entity.DocumentType = dto.DocumentType;
            entity.Prefix = dto.Prefix;
            entity.NextNumber = dto.NextNumber;
            entity.FinancialYear = dto.FinancialYear;
            entity.BranchId = dto.BranchId;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.Tbl_DocumentSeries.FindAsync(id);

            if (entity == null)
                return false;

            _context.Tbl_DocumentSeries.Remove(entity);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
