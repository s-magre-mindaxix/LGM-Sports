import React from 'react';
import { FaShip, FaCheckCircle, FaClock, FaTruckLoading } from 'react-icons/fa';
import type { ShipmentTransitSummary } from './Services/types';

interface Props {
    summary: ShipmentTransitSummary;
    onCardClick: (status: string) => void;
}

const SummaryTransitCards: React.FC<Props> = ({
    summary,
    onCardClick,
}) => {
    const cards = [
        {
            title: "Total Shipments",
            value: summary.totalShipments,
            status: "All",
            icon: <FaShip />,
            borderColor: "border-l-blue-500",
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600",
            unit: "Total"
        },
        {
            title: "In Transit",
            value: summary.inTransit,
             status: "In Transit",
            icon: <FaTruckLoading />,
            borderColor: "border-l-amber-500",
            iconBg: "bg-amber-50",
            iconColor: "text-amber-600",
            unit: "Active"
        },
        {
            title: "Delivered",
            value: summary.delivered,
            status: "Delivered",
            icon: <FaCheckCircle />,
            borderColor: "border-l-emerald-500",
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-600",
            unit: "Completed"
        },
        {
            title: "Pending/Other",
            value: summary.pending,
             status: "Pending",
            icon: <FaClock />,
            borderColor: "border-l-gray-500",
            iconBg: "bg-gray-50",
            iconColor: "text-gray-600",
            unit: "Waiting"
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {cards.map((card, index) => (
                <div
                        key={index}
                        onClick={() => onCardClick(card.status)}
                        className={`relative overflow-hidden bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 ${card.borderColor} transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer`}
                    >
                    <div className="p-5 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-2xl font-bold text-gray-800">{card.value}</h3>
                                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{card.unit}</span>
                            </div>
                        </div>
                        <div className={`p-3 rounded-xl ${card.iconBg} ${card.iconColor} shadow-inner`}>
                            <span className="text-2xl">{card.icon}</span>
                        </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 text-gray-50 opacity-[0.03] text-7xl transform -rotate-12 pointer-events-none">
                        {card.icon}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SummaryTransitCards;