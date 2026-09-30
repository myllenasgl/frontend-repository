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
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { apiGet, apiDelete, ApiRequestError } from "@/lib/api";
import type { AllocationResponseDTO, ApiError } from "@/lib/types";
import { DAY_OF_WEEK_LABELS, formatTime } from "@/lib/dayOfWeek";
import ErrorAlert from "@/components/ErrorAlert";

export default function AllocationsPage() {
  const [allocations, setAllocations] = useState<AllocationResponseDTO[]>([]);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    apiGet<AllocationResponseDTO[]>("/allocations")
      .then(setAllocations)
      .catch((err) => setError(err instanceof ApiRequestError ? err.apiError : null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja excluir esta alocação?")) return;
    setError(null);
    try {
      await apiDelete(`/allocations/${id}`);
      load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.apiError : null);
    }
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight={700}>
          Alocações
        </Typography>
        <Button component={Link} href="/allocations/new" variant="contained" startIcon={<AddIcon />}>
          Nova
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
                <TableCell>Dia</TableCell>
                <TableCell>Horário</TableCell>
                <TableCell>Professor</TableCell>
                <TableCell>Curso</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allocations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Nenhuma alocação cadastrada.
                  </TableCell>
                </TableRow>
              )}
              {allocations.map((allocation) => (
                <TableRow key={allocation.id}>
                  <TableCell>
                    <Chip label={DAY_OF_WEEK_LABELS[allocation.dayOfWeek]} size="small" />
                  </TableCell>
                  <TableCell>
                    {formatTime(allocation.startHour)} — {formatTime(allocation.endHour)}
                  </TableCell>
                  <TableCell>{allocation.professor?.name}</TableCell>
                  <TableCell>{allocation.course?.name}</TableCell>
                  <TableCell align="right">
                    <IconButton component={Link} href={`/allocations/${allocation.id}/edit`} size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(allocation.id)}>
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
