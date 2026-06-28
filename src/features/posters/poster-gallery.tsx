"use client";

import { useEffect, useState, useRef } from "react";
import { ImageIcon, Plus, Trash2, Upload } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { SkeletonCardGrid } from "@/components/loading-skeletons";
import type { Poster } from "./types";

export function PosterGallery() {
  const [posters, setPosters] = useState<Poster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useUser();
  const role = (user?.publicMetadata?.role ?? "Student") as string;
  const isAdmin = role === "Admin";
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/posters")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (!cancelled) setPosters(data);
      })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  async function handleUpload() {
    if (!title || !file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("title", title);
      formData.set("image", file);
      const res = await fetch("/api/posters", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const poster = await res.json();
      setPosters((prev) => [poster, ...prev]);
      setUploadOpen(false);
      setTitle("");
      setFile(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`/api/posters?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setPosters((prev) => prev.filter((p) => p.poster_id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Posters</h1>
        {isAdmin && (
          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <DialogTrigger render={<Button><Plus data-icon="inline-start" />Upload Poster</Button>} />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Poster</DialogTitle>
                <DialogDescription>Add a new poster image to the gallery.</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 pt-2">
                <Input
                  placeholder="Poster title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                <Button onClick={handleUpload} disabled={uploading || !title || !file}>
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading && <SkeletonCardGrid count={6} />}
      {error && <p className="text-destructive">{error}</p>}

      {!loading && !error && posters.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><ImageIcon /></EmptyMedia>
            <EmptyTitle>No posters yet</EmptyTitle>
            <EmptyDescription>{isAdmin ? "Upload the first poster to get started." : "Check back later for new posters."}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {!loading && !error && posters.length > 0 && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {posters.map((poster) => (
            <Card key={poster.poster_id} className="overflow-hidden group">
              <div className="aspect-[4/3] bg-muted relative">
                <img
                  src={`/api/posters?id=${poster.poster_id}`}
                  alt={poster.title}
                  className="size-full object-cover"
                />
                {isAdmin && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 size-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(poster.poster_id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
              <CardHeader className="p-3 pt-2">
                <CardTitle className="text-sm font-medium">{poster.title}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {poster.created_at ? new Date(poster.created_at).toLocaleDateString() : ""}
                </p>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
