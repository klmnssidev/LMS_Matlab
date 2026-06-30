export const Subjects = [
  "all",
  "Department",
  "Teacher",
  "Student",
  "Course",
  "Semester",
  "Classroom",
  "CourseOffering",
  "Enrollment",
  "Attendance",
  "Exam",
  "ExamResult",
  "Poster",
  "Dashboard",
  "Analytics",
  "Settings",
  "Announcement",
  "MyEnrollments",
  "MyGrades",
] as const;

export type Subject = (typeof Subjects)[number];
