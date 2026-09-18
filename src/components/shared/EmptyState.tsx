import React from "react";
import { LucideIcon, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * คอมโพเนนต์แสดงสถานะว่าง (Empty State)
 * ใช้แสดงผลเมื่อไม่มีข้อมูล หรือผลการค้นหาไม่ตรงกับเงื่อนไข
 */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-border bg-card/40 backdrop-blur ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mt-1 mb-4 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" variant="outline" className="text-xs font-medium">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
