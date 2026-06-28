"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as attendanceApi from "@/features/attendance/services/attendance-api";
import type { AttendanceListParams } from "@/features/attendance/services/attendance-api";

export function useAttendance(params: AttendanceListParams = {}) {
  return useQuery({
    queryKey: ["attendance", params],
    queryFn: () => attendanceApi.fetchAttendance(params),
  });
}

export function useCreateAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: attendanceApi.createAttendance,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });
}

export function useUpdateAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: attendanceApi.updateAttendance,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });
}

export function useDeleteAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: attendanceApi.deleteAttendance,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });
}
