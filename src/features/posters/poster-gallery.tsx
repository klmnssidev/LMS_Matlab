"use client";

import { useState, useRef } from "react";
import { ImageIcon, Plus, Trash2 } from "lucide-react";
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
import { Can } from "@/permissions/components/can";
import { usePosters, useUploadPoster, useDeletePoster } from "@/features/posters/hooks/use-posters";

export function PosterGallery() {
  const { data: posters = [], isLoading, error } = usePosters();
  const { mutateAsync: upload, isPending: uploading } = useUploadPoster();
  const { mutateAsync: remove } = useDeletePoster();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    if (!title || !file) return;
    try {
      await upload({ title, file });
      setUploadOpen(false);
      setTitle("");
      setFile(null);
    } catch {
      // handled by mutation state
    }
  }

  async function handleDelete(id: number) {
    try {
      await remove(id);
    } catch {
      // handled by mutation state
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Posters</h1>
        <Can I="create" a="Poster">
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
        </Can>
      </div>

      {isLoading && <SkeletonCardGrid count={6} />}
      {error && <p className="text-destructive">{error.message}</p>}

      {!isLoading && !error && posters.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><ImageIcon /></EmptyMedia>
            <EmptyTitle>No posters yet</EmptyTitle>
            <EmptyDescription>No posters available yet.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {!isLoading && !error && posters.length > 0 && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {posters.map((poster) => (
            <Card key={poster.posterId} className="overflow-hidden group">
              <div className="aspect-[4/3] bg-muted relative">
                <img
                  src={`/api/posters?id=${poster.posterId}`}
                  alt={poster.title}
                  className="size-full object-cover"
                />
                <Can I="delete" a="Poster">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 size-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(poster.posterId)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </Can>
              </div>
              <CardHeader className="p-3 pt-2">
                <CardTitle className="text-sm font-medium">{poster.title}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {poster.createdAt ? new Date(poster.createdAt).toLocaleDateString() : ""}
                </p>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
