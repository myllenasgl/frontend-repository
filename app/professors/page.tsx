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
  TextField,
  MenuItem,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import EventIcon from "@mui/icons-material/Event";
import { apiGet, apiDelete, ApiRequestError, downloadFile } from "@/lib/api";
import type { ProfessorResponseDTO, DepartmentResponseDTO, ApiError } from "@/lib/types";
import ErrorAlert from "@/components/ErrorAlert";
import { generateScheduleCsv, generateScheduleIcs } from "@/lib/mockData";

export default function ProfessorsPage() {
  const [professors, setProfessors] = useState<ProfessorResponseDTO[]>([]);
  const [departments, setDepartments] = useState<DepartmentResponseDTO[]>([]);
  const [nameFilter, setNameFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<DepartmentResponseDTO[]>("/departments").then(setDepartments).catch(() => {});
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);

    let path = "/professors";
    if (departmentFilter) {
      path = `/professors/department/${departmentFilter}`;
    } else if (nameFilter.trim()) {
      path = `/professors?name=${encodeURIComponent(nameFilter.trim())}`;
    }

    apiGet<ProfessorResponseDTO[]>(path)
      .then(setProfessors)
      .catch((err) => setError(err instanceof ApiRequestError ? err.apiError : null))
      .finally(() => setLoading(false));
  }, [nameFilter, departmentFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja excluir este professor?")) return;
    setError(null);
    try {
      await apiDelete(`/professors/${id}`);
      load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.apiError : null);
    }
  }

  function handleExportCsv(id: number) {
    downloadFile(
      `/professors/${id}/schedule/export/csv`,
      `agenda_professor_${id}.csv`,
      () => generateScheduleCsv(id),
      "text/csv"
    );
  }

  function handleExportIcs(id: number) {
    downloadFile(
      `/professors/${id}/schedule/export/ics`,
      `agenda_professor_${id}.ics`,
      () => generateScheduleIcs(id),
      "text/calendar"
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight={700}>
          Professores
        </Typography>
        <Button component={Link} href="/professors/new" variant="contained" startIcon={<AddIcon />}>
          Novo
        </Button>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="Buscar por nome"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          size="small"
          fullWidth
        />
        <TextField
          label="Filtrar por departamento"
          select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          size="small"
          fullWidth
        >
          <MenuItem value="">Todos</MenuItem>
          {departments.map((department) => (
            <MenuItem key={department.id} value={String(department.id)}>
              {department.name}
            </MenuItem>
          ))}
        </TextField>
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
                <TableCell>CPF</TableCell>
                <TableCell>Departamento</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {professors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Nenhum professor encontrado.
                  </TableCell>
                </TableRow>
              )}
              {professors.map((professor) => (
                <TableRow key={professor.id}>
                  <TableCell>{professor.name}</TableCell>
                  <TableCell>{professor.cpf}</TableCell>
                  <TableCell>{professor.department?.name}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Exportar agenda (CSV)">
                      <IconButton size="small" onClick={() => handleExportCsv(professor.id)}>
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Exportar agenda (iCalendar)">
                      <IconButton size="small" onClick={() => handleExportIcs(professor.id)}>
                        <EventIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <IconButton component={Link} href={`/professors/${professor.id}/edit`} size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(professor.id)}>
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
