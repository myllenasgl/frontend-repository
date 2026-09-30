import { ApiRequestError, makeApiError } from "./errors";
import type {
  DepartmentRequestDTO,
  ProfessorRequestDTO,
  CourseRequestDTO,
  AllocationRequestDTO,
} from "./types";
import {
  mockState,
  sortByName,
  sortAllocations,
  isValidCPF,
  hasScheduleConflict,
  computeDashboard,
  computeWorkloads,
} from "./mockData";

function notFound(entity: string, id: string): never {
  throw new ApiRequestError(makeApiError(404, "Recurso não encontrado", `${entity} não encontrado com id ${id}`));
}

function badRequest(message: string, details: string[] = []): never {
  throw new ApiRequestError(makeApiError(400, details.length ? "Dados inválidos" : "Requisição inválida", message, details));
}

function conflict(message: string): never {
  throw new ApiRequestError(makeApiError(409, "Conflito de horário", message));
}

function parseBody<T>(body: BodyInit | null | undefined): T {
  return JSON.parse(String(body ?? "{}")) as T;
}

export function mockRequest<T>(method: string, fullPath: string, body?: BodyInit | null): T {
  const [pathname, query] = fullPath.split("?");
  const segments = pathname.split("/").filter(Boolean);
  const params = new URLSearchParams(query);

  // /departments...
  if (segments[0] === "departments") {
    if (segments.length === 1) {
      if (method === "GET") return sortByName(mockState.departments) as T;
      if (method === "POST") {
        const dto = parseBody<DepartmentRequestDTO>(body);
        if (!dto.name?.trim()) badRequest("Nome é obrigatório", ["name: não deve estar em branco"]);
        const department = { id: mockState.nextDepartmentId++, name: dto.name };
        mockState.departments.push(department);
        return department as T;
      }
    }
    if (segments.length === 2) {
      const id = Number(segments[1]);
      const index = mockState.departments.findIndex((d) => d.id === id);
      if (method === "GET") {
        if (index === -1) notFound("Departamento", segments[1]);
        return mockState.departments[index] as T;
      }
      if (method === "PUT") {
        if (index === -1) notFound("Departamento", segments[1]);
        const dto = parseBody<DepartmentRequestDTO>(body);
        mockState.departments[index] = { id, name: dto.name };
        return mockState.departments[index] as T;
      }
      if (method === "DELETE") {
        if (index === -1) notFound("Departamento", segments[1]);
        mockState.departments.splice(index, 1);
        return undefined as T;
      }
    }
  }

  // /courses...
  if (segments[0] === "courses") {
    if (segments.length === 1) {
      if (method === "GET") return sortByName(mockState.courses) as T;
      if (method === "POST") {
        const dto = parseBody<CourseRequestDTO>(body);
        if (!dto.name?.trim()) badRequest("Nome é obrigatório", ["name: não deve estar em branco"]);
        const course = { id: mockState.nextCourseId++, name: dto.name };
        mockState.courses.push(course);
        return course as T;
      }
    }
    if (segments.length === 2) {
      const id = Number(segments[1]);
      const index = mockState.courses.findIndex((c) => c.id === id);
      if (method === "GET") {
        if (index === -1) notFound("Curso", segments[1]);
        return mockState.courses[index] as T;
      }
      if (method === "PUT") {
        if (index === -1) notFound("Curso", segments[1]);
        const dto = parseBody<CourseRequestDTO>(body);
        mockState.courses[index] = { id, name: dto.name };
        return mockState.courses[index] as T;
      }
      if (method === "DELETE") {
        if (index === -1) notFound("Curso", segments[1]);
        mockState.courses.splice(index, 1);
        return undefined as T;
      }
    }
  }

  // /professors...
  if (segments[0] === "professors") {
    if (segments.length === 1 && method === "GET") {
      const name = params.get("name");
      const list = name
        ? mockState.professors.filter((p) => p.name.toLowerCase().includes(name.toLowerCase()))
        : mockState.professors;
      return sortByName(list) as T;
    }
    if (segments.length === 1 && method === "POST") {
      const dto = parseBody<ProfessorRequestDTO>(body);
      if (!isValidCPF(dto.cpf)) badRequest("Um ou mais campos estão inválidos.", ["cpf: CPF inválido"]);
      const department = mockState.departments.find((d) => d.id === dto.departmentId);
      if (!department) badRequest("Departamento não encontrado.");
      const professor = { id: mockState.nextProfessorId++, name: dto.name, cpf: dto.cpf, department };
      mockState.professors.push(professor);
      return professor as T;
    }
    if (segments[1] === "department" && segments.length === 3 && method === "GET") {
      const departmentId = Number(segments[2]);
      return sortByName(mockState.professors.filter((p) => p.department.id === departmentId)) as T;
    }
    if (segments.length === 3 && segments[2] === "edit") {
      // not an API route, ignore
    }
    if (segments.length >= 2 && segments[1] !== "department") {
      const id = Number(segments[1]);
      const index = mockState.professors.findIndex((p) => p.id === id);

      if (segments.length === 4 && segments[2] === "schedule" && segments[3] === "export") {
        // handled separately by downloadFile(), not through JSON request()
      }

      if (segments.length === 2) {
        if (method === "GET") {
          if (index === -1) notFound("Professor", segments[1]);
          return mockState.professors[index] as T;
        }
        if (method === "PUT") {
          if (index === -1) notFound("Professor", segments[1]);
          const dto = parseBody<ProfessorRequestDTO>(body);
          if (!isValidCPF(dto.cpf)) badRequest("Um ou mais campos estão inválidos.", ["cpf: CPF inválido"]);
          const department = mockState.departments.find((d) => d.id === dto.departmentId);
          if (!department) badRequest("Departamento não encontrado.");
          mockState.professors[index] = { id, name: dto.name, cpf: dto.cpf, department };
          return mockState.professors[index] as T;
        }
        if (method === "DELETE") {
          if (index === -1) notFound("Professor", segments[1]);
          mockState.professors.splice(index, 1);
          return undefined as T;
        }
      }
    }
  }

  // /allocations...
  if (segments[0] === "allocations") {
    if (segments.length === 1 && method === "GET") {
      return sortAllocations(mockState.allocations) as T;
    }
    if (segments.length === 1 && method === "POST") {
      const dto = parseBody<AllocationRequestDTO>(body);
      return createOrUpdateAllocation(dto) as T;
    }
    if (segments[1] === "professor" && segments.length === 3 && method === "GET") {
      const professorId = Number(segments[2]);
      return sortAllocations(mockState.allocations.filter((a) => a.professor.id === professorId)) as T;
    }
    if (segments[1] === "course" && segments.length === 3 && method === "GET") {
      const courseId = Number(segments[2]);
      return sortAllocations(mockState.allocations.filter((a) => a.course.id === courseId)) as T;
    }
    if (segments.length === 2 && segments[1] !== "professor" && segments[1] !== "course") {
      const id = Number(segments[1]);
      const index = mockState.allocations.findIndex((a) => a.id === id);
      if (method === "GET") {
        if (index === -1) notFound("Alocação", segments[1]);
        return mockState.allocations[index] as T;
      }
      if (method === "PUT") {
        if (index === -1) notFound("Alocação", segments[1]);
        const dto = parseBody<AllocationRequestDTO>(body);
        return createOrUpdateAllocation(dto, id) as T;
      }
      if (method === "DELETE") {
        if (index === -1) notFound("Alocação", segments[1]);
        mockState.allocations.splice(index, 1);
        return undefined as T;
      }
    }
  }

  // /reports...
  if (segments[0] === "reports") {
    if (segments[1] === "dashboard" && method === "GET") return computeDashboard() as T;
    if (segments[1] === "workload" && method === "GET") return computeWorkloads() as T;
  }

  throw new ApiRequestError(
    makeApiError(404, "Não encontrado", `Rota de demonstração não implementada: ${method} ${pathname}`)
  );
}

function createOrUpdateAllocation(dto: AllocationRequestDTO, id?: number) {
  if (!(dto.startHour < dto.endHour)) {
    badRequest("O horário final deve ser maior que o horário inicial.");
  }

  const professor = mockState.professors.find((p) => p.id === dto.professorId);
  if (!professor) badRequest("Professor inválido.");

  const course = mockState.courses.find((c) => c.id === dto.courseId);
  if (!course) badRequest("Curso inválido.");

  if (hasScheduleConflict(dto.professorId, dto.dayOfWeek, dto.startHour, dto.endHour, id)) {
    conflict("O professor já possui uma alocação nesse horário.");
  }

  const allocation = {
    id: id ?? mockState.nextAllocationId++,
    dayOfWeek: dto.dayOfWeek,
    startHour: dto.startHour.length === 5 ? `${dto.startHour}:00` : dto.startHour,
    endHour: dto.endHour.length === 5 ? `${dto.endHour}:00` : dto.endHour,
    professor: professor!,
    course: course!,
  };

  if (id) {
    const index = mockState.allocations.findIndex((a) => a.id === id);
    mockState.allocations[index] = allocation;
  } else {
    mockState.allocations.push(allocation);
  }

  return allocation;
}
