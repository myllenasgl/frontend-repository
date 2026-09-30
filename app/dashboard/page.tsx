"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Chip,
  Stack,
  CircularProgress,
} from "@mui/material";
import { apiGet } from "@/lib/api";
import type { DashboardReportDTO } from "@/lib/types";
import ErrorAlert from "@/components/ErrorAlert";
import type { ApiError } from "@/lib/types";
import { ApiRequestError } from "@/lib/api";

const STAT_CARDS: { key: keyof DashboardReportDTO; label: string }[] = [
  { key: "totalProfessors", label: "Professores" },
  { key: "totalDepartments", label: "Departamentos" },
  { key: "totalCourses", label: "Cursos" },
  { key: "totalAllocations", label: "Alocações" },
];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardReportDTO | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<DashboardReportDTO>("/reports/dashboard")
      .then(setData)
      .catch((err) => setError(err instanceof ApiRequestError ? err.apiError : null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Visão geral do sistema e carga horária semanal de cada professor.
      </Typography>

      <ErrorAlert error={error} />

      {loading && (
        <Stack alignItems="center" sx={{ py: 6 }}>
          <CircularProgress />
        </Stack>
      )}

      {data && (
        <>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {STAT_CARDS.map((card) => (
              <Grid key={card.key} size={{ xs: 6, sm: 3 }}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography variant="h3" fontWeight={700} color="primary">
                      {data[card.key] as number}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {card.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Typography variant="h6" gutterBottom>
            Carga horária por professor
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Professor</TableCell>
                  <TableCell>Departamento</TableCell>
                  <TableCell align="right">Alocações</TableCell>
                  <TableCell align="right">Horas/semana</TableCell>
                  <TableCell>Cursos</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.professorWorkloads.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Nenhum professor cadastrado ainda.
                    </TableCell>
                  </TableRow>
                )}
                {data.professorWorkloads.map((workload) => (
                  <TableRow key={workload.professorId}>
                    <TableCell>{workload.professorName}</TableCell>
                    <TableCell>{workload.departmentName}</TableCell>
                    <TableCell align="right">{workload.totalAllocations}</TableCell>
                    <TableCell align="right">{workload.totalHoursPerWeek}h</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {workload.courses.map((course) => (
                          <Chip key={course} label={course} size="small" />
                        ))}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
}
