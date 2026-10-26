import React from "react";
import { FaShip, FaGlobe, FaFileInvoice, FaPercentage, FaWallet } from "react-icons/fa";
import type { ShipmentLandedCostSummaryDto } from "./Services/types";

const SummaryCards: React.FC<{ summary: ShipmentLandedCostSummaryDto }> = ({ summary }) => {
    const cards = [
        {
            title: "Total Shipments",
            value: summary.totalShipments,
            icon: <FaShip />,
            borderColor: "border-l-indigo-500",
            iconBg: "bg-indigo-50",
            iconColor: "text-indigo-600",
            prefix: "",
            unit: "Units"
        },
        {
            title: "Inv. Value (Foreign)",
            value: summary.totalInvoiceValue.toLocaleString(undefined, { minimumFractionDigits: 2 }),
            icon: <FaGlobe />,
            borderColor: "border-l-emerald-500",
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-600",
            prefix: "£",
            unit: "GBP"
        },
        {
            title: "Total Custom Duty",
            value: summary.totalCustomDuty.toLocaleString(),
            icon: <FaFileInvoice />,
            borderColor: "border-l-amber-500",
            iconBg: "bg-amber-50",
            iconColor: "text-amber-600",
            prefix: "₹",
            unit: "INR"
        },
        {
            title: "Total IGST",
            value: summary.totalIGST.toLocaleString(),
            icon: <FaPercentage />,
            borderColor: "border-l-rose-500",
            iconBg: "bg-rose-50",
            iconColor: "text-rose-600",
            prefix: "₹",
            unit: "INR"
        },
        {
            title: "Grand Landed Cost",
            value: summary.grandTotalLandedCost.toLocaleString(undefined, { minimumFractionDigits: 2 }),
            icon: <FaWallet />,
            borderColor: "border-l-blue-600",
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600",
            prefix: "₹",
            unit: "INR"
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className={`relative overflow-hidden bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 ${card.borderColor} transition-all duration-300 hover:shadow-md hover:-translate-y-1`}
                >
                    <div className="p-4">
                        <div className="flex items-start justify-between">
                            <div className="z-10">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                    {card.title}
                                </p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-sm font-bold text-gray-500">{card.prefix}</span>
                                    <h3 className="text-lg font-black text-gray-800 tracking-tight">
                                        {card.value}
                                    </h3>
                                </div>
                                <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">
                                    Currency: {card.unit}
                                </p>
                            </div>

                            <div className={`p-2.5 rounded-lg ${card.iconBg} ${card.iconColor} shadow-inner z-10`}>
                                <span className="text-xl">
                                    {card.icon}
                                </span>
                            </div>
                        </div>

                        {/* Background Decorative Element */}
                        <div className="absolute -bottom-2 -right-1 text-gray-100 opacity-[0.2] text-6xl transform -rotate-12 pointer-events-none">
                            {card.icon}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SummaryCards;