import { Alert, AlertTitle, List, ListItem } from "@mui/material";
import type { ApiError } from "@/lib/types";

export default function ErrorAlert({ error }: { error: ApiError | null }) {
  if (!error) return null;

  return (
    <Alert severity="error" sx={{ mb: 2 }}>
      <AlertTitle>{error.error || "Erro"}</AlertTitle>
      {error.message}
      {error.details && error.details.length > 0 && (
        <List dense sx={{ listStyleType: "disc", pl: 3 }}>
          {error.details.map((detail, index) => (
            <ListItem key={index} sx={{ display: "list-item", p: 0 }}>
              {detail}
            </ListItem>
          ))}
        </List>
      )}
    </Alert>
  );
}
