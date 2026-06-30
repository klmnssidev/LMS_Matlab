import * as enrollmentRepo from "@/server/repositories/enrollment.repository";

type TranscriptEnrollmentRaw = Awaited<ReturnType<typeof enrollmentRepo.findTranscriptEnrollments>>[number];

const GRADE_POINTS: Record<string, number> = {
  A: 4.0,
  B: 3.0,
  C: 2.0,
  D: 1.0,
  F: 0.0,
};

function calcGpaFromEnrollments(
  enrollments: TranscriptEnrollmentRaw[]
): number | null {
  let totalPoints = 0;
  let totalCredits = 0;

  for (const e of enrollments) {
    const grade = e.finalGrade;
    const credits = e.offering.course.creditHours;
    const gradePoint = grade ? GRADE_POINTS[grade] : undefined;
    if (gradePoint !== undefined && credits > 0) {
      totalPoints += gradePoint * credits;
      totalCredits += credits;
    }
  }

  if (totalCredits === 0) return null;
  return Math.round((totalPoints / totalCredits) * 100) / 100;
}

export type TranscriptDTO = {
  studentName: string;
  departmentName: string;
  studentNumber: string | null;
  semesters: {
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
  const enrollments = await enrollmentRepo.findTranscriptEnrollments(
    studentId,
    semesterId
  );

  if (enrollments.length === 0) {
    return {
      studentName: "",
      departmentName: "",
      studentNumber: null,
      semesters: [],
      cumulativeGpa: null,
      totalCompletedCredits: 0,
    };
  }

  const first = enrollments[0];
  const student = first.student;
  const studentName = student.studentName;
  const departmentName = student.department.departmentName;
  const studentNumber = student.studentNumber;

  const semesterMap = new Map<
    number,
    {
      semesterName: string;
      academicYear: string;
      enrollments: TranscriptEnrollmentRaw[];
    }
  >();

  for (const e of enrollments) {
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

  const semesters = Array.from(semesterMap.entries())
    .sort(([, a], [, b]) => a.semesterName.localeCompare(b.semesterName))
    .map(([, entry]) => {
      const gpa = calcGpaFromEnrollments(entry.enrollments);
      const totalCredits = entry.enrollments.reduce(
        (sum, e) => sum + e.offering.course.creditHours,
        0
      );
      const earnedCredits = entry.enrollments
        .filter((e) => e.status === "Completed")
        .reduce((sum, e) => sum + e.offering.course.creditHours, 0);

      return {
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

  const allGraded = enrollments.filter((e) => e.finalGrade != null && e.finalGrade !== "");
  const cumulativeGpa = calcGpaFromEnrollments(allGraded);
  const totalCompletedCredits = enrollments
    .filter((e) => e.status === "Completed")
    .reduce((sum, e) => sum + e.offering.course.creditHours, 0);

  return {
    studentName,
    departmentName,
    studentNumber,
    semesters,
    cumulativeGpa,
    totalCompletedCredits,
  };
}
