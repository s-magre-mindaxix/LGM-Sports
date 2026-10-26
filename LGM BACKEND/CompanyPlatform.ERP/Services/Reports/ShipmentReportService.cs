using CompanyPlatform.Core.Data;
using CompanyPlatform.ERP.DTO.ReportsDTO;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.Services.Reports
{
    public class ShipmentReportService:IShipmentReportService
    {
        private readonly ApplicationDBContext _context;

        public ShipmentReportService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<ShipmentLandedCostResponseDto> GetReportAsync()
        {
            var query =
                from shipment in _context.Tbl_ShipmentInitiates

                join vendor in _context.Tbl_Vendors
                    on shipment.CustomerId equals vendor.Id into vendorJoin
                from vendor in vendorJoin.DefaultIfEmpty()

                join custom in _context.Tbl_ShipmentUnderTransits
                on shipment.ShipmentInitiateId equals custom.ShipmentInitiateId into customJoin
                from custom in customJoin.DefaultIfEmpty()

                join forwarding in _context.Tbl_ForwarderBills
                    on shipment.ShipmentInitiateId equals forwarding.ShipmentInitiateId into forwardingJoin
                from forwarding in forwardingJoin.DefaultIfEmpty()

                join clearing in _context.Tbl_CHABills
                    on shipment.ShipmentInitiateId equals clearing.ShipmentInitiateId into clearingJoin
                from clearing in clearingJoin.DefaultIfEmpty()

                join transport in _context.Tbl_TransporterBills
                    on shipment.ShipmentInitiateId equals transport.ShipmentInitiateId into transportJoin
                from transport in transportJoin.DefaultIfEmpty()

                where !shipment.IsDeleted

                select new ShipmentLandedCostReportDto
                {
                    ShipmentInitiateId = shipment.ShipmentInitiateId,
                    ShipmentNo = shipment.ShipmentNo,
                    CustomerName = vendor != null ? vendor.VendorName: "",
                    InvoiceNo = shipment.InvoiceNo,
                    ShipmentDate = shipment.ShipmentDate,
                    InvoiceValue = shipment.InvoiceValue ?? 0,
                    BOEExchangeRate = custom != null ? (custom.BOEExchangeRate ?? 0) : 0,
                    InvoiceValueInINR = (shipment.InvoiceValue ?? 0) * (custom != null ? (custom.BOEExchangeRate ?? 0) : 0),
                    CustomDuty = custom != null ? (custom.BOECustomDuty ?? 0) : 0,
                    IGST = custom != null ? (custom.BOEGST ?? 0) : 0,
                    ForwardingExpense = forwarding != null ? forwarding.TotalAmount : 0,
                    ClearingExpense = clearing != null ? clearing.TotalAmount : 0,
                    TransportationExpense = transport != null ? transport.BillAmount + transport.GstAmount : 0,
                };


            var reports = await query
                .OrderByDescending(x => x.ShipmentDate)
                .ToListAsync();

            foreach (var item in reports)
            {
                item.TotalLandedCost =
                    item.InvoiceValueInINR +
                    item.CustomDuty +
                    item.IGST +
                    item.ForwardingExpense +
                    item.ClearingExpense +
                    item.TransportationExpense +
                    item.OtherCharges;
            }

            var summary = new ShipmentLandedCostSummaryDto
            {
                TotalShipments = reports.Count,
                TotalInvoiceValue = reports.Sum(x => x.InvoiceValue),
                TotalForwardingExpense = reports.Sum(x => x.ForwardingExpense),
                TotalClearingExpense = reports.Sum(x => x.ClearingExpense),
                TotalTransportationExpense = reports.Sum(x => x.TransportationExpense),
                TotalCustomDuty = reports.Sum(x => x.CustomDuty),
                TotalIGST = reports.Sum(x => x.IGST),
                TotalOtherCharges = reports.Sum(x => x.OtherCharges),
                GrandTotalLandedCost = reports.Sum(x => x.TotalLandedCost)
            };

            return new ShipmentLandedCostResponseDto
            {
                Reports = reports,
                Summary = summary
            };
        }

        public async Task<List<ShipmentStatusReportDto>> GetShipmentStatusReportAsync()
        {
            var reports = await _context.Tbl_ShipmentInitiates
                .Where(x => !x.IsDeleted)
                .OrderByDescending(x => x.ShipmentDate)
                .Select(x => new ShipmentStatusReportDto
                {
                    ShipmentInitiateId = x.ShipmentInitiateId,
                    ShipmentNo = x.ShipmentNo,
                    CustomerName = x.CustomerName,
                    InvoiceNo = x.InvoiceNo,
                    InvoiceValue = x.InvoiceValue,
                    CurrencyName = x.CurrencyName,
                    ShipmentDate = x.ShipmentDate,
                    Status = x.Status,
                    TotalNetWeightKg = x.TotalNetWeightKg,
                    TotalGrossWeightKg = x.TotalGrossWeightKg,
                    TotalCBM = x.TotalCBM
                })
                .ToListAsync();

            return reports;
        }

        public async Task<List<ShipmentTransitStatusReportDto>> GetShipmentTransitStatusReportAsync()
        {
            var result = await (
                from transit in _context.Tbl_ShipmentUnderTransits

                join shipment in _context.Tbl_ShipmentInitiates
                    on transit.ShipmentInitiateId equals shipment.ShipmentInitiateId

                where !transit.IsDeleted

                orderby transit.CreatedDate descending

                select new ShipmentTransitStatusReportDto
                {
                    ShipmentNo = shipment.ShipmentNo,
                    CustomerName = shipment.CustomerName,
                    ContainerNo = transit.ContainerNo,
                    VesselFlightNo = transit.VesselFlightNo,
                    PortOfLoading = transit.PortOfLoading,
                    PortOfDischarge = transit.PortOfDischarge,
                    Destination = transit.Destination,
                    DepartureDate = transit.DepartureDate,
                    ExpectedArrivalDate = transit.ExpectedArrivalDate,
                    FinalDeliveryDate = transit.FinalDeliveryDate,
                    Status = transit.Status
                })
                .ToListAsync();

            return result;
        }
    }
}

