import React, { useEffect, useState } from "react";
import { type TableColumn } from "react-data-table-component";
import { toast } from "sonner";
import ListingLayout from "../../../../../Components/Common/ListingLayout";
import { getShipmentTransitStatusReport } from "./Services/ShipmentTransitService";
import type { ShipmentTransitStatusReportDto, ShipmentTransitSummary } from "./Services/types";
import SummaryTransitCards from "./SummaryTransitCards";

const ShipmentTransitStatusPage: React.FC = () => {
    const [reports, setReports] = useState<ShipmentTransitStatusReportDto[]>([]);
    const [summary, setSummary] = useState<ShipmentTransitSummary>({
        totalShipments: 0,
        inTransit: 0,
        delivered: 0,
        pending: 0,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string>("All");

    const loadData = async () => {
        setIsLoading(true);
        try {
            const data = await getShipmentTransitStatusReport();
            setReports(data);

            // Calculate summary counts
            const totals = data.reduce((acc, curr) => {
                acc.totalShipments++;
                const status = curr.status?.toLowerCase();
                if (status === "in transit") acc.inTransit++;
                else if (status === "delivered") acc.delivered++;
                else acc.pending++;
                return acc;
            }, { totalShipments: 0, inTransit: 0, delivered: 0, pending: 0 });

            setSummary(totals);
        } catch (error) {
            toast.error("Failed to load Shipment Transit Report");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const columns: TableColumn<ShipmentTransitStatusReportDto>[] = [
        {
            name: "Shipment No",
            selector: (row) => row.shipmentNo,
            sortable: true,
            width: "140px",
            cell: (row) => <span className="font-semibold text-blue-600">{row.shipmentNo}</span>
        },
        {
            name: "Customer",
            selector: (row) => row.customerName || "N/A",
            sortable: true,
            grow: 1.5,
        },
        {
            name: "Vessel / Flight",
            selector: (row) => row.vesselFlightNo || "N/A",
            sortable: true,
            cell: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.vesselFlightNo}</span>
                    <span className="text-xs text-gray-500">{row.containerNo}</span>
                </div>
            )
        },
        {
            name: "Route (POL → POD)",
            selector: (row) => row.portOfLoading || "",
            cell: (row) => (
                <div className="text-xs">
                    <span className="text-blue-600 font-medium">{row.portOfLoading}</span>
                    <span className="mx-1 text-gray-400">→</span>
                    <span className="text-emerald-600 font-medium">{row.portOfDischarge}</span>
                </div>
            ),
            width: "200px"
        },
        {
            name: "Departure",
            selector: (row) => row.departureDate ? new Date(row.departureDate).toLocaleDateString() : "N/A",
            sortable: true,
            width: "110px"
        },
        {
            name: "Exp. Arrival",
            selector: (row) => row.expectedArrivalDate ? new Date(row.expectedArrivalDate).toLocaleDateString() : "N/A",
            sortable: true,
            width: "110px"
        },
        {
            name: "Status",
            selector: (row) => row.status,
            sortable: true,
            cell: (row) => (
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                    row.status?.toLowerCase() === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 
                    row.status?.toLowerCase() === 'in transit' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                }`}>
                    {row.status}
                </span>
            ),
            width: "120px"
        },
        {
            name: "Final Delivery",
            selector: (row) => row.finalDeliveryDate ? new Date(row.finalDeliveryDate).toLocaleDateString() : "Pending",
            sortable: true,
            width: "120px"
        }
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Shipment Transit Report</h1>
                <p className="text-gray-500">Tracking status and logistics timeline for all shipments</p>
            </div>

           <SummaryTransitCards
                summary={summary}
                onCardClick={(status) => setSelectedStatus(status)}
            />

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <ListingLayout
                    title="Transit Details"
                    columns={columns}
                   data={
                        selectedStatus === "All"
                            ? reports
                            : reports.filter(
                                x => x.status?.toLowerCase() === selectedStatus.toLowerCase()
                            )
                    }
                    isLoading={isLoading}
                    filterText=""
                    onFilterChange={() => {}}
                    onCreate={undefined}
                />
            </div>
        </div>
    );
};

export default ShipmentTransitStatusPage;