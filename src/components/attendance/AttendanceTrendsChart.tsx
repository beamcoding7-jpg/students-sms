"use client";

import React from "react";
import { TrendingUp, Calendar, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DayTrend {
  date: string; // YYYY-MM-DD
  dayLabel: string; // เช่น "จันทร์ 8 ก.ย." หรือ "8 ก.ย."
  total: number;
  present: number;
  late: number;
  leave: number;
  absent: number;
  rate: number; // 0 - 100
}

interface AttendanceTrendsChartProps {
  trends: DayTrend[];
}

export function AttendanceTrendsChart({ trends }: AttendanceTrendsChartProps) {
  if (trends.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
        <p className="text-sm text-muted-foreground">ยังไม่มีข้อมูลแนวโน้มการเข้าเรียนย้อนหลัง</p>
      </div>
    );
  }

  // คำนวณอัตราเฉลี่ยตลอดช่วงวัน
  const avgRate = Math.round(
    trends.reduce((acc, curr) => acc + curr.rate, 0) / trends.length
  );

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-3">
        <div>
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            แนวโน้มอัตราการเข้าเรียน (5 วันทำการล่าสุด)
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            สัดส่วนการมาเรียนเทียบกับจำนวนนักเรียนทั้งหมดในแต่ละวัน
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-muted-foreground">อัตราเฉลี่ย:</span>
          <span
            className={cn(
              "px-2.5 py-0.5 rounded-full text-xs font-bold",
              avgRate >= 90
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                : avgRate >= 80
                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
            )}
          >
            {avgRate}%
          </span>
        </div>
      </div>

      {/* กราฟแท่ง Pure CSS/Tailwind (Stacked Multi-Segment Bar) */}
      <div className="pt-4 pb-2">
        <div className="grid grid-cols-5 gap-2 sm:gap-4 items-end h-52 sm:h-56 px-2">
          {trends.map((item) => {
            const heightPercent = Math.max(item.rate, 10);
            return (
              <div key={item.date} className="flex flex-col items-center h-full justify-end group">
                {/* Tooltip / Value on top */}
                <div className="mb-2 text-center transition-transform group-hover:-translate-y-1">
                  <span className="text-xs font-bold text-foreground block">{item.rate}%</span>
                  <span className="text-[10px] text-muted-foreground hidden sm:block">
                    {item.present}/{item.total} คน
                  </span>
                </div>

                {/* แท่ง Bar Chart */}
                <div className="w-full max-w-[48px] bg-muted/40 rounded-t-lg overflow-hidden flex flex-col justify-end relative h-36 border border-border/50">
                  {/* พื้นที่สีตามอัตราการมาเรียน */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={cn(
                      "w-full rounded-t-sm transition-all duration-500 relative flex flex-col justify-end",
                      item.rate >= 90
                        ? "bg-emerald-500 dark:bg-emerald-600"
                        : item.rate >= 80
                        ? "bg-amber-500 dark:bg-amber-600"
                        : "bg-rose-500 dark:bg-rose-600"
                    )}
                  >
                    {/* ขีดไฮไลท์ด้านบนของแท่ง */}
                    <div className="h-1 w-full bg-white/30" />
                  </div>
                </div>

                {/* ป้ายวันที่ด้านล่าง */}
                <div className="mt-2 text-center">
                  <p className="text-xs font-medium text-foreground truncate max-w-[70px]">
                    {item.dayLabel}
                  </p>
                  <p className="text-[10px] text-muted-foreground hidden sm:block font-mono">
                    {item.date.slice(5)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* คำอธิบายสัญลักษณ์ (Legend) */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-3 border-t border-border text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-emerald-500" />
          <span>มาเรียนดีเยี่ยม (≥ 90%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-amber-500" />
          <span>ปานกลาง (80 - 89%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-rose-500" />
          <span>ต้องปรับปรุง (&lt; 80%)</span>
        </div>
      </div>
    </div>
  );
}
