import React from "react";
import { LucideIcon } from "lucide-react";

interface CardProps {
  label: string;
  icon: LucideIcon;
  amount: number | string;
}

const Card: React.FC<CardProps> = ({ label, icon: Icon, amount }) => {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium">{label}</h3>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <div className="text-2xl font-bold">{amount}</div>
      </div>
    </div>
  );
};

export default Card;
