import * as classroomRepo from "@/server/repositories/classroom.repository";

export async function list() {
  return classroomRepo.findAll();
}
