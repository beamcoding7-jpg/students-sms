"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { BarChart3 } from "lucide-react";

export interface GradeDistributionData {
  gradeLetter: string;
  count: number;
  percentage: number;
}

interface GradeDistributionChartProps {
  data: GradeDistributionData[];
  totalStudents: number;
  className?: string;
}

const GRADE_COLORS: Record<string, { bar: string; text: string; bg: string }> = {
  "4.0": { bar: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  "3.5": { bar: "bg-teal-500", text: "text-teal-700 dark:text-teal-300", bg: "bg-teal-50 dark:bg-teal-950/40" },
  "3.0": { bar: "bg-blue-500", text: "text-blue-700 dark:text-blue-300", bg: "bg-blue-50 dark:bg-blue-950/40" },
  "2.5": { bar: "bg-indigo-500", text: "text-indigo-700 dark:text-indigo-300", bg: "bg-indigo-50 dark:bg-indigo-950/40" },
  "2.0": { bar: "bg-amber-500", text: "text-amber-700 dark:text-amber-300", bg: "bg-amber-50 dark:bg-amber-950/40" },
  "1.5": { bar: "bg-orange-500", text: "text-orange-700 dark:text-orange-300", bg: "bg-orange-50 dark:bg-orange-950/40" },
  "1.0": { bar: "bg-rose-400", text: "text-rose-700 dark:text-rose-300", bg: "bg-rose-50 dark:bg-rose-950/40" },
  "0": { bar: "bg-rose-600", text: "text-rose-800 dark:text-rose-300", bg: "bg-rose-100 dark:bg-rose-950/60" },
};

export function GradeDistributionChart({
  data,
  totalStudents,
  className,
}: GradeDistributionChartProps) {
  // คำนวณค่าสูงสุดเพื่อ scale ความสูงของ Bar
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className={cn("bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm", className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">
              การกระจายตัวของระดับผลการเรียน (Grade Distribution)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              วิเคราะห์ความถี่ผลการเรียน 8 ระดับ จากทั้งหมด {totalStudents} รายการคะแนน
            </p>
          </div>
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="pt-8 pb-4 px-2">
        <div className="grid grid-cols-8 gap-2 sm:gap-4 items-end h-48 border-b border-slate-200 dark:border-slate-700 pb-2">
          {data.map((item) => {
            const heightPercent = Math.round((item.count / maxCount) * 100);
            const colorConfig = GRADE_COLORS[item.gradeLetter] || {
              bar: "bg-slate-500",
              text: "text-slate-700",
              bg: "bg-slate-50",
            };

            return (
              <div
                key={item.gradeLetter}
                className="flex flex-col items-center h-full justify-end group relative"
              >
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 z-10 pointer-events-none bg-slate-900 text-white text-[11px] py-1 px-2 rounded shadow-lg whitespace-nowrap">
                  เกรด {item.gradeLetter}: {item.count} คน ({item.percentage}%)
                </div>

                {/* Score Count Text above Bar */}
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {item.count}
                </span>

                {/* Vertical Bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg h-36 flex items-end overflow-hidden">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={cn(
                      "w-full rounded-t-lg transition-all duration-500 ease-out group-hover:brightness-110",
                      colorConfig.bar,
                      heightPercent === 0 && "h-1"
                    )}
                  />
                </div>

                {/* Grade Label */}
                <div className="mt-2 text-center">
                  <span
                    className={cn(
                      "inline-block px-1.5 py-0.5 rounded text-xs font-bold",
                      colorConfig.text,
                      colorConfig.bg
                    )}
                  >
                    {item.gradeLetter}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Percentage summary breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-xs">
        {data.map((item) => (
          <div
            key={item.gradeLetter}
            className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40"
          >
            <span className="text-slate-500 dark:text-slate-400">
              เกรด <strong className="text-slate-700 dark:text-slate-200">{item.gradeLetter}</strong>
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {item.percentage}% ({item.count})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
