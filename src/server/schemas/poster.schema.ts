import { z } from "zod";

export const PosterSchema = z.object({
  posterId: z.number(),
  title: z.string().max(200),
  createdAt: z.string().nullable(),
});

export const PosterFullSchema = PosterSchema.extend({
  imageData: z.any(),
});

export const CreatePosterSchema = z.object({
  title: z.string().min(1).max(200),
  imageData: z.instanceof(Buffer),
});

export type Poster = z.infer<typeof PosterSchema>;
export type PosterFull = z.infer<typeof PosterFullSchema>;
export type CreatePoster = z.infer<typeof CreatePosterSchema>;
