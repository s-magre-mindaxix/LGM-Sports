import React from "react";
import { FaShip, FaBox, FaDollyFlatbed } from "react-icons/fa";
import type { ShipmentStatusSummary } from "./Services/types";

interface Props {
  summary: ShipmentStatusSummary;
  onCardClick: (status: string) => void;
}

const SummaryCards: React.FC<Props> = ({ summary, onCardClick }) => {
  const cards = [
    {
      title: "Total Shipments",
      value: summary.totalShipments,
      status: "All",
      icon: <FaShip />,
      borderColor: "border-l-blue-500",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      unit: "Count",
    },
    {
      title: "Shipment Initiated",
      value: summary.shipmentInitiated,
      status: "Shipment Initiated",
      icon: <FaShip />,
      borderColor: "border-l-emerald-500",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      unit: "Count",
    },
    {
      title: "Shipment In Transit",
      value: summary.shipmentInTransit,
      status: "In Transit",
      icon: <FaDollyFlatbed />,
      borderColor: "border-l-amber-500",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      unit: "Count",
    },
    {
      title: "Shipment Closed",
      value: summary.shipmentClosed,
      status: "Closed",
      icon: <FaBox />,
      borderColor: "border-l-indigo-500",
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      unit: "Count",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div
          key={index}
          onClick={() => onCardClick(card.status)}
          className={`relative overflow-hidden bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 ${card.borderColor}
    transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer`}
        >
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                  {card.title}
                </p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-black text-gray-800 tracking-tight">
                    {card.value}
                  </h3>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    {card.unit}
                  </span>
                </div>
              </div>

              <div
                className={`p-3 rounded-xl ${card.iconBg} ${card.iconColor} shadow-inner`}
              >
                <span className="text-2xl">{card.icon}</span>
              </div>
            </div>

            {/* Background Decorative Element */}
            <div className="absolute -bottom-2 -right-2 text-gray-50 opacity-[0.03] text-7xl transform -rotate-12 pointer-events-none">
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
