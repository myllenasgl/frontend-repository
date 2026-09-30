import type { Metadata } from "next";
import "./globals.css";
import ThemeRegistry from "@/components/ThemeRegistry";
import Navbar from "@/components/Navbar";
import { Box } from "@mui/material";

export const metadata: Metadata = {
  title: "Professor Allocation",
  description: "Sistema de alocação de professores, departamentos, cursos e horários.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <ThemeRegistry>
          <Navbar />
          <Box component="main" sx={{ maxWidth: 1100, mx: "auto", px: 2, py: 4 }}>
            {children}
          </Box>
        </ThemeRegistry>
      </body>
    </html>
  );
}
