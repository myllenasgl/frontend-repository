import type {
  DepartmentResponseDTO,
  ProfessorResponseDTO,
  CourseResponseDTO,
  AllocationResponseDTO,
  ProfessorWorkloadDTO,
  DashboardReportDTO,
} from "./types";
import { DAYS_OF_WEEK, DAY_OF_WEEK_LABELS, formatTime } from "./dayOfWeek";

export const mockState = {
  departments: [
    { id: 1, name: "Tecnologia da Informação" },
    { id: 2, name: "Matemática" },
    { id: 3, name: "Letras" },
  ] as DepartmentResponseDTO[],

  courses: [
    { id: 1, name: "Estrutura de Dados" },
    { id: 2, name: "Cálculo I" },
    { id: 3, name: "Literatura Brasileira" },
  ] as CourseResponseDTO[],

  professors: [] as ProfessorResponseDTO[],

  allocations: [] as AllocationResponseDTO[],

  nextDepartmentId: 4,
  nextCourseId: 4,
  nextProfessorId: 4,
  nextAllocationId: 4,
};

mockState.professors = [
  { id: 1, name: "Ana Ribeiro", cpf: "52998224725", department: mockState.departments[0] },
  { id: 2, name: "Carlos Mendes", cpf: "11144477735", department: mockState.departments[1] },
  { id: 3, name: "Beatriz Souza", cpf: "93541134780", department: mockState.departments[2] },
];

mockState.allocations = [
  {
    id: 1,
    dayOfWeek: "MONDAY",
    startHour: "08:00:00",
    endHour: "10:00:00",
    professor: mockState.professors[0],
    course: mockState.courses[0],
  },
  {
    id: 2,
    dayOfWeek: "WEDNESDAY",
    startHour: "14:00:00",
    endHour: "16:00:00",
    professor: mockState.professors[1],
    course: mockState.courses[1],
  },
  {
    id: 3,
    dayOfWeek: "FRIDAY",
    startHour: "10:00:00",
    endHour: "12:00:00",
    professor: mockState.professors[2],
    course: mockState.courses[2],
  },
];

export function sortByName<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }));
}

export function sortAllocations(items: AllocationResponseDTO[]): AllocationResponseDTO[] {
  return [...items].sort((a, b) => {
    const dayDiff = DAYS_OF_WEEK.indexOf(a.dayOfWeek) - DAYS_OF_WEEK.indexOf(b.dayOfWeek);
    if (dayDiff !== 0) return dayDiff;
    return a.startHour.localeCompare(b.startHour);
  });
}

/** Standard Brazilian CPF check-digit algorithm, mirroring the backend's @CPF validator. */
export function isValidCPF(cpf: string): boolean {
  if (!/^\d{11}$/.test(cpf)) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const digits = cpf.split("").map(Number);

  const checkDigit = (length: number) => {
    let sum = 0;
    for (let i = 0; i < length; i++) {
      sum += digits[i] * (length + 1 - i);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return checkDigit(9) === digits[9] && checkDigit(10) === digits[10];
}

export function hasScheduleConflict(
  professorId: number,
  dayOfWeek: string,
  startHour: string,
  endHour: string,
  excludeId?: number
): boolean {
  return mockState.allocations.some((allocation) => {
    if (allocation.professor.id !== professorId) return false;
    if (allocation.id === excludeId) return false;
    if (allocation.dayOfWeek !== dayOfWeek) return false;
    return startHour < allocation.endHour && allocation.startHour < endHour;
  });
}

export function computeWorkloads(): ProfessorWorkloadDTO[] {
  return sortByName(mockState.professors).map((professor) => {
    const allocations = mockState.allocations.filter((a) => a.professor.id === professor.id);
    const totalMinutes = allocations.reduce((sum, allocation) => {
      const [sh, sm] = allocation.startHour.split(":").map(Number);
      const [eh, em] = allocation.endHour.split(":").map(Number);
      return sum + (eh * 60 + em - (sh * 60 + sm));
    }, 0);

    return {
      professorId: professor.id,
      professorName: professor.name,
      departmentName: professor.department.name,
      totalAllocations: allocations.length,
      totalHoursPerWeek: Math.round((totalMinutes / 60) * 100) / 100,
      courses: [...new Set(allocations.map((a) => a.course.name))],
    };
  });
}

export function computeDashboard(): DashboardReportDTO {
  return {
    totalProfessors: mockState.professors.length,
    totalDepartments: mockState.departments.length,
    totalCourses: mockState.courses.length,
    totalAllocations: mockState.allocations.length,
    professorWorkloads: computeWorkloads(),
  };
}

export function generateScheduleCsv(professorId: number): string {
  const professor = mockState.professors.find((p) => p.id === professorId);
  const allocations = mockState.allocations.filter((a) => a.professor.id === professorId);

  const rows = ["Dia da Semana,Horario Inicial,Horario Final,Curso,Departamento"];
  for (const allocation of allocations) {
    rows.push(
      `${allocation.dayOfWeek},${formatTime(allocation.startHour)},${formatTime(allocation.endHour)},"${allocation.course.name}","${professor?.department.name ?? ""}"`
    );
  }
  return rows.join("\n") + "\n";
}

const ICAL_DAY: Record<string, string> = {
  MONDAY: "MO",
  TUESDAY: "TU",
  WEDNESDAY: "WE",
  THURSDAY: "TH",
  FRIDAY: "FR",
  SATURDAY: "SA",
  SUNDAY: "SU",
};

export function generateScheduleIcs(professorId: number): string {
  const professor = mockState.professors.find((p) => p.id === professorId);
  const allocations = mockState.allocations.filter((a) => a.professor.id === professorId);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Professor Allocation System (demo)//NONSGML v1.0//PT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:Agenda - Prof. ${professor?.name ?? ""}`,
  ];

  allocations.forEach((allocation, index) => {
    const start = allocation.startHour.replace(/:/g, "").padEnd(6, "0");
    const end = allocation.endHour.replace(/:/g, "").padEnd(6, "0");
    lines.push(
      "BEGIN:VEVENT",
      `UID:allocation-${allocation.id ?? index}@professor-allocation-demo`,
      `SUMMARY:${allocation.course.name} - Prof. ${professor?.name ?? ""}`,
      `DESCRIPTION:Aula de ${allocation.course.name} (${allocation.dayOfWeek})`,
      `DTSTART:20260824T${start}`,
      `DTEND:20260824T${end}`,
      `RRULE:FREQ=WEEKLY;BYDAY=${ICAL_DAY[allocation.dayOfWeek] ?? "MO"}`,
      "END:VEVENT"
    );
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}

export { DAY_OF_WEEK_LABELS };
