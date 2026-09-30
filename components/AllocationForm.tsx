"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import { apiGet, apiPost, apiPut, ApiRequestError } from "@/lib/api";
import type {
  AllocationRequestDTO,
  AllocationResponseDTO,
  ProfessorResponseDTO,
  CourseResponseDTO,
  DayOfWeek,
  ApiError,
} from "@/lib/types";
import { DAYS_OF_WEEK, DAY_OF_WEEK_LABELS, formatTime, toBackendTime } from "@/lib/dayOfWeek";
import ErrorAlert from "@/components/ErrorAlert";

export default function AllocationForm({ id }: { id?: string }) {
  const router = useRouter();
  const isEdit = Boolean(id);

  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek | "">("");
  const [startHour, setStartHour] = useState("");
  const [endHour, setEndHour] = useState("");
  const [professorId, setProfessorId] = useState("");
  const [courseId, setCourseId] = useState("");

  const [professors, setProfessors] = useState<ProfessorResponseDTO[]>([]);
  const [courses, setCourses] = useState<CourseResponseDTO[]>([]);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      apiGet<ProfessorResponseDTO[]>("/professors"),
      apiGet<CourseResponseDTO[]>("/courses"),
      id ? apiGet<AllocationResponseDTO>(`/allocations/${id}`) : Promise.resolve(null),
    ])
      .then(([professorsResult, coursesResult, allocation]) => {
        setProfessors(professorsResult);
        setCourses(coursesResult);
        if (allocation) {
          setDayOfWeek(allocation.dayOfWeek);
          setStartHour(formatTime(allocation.startHour));
          setEndHour(formatTime(allocation.endHour));
          setProfessorId(String(allocation.professor.id));
          setCourseId(String(allocation.course.id));
        }
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.apiError : null))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload: AllocationRequestDTO = {
      dayOfWeek: dayOfWeek as DayOfWeek,
      startHour: toBackendTime(startHour),
      endHour: toBackendTime(endHour),
      professorId: Number(professorId),
      courseId: Number(courseId),
    };

    try {
      if (isEdit) {
        await apiPut(`/allocations/${id}`, payload);
      } else {
        await apiPost("/allocations", payload);
      }
      router.push("/allocations");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.apiError : null);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Stack alignItems="center" sx={{ py: 6 }}>
        <CircularProgress />
      </Stack>
    );
  }

  const missingPrerequisites = professors.length === 0 || courses.length === 0;

  return (
    <Box sx={{ maxWidth: 480 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
        {isEdit ? "Editar alocação" : "Nova alocação"}
      </Typography>

      <ErrorAlert error={error} />

      {missingPrerequisites ? (
        <ErrorAlert
          error={{
            timestamp: "",
            status: 0,
            error: "Cadastro incompleto",
            message: "Cadastre pelo menos um professor e um curso antes de criar uma alocação.",
            details: [],
          }}
        />
      ) : (
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Professor"
            select
            value={professorId}
            onChange={(e) => setProfessorId(e.target.value)}
            required
            fullWidth
            sx={{ mb: 2 }}
          >
            {professors.map((professor) => (
              <MenuItem key={professor.id} value={String(professor.id)}>
                {professor.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Curso"
            select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            required
            fullWidth
            sx={{ mb: 2 }}
          >
            {courses.map((course) => (
              <MenuItem key={course.id} value={String(course.id)}>
                {course.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Dia da semana"
            select
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}
            required
            fullWidth
            sx={{ mb: 2 }}
          >
            {DAYS_OF_WEEK.map((day) => (
              <MenuItem key={day} value={day}>
                {DAY_OF_WEEK_LABELS[day]}
              </MenuItem>
            ))}
          </TextField>
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <TextField
              label="Horário inicial"
              type="time"
              value={startHour}
              onChange={(e) => setStartHour(e.target.value)}
              required
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Horário final"
              type="time"
              value={endHour}
              onChange={(e) => setEndHour(e.target.value)}
              required
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
            <Button variant="text" onClick={() => router.push("/allocations")}>
              Cancelar
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  );
}
