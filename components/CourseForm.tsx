"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, TextField, Button, Stack, Typography, CircularProgress } from "@mui/material";
import { apiGet, apiPost, apiPut, ApiRequestError } from "@/lib/api";
import type { CourseRequestDTO, CourseResponseDTO, ApiError } from "@/lib/types";
import ErrorAlert from "@/components/ErrorAlert";

export default function CourseForm({ id }: { id?: string }) {
  const router = useRouter();
  const isEdit = Boolean(id);

  const [name, setName] = useState("");
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiGet<CourseResponseDTO>(`/courses/${id}`)
      .then((course) => setName(course.name))
      .catch((err) => setError(err instanceof ApiRequestError ? err.apiError : null))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload: CourseRequestDTO = { name };

    try {
      if (isEdit) {
        await apiPut(`/courses/${id}`, payload);
      } else {
        await apiPost("/courses", payload);
      }
      router.push("/courses");
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
        {isEdit ? "Editar curso" : "Novo curso"}
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
          <Button variant="text" onClick={() => router.push("/courses")}>
            Cancelar
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
