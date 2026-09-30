"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  IconButton,
  Stack,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { apiGet, apiDelete, ApiRequestError } from "@/lib/api";
import type { CourseResponseDTO, ApiError } from "@/lib/types";
import ErrorAlert from "@/components/ErrorAlert";

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseResponseDTO[]>([]);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    apiGet<CourseResponseDTO[]>("/courses")
      .then(setCourses)
      .catch((err) => setError(err instanceof ApiRequestError ? err.apiError : null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja excluir este curso?")) return;
    setError(null);
    try {
      await apiDelete(`/courses/${id}`);
      load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.apiError : null);
    }
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight={700}>
          Cursos
        </Typography>
        <Button component={Link} href="/courses/new" variant="contained" startIcon={<AddIcon />}>
          Novo
        </Button>
      </Stack>

      <ErrorAlert error={error} />

      {loading ? (
        <Stack alignItems="center" sx={{ py: 6 }}>
          <CircularProgress />
        </Stack>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    Nenhum curso cadastrado.
                  </TableCell>
                </TableRow>
              )}
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>{course.name}</TableCell>
                  <TableCell align="right">
                    <IconButton component={Link} href={`/courses/${course.id}/edit`} size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(course.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
