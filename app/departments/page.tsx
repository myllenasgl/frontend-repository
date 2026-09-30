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
import type { DepartmentResponseDTO, ApiError } from "@/lib/types";
import ErrorAlert from "@/components/ErrorAlert";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<DepartmentResponseDTO[]>([]);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    apiGet<DepartmentResponseDTO[]>("/departments")
      .then(setDepartments)
      .catch((err) => setError(err instanceof ApiRequestError ? err.apiError : null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja excluir este departamento?")) return;
    setError(null);
    try {
      await apiDelete(`/departments/${id}`);
      load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.apiError : null);
    }
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight={700}>
          Departamentos
        </Typography>
        <Button component={Link} href="/departments/new" variant="contained" startIcon={<AddIcon />}>
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
              {departments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    Nenhum departamento cadastrado.
                  </TableCell>
                </TableRow>
              )}
              {departments.map((department) => (
                <TableRow key={department.id}>
                  <TableCell>{department.name}</TableCell>
                  <TableCell align="right">
                    <IconButton component={Link} href={`/departments/${department.id}/edit`} size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(department.id)}>
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
