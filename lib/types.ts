export interface DepartmentResponseDTO {
  id: number;
  name: string;
}

export interface DepartmentRequestDTO {
  name: string;
}

export interface ProfessorResponseDTO {
  id: number;
  name: string;
  cpf: string;
  department: DepartmentResponseDTO;
}

export interface ProfessorRequestDTO {
  name: string;
  cpf: string;
  departmentId: number;
}

export interface CourseResponseDTO {
  id: number;
  name: string;
}

export interface CourseRequestDTO {
  name: string;
}

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface AllocationResponseDTO {
  id: number;
  dayOfWeek: DayOfWeek;
  startHour: string;
  endHour: string;
  professor: ProfessorResponseDTO;
  course: CourseResponseDTO;
}

export interface AllocationRequestDTO {
  dayOfWeek: DayOfWeek;
  startHour: string;
  endHour: string;
  professorId: number;
  courseId: number;
}

export interface ProfessorWorkloadDTO {
  professorId: number;
  professorName: string;
  departmentName: string;
  totalAllocations: number;
  totalHoursPerWeek: number;
  courses: string[];
}

export interface DashboardReportDTO {
  totalProfessors: number;
  totalDepartments: number;
  totalCourses: number;
  totalAllocations: number;
  professorWorkloads: ProfessorWorkloadDTO[];
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  details: string[];
}
