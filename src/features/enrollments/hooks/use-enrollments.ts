"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as enrollmentApi from "@/features/enrollments/services/enrollment-api";
import type { EnrollmentListParams } from "@/features/enrollments/services/enrollment-api";

export function useEnrollments(params: EnrollmentListParams = {}) {
  return useQuery({
    queryKey: ["enrollments", params],
    queryFn: () => enrollmentApi.fetchEnrollments(params),
  });
}

export function useCreateEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: enrollmentApi.createEnrollment,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["enrollments"] }),
  });
}

export function useUpdateEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: enrollmentApi.updateEnrollment,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["enrollments"] }),
  });
}

export function useDeleteEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: enrollmentApi.deleteEnrollment,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["enrollments"] }),
  });
}
