import { z } from "zod";

export const ClassroomSchema = z.object({
  classroomId: z.number(),
  roomCode: z.string().max(20),
  building: z.string().max(100),
  capacity: z.number(),
});

export const CreateClassroomSchema = ClassroomSchema.omit({ classroomId: true });

export type Classroom = z.infer<typeof ClassroomSchema>;
export type CreateClassroom = z.infer<typeof CreateClassroomSchema>;
