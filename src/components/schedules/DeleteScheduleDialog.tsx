"use client";

import React, { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { deleteScheduleAction } from "@/app/(dashboard)/admin/schedules/actions";
import { ScheduleItem } from "./TimetableGrid";

interface DeleteScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: ScheduleItem | null;
  onSuccess?: () => void;
}

export function DeleteScheduleDialog({
  isOpen,
  onClose,
  schedule,
  onSuccess,
}: DeleteScheduleDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!schedule) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    const res = await deleteScheduleAction(schedule.id);
    setIsDeleting(false);

    if (res.success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setError(res.error || "เกิดข้อผิดพลาดในการลบคาบเรียน");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            ยืนยันการลบคาบเรียน
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          <p className="text-sm text-foreground">
            คุณต้องการลบคาบเรียนนี้ออกจากตารางเรียนใช่หรือไม่?
          </p>

          <div className="bg-muted/40 border border-border rounded-xl p-3.5 space-y-1.5 text-xs">
            <p className="font-bold text-sm text-foreground">
              {schedule.courseCode} - {schedule.courseName}
            </p>
            <p className="text-muted-foreground">
              ห้องเรียน: <span className="font-semibold text-foreground">{schedule.classroom}</span>
            </p>
            <p className="text-muted-foreground">
              วันและเวลา:{" "}
              <span className="font-semibold text-foreground">
                วัน{schedule.dayOfWeek} ({schedule.startTime} - {schedule.endTime} น.)
              </span>
            </p>
            <p className="text-muted-foreground">
              สถานที่: <span className="font-semibold text-foreground">{schedule.roomNumber}</span>
            </p>
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/20">
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="pt-3 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="h-9 px-4"
          >
            ยกเลิก
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-9 px-4 font-semibold"
          >
            {isDeleting ? "กำลังลบ..." : "ยืนยันการลบ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
