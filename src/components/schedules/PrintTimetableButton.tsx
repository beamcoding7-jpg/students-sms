"use client";

import React from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrintTimetableButtonProps {
  label?: string;
  className?: string;
}

export function PrintTimetableButton({
  label = "พิมพ์ตารางเรียน (A4)",
  className,
}: PrintTimetableButtonProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handlePrint}
      className={`gap-1.5 print:hidden border-border bg-card text-foreground hover:bg-muted font-medium shadow-xs ${className || ""}`}
    >
      <Printer className="w-4 h-4 text-primary" />
      <span>{label}</span>
    </Button>
  );
}
