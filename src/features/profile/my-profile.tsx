"use client";

import { User, Mail, Phone, Calendar, Hash, Building2, BadgeCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkeletonProfile } from "@/components/loading-skeletons";
import { useMyProfile } from "@/features/profile/hooks/use-my-profile";

export function MyProfile() {
  const { data: profile, isLoading, error } = useMyProfile();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <SkeletonProfile />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-destructive">{error?.message ?? "Failed to load profile"}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
              <User className="size-7 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{profile.studentName}</CardTitle>
              <p className="text-sm text-muted-foreground">{profile.studentNumber ?? "No student number"}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <Mail className="size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">{profile.phone ?? "—"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Gender</p>
                <p className="text-sm font-medium capitalize">{profile.gender.toLowerCase()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Date of Birth</p>
                <p className="text-sm font-medium">{profile.dateOfBirth ?? "—"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Hash className="size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Admission Year</p>
                <p className="text-sm font-medium">{profile.admissionYear}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Building2 className="size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Department</p>
                <p className="text-sm font-medium">{profile.departmentName} ({profile.departmentCode})</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <BadgeCheck className="size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge variant={profile.status === "Active" ? "default" : "secondary"}>
                  {profile.status ?? "Active"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
