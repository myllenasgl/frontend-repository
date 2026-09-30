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
import type { ProfessorRequestDTO, ProfessorResponseDTO, DepartmentResponseDTO, ApiError } from "@/lib/types";
import ErrorAlert from "@/components/ErrorAlert";

export default function ProfessorForm({ id }: { id?: string }) {
  const router = useRouter();
  const isEdit = Boolean(id);

  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [departments, setDepartments] = useState<DepartmentResponseDTO[]>([]);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      apiGet<DepartmentResponseDTO[]>("/departments"),
      id ? apiGet<ProfessorResponseDTO>(`/professors/${id}`) : Promise.resolve(null),
    ])
      .then(([departmentsResult, professor]) => {
        setDepartments(departmentsResult);
        if (professor) {
          setName(professor.name);
          setCpf(professor.cpf);
          setDepartmentId(String(professor.department.id));
        }
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.apiError : null))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload: ProfessorRequestDTO = {
      name,
      cpf,
      departmentId: Number(departmentId),
    };

    try {
      if (isEdit) {
        await apiPut(`/professors/${id}`, payload);
      } else {
        await apiPost("/professors", payload);
      }
      router.push("/professors");
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

  return (
    <Box sx={{ maxWidth: 480 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
        {isEdit ? "Editar professor" : "Novo professor"}
      </Typography>

      <ErrorAlert error={error} />

      {departments.length === 0 ? (
        <ErrorAlert
          error={{
            timestamp: "",
            status: 0,
            error: "Nenhum departamento cadastrado",
            message: "Cadastre pelo menos um departamento antes de criar um professor.",
            details: [],
          }}
        />
      ) : (
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="CPF"
            value={cpf}
            onChange={(e) => setCpf(e.target.value.replace(/\D/g, ""))}
            required
            fullWidth
            helperText="Somente números (11 dígitos)."
            slotProps={{ htmlInput: { maxLength: 11 } }}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Departamento"
            select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            required
            fullWidth
            sx={{ mb: 3 }}
          >
            {departments.map((department) => (
              <MenuItem key={department.id} value={String(department.id)}>
                {department.name}
              </MenuItem>
            ))}
          </TextField>
          <Stack direction="row" spacing={2}>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
            <Button variant="text" onClick={() => router.push("/professors")}>
              Cancelar
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  );
}
