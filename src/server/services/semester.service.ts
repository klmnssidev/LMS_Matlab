import * as semesterRepo from "@/server/repositories/semester.repository";

export async function list() {
  return semesterRepo.findAll();
}
