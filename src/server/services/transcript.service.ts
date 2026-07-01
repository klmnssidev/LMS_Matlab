import * as enrollmentRepo from "@/server/repositories/enrollment.repository";
import { calculateGpa } from "@/server/lib/academic/gpa";
import { calculateCompletedCredits } from "@/server/lib/academic/credits";

type TranscriptEnrollmentRaw = Awaited<ReturnType<typeof enrollmentRepo.findTranscriptEnrollments>>[number];

export type TranscriptDTO = {
  studentName: string;
  departmentName: string;
  studentNumber: string | null;
  semesters: {
    semesterId: number;
    semesterName: string;
    academicYear: string;
    gpa: number | null;
    totalCredits: number;
    earnedCredits: number;
    enrollments: {
      enrollmentId: number;
      courseCode: string;
      courseName: string;
      creditHours: number;
      finalGrade: string | null;
      letterGrade: string | null;
      examResults: {
        examType: string;
        score: number;
        maxScore: number;
      }[];
    }[];
  }[];
  cumulativeGpa: number | null;
  totalCompletedCredits: number;
};

export async function getTranscript(
  studentId: number,
  semesterId?: number
): Promise<TranscriptDTO> {
  const allEnrollments = await enrollmentRepo.findTranscriptEnrollments(studentId);

  if (allEnrollments.length === 0) {
    return {
      studentName: "",
      departmentName: "",
      studentNumber: null,
      semesters: [],
      cumulativeGpa: null,
      totalCompletedCredits: 0,
    };
  }

  const first = allEnrollments[0];
  const student = first.student;
  const studentName = student.studentName;
  const departmentName = student.department.departmentName;
  const studentNumber = student.studentNumber;

  const viewEnrollments = semesterId
    ? allEnrollments.filter((e) => e.offering.semester.semesterId === semesterId)
    : allEnrollments;

  const semesterMap = new Map<
    number,
    {
      semesterName: string;
      academicYear: string;
      enrollments: TranscriptEnrollmentRaw[];
    }
  >();

  for (const e of viewEnrollments) {
    const sem = e.offering.semester;
    const existing = semesterMap.get(sem.semesterId);
    if (existing) {
      existing.enrollments.push(e);
    } else {
      semesterMap.set(sem.semesterId, {
        semesterName: sem.semesterName,
        academicYear: sem.academicYear,
        enrollments: [e],
      });
    }
  }

  const semesters = Array.from(semesterMap.entries()).map(([semId, entry]) => {
    const gpaItems = entry.enrollments.map((e) => ({
      finalGrade: e.finalGrade,
      creditHours: e.offering.course.creditHours,
    }));
    const gpa = calculateGpa(gpaItems);
    const totalCredits = entry.enrollments.reduce(
      (sum, e) => sum + e.offering.course.creditHours,
      0
    );
    const creditItems = entry.enrollments.map((e) => ({
      status: e.status,
      creditHours: e.offering.course.creditHours,
    }));
    const earnedCredits = calculateCompletedCredits(creditItems);

    return {
      semesterId: semId,
      semesterName: entry.semesterName,
      academicYear: entry.academicYear,
      gpa,
      totalCredits,
      earnedCredits,
      enrollments: entry.enrollments.map((e) => ({
        enrollmentId: e.enrollmentId,
        courseCode: e.offering.course.courseCode,
        courseName: e.offering.course.courseName,
        creditHours: e.offering.course.creditHours,
        finalGrade: e.finalGrade,
        letterGrade: e.finalGrade ?? null,
        examResults: e.examResults.map((er) => ({
          examType: er.exam.examType,
          score: Number(er.score),
          maxScore: Number(er.exam.maxScore),
        })),
      })),
    };
  });

  const allGradedItems = allEnrollments
    .filter((e) => e.finalGrade != null && e.finalGrade !== "")
    .map((e) => ({
      finalGrade: e.finalGrade,
      creditHours: e.offering.course.creditHours,
    }));
  const cumulativeGpa = calculateGpa(allGradedItems);

  const allCreditItems = allEnrollments.map((e) => ({
    status: e.status,
    creditHours: e.offering.course.creditHours,
  }));
  const totalCompletedCredits = calculateCompletedCredits(allCreditItems);

  return {
    studentName,
    departmentName,
    studentNumber,
    semesters,
    cumulativeGpa,
    totalCompletedCredits,
  };
}
