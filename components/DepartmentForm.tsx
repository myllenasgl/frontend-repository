"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, TextField, Button, Stack, Typography, CircularProgress } from "@mui/material";
import { apiGet, apiPost, apiPut, ApiRequestError } from "@/lib/api";
import type { DepartmentRequestDTO, DepartmentResponseDTO, ApiError } from "@/lib/types";
import ErrorAlert from "@/components/ErrorAlert";

export default function DepartmentForm({ id }: { id?: string }) {
  const router = useRouter();
  const isEdit = Boolean(id);

  const [name, setName] = useState("");
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiGet<DepartmentResponseDTO>(`/departments/${id}`)
      .then((department) => setName(department.name))
      .catch((err) => setError(err instanceof ApiRequestError ? err.apiError : null))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload: DepartmentRequestDTO = { name };

    try {
      if (isEdit) {
        await apiPut(`/departments/${id}`, payload);
      } else {
        await apiPost("/departments", payload);
      }
      router.push("/departments");
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
        {isEdit ? "Editar departamento" : "Novo departamento"}
      </Typography>

      <ErrorAlert error={error} />

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
          sx={{ mb: 3 }}
        />
        <Stack direction="row" spacing={2}>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
          <Button variant="text" onClick={() => router.push("/departments")}>
            Cancelar
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
