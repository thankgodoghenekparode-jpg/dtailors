"use client";

import { CheckCircle2, Clock3, Truck, Package, XCircle } from "lucide-react";

type OrderStatus = "pending" | "confirmed" | "shipped" | "completed" | "cancelled";

interface OrderTimelineProps {
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
  compact?: boolean;
}

const steps: Array<{
  key: OrderStatus;
  label: string;
  icon: typeof Clock3;
}> = [
  { key: "pending", label: "Pending", icon: Clock3 },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "completed", label: "Completed", icon: Package },
];

const statusIndex: Record<OrderStatus, number> = {
  pending: 0,
  confirmed: 1,
  shipped: 2,
  completed: 3,
  cancelled: 3,
};

export default function OrderTimeline({ status, createdAt, updatedAt, compact }: OrderTimelineProps) {
  const currentIndex = statusIndex[status];
  const cancelled = status === "cancelled";

  return (
    <div className={`rounded-2xl border border-gray-100 bg-white ${compact ? "p-4" : "p-5"}`}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h3 className={`font-semibold text-gray-900 ${compact ? "text-sm" : "text-base"}`}>Order Progress</h3>
          <p className="text-xs text-gray-500">Created {new Date(createdAt).toLocaleDateString()}</p>
        </div>
        {cancelled ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600">
            <XCircle className="h-3.5 w-3.5" /> Cancelled
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">
            <CheckCircle2 className="h-3.5 w-3.5" /> {status}
          </span>
        )}
      </div>

      <div className="relative">
        <div className="absolute left-4 right-4 top-4 h-0.5 bg-gray-100" />
        <div
          className="absolute left-4 top-4 h-0.5 bg-primary-500 transition-all"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />
        <div className="relative grid grid-cols-4 gap-2">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const active = idx <= currentIndex && !cancelled;
            const complete = idx < currentIndex && !cancelled;
            return (
              <div key={step.key} className="flex flex-col items-center text-center gap-2">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center border-2 bg-white z-10 ${
                    active ? "border-primary-500 text-primary-600" : "border-gray-200 text-gray-400"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${complete ? "text-primary-600" : ""}`} />
                </div>
                <div>
                  <p className={`text-xs font-medium ${active ? "text-gray-900" : "text-gray-500"}`}>{step.label}</p>
                  {step.key === status && updatedAt && (
                    <p className="text-[11px] text-gray-400">Updated {new Date(updatedAt).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
